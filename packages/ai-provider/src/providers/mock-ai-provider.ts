import type { DocumentType } from "@hukukai/types";
import type {
  AIProvider,
  DocumentClassificationResult,
  StructuredExtractionResult,
} from "../types";

const KEYWORD_RULES: Array<{ type: DocumentType; keywords: string[] }> = [
  {
    type: "ENFORCEMENT_PAYMENT_ORDER",
    keywords: ["ödeme emri", "icra dairesi", "borçlu"],
  },
  {
    type: "ENFORCEMENT_NOTICE",
    keywords: ["icra tebligatı", "haciz ihbarnamesi"],
  },
  {
    type: "COURT_REASONED_DECISION",
    keywords: ["gerekçeli karar", "mahkeme", "hüküm"],
  },
  { type: "TAX_NOTICE", keywords: ["vergi dairesi", "vergi tebligatı"] },
  { type: "SGK_NOTICE", keywords: ["sgk", "sosyal güvenlik kurumu"] },
  {
    type: "RENT_AGREEMENT",
    keywords: ["kira sözleşmesi", "kiracı", "kiraya veren"],
  },
  { type: "EXECUTION_TIMESHEET", keywords: ["müddetname", "infaz"] },
  {
    type: "TRAFFIC_ADMINISTRATIVE_FINE",
    keywords: ["trafik idari para cezası", "radar tespit"],
  },
];

const AMOUNT_PATTERN = /([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)\s?(?:TL|₺)/i;
const DATE_PATTERN = /(\d{1,2}[./]\d{1,2}[./]\d{4})/;

/**
 * Faz 4 varsayılan sağlayıcısı (`AI_PROVIDER=mock`). Gerçek bir LLM
 * çağrısı yapmaz; anahtar kelime eşleştirme ve basit desen tanımayla
 * deterministik, test edilebilir sonuçlar üretir. Üretimde
 * `AI_PROVIDER=anthropic` ile gerçek sağlayıcıya geçilir.
 */
export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  readonly model = "mock-heuristic-v1";

  async classifyDocument(ocrText: string): Promise<DocumentClassificationResult> {
    const normalized = ocrText.toLocaleLowerCase("tr");
    for (const rule of KEYWORD_RULES) {
      if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
        return { documentType: rule.type, confidence: 0.82 };
      }
    }
    return {
      documentType: "UNKNOWN_OFFICIAL_DOCUMENT",
      confidence: 0.4,
    };
  }

  async extractStructuredData(
    ocrText: string,
    documentType: DocumentType,
  ): Promise<StructuredExtractionResult> {
    const warnings: string[] = [];
    const data: Record<string, unknown> = { documentType };

    const amountMatch = AMOUNT_PATTERN.exec(ocrText);
    if (amountMatch?.[1]) {
      data.amountText = amountMatch[1];
    } else {
      warnings.push("Tutar alanı bulunamadı.");
    }

    const dateMatch = DATE_PATTERN.exec(ocrText);
    if (dateMatch?.[1]) {
      data.dateText = dateMatch[1];
    } else {
      warnings.push("Tarih alanı bulunamadı.");
    }

    return {
      data,
      warnings,
      confidence: warnings.length === 0 ? 0.8 : 0.5,
    };
  }

  async summarize(ocrText: string): Promise<string> {
    const trimmed = ocrText.trim();
    if (!trimmed) return "Belge içeriği okunamadı.";
    return trimmed.length > 240 ? `${trimmed.slice(0, 240)}…` : trimmed;
  }
}
