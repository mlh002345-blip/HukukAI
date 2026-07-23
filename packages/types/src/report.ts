export const REPORT_TYPES = ["DOCUMENT_ANALYSIS", "CALCULATION", "DEADLINE"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export interface GeneratedReportSummary {
  id: string;
  folderId: string | null;
  documentType: string;
  templateVersion: string;
  createdAt: string;
}

export interface ReportDownloadUrlResponse {
  downloadUrl: string;
  expiresInSeconds: number;
}
