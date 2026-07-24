import { describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { RulesService } from "./rules.service";
import { RuleUnderReviewException } from "./rule-under-review.exception";

function createPrismaMock() {
  return {
    ruleSet: { findMany: vi.fn() },
    holiday: { findMany: vi.fn() },
  };
}

function ruleRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
    version: "1.0.0",
    validFrom: new Date("2020-01-01T00:00:00.000Z"),
    validTo: null,
    isPublished: true,
    status: "ACTIVE",
    ruleData: {
      conditions: [
        { field: "documentType", operator: "EQUALS", value: "TRAFFIC_ADMINISTRATIVE_FINE" },
      ],
      calculation: {
        duration: 15,
        durationUnit: "DAY",
        dayType: "CALENDAR_DAY",
        includeStartDate: false,
        extendIfHoliday: true,
      },
      warnings: ["test uyarısı"],
    },
    legalBasis: [{ law: "Kabahatler Kanunu", article: "27" }],
    ...overrides,
  };
}

describe("RulesService.getRuleValidOn", () => {
  it("verilen tarihte geçerli kuralı döner", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findMany.mockResolvedValue([ruleRow()]);
    const service = new RulesService(prisma as never);

    const rule = await service.getRuleValidOn(
      "TR_TRAFFIC_FINE_OBJECTION",
      "2026-06-20",
    );

    expect(rule.version).toBe("1.0.0");
    expect(rule.data.duration).toBe(15);
    expect(rule.legalBasis).toEqual([{ law: "Kabahatler Kanunu", article: "27" }]);
  });

  it("hiçbir sürüm geçerli değilse NotFoundException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findMany.mockResolvedValue([
      ruleRow({ validFrom: new Date("2030-01-01T00:00:00.000Z") }),
    ]);
    const service = new RulesService(prisma as never);

    await expect(
      service.getRuleValidOn("TR_TRAFFIC_FINE_OBJECTION", "2024-01-01"),
    ).rejects.toThrow(NotFoundException);
  });

  it("yayınlanmamış (isPublished:false) bir sürümü asla döndürmez", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findMany.mockResolvedValue([ruleRow({ isPublished: false })]);
    const service = new RulesService(prisma as never);

    await expect(
      service.getRuleValidOn("TR_TRAFFIC_FINE_OBJECTION", "2026-06-20"),
    ).rejects.toThrow(NotFoundException);
  });

  it("fail-closed: yayınlanmış sürüm yok ama TEMPORARILY_RESTRICTED bir sürüm o tarihte geçerli olacaksa RuleUnderReviewException fırlatır (NotFoundException değil)", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findMany.mockResolvedValue([
      ruleRow({ isPublished: false, status: "TEMPORARILY_RESTRICTED" }),
    ]);
    const service = new RulesService(prisma as never);

    await expect(
      service.getRuleValidOn("TR_TRAFFIC_FINE_OBJECTION", "2026-06-20"),
    ).rejects.toThrow(RuleUnderReviewException);
  });

  it("TEMPORARILY_RESTRICTED sürüm o tarihte zaten geçerli değilse (validFrom sonraki bir tarihte) normal NotFoundException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findMany.mockResolvedValue([
      ruleRow({
        isPublished: false,
        status: "TEMPORARILY_RESTRICTED",
        validFrom: new Date("2030-01-01T00:00:00.000Z"),
      }),
    ]);
    const service = new RulesService(prisma as never);

    await expect(
      service.getRuleValidOn("TR_TRAFFIC_FINE_OBJECTION", "2026-06-20"),
    ).rejects.toThrow(NotFoundException);
  });
});

describe("RulesService.findApplicableRule", () => {
  it("olgulara (facts) uyan kuralı bulur", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findMany.mockResolvedValue([ruleRow()]);
    const service = new RulesService(prisma as never);

    const rule = await service.findApplicableRule(
      "DEADLINE",
      { documentType: "TRAFFIC_ADMINISTRATIVE_FINE" },
      "2026-06-20",
    );
    expect(rule.ruleKey).toBe("TR_TRAFFIC_FINE_OBJECTION");
  });

  it("eşleşme yoksa NotFoundException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findMany.mockResolvedValue([ruleRow()]);
    const service = new RulesService(prisma as never);

    await expect(
      service.findApplicableRule("DEADLINE", { documentType: "TAX_NOTICE" }, "2026-06-20"),
    ).rejects.toThrow(NotFoundException);
  });

  it("fail-closed: olgulara uyan yayınlanmış kural yok ama TEMPORARILY_RESTRICTED bir sürüm uyuyorsa RuleUnderReviewException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findMany.mockResolvedValue([
      ruleRow({ isPublished: false, status: "TEMPORARILY_RESTRICTED" }),
    ]);
    const service = new RulesService(prisma as never);

    await expect(
      service.findApplicableRule(
        "DEADLINE",
        { documentType: "TRAFFIC_ADMINISTRATIVE_FINE" },
        "2026-06-20",
      ),
    ).rejects.toThrow(RuleUnderReviewException);
  });
});

describe("RulesService.getHolidays", () => {
  it("resmi tatilleri ISO tarih olarak döner", async () => {
    const prisma = createPrismaMock();
    prisma.holiday.findMany.mockResolvedValue([
      { date: new Date("2026-01-01T00:00:00.000Z"), isHalfDay: false },
    ]);
    const service = new RulesService(prisma as never);

    expect(await service.getHolidays()).toEqual([
      { date: "2026-01-01", isHalfDay: false },
    ]);
  });
});
