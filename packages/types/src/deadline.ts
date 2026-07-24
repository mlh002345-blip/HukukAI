export const DEADLINE_STATUSES = [
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
] as const;
export type DeadlineStatus = (typeof DEADLINE_STATUSES)[number];

export interface LegalBasisRef {
  law: string;
  article?: string;
}

export type DeadlineAdjustmentType =
  | "WEEKEND"
  | "HOLIDAY"
  | "HALF_DAY"
  | "SPECIAL_RULE";

export interface DeadlineAdjustment {
  type: DeadlineAdjustmentType;
  description: string;
}

/** Otonom Mevzuat Sistemi'nin ürettiği kural sürümü meta verisi — her
 * sonuç ekranında "Mevzuat güncel" göstergesi için kullanılır. */
export interface RuleLegislationStatus {
  status: string;
  validFrom: string;
  validTo: string | null;
  verifiedAt: string | null;
  confidenceScore: string | null;
  sourceUrl: string | null;
}

/** Bkz. Doküman Bölüm 16 — `DeadlineOutput`. Kalıcı bir `Deadline`
 * kaydı oluşturmadan yapılan tek seferlik hesaplamanın sonucudur. */
export interface DeadlineCalculationResponse {
  ruleId: string;
  ruleVersion: string;
  startDate: string;
  rawEndDate: string;
  adjustedEndDate: string;
  remainingCalendarDays: number;
  isExpired: boolean;
  appliedAdjustments: DeadlineAdjustment[];
  legalBasis: LegalBasisRef[];
  warnings: string[];
  legislationStatus: RuleLegislationStatus;
}

export interface DeadlineSummary {
  id: string;
  folderId: string | null;
  documentId: string | null;
  title: string;
  ruleId: string;
  ruleVersion: string;
  startEvent: string;
  startDate: string;
  calculatedEndDate: string;
  adjustedEndDate: string;
  status: DeadlineStatus;
  legalBasis: LegalBasisRef[];
  warnings: string[];
  completedAt: string | null;
  createdAt: string;
}
