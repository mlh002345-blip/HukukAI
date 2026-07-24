import { Processor, WorkerHost } from "@nestjs/bullmq";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { LegislationPipelineService } from "./legislation-pipeline.service";
import { LEGISLATION_QUEUE } from "./legislation-queue.token";

/**
 * `LegislationSourceWatcherScheduler` bu kuyruğa her 15 dakikada bir
 * tekrarlayan bir iş ekler; bu worker her tetiklendiğinde tüm boru
 * hattını (`LegislationPipelineService.runPollingCycle`) bir kez
 * çalıştırır.
 */
@Processor(LEGISLATION_QUEUE)
export class LegislationSourceWatcherProcessor extends WorkerHost {
  constructor(private readonly pipeline: LegislationPipelineService) {
    super();
  }

  async process(): Promise<void> {
    await this.pipeline.runPollingCycle();
  }
}
