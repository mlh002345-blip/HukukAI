import type { DocumentType, SubscriptionPlan } from "@hukukai/types";

/**
 * AI Router karar seviyeleri (Bölüm 15 — AI Router).
 * FAST: düşük maliyetli/hızlı model. ACCURATE: daha güçlü/pahalı model.
 */
export const MODEL_TIERS = ["FAST", "ACCURATE"] as const;
export type ModelTier = (typeof MODEL_TIERS)[number];

export interface RouteDecisionInput {
  pageCount: number;
  ocrConfidence: number;
  documentType: DocumentType | null;
  subscriptionPlan: SubscriptionPlan;
  firstPassConfidence?: number;
}

export interface RouteDecision {
  tier: ModelTier;
  reasons: string[];
}

export interface DocumentClassificationResult {
  documentType: DocumentType;
  confidence: number;
}

export interface StructuredExtractionResult {
  data: Record<string, unknown>;
  warnings: string[];
  confidence: number;
}

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  classifyDocument(
    ocrText: string,
    tier?: ModelTier,
  ): Promise<DocumentClassificationResult>;
  extractStructuredData(
    ocrText: string,
    documentType: DocumentType,
    tier?: ModelTier,
  ): Promise<StructuredExtractionResult>;
  summarize(ocrText: string, tier?: ModelTier): Promise<string>;
}
