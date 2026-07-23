import { describe, expect, it } from "vitest";
import { buildCalculationReportContent } from "./calculation-report";

describe("buildCalculationReportContent", () => {
  it("hesaplama türüne göre doğru başlığı seçer", () => {
    const content = buildCalculationReportContent({
      reportId: "calc-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      calculationType: "VAT",
      inputData: { amount: "1000", vatRatePercent: "20" },
      outputData: { baseAmount: "1000.00", vatAmount: "200.00", totalAmount: "1200.00" },
      isFreePlan: true,
    });

    expect(content.title).toBe("KDV Hesaplama Raporu");
    expect(content.watermark).toBe(true);
    expect(content.sections.find((s) => s.heading === "Girdiler")?.rows).toEqual([
      { label: "amount", value: "1000" },
      { label: "vatRatePercent", value: "20" },
    ]);
  });

  it("infaz ön hesabında zorunlu uyarıları warnings alanından çıkarır", () => {
    const content = buildCalculationReportContent({
      reportId: "calc-2",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      calculationType: "EXECUTION_PREVIEW",
      inputData: { sentenceDays: 3650 },
      outputData: {
        requiredServedDays: 1825,
        warnings: ["Bu bir ön hesaptır.", "Nihai hesap yetkili makamlarca yapılır."],
      },
      isFreePlan: false,
    });

    expect(content.title).toBe("İnfaz Ön Hesap Raporu");
    expect(content.warnings).toEqual([
      "Bu bir ön hesaptır.",
      "Nihai hesap yetkili makamlarca yapılır.",
    ]);
    // warnings, "Sonuç" bölümünde ayrıca bir satır olarak tekrarlanmaz.
    expect(
      content.sections
        .find((s) => s.heading === "Sonuç")
        ?.rows.some((row) => row.label === "warnings"),
    ).toBe(false);
  });
});
