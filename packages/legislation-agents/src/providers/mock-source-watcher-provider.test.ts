import { describe, expect, it } from "vitest";
import { MockSourceWatcherProvider } from "./mock-source-watcher-provider";

describe("MockSourceWatcherProvider", () => {
  it("fixture verilmeyen bir kaynak için boş dizi döner (hayali değişiklik üretmez)", async () => {
    const provider = new MockSourceWatcherProvider();
    const result = await provider.fetchLatestDocuments("RESMI_GAZETE");
    expect(result).toEqual([]);
  });

  it("verilen fixture'ı olduğu gibi döner", async () => {
    const fixture = [
      {
        sourceKey: "GIB",
        publicationDate: "2026-06-16",
        documentType: "TEBLIG",
        title: "KDV Genel Uygulama Tebliğinde Değişiklik",
        contentHash: "sha256:abc",
        sourceUrl: "https://gib.gov.tr/ornek",
        rawText: "...",
        downloadedAt: "2026-06-16T01:12:00+03:00",
      },
    ];
    const provider = new MockSourceWatcherProvider({ GIB: fixture });
    expect(await provider.fetchLatestDocuments("GIB")).toEqual(fixture);
    expect(await provider.fetchLatestDocuments("SGK")).toEqual([]);
  });
});
