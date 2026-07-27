import { describe, expect, it, vi } from "vitest";
import { LegislationImpactAnalysisService } from "./legislation-impact-analysis.service";

function createPrismaMock() {
  return {
    ruleImpactAssessment: { create: vi.fn().mockResolvedValue({ id: "assessment-1" }) },
    legislationChange: { update: vi.fn() },
    ruleSet: { updateMany: vi.fn() },
  };
}

describe("LegislationImpactAnalysisService.analyze", () => {
  it("eşleşen bir mevzuat başlığı için etkilenen ruleKey'leri bulur ve ACTIVE sürümü kısıtlar (fail-closed)", async () => {
    const prisma = createPrismaMock();
    const service = new LegislationImpactAnalysisService(prisma as never);

    const { affectedRuleIds } = await service.analyze({
      id: "change-1",
      affectedLegislation: "Trafik İdari Para Cezalarına İtiraz Tebliği",
      changeType: "DEADLINE_EXTENSION",
    });

    expect(affectedRuleIds).toEqual([
      "TR_TRAFFIC_FINE_OBJECTION",
      "TR_TRAFFIC_FINE_DISCOUNTED_PAYMENT",
    ]);
    expect(prisma.ruleSet.updateMany).toHaveBeenCalledWith({
      where: { ruleKey: "TR_TRAFFIC_FINE_OBJECTION", status: "ACTIVE" },
      data: { status: "TEMPORARILY_RESTRICTED", isPublished: false },
    });
    expect(prisma.ruleSet.updateMany).toHaveBeenCalledWith({
      where: { ruleKey: "TR_TRAFFIC_FINE_DISCOUNTED_PAYMENT", status: "ACTIVE" },
      data: { status: "TEMPORARILY_RESTRICTED", isPublished: false },
    });
    expect(prisma.legislationChange.update).toHaveBeenCalledWith({
      where: { id: "change-1" },
      data: { status: "ANALYZING" },
    });
  });

  it("haciz ihbarnamesi/uzlaşma anahtar kelimeleriyle yeni eklenen kuralları bulur", async () => {
    const prisma = createPrismaMock();
    const service = new LegislationImpactAnalysisService(prisma as never);

    const noticeResult = await service.analyze({
      id: "change-notice",
      affectedLegislation: "Üçüncü şahıs haciz ihbarnamesi usulüne dair genel tebliğ",
      changeType: "DEADLINE_EXTENSION",
    });
    expect(noticeResult.affectedRuleIds).toEqual([
      "TR_ENFORCEMENT_THIRD_PARTY_NOTICE_OBJECTION",
    ]);

    const taxResult = await service.analyze({
      id: "change-tax",
      affectedLegislation: "Vergi uzlaşma başvurusuna ilişkin tebliğ",
      changeType: "DEADLINE_EXTENSION",
    });
    expect(taxResult.affectedRuleIds).toEqual([
      "TR_TAX_COURT_ACTION",
      "TR_TAX_SETTLEMENT_APPLICATION",
    ]);
  });

  it("eşleşmeyen bir mevzuat için affectedRuleIds boş döner, requiresMigration true ve riskLevel HIGH olur", async () => {
    const prisma = createPrismaMock();
    const service = new LegislationImpactAnalysisService(prisma as never);

    const { affectedRuleIds } = await service.analyze({
      id: "change-2",
      affectedLegislation: "Tamamen bilinmeyen bir düzenleme",
      changeType: "AMENDED_PROVISION",
    });

    expect(affectedRuleIds).toEqual([]);
    expect(prisma.ruleSet.updateMany).not.toHaveBeenCalled();
    expect(prisma.ruleImpactAssessment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ requiresMigration: true, riskLevel: "HIGH" }),
      }),
    );
  });

  it("asla-otomatik-değil bir changeType için (eşleşse bile) riskLevel HIGH olur", async () => {
    const prisma = createPrismaMock();
    const service = new LegislationImpactAnalysisService(prisma as never);

    await service.analyze({
      id: "change-3",
      affectedLegislation: "İcra ödeme emrine itiraz süresi tebliği",
      changeType: "COURT_ANNULMENT",
    });

    expect(prisma.ruleImpactAssessment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ riskLevel: "HIGH" }) }),
    );
  });
});
