import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import {
  createMultiModelConsensusProvider,
  createSourceWatcherProvider,
} from "@hukukai/legislation-agents";
import type { ApiEnv } from "@hukukai/config";
import { AuditModule } from "../audit/audit.module";
import { LegislationController } from "./legislation.controller";
import { LegislationAdminService } from "./legislation-admin.service";
import { LegislationSourceWatcherService } from "./legislation-source-watcher.service";
import { LegislationLegalDiffService } from "./legislation-legal-diff.service";
import { LegislationImpactAnalysisService } from "./legislation-impact-analysis.service";
import { LegislationRuleAuthorService } from "./legislation-rule-author.service";
import { LegislationIndependentReviewService } from "./legislation-independent-review.service";
import { LegislationRuleVerificationService } from "./legislation-rule-verification.service";
import { LegislationReleaseDecisionService } from "./legislation-release-decision.service";
import { LegislationRuleRemediationService } from "./legislation-rule-remediation.service";
import { LegislationPipelineService } from "./legislation-pipeline.service";
import { LegislationSourceWatcherScheduler } from "./legislation-source-watcher.scheduler";
import { LegislationSourceWatcherProcessor } from "./legislation-source-watcher.processor";
import {
  LEGISLATION_QUEUE,
  MULTI_MODEL_CONSENSUS_PROVIDER_TOKEN,
  SOURCE_WATCHER_PROVIDER_TOKEN,
} from "./legislation-queue.token";

@Module({
  imports: [AuditModule, BullModule.registerQueue({ name: LEGISLATION_QUEUE })],
  controllers: [LegislationController],
  providers: [
    LegislationAdminService,
    LegislationSourceWatcherService,
    LegislationLegalDiffService,
    LegislationImpactAnalysisService,
    LegislationRuleAuthorService,
    LegislationIndependentReviewService,
    LegislationRuleVerificationService,
    LegislationReleaseDecisionService,
    LegislationRuleRemediationService,
    LegislationPipelineService,
    LegislationSourceWatcherScheduler,
    LegislationSourceWatcherProcessor,
    {
      provide: SOURCE_WATCHER_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService<ApiEnv, true>) =>
        createSourceWatcherProvider({
          LEGISLATION_SOURCE_WATCHER: configService.get("LEGISLATION_SOURCE_WATCHER", {
            infer: true,
          }),
        }),
      inject: [ConfigService],
    },
    {
      provide: MULTI_MODEL_CONSENSUS_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService<ApiEnv, true>) =>
        createMultiModelConsensusProvider({
          LEGISLATION_CONSENSUS_PROVIDER: configService.get(
            "LEGISLATION_CONSENSUS_PROVIDER",
            { infer: true },
          ),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [LegislationPipelineService],
})
export class LegislationModule {}
