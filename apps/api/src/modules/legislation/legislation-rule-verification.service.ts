import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { calculateDeadline, type DeadlineRuleCalculation } from "@hukukai/deadline-engine";
import {
  runGoldenTests,
  runRegressionCheck,
  validateRuleSchema,
  type RuleVersionLike,
} from "@hukukai/legislation-agents";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationIndependentReviewService } from "./legislation-independent-review.service";

/** Yalnızca bu domain'lerden gelen belgeler "kaynak bütünlüğü"
 * katmanını geçebilir. MVP allowlist — gerçek bir sağlayıcı
 * eklendiğinde genişletilmelidir. */
const TRUSTED_SOURCE_DOMAINS = [
  "resmigazete.gov.tr",
  "gib.gov.tr",
  "sgk.gov.tr",
  "adalet.gov.tr",
  "anayasa.gov.tr",
];

/** Bir kural değişikliğinin çok sayıda geçmiş kaydı etkilemesi,
 * otomatik yayın için insan gözünden geçmesi gereken bir sinyaldir. */
const REGRESSION_REVIEW_THRESHOLD = 20;

type RuleSetRow = {
  id: string;
  ruleKey: string;
  module: string;
  version: string;
  validFrom: Date;
  validTo: Date | null;
  ruleData: unknown;
  legalBasis: unknown;
  supersedesRuleSetId: string | null;
};

type LegislationDocumentRow = {
  contentHash: string;
  sourceUrl: string;
  title: string;
  publicationDate: Date;
  sourceId: string;
};

function isTrustedUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return TRUSTED_SOURCE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function toRuleVersionLike(row: RuleSetRow): RuleVersionLike {
  return {
    ruleKey: row.ruleKey,
    version: row.version,
    validFrom: row.validFrom.toISOString().slice(0, 10),
    validTo: row.validTo ? row.validTo.toISOString().slice(0, 10) : null,
    legalBasis: row.legalBasis as RuleVersionLike["legalBasis"],
    ruleData: row.ruleData as Record<string, unknown>,
  };
}

/**
 * Doğrulama katmanlarını (kullanıcının "En az beş doğrulama katmanı"
 * talebi) orkestre eder: kaynak bütünlüğü, ikinci kaynak, model
 * mutabakatı (`LegislationIndependentReviewService`e devredilir),
 * şema/çakışma, golden testler ve regresyon. Her katman bir
 * `RuleVerificationResult` satırı yazar; hiçbiri bir diğerini
 * "geç"emez — `ReleaseDecisionService` yalnızca **tümü** geçtiğinde
 * otomatik yayını değerlendirir.
 */
@Injectable()
export class LegislationRuleVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly independentReview: LegislationIndependentReviewService,
  ) {}

  async verifyAll(draft: RuleSetRow, document: LegislationDocumentRow): Promise<void> {
    await this.verifySourceIntegrity(draft, document);
    await this.verifySecondSource(draft, document);
    await this.independentReview.review(draft);
    await this.verifySchema(draft);
    await this.verifyGoldenTests(draft);
    await this.verifyRegression(draft);
  }

  async getResults(ruleSetId: string) {
    return this.prisma.ruleVerificationResult.findMany({ where: { ruleSetId } });
  }

  private async verifySourceIntegrity(
    draft: RuleSetRow,
    document: LegislationDocumentRow,
  ): Promise<void> {
    const hashValid = document.contentHash.startsWith("sha256:");
    const urlTrusted = isTrustedUrl(document.sourceUrl);
    const passed = hashValid && urlTrusted;

    await this.prisma.ruleVerificationResult.create({
      data: {
        ruleSetId: draft.id,
        layer: "SOURCE_INTEGRITY",
        passed,
        details: { hashValid, urlTrusted, sourceUrl: document.sourceUrl } as unknown as Prisma.InputJsonValue,
      },
    });
  }

  private async verifySecondSource(
    draft: RuleSetRow,
    document: LegislationDocumentRow,
  ): Promise<void> {
    const windowStart = new Date(document.publicationDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(document.publicationDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const secondSource = await this.prisma.legislationDocument.findFirst({
      where: {
        sourceId: { not: document.sourceId },
        title: document.title,
        publicationDate: { gte: windowStart, lte: windowEnd },
      },
    });

    await this.prisma.ruleVerificationResult.create({
      data: {
        ruleSetId: draft.id,
        layer: "SECOND_SOURCE",
        passed: secondSource !== null,
        details: secondSource
          ? { secondSourceDocumentId: secondSource.id }
          : { reason: "Aynı değişikliği kapsayan ikinci resmî kaynak bulunamadı." },
      },
    });
  }

  private async verifySchema(draft: RuleSetRow): Promise<void> {
    const existingVersions = await this.prisma.ruleSet.findMany({
      where: { ruleKey: draft.ruleKey, id: { not: draft.id } },
    });
    const result = validateRuleSchema(
      toRuleVersionLike(draft),
      existingVersions.map(toRuleVersionLike),
    );

    await this.prisma.ruleVerificationResult.create({
      data: {
        ruleSetId: draft.id,
        layer: "SCHEMA_VALIDATION",
        passed: result.valid,
        details: { errors: result.errors },
      },
    });
  }

  private async verifyGoldenTests(draft: RuleSetRow): Promise<void> {
    const testCases = await this.prisma.goldenTestCase.findMany({
      where: { ruleKey: draft.ruleKey },
    });

    if (testCases.length === 0) {
      await this.prisma.ruleVerificationResult.create({
        data: {
          ruleSetId: draft.id,
          layer: "GOLDEN_TESTS",
          passed: false,
          details: { reason: `"${draft.ruleKey}" için tanımlı golden test yok.` },
        },
      });
      return;
    }

    const ruleData = draft.ruleData as { calculation: DeadlineRuleCalculation };
    type GoldenTestFacts = { startDate: string; holidays: { date: string; isHalfDay: boolean }[] };
    const results = runGoldenTests<GoldenTestFacts, Record<string, unknown>>(
      testCases.map((testCase) => ({
        ruleKey: testCase.ruleKey,
        name: testCase.name,
        facts: testCase.facts as unknown as GoldenTestFacts,
        expectedOutcome: testCase.expectedOutcome as Record<string, unknown>,
      })),
      (facts: GoldenTestFacts) =>
        calculateDeadline({
          calculation: ruleData.calculation,
          startDate: facts.startDate,
          holidays: facts.holidays,
        }) as unknown as Record<string, unknown>,
    );

    const allPassed = results.every((result) => result.passed);

    await Promise.all(
      results.map((result, index) => {
        const testCase = testCases[index];
        if (!testCase) return Promise.resolve();
        return this.prisma.goldenTestResult.create({
          data: {
            testCaseId: testCase.id,
            ruleSetId: draft.id,
            passed: result.passed,
            actualOutcome: result.actualOutcome as unknown as Prisma.InputJsonValue,
          },
        });
      }),
    );

    await this.prisma.ruleVerificationResult.create({
      data: {
        ruleSetId: draft.id,
        layer: "GOLDEN_TESTS",
        passed: allPassed,
        details: { totalCases: testCases.length, failedCases: results.filter((r) => !r.passed).length },
      },
    });
  }

  private async verifyRegression(draft: RuleSetRow): Promise<void> {
    const oldRuleSet = await this.prisma.ruleSet.findFirst({
      where: { ruleKey: draft.ruleKey, id: { not: draft.id } },
      orderBy: { validFrom: "desc" },
    });

    if (!oldRuleSet) {
      await this.prisma.ruleVerificationResult.create({
        data: {
          ruleSetId: draft.id,
          layer: "REGRESSION",
          passed: true,
          details: { reason: "Karşılaştırılacak önceki sürüm yok (yeni kural)." },
        },
      });
      return;
    }

    const affectedDeadlines = await this.prisma.deadline.findMany({
      where: { ruleId: draft.ruleKey, ruleVersion: oldRuleSet.version },
      take: 200,
    });

    const oldData = oldRuleSet.ruleData as unknown as { calculation: DeadlineRuleCalculation };
    const newData = draft.ruleData as { calculation: DeadlineRuleCalculation };
    const holidays = (await this.prisma.holiday.findMany()).map((holiday) => ({
      date: holiday.date.toISOString().slice(0, 10),
      isHalfDay: holiday.isHalfDay,
    }));

    const regressionResults = runRegressionCheck<{ startDate: Date }>({
      records: affectedDeadlines,
      evaluateOld: (record) =>
        calculateDeadline({
          calculation: oldData.calculation,
          startDate: record.startDate.toISOString().slice(0, 10),
          holidays,
        }).adjustedEndDate,
      evaluateNew: (record) =>
        calculateDeadline({
          calculation: newData.calculation,
          startDate: record.startDate.toISOString().slice(0, 10),
          holidays,
        }).adjustedEndDate,
    });

    const changedCount = regressionResults.filter((result) => result.changed).length;
    const passed = changedCount <= REGRESSION_REVIEW_THRESHOLD;

    await this.prisma.ruleVerificationResult.create({
      data: {
        ruleSetId: draft.id,
        layer: "REGRESSION",
        passed,
        details: { affectedCount: affectedDeadlines.length, changedCount },
      },
    });
  }
}
