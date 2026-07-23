import {
  buildReportNumber,
  STANDARD_DISCLAIMER,
  type ReportContent,
} from "../report-content";

const DEADLINE_REPORT_TITLES: Record<string, string> = {
  TR_TRAFFIC_FINE_OBJECTION: "Trafik Cezası Süre Raporu",
  TR_TRAFFIC_FINE_DISCOUNTED_PAYMENT: "Trafik Cezası Süre Raporu",
  TR_ENFORCEMENT_PAYMENT_ORDER_OBJECTION: "İcra Süre Raporu",
};

function deadlineReportTitle(ruleId: string): string {
  return DEADLINE_REPORT_TITLES[ruleId] ?? "Süre Raporu";
}

export interface DeadlineReportInput {
  reportId: string;
  createdAt: Date;
  deadline: {
    title: string;
    ruleId: string;
    ruleVersion: string;
    startEvent: string;
    startDate: Date;
    calculatedEndDate: Date;
    adjustedEndDate: Date;
    legalBasis: Array<{ law: string; article?: string }>;
    warnings: string[];
  };
  isFreePlan: boolean;
}

export function buildDeadlineReportContent(
  input: DeadlineReportInput,
): ReportContent {
  const { deadline } = input;

  return {
    reportNumber: buildReportNumber(input.reportId, input.createdAt),
    title: deadlineReportTitle(deadline.ruleId),
    generatedAt: input.createdAt.toISOString(),
    sections: [
      {
        heading: "Süre Bilgileri",
        rows: [
          { label: "Başlık", value: deadline.title },
          { label: "Başlangıç Olayı", value: deadline.startEvent },
          {
            label: "Başlangıç Tarihi",
            value: deadline.startDate.toISOString().slice(0, 10),
          },
          {
            label: "Hesaplanan Son Gün",
            value: deadline.calculatedEndDate.toISOString().slice(0, 10),
          },
          {
            label: "Düzeltilmiş Son Gün",
            value: deadline.adjustedEndDate.toISOString().slice(0, 10),
          },
        ],
      },
      {
        heading: "Kural Bilgisi",
        rows: [
          { label: "Kural", value: deadline.ruleId },
          { label: "Sürüm", value: deadline.ruleVersion },
        ],
      },
      {
        heading: "Mevzuat Dayanağı",
        rows: deadline.legalBasis.map((basis) => ({
          label: basis.law,
          value: basis.article ? `m.${basis.article}` : "-",
        })),
      },
    ],
    warnings: deadline.warnings,
    disclaimer: STANDARD_DISCLAIMER,
    watermark: input.isFreePlan,
  };
}
