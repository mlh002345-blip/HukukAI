import { Injectable, NotFoundException } from "@nestjs/common";
import {
  findApplicableRule,
  selectRuleVersion,
  type LegalBasisRef,
  type RuleCondition,
  type VersionedRule,
} from "@hukukai/rule-engine";
import type { DeadlineRuleCalculation, HolidayInput } from "@hukukai/deadline-engine";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";
import { RuleUnderReviewException } from "./rule-under-review.exception";

interface DeadlineRuleData {
  conditions?: RuleCondition[];
  calculation: DeadlineRuleCalculation;
  warnings?: string[];
}

type RuleSetRow = {
  ruleKey: string;
  version: string;
  validFrom: Date;
  validTo: Date | null;
  ruleData: unknown;
  legalBasis: unknown;
};

type RuleSetStatusRow = RuleSetRow & { status: string };

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toVersionedRule(
  row: RuleSetRow,
): VersionedRule<DeadlineRuleCalculation> {
  const data = row.ruleData as DeadlineRuleData;
  return {
    ruleKey: row.ruleKey,
    version: row.version,
    validFrom: toIsoDate(row.validFrom),
    validTo: row.validTo ? toIsoDate(row.validTo) : null,
    conditions: data.conditions ?? [],
    data: data.calculation,
    legalBasis: (row.legalBasis ?? []) as LegalBasisRef[],
    warnings: data.warnings ?? [],
  };
}

/**
 * `RuleSet` tablosunu (Bölüm 16 — Kural ve Süre Motoru) yorumlayan katman.
 * Mevzuat oranları/süreleri koda gömülmez; bu servis yalnızca DB'deki
 * sürümlenmiş kuralları okuyup `@hukukai/rule-engine`'e devreder.
 */
@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async getRuleValidOn(
    ruleKey: string,
    onDate: string,
  ): Promise<VersionedRule<DeadlineRuleCalculation>> {
    const rows = await this.prisma.ruleSet.findMany({ where: { ruleKey } });
    const published = rows.filter((row) => row.isPublished);
    const rule = selectRuleVersion(published.map(toVersionedRule), onDate);
    if (rule) return rule;

    this.assertNotUnderReview(rows, onDate, ruleKey);
    throw new NotFoundException(
      `"${ruleKey}" için ${onDate} tarihinde geçerli bir kural bulunamadı.`,
    );
  }

  async findApplicableRule(
    ruleModule: string,
    facts: Record<string, unknown>,
    onDate: string,
  ): Promise<VersionedRule<DeadlineRuleCalculation>> {
    const rows = await this.prisma.ruleSet.findMany({ where: { module: ruleModule } });
    const published = rows.filter((row) => row.isPublished);
    const rule = findApplicableRule(published.map(toVersionedRule), facts, onDate);
    if (rule) return rule;

    const restricted = rows.filter((row) => row.status === "TEMPORARILY_RESTRICTED");
    const restrictedMatch = findApplicableRule(restricted.map(toVersionedRule), facts, onDate);
    if (restrictedMatch) {
      throw new RuleUnderReviewException(restrictedMatch.ruleKey);
    }

    throw new NotFoundException(
      "Bu belge/olgular için geçerli bir kural bulunamadı.",
    );
  }

  /**
   * Fail-closed denetimi (`getRuleValidOn` için): yayınlanmış bir sürüm
   * arasında `onDate`e uyan yoksa, bu tarihte normalde geçerli olacak
   * ama mevzuat değişikliği tespit edilip henüz bağımsız doğrulanmamış
   * (`status: TEMPORARILY_RESTRICTED`) bir sürüm olup olmadığına bakar.
   * Varsa, eski kuralla sessizce devam etmek yerine
   * `RuleUnderReviewException` fırlatır — "kesin ama potansiyel olarak
   * yanlış" bir sonuç asla dönmez.
   */
  private assertNotUnderReview(
    rows: RuleSetStatusRow[],
    onDate: string,
    ruleKey: string,
  ): void {
    const restricted = rows.filter((row) => row.status === "TEMPORARILY_RESTRICTED");
    const restrictedMatch = selectRuleVersion(restricted.map(toVersionedRule), onDate);
    if (restrictedMatch) {
      throw new RuleUnderReviewException(ruleKey);
    }
  }

  async getHolidays(): Promise<HolidayInput[]> {
    const holidays = await this.prisma.holiday.findMany();
    return holidays.map((holiday) => ({
      date: toIsoDate(holiday.date),
      isHalfDay: holiday.isHalfDay,
    }));
  }
}
