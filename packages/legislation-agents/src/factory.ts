import type { MultiModelConsensusProvider, SourceWatcherProvider } from "./types";
import { MockSourceWatcherProvider } from "./providers/mock-source-watcher-provider";
import { MockMultiModelConsensusProvider } from "./providers/mock-multi-model-consensus-provider";
import { ResmiGazeteSourceWatcherProvider } from "./providers/resmi-gazete-source-watcher-provider";

export interface SourceWatcherProviderEnv {
  LEGISLATION_SOURCE_WATCHER: "mock" | "resmi_gazete";
}

/**
 * Kaynak tarama sağlayıcısının değiştirilebilir olması gereken tek
 * giriş noktası — `@hukukai/ai-provider`'ın `createAIProvider`ıyla aynı
 * desen. `resmi_gazete` gerçek bir siteye HTTP isteği atar (bkz.
 * `ResmiGazeteSourceWatcherProvider` — bu sandbox ortamında canlı
 * siteye karşı test edilemedi, üretime alınmadan önce doğrulanmalı).
 * GİB/SGK/Adalet Bakanlığı/AYM için gerçek sağlayıcılar henüz yok —
 * bu union'a eklendiklerinde genişletilecek.
 */
export function createSourceWatcherProvider(env: SourceWatcherProviderEnv): SourceWatcherProvider {
  if (env.LEGISLATION_SOURCE_WATCHER === "resmi_gazete") {
    return new ResmiGazeteSourceWatcherProvider();
  }
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
