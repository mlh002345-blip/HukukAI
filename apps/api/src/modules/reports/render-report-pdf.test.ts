import { describe, expect, it } from "vitest";
import { renderReportPdf } from "./render-report-pdf";
import type { ReportContent } from "./report-content";

const baseContent: ReportContent = {
  reportNumber: "HKA-2026-ABCD1234",
  title: "Test Raporu",
  generatedAt: "2026-01-01T00:00:00.000Z",
  sections: [
    {
      heading: "Girdiler",
      rows: [{ label: "Tutar", value: "1000" }],
    },
  ],
  warnings: ["Bu bir ön hesaptır."],
  disclaimer: "Bu rapor otomatik üretilmiştir.",
  watermark: false,
};

describe("renderReportPdf", () => {
  it("geçerli bir PDF buffer üretir", async () => {
    const buffer = await renderReportPdf(baseContent);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("filigranlı ve filigransız raporlar için de geçerli PDF üretir", async () => {
    const watermarked = await renderReportPdf({ ...baseContent, watermark: true });
    expect(watermarked.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
