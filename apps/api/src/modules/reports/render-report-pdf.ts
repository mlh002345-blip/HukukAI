import { PassThrough } from "node:stream";
import PDFDocument from "pdfkit";
import type { ReportContent } from "./report-content";

const PAGE_SIZE: [number, number] = [595.28, 841.89]; // A4 (pt)

function applyWatermark(doc: PDFKit.PDFDocument): void {
  const pageRange = doc.bufferedPageRange();
  for (let i = pageRange.start; i < pageRange.start + pageRange.count; i += 1) {
    doc.switchToPage(i);
    doc.save();
    doc
      .rotate(-45, { origin: [PAGE_SIZE[0] / 2, PAGE_SIZE[1] / 2] })
      .fillOpacity(0.12)
      .fontSize(56)
      .fillColor("#175CD3")
      .text("HukukAI — Ücretsiz Sürüm", 0, PAGE_SIZE[1] / 2 - 30, {
        width: PAGE_SIZE[0],
        align: "center",
      });
    doc.restore();
  }
}

/**
 * Bir `ReportContent` yapısını PDF byte'larına dönüştürür (Bölüm 22).
 * Ücretsiz plan kullanıcıları için filigran uygulanır (Bölüm 23).
 */
export function renderReportPdf(content: ReportContent): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
    const chunks: Buffer[] = [];
    const stream = new PassThrough();

    doc.pipe(stream);
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);

    doc.fontSize(18).fillColor("#101828").text(content.title);
    doc
      .fontSize(9)
      .fillColor("#667085")
      .text(`Rapor No: ${content.reportNumber}`)
      .text(`Oluşturma Tarihi: ${content.generatedAt}`);
    doc.moveDown();

    for (const section of content.sections) {
      doc.fontSize(13).fillColor("#101828").text(section.heading);
      doc.moveDown(0.3);
      for (const row of section.rows) {
        doc
          .fontSize(10)
          .fillColor("#344054")
          .text(`${row.label}: ${row.value}`);
      }
      doc.moveDown();
    }

    if (content.warnings.length > 0) {
      doc.fontSize(12).fillColor("#B54708").text("Uyarılar");
      doc.moveDown(0.2);
      for (const warning of content.warnings) {
        doc.fontSize(10).fillColor("#B54708").text(`• ${warning}`);
      }
      doc.moveDown();
    }

    doc
      .fontSize(9)
      .fillColor("#667085")
      .text(content.disclaimer, { align: "left" });

    if (content.watermark) {
      applyWatermark(doc);
    }

    doc.end();
  });
}
