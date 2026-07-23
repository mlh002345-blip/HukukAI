import type { AIProvider } from "./types";
import { MockAIProvider } from "./providers/mock-ai-provider";
import { AnthropicAIProvider } from "./providers/anthropic-ai-provider";

export interface AIProviderEnv {
  AI_PROVIDER: "anthropic" | "mock";
  AI_API_KEY?: string;
  AI_MODEL?: string;
}

/**
 * AI sağlayıcısının değiştirilebilir olması gereken tek giriş noktası
 * (Bölüm 29 madde 15). Ortam değişkeni değiştirilerek üretim/geliştirme
 * arasında geçiş yapılabilir.
 */
export function createAIProvider(env: AIProviderEnv): AIProvider {
  if (env.AI_PROVIDER === "anthropic") {
    if (!env.AI_API_KEY) {
      throw new Error(
        "AI_PROVIDER=anthropic için AI_API_KEY ortam değişkeni zorunludur.",
      );
    }
    return new AnthropicAIProvider(env.AI_API_KEY, env.AI_MODEL);
  }
  return new MockAIProvider();
}
