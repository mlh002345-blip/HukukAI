import { describe, expect, it } from "vitest";
import { buildDeadlineReportContent } from "./deadline-report";

const baseDeadline = {
  title: "İtiraz süresi",
  ruleVersion: "1.0.0",
  startEvent: "TEBLIGAT",
  startDate: new Date("2026-01-01T00:00:00.000Z"),
  calculatedEndDate: new Date("2026-01-16T00:00:00.000Z"),
  adjustedEndDate: new Date("2026-01-16T00:00:00.000Z"),
  legalBasis: [{ law: "Kabahatler Kanunu", article: "27" }],
  warnings: ["Tebliğ yöntemi sonucu değiştirebilir."],
};

describe("buildDeadlineReportContent", () => {
  it("trafik cezası kuralı için doğru başlığı seçer", () => {
    const content = buildDeadlineReportContent({
      reportId: "deadline-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      deadline: { ...baseDeadline, ruleId: "TR_TRAFFIC_FINE_OBJECTION" },
      isFreePlan: true,
    });
    expect(content.title).toBe("Trafik Cezası Süre Raporu");
  });

  it("icra kuralı için İcra Süre Raporu başlığını seçer", () => {
    const content = buildDeadlineReportContent({
      reportId: "deadline-2",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      deadline: { ...baseDeadline, ruleId: "TR_ENFORCEMENT_PAYMENT_ORDER_OBJECTION" },
      isFreePlan: false,
    });
    expect(content.title).toBe("İcra Süre Raporu");
  });

  it("bilinmeyen kural için genel Süre Raporu başlığını kullanır", () => {
    const content = buildDeadlineReportContent({
      reportId: "deadline-3",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      deadline: { ...baseDeadline, ruleId: "CUSTOM" },
      isFreePlan: false,
    });
    expect(content.title).toBe("Süre Raporu");
  });

  it("mevzuat dayanağını doğru biçimlendirir", () => {
    const content = buildDeadlineReportContent({
      reportId: "deadline-4",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      deadline: { ...baseDeadline, ruleId: "TR_TRAFFIC_FINE_OBJECTION" },
      isFreePlan: false,
    });
    const legalBasisSection = content.sections.find(
      (s) => s.heading === "Mevzuat Dayanağı",
    );
    expect(legalBasisSection?.rows).toEqual([
      { label: "Kabahatler Kanunu", value: "m.27" },
    ]);
  });
});
