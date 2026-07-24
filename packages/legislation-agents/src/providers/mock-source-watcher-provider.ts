import type { LegislationDocumentFetch, SourceWatcherProvider } from "../types";

/**
 * Varsayılan sağlayıcı (`LEGISLATION_SOURCE_WATCHER=mock`). Gerçek bir
 * ağ isteği atmaz; yalnızca kurucuya verilen sabit fixture verisini
 * döner. Fixture verilmezse boş dizi döner — yani hiçbir hayali
 * mevzuat değişikliği üretmez (bu, gerçek bir kaynaktan hiçbir şey
 * gelmediği durumla ayırt edilemez bir "sahte değişiklik" riskini
 * ortadan kaldırır). Testlerde/geliştirmede kontrollü senaryolar için
 * fixture enjekte edilir; üretimde siteye özel bir gerçek sağlayıcıyla
 * değiştirilmelidir (bkz. CLAUDE.md kapsam notu).
 */
export class MockSourceWatcherProvider implements SourceWatcherProvider {
  readonly name = "mock";

  constructor(private readonly fixtures: Record<string, LegislationDocumentFetch[]> = {}) {}

  async fetchLatestDocuments(sourceKey: string): Promise<LegislationDocumentFetch[]> {
    return this.fixtures[sourceKey] ?? [];
  }
}
