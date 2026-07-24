import { Processor, WorkerHost } from "@nestjs/bullmq";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { NotificationsService } from "./notifications.service";
import { NOTIFICATIONS_QUEUE } from "./notification-queue.token";

/**
 * Zamanlanmış bildirimlerin gerçek teslimatı (Bölüm 21 — Bildirim
 * Altyapısı). `NotificationsSchedulerService` bu kuyruğa her dakika
 * tekrarlayan bir iş ekler; bu worker her tetiklendiğinde zamanı
 * gelmiş tüm bildirimleri tarar ve Expo üzerinden gönderir.
 */
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsDeliveryProcessor extends WorkerHost {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(): Promise<void> {
    await this.notificationsService.deliverDueNotifications();
  }
}
