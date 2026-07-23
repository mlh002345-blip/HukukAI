import { z } from "zod";

const decimalStringSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Geçerli, negatif olmayan bir sayı giriniz.");

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG biçiminde olmalıdır.");

const calculationLinkFields = {
  folderId: z.string().min(1).optional(),
  documentId: z.string().min(1).optional(),
};

const tieredBracketSchema = z.object({
  upTo: decimalStringSchema.nullable(),
  ratePercent: decimalStringSchema,
});

// --- Yasal faiz ---
const interestPeriodSchema = z.object({
  annualRatePercent: decimalStringSchema,
  days: z.number().int().positive(),
});

export const calculateLegalInterestSchema = z.object({
  principal: decimalStringSchema,
  periods: z.array(interestPeriodSchema).min(1),
  ...calculationLinkFields,
});
export type CalculateLegalInterestRequest = z.infer<
  typeof calculateLegalInterestSchema
>;

// --- İcra borcu ---
export const calculateEnforcementDebtSchema = z.object({
  principal: decimalStringSchema,
  periods: z.array(interestPeriodSchema),
  expenses: z.array(
    z.object({ label: z.string().min(1).max(120), amount: decimalStringSchema }),
  ),
  ...calculationLinkFields,
});
export type CalculateEnforcementDebtRequest = z.infer<
  typeof calculateEnforcementDebtSchema
>;

// --- Kira artışı ---
export const calculateRentIncreaseSchema = z.object({
  currentRent: decimalStringSchema,
  increaseRatePercent: decimalStringSchema,
  ...calculationLinkFields,
});
export type CalculateRentIncreaseRequest = z.infer<
  typeof calculateRentIncreaseSchema
>;

// --- Vekâlet ücreti ---
export const calculateAttorneyFeeSchema = z.object({
  disputeValue: decimalStringSchema,
  brackets: z.array(tieredBracketSchema).min(1),
  minimumFee: decimalStringSchema.optional(),
  ...calculationLinkFields,
});
export type CalculateAttorneyFeeRequest = z.infer<
  typeof calculateAttorneyFeeSchema
>;

// --- Harç ön hesabı ---
export const calculateCourtFeeSchema = z.object({
  disputeValue: decimalStringSchema,
  proportionalRatePerMille: decimalStringSchema,
  fixedApplicationFee: decimalStringSchema,
  ...calculationLinkFields,
});
export type CalculateCourtFeeRequest = z.infer<typeof calculateCourtFeeSchema>;

// --- Serbest meslek makbuzu ---
export const calculateSelfEmploymentReceiptSchema = z.object({
  grossAmount: decimalStringSchema,
  withholdingTaxRatePercent: decimalStringSchema,
  vatRatePercent: decimalStringSchema,
  ...calculationLinkFields,
});
export type CalculateSelfEmploymentReceiptRequest = z.infer<
  typeof calculateSelfEmploymentReceiptSchema
>;

// --- Gelir vergisi ---
export const calculateIncomeTaxSchema = z.object({
  taxableIncome: decimalStringSchema,
  brackets: z.array(tieredBracketSchema).min(1),
  ...calculationLinkFields,
});
export type CalculateIncomeTaxRequest = z.infer<
  typeof calculateIncomeTaxSchema
>;

// --- KDV ---
export const calculateVatSchema = z.object({
  amount: decimalStringSchema,
  vatRatePercent: decimalStringSchema,
  mode: z.enum(["ADD_VAT", "EXTRACT_VAT"]),
  ...calculationLinkFields,
});
export type CalculateVatRequest = z.infer<typeof calculateVatSchema>;

// --- SGK işveren maliyeti ---
export const calculateSgkEmployerCostSchema = z.object({
  grossSalary: decimalStringSchema,
  sgkEmployerRatePercent: decimalStringSchema,
  unemploymentEmployerRatePercent: decimalStringSchema,
  ...calculationLinkFields,
});
export type CalculateSgkEmployerCostRequest = z.infer<
  typeof calculateSgkEmployerCostSchema
>;

// --- İnfaz ön hesabı ---
export const calculateExecutionPreviewSchema = z.object({
  sentenceDays: z.number().int().positive(),
  executionFraction: z.enum(["HALF", "TWO_THIRDS", "THREE_QUARTERS"]),
  creditedDays: z.number().int().min(0),
  startDate: isoDateSchema,
  probationBufferDays: z.number().int().positive().optional(),
  ...calculationLinkFields,
});
export type CalculateExecutionPreviewRequest = z.infer<
  typeof calculateExecutionPreviewSchema
>;
