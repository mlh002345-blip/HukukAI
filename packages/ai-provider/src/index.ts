/**
 * AI Sağlayıcı Soyutlaması — Faz 4 kapsamında doldurulacaktır.
 * Bkz. Bölüm 15 (AI Router) ve Bölüm 29 madde 15: "AI sağlayıcısı
 * değiştirilebilir olmalıdır." Bu paket, belge sınıflandırma, alan
 * çıkarma, özet, sade dil açıklaması ve niyet sınıflandırma
 * görevlerini soyutlayan sağlayıcı-agnostik bir arayüz sunacaktır.
 */
export type AITask =
  | "DOCUMENT_CLASSIFICATION"
  | "STRUCTURED_EXTRACTION"
  | "SUMMARY"
  | "PLAIN_LANGUAGE_EXPLANATION"
  | "INTENT_CLASSIFICATION"
  | "QUALITY_REVIEW";

export const AI_PROVIDER_PLACEHOLDER = true;
