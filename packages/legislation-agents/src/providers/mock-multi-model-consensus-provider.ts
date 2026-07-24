import type { MultiModelConsensusProvider, RuleProposal } from "../types";

/**
 * Varsayılan sağlayıcı (`LEGISLATION_CONSENSUS_PROVIDER=mock`). Gerçek
 * bir ikinci LLM'e istek atmaz; ilk taslağın derin bir kopyasını
 * dönerek her zaman mutabık olur (deterministik, test edilebilir).
 * Gerçek bir ikinci sağlayıcı entegrasyonu, kullanıcının sağlayıcı/API
 * anahtarı kararını bekleyen ayrı bir sonraki fazdır (bkz. CLAUDE.md
 * kapsam notu). **Bu sağlayıcıyla üretimde gerçek bağımsız doğrulama
 * yapılmaz** — yalnızca boru hattının geri kalanını uçtan uca test
 * etmeye yarar.
 */
export class MockMultiModelConsensusProvider implements MultiModelConsensusProvider {
  readonly name = "mock";

  async independentlyReproduce(firstDraft: RuleProposal): Promise<RuleProposal> {
    return structuredClone(firstDraft);
  }
}
