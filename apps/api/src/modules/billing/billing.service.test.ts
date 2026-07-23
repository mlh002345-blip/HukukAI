import { describe, expect, it, vi } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { BillingService } from "./billing.service";

function createPrismaMock() {
  return {
    user: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    usageCounter: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    deadline: { count: vi.fn() },
    paymentTransaction: { create: vi.fn() },
  };
}

function createPaymentProviderMock() {
  return {
    name: "mock",
    chargeSubscription: vi.fn(),
    chargeOneTimeCreditPack: vi.fn(),
  };
}

function buildService() {
  const prisma = createPrismaMock();
  const paymentProvider = createPaymentProviderMock();
  const service = new BillingService(prisma as never, paymentProvider as never);
  return { service, prisma, paymentProvider };
}

describe("BillingService.getUsage", () => {
  it("mevcut plan ve kullanım özetini döner", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      subscriptionPlan: "FREE",
      oneTimeCreditsRemaining: 1,
    });
    prisma.usageCounter.findUnique.mockResolvedValue({
      id: "counter-1",
      documentAnalysisCount: 1,
    });
    prisma.deadline.count.mockResolvedValue(2);

    const usage = await service.getUsage("user-1");

    expect(usage.plan).toBe("FREE");
    expect(usage.monthlyDocumentAnalysesUsed).toBe(1);
    expect(usage.monthlyDocumentAnalysesLimit).toBe(2);
    expect(usage.activeDeadlineCount).toBe(2);
    expect(usage.oneTimeCreditsRemaining).toBe(1);
    expect(usage.watermarkReports).toBe(true);
  });

  it("kullanım sayacı yoksa oluşturur", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      subscriptionPlan: "FREE",
      oneTimeCreditsRemaining: 0,
    });
    prisma.usageCounter.findUnique.mockResolvedValue(null);
    prisma.usageCounter.create.mockResolvedValue({
      id: "counter-new",
      documentAnalysisCount: 0,
    });
    prisma.deadline.count.mockResolvedValue(0);

    const usage = await service.getUsage("user-1");

    expect(prisma.usageCounter.create).toHaveBeenCalled();
    expect(usage.monthlyDocumentAnalysesUsed).toBe(0);
  });
});

describe("BillingService.reserveAnalysisQuota", () => {
  it("kota varsa sayaç arttırılır", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      subscriptionPlan: "FREE",
      oneTimeCreditsRemaining: 0,
    });
    prisma.usageCounter.findUnique.mockResolvedValue({
      id: "counter-1",
      documentAnalysisCount: 0,
    });

    await service.reserveAnalysisQuota("user-1");

    expect(prisma.usageCounter.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "counter-1" },
        data: { documentAnalysisCount: { increment: 1 } },
      }),
    );
  });

  it("kota dolu ama kredi varsa kredi düşülür", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      subscriptionPlan: "FREE",
      oneTimeCreditsRemaining: 2,
    });
    prisma.usageCounter.findUnique.mockResolvedValue({
      id: "counter-1",
      documentAnalysisCount: 2,
    });

    await service.reserveAnalysisQuota("user-1");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { oneTimeCreditsRemaining: { decrement: 1 } },
      }),
    );
  });

  it("kota ve kredi tükendiyse ForbiddenException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      subscriptionPlan: "FREE",
      oneTimeCreditsRemaining: 0,
    });
    prisma.usageCounter.findUnique.mockResolvedValue({
      id: "counter-1",
      documentAnalysisCount: 2,
    });

    await expect(service.reserveAnalysisQuota("user-1")).rejects.toThrow(
      ForbiddenException,
    );
  });
});

describe("BillingService.assertActiveDeadlineLimit", () => {
  it("sınır altındaysa hata fırlatmaz", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUniqueOrThrow.mockResolvedValue({ subscriptionPlan: "FREE" });
    prisma.deadline.count.mockResolvedValue(1);

    await expect(service.assertActiveDeadlineLimit("user-1")).resolves.toBeUndefined();
  });

  it("sınır aşıldıysa ForbiddenException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUniqueOrThrow.mockResolvedValue({ subscriptionPlan: "FREE" });
    prisma.deadline.count.mockResolvedValue(3);

    await expect(service.assertActiveDeadlineLimit("user-1")).rejects.toThrow(
      ForbiddenException,
    );
  });
});

describe("BillingService.assertPageLimit", () => {
  it("sınır altındaysa hata fırlatmaz", () => {
    const { service } = buildService();
    expect(() => service.assertPageLimit("FREE", 5)).not.toThrow();
  });

  it("sınır aşıldıysa ForbiddenException fırlatır", () => {
    const { service } = buildService();
    expect(() => service.assertPageLimit("FREE", 50)).toThrow(ForbiddenException);
  });
});

describe("BillingService.subscribe", () => {
  it("ödeme başarılıysa planı günceller ve işlem kaydeder", async () => {
    const { service, prisma, paymentProvider } = buildService();
    paymentProvider.chargeSubscription.mockResolvedValue({
      success: true,
      providerReference: "MOCK-SUB-123",
    });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      subscriptionPlan: "PRO",
      oneTimeCreditsRemaining: 0,
    });
    prisma.usageCounter.findUnique.mockResolvedValue({
      id: "counter-1",
      documentAnalysisCount: 0,
    });
    prisma.deadline.count.mockResolvedValue(0);

    const usage = await service.subscribe("user-1", "PRO");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { subscriptionPlan: "PRO" } }),
    );
    expect(prisma.paymentTransaction.create).toHaveBeenCalled();
    expect(usage.plan).toBe("PRO");
  });

  it("ödeme başarısızsa BadRequestException fırlatır", async () => {
    const { service, paymentProvider } = buildService();
    paymentProvider.chargeSubscription.mockResolvedValue({
      success: false,
      providerReference: "MOCK-SUB-FAIL",
    });

    await expect(service.subscribe("user-1", "PRO")).rejects.toThrow();
  });
});

describe("BillingService.purchaseOneTimeCredits", () => {
  it("ödeme başarılıysa kredi bakiyesini arttırır", async () => {
    const { service, prisma, paymentProvider } = buildService();
    paymentProvider.chargeOneTimeCreditPack.mockResolvedValue({
      success: true,
      providerReference: "MOCK-CREDIT-123",
    });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      subscriptionPlan: "FREE",
      oneTimeCreditsRemaining: 5,
    });
    prisma.usageCounter.findUnique.mockResolvedValue({
      id: "counter-1",
      documentAnalysisCount: 0,
    });
    prisma.deadline.count.mockResolvedValue(0);

    await service.purchaseOneTimeCredits("user-1");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { oneTimeCreditsRemaining: { increment: 5 } },
      }),
    );
    expect(prisma.paymentTransaction.create).toHaveBeenCalled();
  });
});
