export const DOCUMENT_STATUSES = [
  "UPLOADED",
  "OCR_PROCESSING",
  "AI_PROCESSING",
  "REVIEW_REQUIRED",
  "COMPLETED",
  "FAILED",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const DOCUMENT_TYPES = [
  "ENFORCEMENT_PAYMENT_ORDER",
  "ENFORCEMENT_NOTICE",
  "COURT_REASONED_DECISION",
  "TAX_NOTICE",
  "SGK_NOTICE",
  "RENT_AGREEMENT",
  "EXECUTION_TIMESHEET",
  "TRAFFIC_ADMINISTRATIVE_FINE",
  "UNKNOWN_OFFICIAL_DOCUMENT",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface DocumentSummary {
  id: string;
  folderId: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  documentType: DocumentType | null;
  pageCount: number | null;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
}

export interface DocumentStatusResponse {
  status: DocumentStatus;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface DocumentAnalysisSummary {
  id: string;
  documentId: string;
  provider: string;
  model: string;
  extractedData: Record<string, unknown>;
  summary: string | null;
  warnings: string[];
  recommendedTools: string[];
  confidenceScore: number | null;
  requiresReview: boolean;
  createdAt: string;
}

export interface RecommendedAction {
  toolSlug: string;
  toolName: string;
  route: string;
}
