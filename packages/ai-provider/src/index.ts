/**
 * AI Sağlayıcı Soyutlaması (Bölüm 15 — AI Router, Bölüm 29 madde 15:
 * "AI sağlayıcısı değiştirilebilir olmalıdır"). Belge sınıflandırma,
 * alan çıkarma ve özetleme görevlerini soyutlayan sağlayıcı-agnostik
 * bir arayüz sunar.
 */
export type AITask =
  | "DOCUMENT_CLASSIFICATION"
  | "STRUCTURED_EXTRACTION"
  | "SUMMARY"
  | "PLAIN_LANGUAGE_EXPLANATION"
  | "INTENT_CLASSIFICATION"
  | "QUALITY_REVIEW";

export * from "./types";
export * from "./router";
export * from "./tool-recommendations";
export * from "./factory";
export * from "./providers/mock-ai-provider";
export * from "./providers/anthropic-ai-provider";
