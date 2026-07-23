import type { SubscriptionPlan } from "./user";

export interface PlanCatalogEntry {
  plan: SubscriptionPlan;
  monthlyDocumentAnalyses: number | null;
  pageLimit: number;
  activeDeadlineLimit: number | null;
  watermarkReports: boolean;
  monthlyPriceTRY: string;
}

export interface OneTimeCreditPackInfo {
  credits: number;
  priceTRY: string;
}

export interface UsageSummary {
  plan: SubscriptionPlan;
  periodKey: string;
  monthlyDocumentAnalysesUsed: number;
  monthlyDocumentAnalysesLimit: number | null;
  pageLimit: number;
  activeDeadlineCount: number;
  activeDeadlineLimit: number | null;
  oneTimeCreditsRemaining: number;
  watermarkReports: boolean;
}
