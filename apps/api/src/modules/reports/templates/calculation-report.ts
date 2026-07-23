import type { CalculationType } from "@hukukai/types";
import {
  buildReportNumber,
  STANDARD_DISCLAIMER,
  type ReportContent,
  type ReportRow,
} from "../report-content";

const CALCULATION_REPORT_TITLES: Record<CalculationType, string> = {
  LEGAL_INTEREST: "Faiz Hesaplama Raporu",
  ENFORCEMENT_DEBT: "İcra Borç Raporu",
  RENT_INCREASE: "Kira Artış Raporu",
  ATTORNEY_FEE: "Vekâlet Ücreti Raporu",
  COURT_FEE: "Harç Hesaplama Raporu",
  SELF_EMPLOYMENT_RECEIPT: "Serbest Meslek Makbuzu",
  INCOME_TAX: "Gelir Vergisi Raporu",
  VAT: "KDV Hesaplama Raporu",
  SGK_EMPLOYER_COST: "SGK İşveren Maliyeti Raporu",
  EXECUTION_PREVIEW: "İnfaz Ön Hesap Raporu",
};

function flattenToRows(data: Record<string, unknown>): ReportRow[] {
  return Object.entries(data)
    .filter(([key]) => key !== "warnings")
    .map(([label, value]) => ({
      label,
      value:
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value),
    }));
}

export interface CalculationReportInput {
  reportId: string;
  createdAt: Date;
  calculationType: CalculationType;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  isFreePlan: boolean;
}

export function buildCalculationReportContent(
  input: CalculationReportInput,
): ReportContent {
  const warnings = Array.isArray(input.outputData.warnings)
    ? (input.outputData.warnings as string[])
    : [];

  return {
    reportNumber: buildReportNumber(input.reportId, input.createdAt),
    title: CALCULATION_REPORT_TITLES[input.calculationType] ?? "Hesaplama Raporu",
    generatedAt: input.createdAt.toISOString(),
    sections: [
      { heading: "Girdiler", rows: flattenToRows(input.inputData) },
      { heading: "Sonuç", rows: flattenToRows(input.outputData) },
    ],
    warnings,
    disclaimer: STANDARD_DISCLAIMER,
    watermark: input.isFreePlan,
  };
}
