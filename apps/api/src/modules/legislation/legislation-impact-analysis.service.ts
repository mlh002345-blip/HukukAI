import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import {
  AUTO_PUBLISH_ELIGIBLE_CHANGE_TYPES,
  NEVER_AUTO_PUBLISH_CHANGE_TYPES,
  type LegislationChangeType,
  type RiskLevel,
} from "@hukukai/legislation-agents";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";
import { resolveRuleImpact } from "./legislation-rule-impact-map";

type LegislationChangeRow = {
  id: string;
  affectedLegislation: string;
  changeType: string;
};

function computeRiskLevel(changeType: string, unmapped: boolean): RiskLevel {
  if (unmapped) return "HIGH";
  if (NEVER_AUTO_PUBLISH_CHANGE_TYPES.includes(changeType as LegislationChangeType)) {
    return "HIGH";
  }
  if (AUTO_PUBLISH_ELIGIBLE_CHANGE_TYPES.includes(changeType as LegislationChangeType)) {
    return "LOW";
  }
  return "MEDIUM";
}

/**
 * Impact Agent — bir `LegislationChange`in hangi `RuleSet.ruleKey`leri
 * etkilediğini belirler (`resolveRuleImpact` — bkz. kapsam notu) ve
 * **fail-closed** geçişi burada uygular: etkilenen her ruleKey'in o an
 * `ACTIVE` olan sürümü `TEMPORARILY_RESTRICTED`e çekilir ve
 * `isPublished: false` yapılır — `RulesService` artık bu sürümü
 * döndürmez, doğrulama tamamlanana kadar `RuleUnderReviewException`
 * fırlatır.
 */
@Injectable()
export class LegislationImpactAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(change: LegislationChangeRow) {
    const resolved = resolveRuleImpact(change.affectedLegislation);
    const affectedRuleIds = resolved?.ruleIds ?? [];
    const affectedModules = resolved ? [resolved.module] : [];
    const riskLevel = computeRiskLevel(change.changeType, resolved === null);

    const assessment = await this.prisma.ruleImpactAssessment.create({
      data: {
        changeId: change.id,
        affectedModules: affectedModules as unknown as Prisma.InputJsonValue,
        affectedRuleIds: affectedRuleIds as unknown as Prisma.InputJsonValue,
        // MVP: yalnızca ileriye dönük etki burada tespit edilir; geçmişe
        // etkisi (mevcut Deadline kayıtlarının yeniden hesaplanması)
        // ayrı bir aşamada (RuleRemediationService) değerlendirilir.
        historicalImpact: false,
        prospectiveImpact: true,
        requiresMigration: affectedRuleIds.length === 0,
        riskLevel,
      },
    });

    await this.prisma.legislationChange.update({
      where: { id: change.id },
      data: { status: "ANALYZING" },
    });

    for (const ruleKey of affectedRuleIds) {
      await this.prisma.ruleSet.updateMany({
        where: { ruleKey, status: "ACTIVE" },
        data: { status: "TEMPORARILY_RESTRICTED", isPublished: false },
      });
    }

    return { assessment, affectedRuleIds };
  }
}
