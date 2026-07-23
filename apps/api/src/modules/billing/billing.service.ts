import { BadRequestException, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { SubscriptionPlan } from "@hukukai/types";
import type { PlanCatalogEntry, UsageSummary } from "@hukukai/types";
import {
  ONE_TIME_CREDIT_PACK,
  PLAN_LIMITS,
  SUBSCRIBABLE_PLANS,
  evaluateActiveDeadlineLimit,
  evaluateAnalysisQuota,
  evaluatePageLimit,
  periodKeyForDate,
  type PaymentProvider,
} from "@hukukai/billing";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";
import { PAYMENT_PROVIDER_TOKEN } from "./payment-provider.token";

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER_TOKEN) private readonly paymentProvider: PaymentProvider,
  ) {}

  listPlans(): PlanCatalogEntry[] {
    return SUBSCRIBABLE_PLANS.map((plan) => {
      const limits = PLAN_LIMITS[plan];
      return {
        plan,
        monthlyDocumentAnalyses: limits.monthlyDocumentAnalyses,
        pageLimit: limits.pageLimit,
        activeDeadlineLimit: limits.activeDeadlineLimit,
        watermarkReports: limits.watermarkReports,
        monthlyPriceTRY: limits.monthlyPriceTRY.toFixed(2),
      };
    });
  }

  getOneTimeCreditPack(): { credits: number; priceTRY: string } {
    return {
      credits: ONE_TIME_CREDIT_PACK.credits,
      priceTRY: ONE_TIME_CREDIT_PACK.priceTRY.toFixed(2),
    };
  }

  async getUsage(userId: string): Promise<UsageSummary> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { subscriptionPlan: true, oneTimeCreditsRemaining: true },
    });
    const periodKey = periodKeyForDate(new Date());
    const counter = await this.getOrCreateUsageCounter(userId, periodKey);
    const activeDeadlineCount = await this.prisma.deadline.count({
      where: { userId, status: "ACTIVE" },
    });
    const limits = PLAN_LIMITS[user.subscriptionPlan];

    return {
      plan: user.subscriptionPlan,
      periodKey,
      monthlyDocumentAnalysesUsed: counter.documentAnalysisCount,
      monthlyDocumentAnalysesLimit: limits.monthlyDocumentAnalyses,
      pageLimit: limits.pageLimit,
      activeDeadlineCount,
      activeDeadlineLimit: limits.activeDeadlineLimit,
      oneTimeCreditsRemaining: user.oneTimeCreditsRemaining,
      watermarkReports: limits.watermarkReports,
    };
  }

  async subscribe(userId: string, plan: SubscriptionPlan): Promise<UsageSummary> {
    const result = await this.paymentProvider.chargeSubscription(userId, plan);
    if (!result.success) {
      throw new BadRequestException("Ödeme işlemi başarısız oldu.");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: plan },
    });
    await this.prisma.paymentTransaction.create({
      data: {
        userId,
        type: "SUBSCRIPTION_UPGRADE",
        plan,
        amount: PLAN_LIMITS[plan].monthlyPriceTRY.toFixed(2),
        currency: "TRY",
        status: "COMPLETED",
        provider: this.paymentProvider.name,
        providerReference: result.providerReference,
      },
    });

    return this.getUsage(userId);
  }

  async purchaseOneTimeCredits(userId: string): Promise<UsageSummary> {
    const result = await this.paymentProvider.chargeOneTimeCreditPack(userId);
    if (!result.success) {
      throw new BadRequestException("Ödeme işlemi başarısız oldu.");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { oneTimeCreditsRemaining: { increment: ONE_TIME_CREDIT_PACK.credits } },
    });
    await this.prisma.paymentTransaction.create({
      data: {
        userId,
        type: "ONE_TIME_CREDIT_PACK",
        creditsAdded: ONE_TIME_CREDIT_PACK.credits,
        amount: ONE_TIME_CREDIT_PACK.priceTRY.toFixed(2),
        currency: "TRY",
        status: "COMPLETED",
        provider: this.paymentProvider.name,
        providerReference: result.providerReference,
      },
    });

    return this.getUsage(userId);
  }

  /** Belge analizi başlatılmadan önce çağrılır; kotayı/krediyi rezerve eder. */
  async reserveAnalysisQuota(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { subscriptionPlan: true, oneTimeCreditsRemaining: true },
    });
    const periodKey = periodKeyForDate(new Date());
    const counter = await this.getOrCreateUsageCounter(userId, periodKey);

    const decision = evaluateAnalysisQuota({
      plan: user.subscriptionPlan,
      monthlyAnalysesUsed: counter.documentAnalysisCount,
      oneTimeCreditsRemaining: user.oneTimeCreditsRemaining,
    });
    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason);
    }

    if (decision.source === "PLAN_QUOTA") {
      await this.prisma.usageCounter.update({
        where: { id: counter.id },
        data: { documentAnalysisCount: { increment: 1 } },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { oneTimeCreditsRemaining: { decrement: 1 } },
      });
    }
  }

  /** Bir belgenin sayfa sayısının paket sınırını aşıp aşmadığını denetler. */
  assertPageLimit(plan: SubscriptionPlan, pageCount: number): void {
    const decision = evaluatePageLimit(plan, pageCount);
    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason);
    }
  }

  /** Yeni bir süre (deadline) oluşturulmadan önce aktif süre sınırını denetler. */
  async assertActiveDeadlineLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { subscriptionPlan: true },
    });
    const activeDeadlineCount = await this.prisma.deadline.count({
      where: { userId, status: "ACTIVE" },
    });
    const decision = evaluateActiveDeadlineLimit(user.subscriptionPlan, activeDeadlineCount);
    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason);
    }
  }

  private async getOrCreateUsageCounter(userId: string, periodKey: string) {
    const existing = await this.prisma.usageCounter.findUnique({
      where: { userId_periodKey: { userId, periodKey } },
    });
    if (existing) return existing;

    return this.prisma.usageCounter.create({
      data: { userId, periodKey, documentAnalysisCount: 0 },
    });
  }
}
