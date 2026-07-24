import { Injectable, type OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import { LEGISLATION_QUEUE, POLL_LEGISLATION_SOURCES_JOB } from "./legislation-queue.token";

/** `NotificationsSchedulerService` ile aynı desen — bkz. o dosya. */
const POLL_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Uygulama açılışında, mevzuat kaynak tarama için her 15 dakikada bir
 * tekrarlayan bir BullMQ işi kaydeder (kullanıcının Resmî Gazete için
 * belirttiği en sık tarama aralığı). Aynı `jobId` + `repeat`
 * yapılandırmasıyla tekrar çağrılması yinelenen iş oluşturmaz.
 */
@Injectable()
export class LegislationSourceWatcherScheduler implements OnModuleInit {
  constructor(
    @InjectQueue(LEGISLATION_QUEUE) private readonly queue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queue.add(
      POLL_LEGISLATION_SOURCES_JOB,
      {},
      {
        repeat: { every: POLL_INTERVAL_MS },
        jobId: POLL_LEGISLATION_SOURCES_JOB,
      },
    );
  }
}
