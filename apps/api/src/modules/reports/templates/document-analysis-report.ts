import {
  buildReportNumber,
  STANDARD_DISCLAIMER,
  type ReportContent,
} from "../report-content";

export interface DocumentAnalysisReportInput {
  reportId: string;
  createdAt: Date;
  document: {
    originalName: string;
    documentType: string | null;
    createdAt: Date;
  };
  analysis: {
    summary: string | null;
    extractedData: Record<string, unknown>;
    warnings: string[];
    recommendedTools: string[];
  };
  isFreePlan: boolean;
}

export function buildDocumentAnalysisReportContent(
  input: DocumentAnalysisReportInput,
): ReportContent {
  const extractedRows = Object.entries(input.analysis.extractedData).map(
    ([label, value]) => ({ label, value: String(value) }),
  );

  return {
    reportNumber: buildReportNumber(input.reportId, input.createdAt),
    title: "Belge Analiz Raporu",
    generatedAt: input.createdAt.toISOString(),
    sections: [
      {
        heading: "Belge Bilgileri",
        rows: [
          { label: "Dosya Adı", value: input.document.originalName },
          {
            label: "Belge Türü",
            value: input.document.documentType ?? "Belirlenemedi",
          },
          {
            label: "Yükleme Tarihi",
            value: input.document.createdAt.toISOString().slice(0, 10),
          },
        ],
      },
      ...(input.analysis.summary
        ? [{ heading: "Özet", rows: [{ label: "Özet", value: input.analysis.summary }] }]
        : []),
      { heading: "Çıkarılan Veriler", rows: extractedRows },
      {
        heading: "Önerilen Araçlar",
        rows: input.analysis.recommendedTools.map((slug) => ({
          label: "Araç",
          value: slug,
        })),
      },
    ],
    warnings: input.analysis.warnings,
    disclaimer: STANDARD_DISCLAIMER,
    watermark: input.isFreePlan,
  };
}
