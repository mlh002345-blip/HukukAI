import { describe, expect, it, vi } from "vitest";
import { LegislationReleaseDecisionService } from "./legislation-release-decision.service";

function createPrismaMock() {
  return {
    ruleVerificationResult: { findMany: vi.fn() },
    ruleSet: { update: vi.fn(), findUnique: vi.fn() },
    legislationChange: { update: vi.fn() },
  };
}

function createAuditLogMock() {
  return { record: vi.fn() };
}

function createRemediationMock() {
  return { remediate: vi.fn() };
}

const ALL_LAYERS_PASSED = [
  { layer: "SOURCE_INTEGRITY", passed: true, details: {} },
  { layer: "SECOND_SOURCE", passed: true, details: {} },
  { layer: "MODEL_CONSENSUS", passed: true, details: {} },
  { layer: "SCHEMA_VALIDATION", passed: true, details: {} },
  { layer: "GOLDEN_TESTS", passed: true, details: {} },
  { layer: "REGRESSION", passed: true, details: {} },
];

describe("LegislationReleaseDecisionService.evaluateAndApply", () => {
  it("otomatik-uygun changeType + tüm katmanlar geçti -> aday sürümü ACTIVE yapar ve eskisini SUPERSEDED işaretler", async () => {
    const prisma = createPrismaMock();
    prisma.ruleVerificationResult.findMany.mockResolvedValue(ALL_LAYERS_PASSED);
    prisma.ruleSet.findUnique.mockResolvedValue({ changeId: "change-1" });
    const service = new LegislationReleaseDecisionService(
      prisma as never,
      createAuditLogMock() as never,
      createRemediationMock() as never,
    );

    const draft = {
      id: "draft-1",
      ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
      validFrom: new Date("2026-07-01T00:00:00.000Z"),
      supersedesRuleSetId: "old-1",
    };

    const decision = await service.evaluateAndApply(draft, "DEADLINE_EXTENSION");

    expect(decision.outcome).toBe("AUTO_PUBLISH");
    expect(prisma.ruleSet.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "draft-1" },
        data: expect.objectContaining({ status: "ACTIVE", isPublished: true }),
      }),
    );
    expect(prisma.ruleSet.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "old-1" },
        data: expect.objectContaining({ status: "SUPERSEDED", isPublished: false }),
      }),
    );
    expect(prisma.legislationChange.update).toHaveBeenCalledWith({
      where: { id: "change-1" },
      data: { status: "PUBLISHED" },
    });
  });

  it("bir katman başarısız olduysa aday sürüm VERIFIED (yayınlanmamış) kalır ve değişiklik HOLD_FOR_REVIEW olur", async () => {
    const prisma = createPrismaMock();
    prisma.ruleVerificationResult.findMany.mockResolvedValue([
      ...ALL_LAYERS_PASSED.filter((r) => r.layer !== "SECOND_SOURCE"),
      { layer: "SECOND_SOURCE", passed: false, details: {} },
    ]);
    prisma.ruleSet.findUnique.mockResolvedValue({ changeId: "change-2" });
    const service = new LegislationReleaseDecisionService(
      prisma as never,
      createAuditLogMock() as never,
      createRemediationMock() as never,
    );

    const draft = {
      id: "draft-2",
      ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
      validFrom: new Date("2026-07-01T00:00:00.000Z"),
      supersedesRuleSetId: "old-2",
    };

    const decision = await service.evaluateAndApply(draft, "DEADLINE_EXTENSION");

    expect(decision.outcome).toBe("HOLD_FOR_REVIEW");
    expect(prisma.ruleSet.update).toHaveBeenCalledWith({
      where: { id: "draft-2" },
      data: expect.objectContaining({ status: "VERIFIED" }),
    });
    expect(prisma.legislationChange.update).toHaveBeenCalledWith({
      where: { id: "change-2" },
      data: { status: "HOLD_FOR_REVIEW" },
    });
  });
});

describe("LegislationReleaseDecisionService.approveManually", () => {
  it("admin onayı, katmanlar geçmemiş olsa bile aday sürümü yayınlar", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findUnique.mockResolvedValue({
      id: "draft-3",
      ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
      validFrom: new Date("2026-07-01T00:00:00.000Z"),
      supersedesRuleSetId: "old-3",
      changeId: "change-3",
      confidenceScore: null,
    });
    const auditLog = createAuditLogMock();
    const service = new LegislationReleaseDecisionService(
      prisma as never,
      auditLog as never,
      createRemediationMock() as never,
    );

    await service.approveManually("admin-1", "draft-3");

    expect(prisma.ruleSet.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "draft-3" }, data: expect.objectContaining({ status: "ACTIVE" }) }),
    );
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "admin-1", action: "LEGISLATION_CHANGE_APPROVED" }),
    );
  });
});

describe("LegislationReleaseDecisionService.rejectManually", () => {
  it("reddedilen bir aday için eski (kısıtlanmış) sürümü yeniden ACTIVE yapar", async () => {
    const prisma = createPrismaMock();
    prisma.ruleSet.findUnique.mockResolvedValue({
      id: "draft-4",
      ruleKey: "TR_TRAFFIC_FINE_OBJECTION",
      version: "2026-07-01",
      supersedesRuleSetId: "old-4",
      changeId: "change-4",
    });
    const service = new LegislationReleaseDecisionService(
      prisma as never,
      createAuditLogMock() as never,
      createRemediationMock() as never,
    );

    await service.rejectManually("admin-1", "draft-4");

    expect(prisma.ruleSet.update).toHaveBeenCalledWith({
      where: { id: "draft-4" },
      data: { status: "REJECTED", isPublished: false },
    });
    expect(prisma.ruleSet.update).toHaveBeenCalledWith({
      where: { id: "old-4" },
      data: { status: "ACTIVE", isPublished: true },
    });
    expect(prisma.legislationChange.update).toHaveBeenCalledWith({
      where: { id: "change-4" },
      data: { status: "REJECTED" },
    });
  });
});
