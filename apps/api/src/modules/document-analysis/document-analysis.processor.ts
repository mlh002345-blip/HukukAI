import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { DocumentAnalysisService } from "./document-analysis.service";
import { DOCUMENT_ANALYSIS_QUEUE } from "./ai-provider.token";

interface AnalyzeJobData {
  documentId: string;
}

/**
 * Belge işleme asenkron yapılır (Bölüm 12): OCR ve AI adımları bu
 * BullMQ worker'ında çalışır, API isteği hemen döner.
 */
@Processor(DOCUMENT_ANALYSIS_QUEUE)
export class DocumentAnalysisProcessor extends WorkerHost {
  constructor(
    private readonly documentAnalysisService: DocumentAnalysisService,
  ) {
    super();
  }

  async process(job: Job<AnalyzeJobData>): Promise<void> {
    await this.documentAnalysisService.runPipeline(job.data.documentId);
  }
}
