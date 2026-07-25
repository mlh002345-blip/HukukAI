import { describe, expect, it, vi } from "vitest";
import {
  ResmiGazeteSourceWatcherProvider,
  extractDayIndexLinks,
  inferResmiGazeteDocumentType,
  resmiGazeteDayIndexUrl,
  stripHtml,
} from "./resmi-gazete-source-watcher-provider";

const DAY_INDEX_HTML = `
<html><body>
<h5>YÖNETMELİK</h5>
<a href="eskiler/2026/07/20260725-1.htm">Filan Bakanlığı Personel Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik</a>
<h5>TEBLİĞ</h5>
<a href="eskiler/2026/07/20260725-2.htm">Katma Değer Vergisi Genel Uygulama Tebliğinde Değişiklik Yapılmasına Dair Tebliğ</a>
<a href="/anasayfa.htm">Ana Sayfa</a>
</body></html>
`;

const DOCUMENT_HTML = `
<html><body>
<p>MADDE 1 — Bu Yönetmeliğin amacı, filan bakanlığı personelinin çalışma usul ve esaslarını düzenlemektir.</p>
<p>MADDE 2 — Bu Yönetmelik yayımı tarihinde yürürlüğe girer.</p>
</body></html>
`;

function createFetchImpl(
  responses: Record<string, { ok: boolean; text: string }>,
): typeof fetch {
  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    const key = Object.keys(responses).find((candidate) => url.includes(candidate));
    const response = key ? responses[key] : undefined;
    if (!response) {
      return { ok: false, text: async () => "" } as Response;
    }
    return { ok: response.ok, text: async () => response.text } as Response;
  }) as unknown as typeof fetch;
}

describe("stripHtml", () => {
  it("etiketleri ve HTML entity'lerini temizler", () => {
    expect(stripHtml("<p>Madde&nbsp;1 &amp; 2</p>")).toBe("Madde 1 & 2");
  });
});

describe("extractDayIndexLinks", () => {
  it("*.htm uzantılı bağlantıları çıkarır (sayfa navigasyon bağlantıları dahil — süzme sourceKey/uzunluk denetimiyle yapılır)", () => {
    const links = extractDayIndexLinks(DAY_INDEX_HTML);
    expect(links).toHaveLength(3);
    expect(links[0]?.href).toBe("eskiler/2026/07/20260725-1.htm");
    expect(links[0]?.text).toContain("Yönetmelik");
  });

  it("çok kısa bağlantı metinlerini (nav linkleri gibi) filtreler", () => {
    const links = extractDayIndexLinks(`<a href="x.htm">Git</a>`);
    expect(links).toHaveLength(0);
  });
});

describe("inferResmiGazeteDocumentType", () => {
  it("başlıktan belge türünü tahmin eder", () => {
    expect(inferResmiGazeteDocumentType("... Dair Yönetmelik")).toBe("YONETMELIK");
    expect(inferResmiGazeteDocumentType("... Dair Tebliğ")).toBe("TEBLIG");
    expect(inferResmiGazeteDocumentType("Bilinmeyen bir başlık")).toBe("DIGER");
  });
});

describe("resmiGazeteDayIndexUrl", () => {
  it("YYYY/MM/YYYYMMDD.htm kalıbında bir URL üretir", () => {
    const url = resmiGazeteDayIndexUrl(new Date("2026-07-25T00:00:00.000Z"));
    expect(url).toBe("https://www.resmigazete.gov.tr/eskiler/2026/07/20260725.htm");
  });
});

describe("ResmiGazeteSourceWatcherProvider.fetchLatestDocuments", () => {
  it("resmi_gazete dışında bir sourceKey için boş dizi döner", async () => {
    const provider = new ResmiGazeteSourceWatcherProvider(
      () => new Date("2026-07-25T00:00:00.000Z"),
      createFetchImpl({}),
    );
    expect(await provider.fetchLatestDocuments("gib")).toEqual([]);
  });

  it("günlük listeleme sayfasındaki belgeleri ayrıştırıp döner", async () => {
    const fetchImpl = createFetchImpl({
      "20260725.htm": { ok: true, text: DAY_INDEX_HTML },
      "20260725-1.htm": { ok: true, text: DOCUMENT_HTML },
      "20260725-2.htm": { ok: true, text: DOCUMENT_HTML },
    });
    const provider = new ResmiGazeteSourceWatcherProvider(
      () => new Date("2026-07-25T00:00:00.000Z"),
      fetchImpl,
    );

    const results = await provider.fetchLatestDocuments("resmi_gazete");

    expect(results).toHaveLength(2);
    expect(results[0]?.sourceKey).toBe("resmi_gazete");
    expect(results[0]?.publicationDate).toBe("2026-07-25");
    expect(results[0]?.documentType).toBe("YONETMELIK");
    expect(results[0]?.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(results[0]?.sourceUrl).toBe(
      "https://www.resmigazete.gov.tr/eskiler/2026/07/20260725-1.htm",
    );
  });

  it("günlük listeleme sayfasındaki dış (farklı host) bir bağlantıyı takip etmez (SSRF sertleştirmesi)", async () => {
    const externalLinkHtml = `<a href="https://evil.example.com/x.htm">Şüpheli dış bağlantı metni</a>`;
    const fetchImpl = createFetchImpl({
      "20260725.htm": { ok: true, text: externalLinkHtml },
      "evil.example.com": { ok: true, text: DOCUMENT_HTML },
    });
    const provider = new ResmiGazeteSourceWatcherProvider(
      () => new Date("2026-07-25T00:00:00.000Z"),
      fetchImpl,
    );

    const results = await provider.fetchLatestDocuments("resmi_gazete");

    expect(results).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("günlük sayfa alınamazsa (404/ağ hatası) hata fırlatmadan boş dizi döner", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });
    const provider = new ResmiGazeteSourceWatcherProvider(
      () => new Date("2026-07-25T00:00:00.000Z"),
      fetchImpl as unknown as typeof fetch,
    );

    expect(await provider.fetchLatestDocuments("resmi_gazete")).toEqual([]);
  });
});
