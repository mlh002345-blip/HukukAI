import { describe, expect, it, vi } from "vitest";
import { LegislationRuleAuthorService } from "./legislation-rule-author.service";

function createPrismaMock() {
  return {
    ruleSet: { findFirst: vi.fn(), create: vi.fn() },
  };
}

const CURRENT_RULE_SET = {
  id: "old-1",
  module: "DEADLINE",
  ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
  version: "1.0.0",
  ruleData: {
    conditions: [],
    calculation: { duration: 15, durationUnit: "DAY", dayType: "CALENDAR_DAY", includeStartDate: false, extendIfHoliday: true },
    warnings: [],
  },
  legalBasis: [{ law: "Kabahatler Kanunu", article: "27" }],
};

describe("LegislationRuleAuthorService.proposeDraft", () => {
  it("DEADLINE_EXTENSION metninden yeni süreyi (gün) çıkarıp taslak üretir", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findFirst.mockResolvedValue(CURRENT_RULE_SET);
    prisma.ruleSet.create.mockImplementation(({ data }) => Promise.resolve({ id: "draft-1", ...data }));
    const service = new LegislationRuleAuthorService(prisma as never);

    const draft = await service.proposeDraft(
      { id: "change-1", changeType: "DEADLINE_EXTENSION", effectiveDate: new Date("2026-07-01T00:00:00.000Z") },
      { rawText: "İtiraz süresi 30 güne uzatılmıştır." },
      "TR_TRAFFIC_FINE_OBJECTION",
    );

    expect(draft).not.toBeNull();
    expect(prisma.ruleSet.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
          status: "DRAFT",
          changeId: "change-1",
          supersedesRuleSetId: "old-1",
          ruleData: expect.objectContaining({
            calculation: expect.objectContaining({ duration: 30 }),
          }),
        }),
      }),
    );
  });

  it("metinden bir gün sayısı çıkarılamazsa null döner (otomatik taslak üretmez)", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findFirst.mockResolvedValue(CURRENT_RULE_SET);
    const service = new LegislationRuleAuthorService(prisma as never);

    const draft = await service.proposeDraft(
      { id: "change-2", changeType: "DEADLINE_EXTENSION", effectiveDate: new Date("2026-07-01T00:00:00.000Z") },
      { rawText: "Süre belirsiz bir şekilde uzatılmıştır." },
      "TR_TRAFFIC_FINE_OBJECTION",
    );

    expect(draft).toBeNull();
    expect(prisma.ruleSet.create).not.toHaveBeenCalled();
  });

  it("RATE_CHANGE gibi bu modülde karşılığı olmayan bir changeType için null döner", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findFirst.mockResolvedValue(CURRENT_RULE_SET);
    const service = new LegislationRuleAuthorService(prisma as never);

    const draft = await service.proposeDraft(
      { id: "change-3", changeType: "RATE_CHANGE", effectiveDate: new Date("2026-07-01T00:00:00.000Z") },
      { rawText: "Oran %20 olarak güncellenmiştir." },
      "TR_TRAFFIC_FINE_OBJECTION",
    );

    expect(draft).toBeNull();
  });

  it("mevcut bir sürüm yoksa null döner", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findFirst.mockResolvedValue(null);
    const service = new LegislationRuleAuthorService(prisma as never);

    const draft = await service.proposeDraft(
      { id: "change-4", changeType: "DEADLINE_EXTENSION", effectiveDate: new Date("2026-07-01T00:00:00.000Z") },
      { rawText: "30 gün" },
      "TR_UNKNOWN_RULE",
    );

    expect(draft).toBeNull();
  });
});
