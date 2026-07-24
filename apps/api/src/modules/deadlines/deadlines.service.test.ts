import { describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { DeadlinesService } from "./deadlines.service";

function createPrismaMock() {
  return {
    deadline: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    caseFolder: { findFirst: vi.fn() },
    document: { findFirst: vi.fn() },
    notification: { createMany: vi.fn() },
  };
}

function createRulesServiceMock() {
  return {
    getRuleValidOn: vi.fn(),
    findApplicableRule: vi.fn(),
    getHolidays: vi.fn().mockResolvedValue([]),
  };
}

function createBillingServiceMock() {
  return {
    assertActiveDeadlineLimit: vi.fn().mockResolvedValue(undefined),
  };
}

const sampleRule = {
  ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
  version: "1.0.0",
  validFrom: "2020-01-01",
  validTo: null,
  conditions: [],
  data: {
    duration: 15,
    durationUnit: "DAY" as const,
    dayType: "CALENDAR_DAY" as const,
    includeStartDate: false,
    extendIfHoliday: true,
  },
  legalBasis: [{ law: "Kabahatler Kanunu", article: "27" }],
  warnings: ["test uyarısı"],
  legislationStatus: {
    status: "ACTIVE",
    validFrom: "2020-01-01",
    validTo: null,
    verifiedAt: null,
    confidenceScore: null,
    sourceUrl: null,
  },
};

function buildService() {
  const prisma = createPrismaMock();
  const rulesService = createRulesServiceMock();
  const billingService = createBillingServiceMock();
  const service = new DeadlinesService(
    prisma as never,
    rulesService as never,
    billingService as never,
  );
  return { service, prisma, rulesService, billingService };
}

describe("DeadlinesService.calculate", () => {
  it("kuralı kullanarak süre hesabı döner", async () => {
    const { service, rulesService } = buildService();
    rulesService.getRuleValidOn.mockResolvedValue(sampleRule);

    const result = await service.calculate({
      ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
      startDate: "2026-01-01",
      startEvent: "TEBLIGAT",
    });

    expect(result.ruleId).toBe("TR_TRAFFIC_FINE_OBJECTION");
    expect(result.adjustedEndDate).toBe("2026-01-16");
    expect(result.legalBasis).toEqual(sampleRule.legalBasis);
  });
});

describe("DeadlinesService.create", () => {
  it("kural bazlı süreyi kaydeder ve hatırlatıcı oluşturur", async () => {
    const { service, prisma, rulesService } = buildService();
    rulesService.getRuleValidOn.mockResolvedValue(sampleRule);

    // Hatırlatıcıların planlanabilmesi için son gün her zaman "bugün"den
    // yeterince ileride olmalı; testin çalıştırıldığı tarihe göre sabit
    // kalması için dinamik olarak hesaplanır.
    const futureStartDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const futureStartDateIso = futureStartDate.toISOString().slice(0, 10);

    prisma.deadline.create.mockResolvedValue({
      id: "deadline-1",
      folderId: null,
      documentId: null,
      title: "Trafik cezası itirazı",
      ruleId: "TR_TRAFFIC_FINE_OBJECTION",
      ruleVersion: "1.0.0",
      startEvent: "TEBLIGAT",
      startDate: futureStartDate,
      calculatedEndDate: futureStartDate,
      adjustedEndDate: futureStartDate,
      status: "ACTIVE",
      legalBasis: sampleRule.legalBasis,
      warnings: sampleRule.warnings,
      completedAt: null,
      createdAt: new Date(),
    });

    const result = await service.create("user-1", {
      mode: "RULE",
      ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
      startDate: futureStartDateIso,
      startEvent: "TEBLIGAT",
      title: "Trafik cezası itirazı",
    });

    expect(result.status).toBe("ACTIVE");
    expect(prisma.notification.createMany).toHaveBeenCalled();
  });

  it("özel (CUSTOM) süreyi kural motorunu kullanmadan kaydeder", async () => {
    const { service, prisma, rulesService } = buildService();
    prisma.deadline.create.mockResolvedValue({
      id: "deadline-2",
      folderId: null,
      documentId: null,
      title: "Özel hatırlatıcı",
      ruleId: "CUSTOM",
      ruleVersion: "-",
      startEvent: "MANUAL",
      startDate: new Date(),
      calculatedEndDate: new Date("2026-03-01T00:00:00.000Z"),
      adjustedEndDate: new Date("2026-03-01T00:00:00.000Z"),
      status: "ACTIVE",
      legalBasis: [],
      warnings: ["Bu süre kullanıcı tarafından manuel olarak girilmiştir."],
      completedAt: null,
      createdAt: new Date(),
    });

    const result = await service.create("user-1", {
      mode: "CUSTOM",
      title: "Özel hatırlatıcı",
      dueDate: "2026-03-01",
    });

    expect(result.ruleId).toBe("CUSTOM");
    expect(rulesService.getRuleValidOn).not.toHaveBeenCalled();
  });

  it("aktif süre sınırı aşıldıysa reddeder ve kayıt oluşturmaz", async () => {
    const { service, prisma, billingService } = buildService();
    billingService.assertActiveDeadlineLimit.mockRejectedValue(
      new Error("Aktif süre sınırınıza ulaştınız."),
    );

    await expect(
      service.create("user-1", {
        mode: "CUSTOM",
        title: "Özel hatırlatıcı",
        dueDate: "2026-03-01",
      }),
    ).rejects.toThrow();
    expect(prisma.deadline.create).not.toHaveBeenCalled();
  });

  it("başkasına ait klasöre eklemeye çalışınca NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.caseFolder.findFirst.mockResolvedValue(null);

    await expect(
      service.create("user-1", {
        mode: "CUSTOM",
        title: "Özel hatırlatıcı",
        dueDate: "2026-03-01",
        folderId: "folder-x",
      }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe("DeadlinesService.complete / remove", () => {
  it("süreyi tamamlandı olarak işaretler", async () => {
    const { service, prisma } = buildService();
    prisma.deadline.findFirst.mockResolvedValue({ id: "deadline-1" });
    prisma.deadline.update.mockResolvedValue({
      id: "deadline-1",
      folderId: null,
      documentId: null,
      title: "t",
      ruleId: "CUSTOM",
      ruleVersion: "-",
      startEvent: "MANUAL",
      startDate: new Date(),
      calculatedEndDate: new Date(),
      adjustedEndDate: new Date(),
      status: "COMPLETED",
      legalBasis: [],
      warnings: [],
      completedAt: new Date(),
      createdAt: new Date(),
    });

    const result = await service.complete("user-1", "deadline-1");
    expect(result.status).toBe("COMPLETED");
  });

  it("başkasına ait süreyi silmeye çalışınca NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.deadline.findFirst.mockResolvedValue(null);

    await expect(service.remove("user-1", "deadline-x")).rejects.toThrow(
      NotFoundException,
    );
  });
});
