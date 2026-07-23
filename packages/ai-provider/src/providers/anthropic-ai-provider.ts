import type { DocumentType } from "@hukukai/types";
import type {
  AIProvider,
  DocumentClassificationResult,
  ModelTier,
  StructuredExtractionResult,
} from "../types";
import { DOCUMENT_TYPES } from "@hukukai/types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

interface AnthropicModels {
  fast: string;
  accurate: string;
}

const DEFAULT_MODELS: AnthropicModels = {
  fast: "claude-haiku-4-5",
  accurate: "claude-sonnet-5",
};

interface AnthropicMessageResponse {
  content: Array<{ type: string; text?: string }>;
}

function extractText(response: AnthropicMessageResponse): string {
  return response.content
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function parseJsonBlock(text: string): unknown {
  const match = /\{[\s\S]*\}/.exec(text);
  if (!match) {
    throw new Error("AI yanıtında JSON bulunamadı.");
  }
  return JSON.parse(match[0]);
}

/**
 * Üretim sağlayıcısı (`AI_PROVIDER=anthropic`). AI sağlayıcısının
 * değiştirilebilir olması gerektiğinden (Bölüm 29 madde 15) bu sınıf,
 * `AIProvider` arayüzünü Anthropic Messages API üzerinden uygular.
 * Router'ın belirlediği model seviyesine (`tier`) göre farklı model
 * seçilir.
 */
export class AnthropicAIProvider implements AIProvider {
  readonly name = "anthropic";
  readonly model: string;

  private readonly models: AnthropicModels;

  constructor(
    private readonly apiKey: string,
    model?: string,
  ) {
    this.models = model
      ? { fast: model, accurate: model }
      : DEFAULT_MODELS;
    this.model = this.models.accurate;
  }

  private modelForTier(tier?: ModelTier): string {
    return tier === "FAST" ? this.models.fast : this.models.accurate;
  }

  private async send(
    prompt: string,
    tier: ModelTier | undefined,
    maxTokens: number,
  ): Promise<string> {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: this.modelForTier(tier),
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Anthropic API hatası: ${response.status} ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as AnthropicMessageResponse;
    return extractText(payload);
  }

  async classifyDocument(
    ocrText: string,
    tier?: ModelTier,
  ): Promise<DocumentClassificationResult> {
    const prompt = [
      "Aşağıdaki OCR ile çıkarılmış Türkçe resmi belge metnini şu",
      `kategorilerden birine sınıflandır: ${DOCUMENT_TYPES.join(", ")}.`,
      'Yalnızca şu JSON biçiminde yanıt ver: {"documentType": "...", "confidence": 0.0}',
      "",
      ocrText,
    ].join("\n");

    const text = await this.send(prompt, tier, 256);
    const parsed = parseJsonBlock(text) as {
      documentType: string;
      confidence: number;
    };

    const documentType = DOCUMENT_TYPES.includes(
      parsed.documentType as DocumentType,
    )
      ? (parsed.documentType as DocumentType)
      : "UNKNOWN_OFFICIAL_DOCUMENT";

    return { documentType, confidence: parsed.confidence };
  }

  async extractStructuredData(
    ocrText: string,
    documentType: DocumentType,
    tier?: ModelTier,
  ): Promise<StructuredExtractionResult> {
    const prompt = [
      `Belge türü: ${documentType}. Aşağıdaki OCR metninden kritik alanları`,
      "çıkar. Yalnızca şu JSON biçiminde yanıt ver:",
      '{"data": {...}, "warnings": ["..."], "confidence": 0.0}',
      "",
      ocrText,
    ].join("\n");

    const text = await this.send(prompt, tier, 1024);
    const parsed = parseJsonBlock(text) as StructuredExtractionResult;
    return {
      data: parsed.data ?? {},
      warnings: parsed.warnings ?? [],
      confidence: parsed.confidence ?? 0,
    };
  }

  async summarize(ocrText: string, tier?: ModelTier): Promise<string> {
    const prompt = [
      "Aşağıdaki resmi belgeyi sade Türkçe ile en fazla 3 cümlede özetle.",
      "",
      ocrText,
    ].join("\n");
    return this.send(prompt, tier, 256);
  }
}
