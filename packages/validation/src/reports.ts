import { z } from "zod";

export const generateDocumentAnalysisReportSchema = z.object({
  documentId: z.string().min(1),
});
export type GenerateDocumentAnalysisReportInput = z.infer<
  typeof generateDocumentAnalysisReportSchema
>;

export const generateCalculationReportSchema = z.object({
  calculationId: z.string().min(1),
});
export type GenerateCalculationReportInput = z.infer<
  typeof generateCalculationReportSchema
>;

export const generateDeadlineReportSchema = z.object({
  deadlineId: z.string().min(1),
});
export type GenerateDeadlineReportInput = z.infer<
  typeof generateDeadlineReportSchema
>;
