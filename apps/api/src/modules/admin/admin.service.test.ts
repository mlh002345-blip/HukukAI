import { describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { AdminService } from "./admin.service";

function createPrismaMock() {
  return {
    user: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
    document: { count: vi.fn(), findMany: vi.fn() },
    deadline: { count: vi.fn() },
    calculation: { count: vi.fn() },
    ruleSet: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), findUnique: vi.fn(), count: vi.fn() },
    holiday: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    documentAnalysis: { groupBy: vi.fn(), aggregate: vi.fn() },
  };
}

function createAuditLogMock() {
  return { record: vi.fn().mockResolvedValue(undefined), findAll: vi.fn() };
}

function buildService() {
  const prisma = createPrismaMock();
  const auditLog = createAuditLogMock();
  const service = new AdminService(prisma as never, auditLog as never);
  return { service, prisma, auditLog };
}

describe("AdminService.freezeUser", () => {
  it("kullanıcıyı dondurur ve audit log kaydeder", async () => {
    const { service, prisma, auditLog } = buildService();
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: "user-1" })
      .mockResolvedValueOnce({
        id: "user-1",
        email: "a@b.com",
        fullName: "Ali",
        role: "CITIZEN",
        subscriptionPlan: "FREE",
        isActive: false,
        createdAt: new Date(),
      });
    prisma.document.count.mockResolvedValue(0);
    prisma.deadline.count.mockResolvedValue(0);
    prisma.calculation.count.mockResolvedValue(0);

    const result = await service.freezeUser("admin-1", "user-1");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { isActive: false },
    });
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "USER_FROZEN", entityId: "user-1" }),
    );
    expect(result.isActive).toBe(false);
  });

  it("kullanıcı bulunamazsa NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.freezeUser("admin-1", "user-x")).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe("AdminService.publishRuleSet", () => {
  it("kuralı yayınlar ve audit log kaydeder", async () => {
    const { service, prisma, auditLog } = buildService();
    prisma.ruleSet.findUnique.mockResolvedValue({ id: "rule-1" });
    prisma.ruleSet.update.mockResolvedValue({
      id: "rule-1",
      module: "DEADLINE",
      ruleKey: "TR_TEST",
      version: "1.0.0",
      validFrom: new Date("2026-01-01T00:00:00.000Z"),
      validTo: null,
      isPublished: true,
      publishedAt: new Date("2026-01-02T00:00:00.000Z"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const result = await service.publishRuleSet("admin-1", "rule-1");

    expect(result.isPublished).toBe(true);
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "RULE_SET_PUBLISHED" }),
    );
  });

  it("kural bulunamazsa NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.ruleSet.findUnique.mockResolvedValue(null);

    await expect(service.publishRuleSet("admin-1", "rule-x")).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe("AdminService.createHoliday", () => {
  it("resmi tatili oluşturur ve audit log kaydeder", async () => {
    const { service, prisma, auditLog } = buildService();
    prisma.holiday.create.mockResolvedValue({
      id: "holiday-1",
      date: new Date("2026-01-01T00:00:00.000Z"),
      name: "Yılbaşı",
      isHalfDay: false,
      source: null,
    });

    const result = await service.createHoliday("admin-1", {
      date: "2026-01-01",
      name: "Yılbaşı",
      isHalfDay: false,
    });

    expect(result.name).toBe("Yılbaşı");
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "HOLIDAY_CREATED" }),
    );
  });
});

describe("AdminService.deleteHoliday", () => {
  it("bulunamayan resmi tatil için NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.holiday.findUnique.mockResolvedValue(null);

    await expect(service.deleteHoliday("admin-1", "holiday-x")).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe("AdminService.getAiUsage", () => {
  it("sağlayıcı/model bazında toplamları döner", async () => {
    const { service, prisma } = buildService();
    prisma.documentAnalysis.groupBy.mockResolvedValue([
      {
        provider: "mock",
        model: "mock-heuristic-v1",
        _count: { _all: 5 },
        _sum: { inputTokens: 100, outputTokens: 200, estimatedCostUsd: null },
      },
    ]);

    const result = await service.getAiUsage();

    expect(result).toEqual([
      {
        provider: "mock",
        model: "mock-heuristic-v1",
        analysisCount: 5,
        totalInputTokens: 100,
        totalOutputTokens: 200,
        totalEstimatedCostUsd: "0",
      },
    ]);
  });
});

describe("AdminService.getDashboard", () => {
  it("özet sayaçları döner", async () => {
    const { service, prisma } = buildService();
    prisma.user.count.mockResolvedValueOnce(10).mockResolvedValueOnce(8);
    prisma.document.count.mockResolvedValue(2);
    prisma.ruleSet.count.mockResolvedValue(3);
    prisma.documentAnalysis.aggregate.mockResolvedValue({
      _sum: { estimatedCostUsd: null },
    });

    const result = await service.getDashboard();

    expect(result).toEqual({
      totalUsers: 10,
      activeUsers: 8,
      failedDocumentsCount: 2,
      unpublishedRuleSetsCount: 3,
      monthlyAiCostUsd: "0",
    });
  });
});
