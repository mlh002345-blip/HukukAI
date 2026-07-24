import { Injectable, type OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import {
  DELIVER_DUE_NOTIFICATIONS_JOB,
  NOTIFICATIONS_QUEUE,
} from "./notification-queue.token";

const DELIVERY_INTERVAL_MS = 60_000;

/**
 * Uygulama açılışında, bildirim teslimatı için her dakika tekrarlayan
 * bir BullMQ işi kaydeder. Aynı `jobId` + `repeat` yapılandırmasıyla
 * tekrar çağrılması (ör. yeniden başlatma) yinelenen iş oluşturmaz.
 */
@Injectable()
export class NotificationsSchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queue.add(
      DELIVER_DUE_NOTIFICATIONS_JOB,
      {},
      {
        repeat: { every: DELIVERY_INTERVAL_MS },
        jobId: DELIVER_DUE_NOTIFICATIONS_JOB,
      },
    );
  }
}
