import Decimal from "decimal.js";
import type { SubscriptionPlan } from "@hukukai/types";

/**
 * Paket limitleri ve fiyatlandırma (Bölüm 23 — Gelir ve Kota Sistemi).
 * `OFFICE`/`ENTERPRISE` planları Bölüm 23'te tanımlanmamıştır; MVP'de
 * `PRO` ile aynı limitlerle davranır ve üretime alınmadan önce ayrıca
 * fiyatlandırılmalıdır.
 */
export interface PlanLimits {
  /** Aylık belge analizi kotası. `null` = sınırsız. */
  monthlyDocumentAnalyses: number | null;
  /** Belge başına sayfa sınırı. */
  pageLimit: number;
  /** Aktif süre (deadline) sınırı. `null` = sınırsız. */
  activeDeadlineLimit: number | null;
  /** `true` ise üretilen raporlar filigranlıdır. */
  watermarkReports: boolean;
  /** Aylık abonelik fiyatı (TRY). */
  monthlyPriceTRY: Decimal;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    monthlyDocumentAnalyses: 2,
    pageLimit: 10,
    activeDeadlineLimit: 3,
    watermarkReports: true,
    monthlyPriceTRY: new Decimal(0),
  },
  INDIVIDUAL: {
    monthlyDocumentAnalyses: 20,
    pageLimit: 25,
    activeDeadlineLimit: 25,
    watermarkReports: false,
    monthlyPriceTRY: new Decimal(149),
  },
  PRO: {
    monthlyDocumentAnalyses: 100,
    pageLimit: 50,
    activeDeadlineLimit: null,
    watermarkReports: false,
    monthlyPriceTRY: new Decimal(399),
  },
  OFFICE: {
    monthlyDocumentAnalyses: 100,
    pageLimit: 50,
    activeDeadlineLimit: null,
    watermarkReports: false,
    monthlyPriceTRY: new Decimal(399),
  },
  ENTERPRISE: {
    monthlyDocumentAnalyses: 100,
    pageLimit: 50,
    activeDeadlineLimit: null,
    watermarkReports: false,
    monthlyPriceTRY: new Decimal(399),
  },
};

/** Bölüm 23 — "Tek seferlik": 5 analiz kredisi. */
export const ONE_TIME_CREDIT_PACK = {
  credits: 5,
  priceTRY: new Decimal(99),
};

/** Abonelik olarak satın alınabilir paketler (tek seferlik hariç). */
export const SUBSCRIBABLE_PLANS: readonly SubscriptionPlan[] = [
  "FREE",
  "INDIVIDUAL",
  "PRO",
];
