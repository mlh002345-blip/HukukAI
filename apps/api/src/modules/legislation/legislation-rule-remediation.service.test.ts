import { describe, expect, it, vi } from "vitest";
import { LegislationRuleRemediationService } from "./legislation-rule-remediation.service";

function createPrismaMock() {
  return {
    ruleSet: { findUnique: vi.fn() },
    deadline: { findMany: vi.fn(), update: vi.fn() },
    holiday: { findMany: vi.fn().mockResolvedValue([]) },
    notification: { create: vi.fn() },
    ruleRemediation: { create: vi.fn() },
  };
}

const NEW_RULE_SET = {
  id: "new-1",
  ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
  supersedesRuleSetId: "old-1",
  publishedAt: new Date("2026-07-05T00:00:00.000Z"),
  ruleData: {
    calculation: { duration: 30, durationUnit: "DAY", dayType: "CALENDAR_DAY", includeStartDate: false, extendIfHoliday: false },
  },
};

const OLD_RULE_SET = {
  id: "old-1",
  version: "1.0.0",
  ruleData: {
    calculation: { duration: 15, durationUnit: "DAY", dayType: "CALENDAR_DAY", includeStartDate: false, extendIfHoliday: false },
  },
};

describe("LegislationRuleRemediationService.remediate", () => {
  it("yeni kuralla sonucu değişen geçmiş Deadline kayıtlarını invalidatedAt ile işaretler ve bildirim oluşturur", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(where.id === "new-1" ? NEW_RULE_SET : OLD_RULE_SET),
    );
    prisma.deadline.findMany.mockResolvedValue([
      {
        id: "deadline-1",
        userId: "user-1",
        title: "Trafik cezası itirazı",
        startDate: new Date("2026-06-20T00:00:00.000Z"),
        adjustedEndDate: new Date("2026-07-05T00:00:00.000Z"),
      },
    ]);

    const service = new LegislationRuleRemediationService(prisma as never);
    await service.remediate("new-1");

    expect(prisma.deadline.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "deadline-1" }, data: expect.objectContaining({ invalidatedAt: expect.any(Date) }) }),
    );
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", deadlineId: "deadline-1" }),
      }),
    );
    expect(prisma.ruleRemediation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ supersededRuleSetId: "old-1", newRuleSetId: "new-1" }),
      }),
    );
  });

  it("yeni kuralla sonuç aynı kalan kayıtları etkilemez (invalidatedAt işaretlemez)", async () => {
    const prisma = createPrismaMock();
    const sameRuleSet = {
      ...NEW_RULE_SET,
      ruleData: OLD_RULE_SET.ruleData,
    };
    prisma.ruleSet.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(where.id === "new-1" ? sameRuleSet : OLD_RULE_SET),
    );
    prisma.deadline.findMany.mockResolvedValue([
      {
        id: "deadline-2",
        userId: "user-1",
        title: "Değişmeyen süre",
        startDate: new Date("2026-06-20T00:00:00.000Z"),
        adjustedEndDate: new Date("2026-07-05T00:00:00.000Z"),
      },
    ]);

    const service = new LegislationRuleRemediationService(prisma as never);
    await service.remediate("new-1");

    expect(prisma.deadline.update).not.toHaveBeenCalled();
    expect(prisma.ruleRemediation.create).not.toHaveBeenCalled();
  });

  it("supersedesRuleSetId yoksa (yeni bir kural, eskiyi değiştirmiyor) hiçbir şey yapmaz", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findUnique.mockResolvedValue({ ...NEW_RULE_SET, supersedesRuleSetId: null });

    const service = new LegislationRuleRemediationService(prisma as never);
    await service.remediate("new-1");

    expect(prisma.deadline.findMany).not.toHaveBeenCalled();
  });
});
