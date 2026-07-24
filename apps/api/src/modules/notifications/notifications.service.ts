import { BadRequestException, Injectable } from "@nestjs/common";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ExpoPushService } from "./expo-push.service";

const DELIVERY_BATCH_SIZE = 100;

export interface DeliveryRunSummary {
  sent: number;
  failed: number;
  skipped: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expoPush: ExpoPushService,
  ) {}

  async registerPushToken(userId: string, token: string): Promise<{ success: boolean }> {
    if (!this.expoPush.isValidToken(token)) {
      throw new BadRequestException("Geçersiz Expo push token.");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    });
    return { success: true };
  }

  /**
   * Zamanı gelmiş ve henüz gönderilmemiş bildirimleri Expo üzerinden
   * teslim eder. `NotificationsDeliveryProcessor` tarafından her
   * dakika (BullMQ tekrarlayan işi) çağrılır.
   */
  async deliverDueNotifications(now: Date = new Date()): Promise<DeliveryRunSummary> {
    const due = await this.prisma.notification.findMany({
      where: { scheduledAt: { lte: now }, sentAt: null, failedAt: null },
      include: { user: { select: { expoPushToken: true } } },
      orderBy: { scheduledAt: "asc" },
      take: DELIVERY_BATCH_SIZE,
    });

    const summary: DeliveryRunSummary = { sent: 0, failed: 0, skipped: 0 };

    for (const notification of due) {
      const token = notification.user.expoPushToken;
      if (!token) {
        // Kullanıcı push token'ı henüz kaydetmemiş; tekrar denemenin
        // anlamı yok (kullanıcı uygulamayı açmadan bildirim alamaz).
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { failedAt: now },
        });
        summary.skipped += 1;
        continue;
      }

      const result = await this.expoPush.send(token, notification.title, notification.body);
      if (result.success) {
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { sentAt: now, providerId: result.ticketId ?? null },
        });
        summary.sent += 1;
      } else {
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { failedAt: now },
        });
        summary.failed += 1;
      }
    }

    return summary;
  }
}
