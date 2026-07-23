import type { SubscriptionPlan } from "@hukukai/types";
import { PLAN_LIMITS } from "./plan-catalog";

/** Verilen tarihin ait olduğu kota dönemi anahtarı (UTC, "YYYY-MM"). */
export function periodKeyForDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export type AnalysisQuotaSource = "PLAN_QUOTA" | "ONE_TIME_CREDIT";

export interface AnalysisQuotaDecision {
  allowed: boolean;
  source: AnalysisQuotaSource | null;
  reason?: string;
}

/**
 * Belge analizi başlatma isteğinin kota/kredi karşısında
 * değerlendirilmesi. Önce aylık plan kotası, tükendiyse tek seferlik
 * kredi kullanılır.
 */
export function evaluateAnalysisQuota(input: {
  plan: SubscriptionPlan;
  monthlyAnalysesUsed: number;
  oneTimeCreditsRemaining: number;
}): AnalysisQuotaDecision {
  const limit = PLAN_LIMITS[input.plan].monthlyDocumentAnalyses;

  if (limit === null || input.monthlyAnalysesUsed < limit) {
    return { allowed: true, source: "PLAN_QUOTA" };
  }
  if (input.oneTimeCreditsRemaining > 0) {
    return { allowed: true, source: "ONE_TIME_CREDIT" };
  }
  return {
    allowed: false,
    source: null,
    reason: `Bu ay için belge analizi kotanız (${String(limit)}) doldu. Paketinizi yükseltin veya tek seferlik analiz kredisi satın alın.`,
  };
}

export interface PageLimitDecision {
  allowed: boolean;
  limit: number;
  reason?: string;
}

export function evaluatePageLimit(
  plan: SubscriptionPlan,
  pageCount: number,
): PageLimitDecision {
  const limit = PLAN_LIMITS[plan].pageLimit;
  if (pageCount <= limit) {
    return { allowed: true, limit };
  }
  return {
    allowed: false,
    limit,
    reason: `Bu belge (${String(pageCount)} sayfa) paketinizin sayfa sınırını (${String(limit)}) aşıyor.`,
  };
}

export interface ActiveDeadlineLimitDecision {
  allowed: boolean;
  limit: number | null;
  reason?: string;
}

export function evaluateActiveDeadlineLimit(
  plan: SubscriptionPlan,
  activeDeadlineCount: number,
): ActiveDeadlineLimitDecision {
  const limit = PLAN_LIMITS[plan].activeDeadlineLimit;
  if (limit === null || activeDeadlineCount < limit) {
    return { allowed: true, limit };
  }
  return {
    allowed: false,
    limit,
    reason: `Aktif süre sınırınıza (${String(limit)}) ulaştınız. Yeni süre eklemek için paketinizi yükseltin.`,
  };
}
