import type { MultiModelConsensusProvider, SourceWatcherProvider } from "./types";
import { MockSourceWatcherProvider } from "./providers/mock-source-watcher-provider";
import { MockMultiModelConsensusProvider } from "./providers/mock-multi-model-consensus-provider";

export interface SourceWatcherProviderEnv {
  LEGISLATION_SOURCE_WATCHER: "mock";
}

/**
 * Kaynak tarama sağlayıcısının değiştirilebilir olması gereken tek
 * giriş noktası — `@hukukai/ai-provider`'ın `createAIProvider`ıyla aynı
 * desen. Şu an yalnızca `mock` seçeneği var; gerçek bir sağlayıcı
 * (siteye özel parser + ToS incelemesi gerektirir) eklendiğinde bu
 * union genişletilecek.
 */
export function createSourceWatcherProvider(_env: SourceWatcherProviderEnv): SourceWatcherProvider {
  return new MockSourceWatcherProvider();
}

export interface MultiModelConsensusProviderEnv {
  LEGISLATION_CONSENSUS_PROVIDER: "mock";
}

/**
 * Çoklu model mutabakat sağlayıcısının değiştirilebilir tek giriş
 * noktası. Şu an yalnızca `mock` seçeneği var; gerçek bir ikinci LLM
 * sağlayıcısı, kullanıcının sağlayıcı/API anahtarı kararını
 * bekliyor.
 */
export function createMultiModelConsensusProvider(
  _env: MultiModelConsensusProviderEnv,
): MultiModelConsensusProvider {
  return new MockMultiModelConsensusProvider();
}
