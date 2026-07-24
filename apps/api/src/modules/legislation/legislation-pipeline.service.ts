import { Injectable } from "@nestjs/common";
import type { LegislationChangeType } from "@hukukai/legislation-agents";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationSourceWatcherService } from "./legislation-source-watcher.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationLegalDiffService } from "./legislation-legal-diff.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationImpactAnalysisService } from "./legislation-impact-analysis.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationRuleAuthorService } from "./legislation-rule-author.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationRuleVerificationService } from "./legislation-rule-verification.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationReleaseDecisionService } from "./legislation-release-decision.service";

/**
 * Otonom Mevzuat Sistemi'nin uçtan uca boru hattı:
 *
 * Kaynak tarama → değişiklik tespiti → etki analizi (fail-closed geçiş)
 * → kural üretimi → çok katmanlı doğrulama → yayın kararı (otomatik
 * yayın veya admin incelemesi).
 *
 * `LegislationSourceWatcherScheduler` bu döngüyü periyodik olarak
 * tetikler (BullMQ). Her adım kendi servisine devredilir; bu sınıf
 * yalnızca akışı düzenler, iş mantığı içermez.
 */
@Injectable()
export class LegislationPipelineService {
  constructor(
    private readonly sourceWatcher: LegislationSourceWatcherService,
    private readonly legalDiff: LegislationLegalDiffService,
    private readonly impactAnalysis: LegislationImpactAnalysisService,
    private readonly ruleAuthor: LegislationRuleAuthorService,
    private readonly verification: LegislationRuleVerificationService,
    private readonly releaseDecision: LegislationReleaseDecisionService,
    private readonly prisma: PrismaService,
  ) {}

  async runPollingCycle(): Promise<void> {
    const newDocuments = await this.sourceWatcher.pollAllSources();

    for (const document of newDocuments) {
      const change = await this.legalDiff.detectChange(document);
      if (!change) continue;

      const { affectedRuleIds } = await this.impactAnalysis.analyze(change);
      if (affectedRuleIds.length === 0) continue;

      for (const ruleKey of affectedRuleIds) {
        const draft = await this.ruleAuthor.proposeDraft(change, document, ruleKey);
        if (!draft) continue;

        await this.prisma.legislationChange.update({
          where: { id: change.id },
          data: { status: "RULE_PROPOSED" },
        });

        await this.verification.verifyAll(draft, document);
        await this.releaseDecision.evaluateAndApply(
          draft,
          change.changeType as LegislationChangeType,
        );
      }
    }
  }
}
