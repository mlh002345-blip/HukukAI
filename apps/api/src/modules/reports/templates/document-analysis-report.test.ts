import { describe, expect, it } from "vitest";
import { buildDocumentAnalysisReportContent } from "./document-analysis-report";

describe("buildDocumentAnalysisReportContent", () => {
  it("belge ve analiz verilerinden rapor içeriği üretir", () => {
    const content = buildDocumentAnalysisReportContent({
      reportId: "report-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      document: {
        originalName: "kira.pdf",
        documentType: "RENT_AGREEMENT",
        createdAt: new Date("2025-12-01T00:00:00.000Z"),
      },
      analysis: {
        summary: "Kira sözleşmesi özeti.",
        extractedData: { amountText: "10000" },
        warnings: ["Tarih alanı bulunamadı."],
        recommendedTools: ["kira-artisi"],
      },
      isFreePlan: true,
    });

    expect(content.title).toBe("Belge Analiz Raporu");
    expect(content.watermark).toBe(true);
    expect(content.warnings).toEqual(["Tarih alanı bulunamadı."]);
    expect(content.sections.find((s) => s.heading === "Özet")).toBeDefined();
    expect(
      content.sections.find((s) => s.heading === "Çıkarılan Veriler")?.rows,
    ).toEqual([{ label: "amountText", value: "10000" }]);
  });

  it("özet yoksa Özet bölümünü eklemez", () => {
    const content = buildDocumentAnalysisReportContent({
      reportId: "report-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      document: {
        originalName: "belge.png",
        documentType: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      analysis: {
        summary: null,
        extractedData: {},
        warnings: [],
        recommendedTools: [],
      },
      isFreePlan: false,
    });

    expect(content.sections.find((s) => s.heading === "Özet")).toBeUndefined();
    expect(content.watermark).toBe(false);
  });
});
