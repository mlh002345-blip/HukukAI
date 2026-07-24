import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";

const DURATION_DAYS_PATTERN = /(\d{1,3})\s*g(?:ü|u)n/i;
const DURATION_APPLICABLE_CHANGE_TYPES = new Set(["DEADLINE_EXTENSION", "DEADLINE_CHANGE"]);

/**
 * Bu projede şu an yalnızca `DEADLINE` modülünde `RuleSet` var
 * (hesaplama motoru henüz RuleSet'ten okumuyor — bkz. CLAUDE.md).
 * Bu yüzden bu MVP çıkarıcı yalnızca "X gün" biçimindeki bir süre
 * değişikliğini metinden çıkarmayı dener; oran/tutar değişiklikleri
 * (RATE_CHANGE/THRESHOLD_CHANGE) için deterministik bir alan eşlemesi
 * yoktur ve `null` döner — bu durumda otomatik taslak üretilmez,
 * değişiklik admin incelemesini bekler (HOLD_FOR_REVIEW).
 */
function extractDurationOverride(
  changeType: string,
  rawText: string,
): { duration: number } | null {
  if (!DURATION_APPLICABLE_CHANGE_TYPES.has(changeType)) return null;
  const match = DURATION_DAYS_PATTERN.exec(rawText);
  const duration = match?.[1] ? Number(match[1]) : NaN;
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return { duration };
}

type LegislationChangeRow = {
  id: string;
  changeType: string;
  effectiveDate: Date;
};

type LegislationDocumentRow = {
  rawText: string;
};

interface RuleDataShape {
  conditions?: unknown;
  calculation: Record<string, unknown>;
  warnings?: string[];
}

/**
 * Rule Author Agent — bir `LegislationChange` + etkilenen `ruleKey`
 * için, metinden deterministik olarak çıkarılabilen bir değeri mevcut
 * (eski) `RuleSet.ruleData`sına uygulayarak taslak bir sürüm üretir.
 * **Bu bir LLM çağrısı değildir** — kasıtlı olarak dar kapsamlı, saf
 * bir çıkarım/birleştirmedir; bu, "AI rastgele hukuki içerik uydurur"
 * riskini ortadan kaldırır ama karşılığında yalnızca önceden
 * tanımlanmış, dar bir değişiklik kümesini otomatik taslaklayabilir.
 */
@Injectable()
export class LegislationRuleAuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async proposeDraft(
    change: LegislationChangeRow,
    document: LegislationDocumentRow,
    ruleKey: string,
  ) {
    const current = await this.prisma.ruleSet.findFirst({
      where: { ruleKey },
      orderBy: { validFrom: "desc" },
    });
    if (!current) return null;

    const override = extractDurationOverride(change.changeType, document.rawText);
    if (!override) return null;

    const currentRuleData = current.ruleData as unknown as RuleDataShape;
    const newRuleData: RuleDataShape = {
      ...currentRuleData,
      calculation: { ...currentRuleData.calculation, ...override },
    };

    return this.prisma.ruleSet.create({
      data: {
        module: current.module,
        ruleKey,
        version: change.effectiveDate.toISOString().slice(0, 10),
        validFrom: change.effectiveDate,
        ruleData: newRuleData as unknown as Prisma.InputJsonValue,
        // MVP: eski dayanağı miras alır; bağımsız inceleme/admin
        // onayı sırasında güncel dayanakla değiştirilmelidir.
        legalBasis: current.legalBasis as Prisma.InputJsonValue,
        status: "DRAFT",
        changeId: change.id,
        supersedesRuleSetId: current.id,
      },
    });
  }
}
