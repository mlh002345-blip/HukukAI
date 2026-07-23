export const CALCULATION_TYPES = [
  "LEGAL_INTEREST",
  "ENFORCEMENT_DEBT",
  "RENT_INCREASE",
  "ATTORNEY_FEE",
  "COURT_FEE",
  "SELF_EMPLOYMENT_RECEIPT",
  "INCOME_TAX",
  "VAT",
  "SGK_EMPLOYER_COST",
  "EXECUTION_PREVIEW",
] as const;
export type CalculationType = (typeof CALCULATION_TYPES)[number];

export const CALCULATION_STATUSES = ["DRAFT", "COMPLETED", "INVALIDATED"] as const;
export type CalculationStatus = (typeof CALCULATION_STATUSES)[number];

export interface CalculationSummary {
  id: string;
  folderId: string | null;
  documentId: string | null;
  calculationType: CalculationType;
  engineVersion: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  status: CalculationStatus;
  createdAt: string;
}
