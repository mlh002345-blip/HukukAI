export const API_PREFIX = "/api/v1";

export const FREE_PLAN_LIMITS = {
  documentAnalysesPerMonth: 2,
  maxPagesPerDocument: 10,
  maxActiveDeadlines: 3,
} as const;

export const UPLOAD_LIMITS = {
  maxFileSizeBytes: 20 * 1024 * 1024, // 20 MB
  maxPages: 50,
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/heic",
  ] as const,
};

export const NOTIFICATION_OFFSETS_DAYS = [7, 3, 1, 0] as const;
