import { Injectable } from "@nestjs/common";
import { calculateDeadline, type DeadlineRuleCalculation } from "@hukukai/deadline-engine";
import type { Prisma } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Geriye dönük düzeltme (Bölüm: "Geriye dönük düzeltme"). Yeni bir
 * `RuleSet` yayınlandığında, yalnızca gelecekteki hesaplamaları
 * düzeltmekle kalmaz — eski sürümle hesaplanmış ve etkilenen
 * `Deadline` kayıtlarını yeni kuralla yeniden çalıştırır; sonuç
 * değişmişse eski kaydı `invalidatedAt` ile işaretler ve mevcut
 * `Notification` altyapısını (yeni bir bildirim sistemi kurmadan)
 * kullanarak kullanıcıya bildirir.
 *
 * **Kapsam notu:** yalnızca `Deadline` için çalışır. `Calculation`
 * (hesaplama motoru) henüz `RuleSet`ten oran okumadığından (Faz 6'dan
 * beri bilinen, önceden var olan bir boşluk) bu motor için geriye
 * dönük düzeltme bu pass'e dahil değildir.
 */
@Injectable()
export class LegislationRuleRemediationService {
  constructor(private readonly prisma: PrismaService) {}

  async remediate(newRuleSetId: string): Promise<void> {
    const newRuleSet = await this.prisma.ruleSet.findUnique({ where: { id: newRuleSetId } });
    if (!newRuleSet?.supersedesRuleSetId) return;

    const oldRuleSet = await this.prisma.ruleSet.findUnique({
      where: { id: newRuleSet.supersedesRuleSetId },
    });
    if (!oldRuleSet) return;

    const affectedDeadlines = await this.prisma.deadline.findMany({
      where: {
        ruleId: newRuleSet.ruleKey,
        ruleVersion: oldRuleSet.version,
        status: "ACTIVE",
        createdAt: { lt: newRuleSet.publishedAt ?? new Date() },
      },
    });
    if (affectedDeadlines.length === 0) return;

    const holidays = (await this.prisma.holiday.findMany()).map((holiday) => ({
      date: holiday.date.toISOString().slice(0, 10),
      isHalfDay: holiday.isHalfDay,
    }));
    const newData = newRuleSet.ruleData as unknown as { calculation: DeadlineRuleCalculation };

    const affectedIds: string[] = [];

    for (const deadline of affectedDeadlines) {
      const result = calculateDeadline({
        calculation: newData.calculation,
        startDate: deadline.startDate.toISOString().slice(0, 10),
        holidays,
      });
      const newAdjustedEndDate = new Date(`${result.adjustedEndDate}T00:00:00.000Z`);
      if (newAdjustedEndDate.getTime() === deadline.adjustedEndDate.getTime()) continue;

      await this.prisma.deadline.update({
        where: { id: deadline.id },
        data: { invalidatedAt: new Date() },
      });
      affectedIds.push(deadline.id);

      // scheduledAt=şimdi: mevcut NotificationsDeliveryProcessor (her
      // dakika çalışan BullMQ işi) bunu otomatik teslim eder — yeni bir
      // bildirim sistemi kurulmadı.
      await this.prisma.notification.create({
        data: {
          userId: deadline.userId,
          deadlineId: deadline.id,
          title: "Süre Yeniden Hesaplandı",
          body:
            `"${deadline.title}" için mevzuat değişikliği nedeniyle süreniz yeniden ` +
            "hesaplandı; önceki sonuç geçersiz kılındı. Lütfen güncel süreyi kontrol edin.",
          scheduledAt: new Date(),
        },
      });
    }

    if (affectedIds.length > 0) {
      await this.prisma.ruleRemediation.create({
        data: {
          supersededRuleSetId: oldRuleSet.id,
          newRuleSetId: newRuleSet.id,
          affectedDeadlineIds: affectedIds as unknown as Prisma.InputJsonValue,
          status: "RECALCULATED",
        },
      });
    }
  }
}
