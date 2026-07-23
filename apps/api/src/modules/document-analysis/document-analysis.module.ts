import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import { createAIProvider } from "@hukukai/ai-provider";
import type { ApiEnv } from "@hukukai/config";
import { StorageModule } from "../storage/storage.module";
import { OcrModule } from "../ocr/ocr.module";
import { BillingModule } from "../billing/billing.module";
import { DocumentAnalysisController } from "./document-analysis.controller";
import { DocumentAnalysisService } from "./document-analysis.service";
import { DocumentAnalysisProcessor } from "./document-analysis.processor";
import { AI_PROVIDER_TOKEN, DOCUMENT_ANALYSIS_QUEUE } from "./ai-provider.token";

@Module({
  imports: [
    StorageModule,
    OcrModule,
    BillingModule,
    BullModule.registerQueue({ name: DOCUMENT_ANALYSIS_QUEUE }),
  ],
  controllers: [DocumentAnalysisController],
  providers: [
    DocumentAnalysisService,
    DocumentAnalysisProcessor,
    {
      provide: AI_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService<ApiEnv, true>) =>
        createAIProvider({
          AI_PROVIDER: configService.get("AI_PROVIDER", { infer: true }),
          AI_API_KEY: configService.get("AI_API_KEY", { infer: true }),
          AI_MODEL: configService.get("AI_MODEL", { infer: true }),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [DocumentAnalysisService],
})
export class DocumentAnalysisModule {}
