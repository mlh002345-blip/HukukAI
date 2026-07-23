import type { RouteDecision, RouteDecisionInput } from "./types";

/**
 * AI Router (Bölüm 15) — hangi model seviyesinin (FAST/ACCURATE)
 * kullanılacağına karar veren deterministik kural motoru. AI'nin
 * kendisi bu kararı vermez; router girdileri sabit eşiklerle
 * değerlendirir.
 */
const LOW_OCR_CONFIDENCE_THRESHOLD = 0.75;
const HIGH_PAGE_COUNT_THRESHOLD = 10;
const LOW_FIRST_PASS_CONFIDENCE_THRESHOLD = 0.6;

export function decideRoute(input: RouteDecisionInput): RouteDecision {
  if (input.subscriptionPlan === "FREE") {
    return { tier: "FAST", reasons: ["ÜCRETSİZ_PAKET_MALİYET_LİMİTİ"] };
  }

  const reasons: string[] = [];
  let tier: RouteDecision["tier"] = "FAST";

  if (input.ocrConfidence < LOW_OCR_CONFIDENCE_THRESHOLD) {
    tier = "ACCURATE";
    reasons.push("DÜŞÜK_OCR_GÜVENİ");
  }
  if (input.pageCount > HIGH_PAGE_COUNT_THRESHOLD) {
    tier = "ACCURATE";
    reasons.push("YÜKSEK_SAYFA_SAYISI");
  }
  if (
    input.firstPassConfidence !== undefined &&
    input.firstPassConfidence < LOW_FIRST_PASS_CONFIDENCE_THRESHOLD
  ) {
    tier = "ACCURATE";
    reasons.push("DÜŞÜK_İLK_GEÇİŞ_GÜVENİ");
  }
  if (input.documentType === "UNKNOWN_OFFICIAL_DOCUMENT") {
    tier = "ACCURATE";
    reasons.push("BİLİNMEYEN_BELGE_TÜRÜ");
  }

  if (reasons.length === 0) {
    reasons.push("STANDART_BELGE");
  }

  return { tier, reasons };
}
