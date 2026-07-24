import { Injectable, NotFoundException } from "@nestjs/common";
import {
  decideReleaseRisk,
  type LegislationChangeType,
  type VerificationLayerResult,
} from "@hukukai/legislation-agents";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditLogService } from "../audit/audit-log.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationRuleRemediationService } from "./legislation-rule-remediation.service";

type RuleSetRow = {
  id: string;
  ruleKey: string;
  validFrom: Date;
  supersedesRuleSetId: string | null;
};

/**
 * Release Decision Agent — bir aday `RuleSet`in doğrulama katmanı
 * sonuçlarını toplar, `decideReleaseRisk` (saf fonksiyon,
 * `@hukukai/legislation-agents`) ile otomatik-yayın kararını verir ve
 * veritabanına uygular. `AUTO_PUBLISH` dışındaki her sonuç
 * (`HOLD_FOR_REVIEW`) admin onayını bekler — sistem kendi kendine asla
 * "belirsiz ama muhtemelen doğru" bir yayın yapmaz.
 */
@Injectable()
export class LegislationReleaseDecisionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly remediation: LegislationRuleRemediationService,
  ) {}

  async evaluateAndApply(draft: RuleSetRow, changeType: LegislationChangeType) {
    const verificationResults = await this.prisma.ruleVerificationResult.findMany({
      where: { ruleSetId: draft.id },
    });
    const layerResults: VerificationLayerResult[] = verificationResults.map((result) => ({
      layer: result.layer,
      passed: result.passed,
      details: result.details as Record<string, unknown>,
    }));
    const confidenceScore =
      layerResults.length === 0
        ? 0
        : layerResults.filter((r) => r.passed).length / layerResults.length;

    const decision = decideReleaseRisk({
      changeType,
      verificationResults: layerResults,
      confidenceScore,
    });

    if (decision.outcome === "AUTO_PUBLISH") {
      await this.publish(draft, confidenceScore);
    } else {
      await this.prisma.ruleSet.update({
        where: { id: draft.id },
        data: { status: "VERIFIED", confidenceScore, verifiedAt: new Date() },
      });
      const changeId = await this.getChangeId(draft.id);
      if (changeId) {
        await this.prisma.legislationChange.update({
          where: { id: changeId },
          data: { status: "HOLD_FOR_REVIEW" },
        });
      }
    }

    return decision;
  }

  /** Admin, `HOLD_FOR_REVIEW` durumundaki bir değişikliği elle onaylayıp yayınlar. */
  async approveManually(adminUserId: string, ruleSetId: string) {
    const draft = await this.prisma.ruleSet.findUnique({ where: { id: ruleSetId } });
    if (!draft) throw new NotFoundException("Aday kural sürümü bulunamadı.");

    await this.publish(draft, draft.confidenceScore ? Number(draft.confidenceScore) : 1);
    await this.auditLog.record({
      userId: adminUserId,
      action: "LEGISLATION_CHANGE_APPROVED",
      entityType: "RuleSet",
      entityId: draft.id,
      metadata: { ruleKey: draft.ruleKey, version: draft.version },
    });
  }

  /** Admin, `HOLD_FOR_REVIEW` durumundaki bir değişikliği reddeder;
   * kısıtlanmış eski sürüm yeniden güvenilir (ACTIVE) kabul edilir. */
  async rejectManually(adminUserId: string, ruleSetId: string) {
    const draft = await this.prisma.ruleSet.findUnique({ where: { id: ruleSetId } });
    if (!draft) throw new NotFoundException("Aday kural sürümü bulunamadı.");

    await this.prisma.ruleSet.update({
      where: { id: draft.id },
      data: { status: "REJECTED", isPublished: false },
    });

    if (draft.supersedesRuleSetId) {
      await this.prisma.ruleSet.update({
        where: { id: draft.supersedesRuleSetId },
        data: { status: "ACTIVE", isPublished: true },
      });
    }

    if (draft.changeId) {
      await this.prisma.legislationChange.update({
        where: { id: draft.changeId },
        data: { status: "REJECTED" },
      });
    }

    await this.auditLog.record({
      userId: adminUserId,
      action: "LEGISLATION_CHANGE_REJECTED",
      entityType: "RuleSet",
      entityId: draft.id,
      metadata: { ruleKey: draft.ruleKey, version: draft.version },
    });
  }

  private async publish(draft: RuleSetRow, confidenceScore: number): Promise<void> {
    const now = new Date();
    await this.prisma.ruleSet.update({
      where: { id: draft.id },
      data: {
        status: "ACTIVE",
        isPublished: true,
        publishedAt: now,
        verifiedAt: now,
        confidenceScore,
      },
    });

    if (draft.supersedesRuleSetId) {
      await this.prisma.ruleSet.update({
        where: { id: draft.supersedesRuleSetId },
        data: { status: "SUPERSEDED", isPublished: false, validTo: draft.validFrom },
      });
    }

    const changeId = await this.getChangeId(draft.id);
    if (changeId) {
      await this.prisma.legislationChange.update({
        where: { id: changeId },
        data: { status: "PUBLISHED" },
      });
    }

    await this.remediation.remediate(draft.id);
  }

  private async getChangeId(ruleSetId: string): Promise<string | null> {
    const row = await this.prisma.ruleSet.findUnique({
      where: { id: ruleSetId },
      select: { changeId: true },
    });
    return row?.changeId ?? null;
  }
}
