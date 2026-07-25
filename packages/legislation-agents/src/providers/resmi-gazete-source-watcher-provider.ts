import type { LegislationDocumentFetch, SourceWatcherProvider } from "../types";
import { hashLegislationText } from "../compare-legislation-texts";

const RESMI_GAZETE_BASE_URL = "https://www.resmigazete.gov.tr";
const SOURCE_KEY = "resmi_gazete";
const MIN_DOCUMENT_TEXT_LENGTH = 50;
const MIN_LINK_TEXT_LENGTH = 5;

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function resmiGazeteDayIndexUrl(date: Date): string {
  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  return `${RESMI_GAZETE_BASE_URL}/eskiler/${year}/${month}/${year}${month}${day}.htm`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

interface DayIndexLink {
  href: string;
  text: string;
}

export function extractDayIndexLinks(html: string): DayIndexLink[] {
  const links: DayIndexLink[] = [];
  const re = /<a[^>]+href="([^"]+\.htm)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const href = match[1];
    const text = stripHtml(match[2] ?? "");
    if (!href || text.length < MIN_LINK_TEXT_LENGTH) continue;
    links.push({ href, text });
  }
  return links;
}

/**
 * Resmî Gazete günlük listeleme sayfalarındaki bağlantılar site köküne
 * göre görecelidir (`eskiler/2026/07/....htm`, öndeki `/` olmadan) —
 * günlük sayfanın kendi dizinine göre DEĞİL. `new URL(href, indexUrl)`
 * kullanmak bu yüzden yanlış (dizini iki kez tekrarlayan bir URL)
 * üretir; bunun yerine her zaman site köküne göre çözülür.
 *
 * Mutlak (`http(s)://`) bir bağlantı yalnızca `resmigazete.gov.tr` ile
 * aynı host'taysa kabul edilir — aksi halde `null` döner. Günlük
 * listeleme sayfası (resmî, güvenilir kaynak) her ne kadar tarama
 * girdisi olsa da, sayfa içeriğinden çıkarılan bir bağlantıyı kör
 * güvenle takip etmemek için (ör. sayfa üzerinde beklenmeyen bir
 * dış bağlantı olması durumunda sunucudan sunucuya istismar/SSRF
 * riskini azaltmak amacıyla) bu denetim eklendi.
 */
function resolveUrl(href: string, base: string): string | null {
  try {
    const origin = new URL(base).origin;
    if (/^https?:\/\//i.test(href)) {
      return new URL(href).origin === origin ? href : null;
    }
    const path = href.startsWith("/") ? href : `/${href}`;
    return `${origin}${path}`;
  } catch {
    return null;
  }
}

export function inferResmiGazeteDocumentType(headingText: string): string {
  const upper = headingText.toLocaleUpperCase("tr-TR");
  if (upper.includes("KANUN")) return "KANUN";
  if (upper.includes("YÖNETMELİK")) return "YONETMELIK";
  if (upper.includes("TEBLİĞ")) return "TEBLIG";
  if (upper.includes("GENELGE")) return "GENELGE";
  if (upper.includes("CUMHURBAŞKANI KARARI") || upper.includes("KARAR")) return "KARAR";
  return "DIGER";
}

/**
 * Resmî Gazete'nin günlük sayı listeleme sayfasını
 * (`eskiler/YYYY/MM/YYYYMMDD.htm` — uzun süredir stabil olan, resmî
 * belge numaralarıyla birebir eşleşen bir URL kalıbı) tarayıp o günkü
 * belgeleri `LegislationDocumentFetch`'e dönüştürür.
 *
 * **Bu ortamda canlı siteye karşı test edilemedi** — bu sandbox'ın ağ
 * politikası `resmigazete.gov.tr`'ye çıkışı engelliyor (bkz. CLAUDE.md).
 * HTML ayrıştırması bilinçli olarak site-özel class/id adlarına değil,
 * genel `<a href="*.htm">` desenine dayanır (markup değişikliklerine
 * karşı daha dayanıklı olsun diye) ama üretime alınmadan önce gerçek
 * siteye karşı doğrulanmalı ve gerekirse ayarlanmalıdır. Belge türü
 * (`documentType`) ve `gazetteNumber` sezgisel/eksik çıkarımlardır —
 * Legal Diff/Etki Analizi ajanları bunları yalnızca bilgilendirici
 * olarak kullanır, kesin hesaplama bu alanlara dayanmaz.
 */
export class ResmiGazeteSourceWatcherProvider implements SourceWatcherProvider {
  readonly name = "resmi_gazete";

  constructor(
    private readonly referenceDate: () => Date = () => new Date(),
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async fetchLatestDocuments(sourceKey: string): Promise<LegislationDocumentFetch[]> {
    if (sourceKey !== SOURCE_KEY) return [];

    const date = this.referenceDate();
    const indexUrl = resmiGazeteDayIndexUrl(date);
    const indexHtml = await this.fetchText(indexUrl);
    if (!indexHtml) return [];

    const publicationDate = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
    const links = extractDayIndexLinks(indexHtml);
    const results: LegislationDocumentFetch[] = [];

    for (const link of links) {
      const sourceUrl = resolveUrl(link.href, indexUrl);
      if (!sourceUrl) continue;
      const documentHtml = await this.fetchText(sourceUrl);
      if (!documentHtml) continue;

      const rawText = stripHtml(documentHtml);
      if (rawText.length < MIN_DOCUMENT_TEXT_LENGTH) continue;

      results.push({
        sourceKey: SOURCE_KEY,
        publicationDate,
        documentType: inferResmiGazeteDocumentType(link.text),
        title: link.text,
        contentHash: hashLegislationText(rawText),
        sourceUrl,
        rawText,
        downloadedAt: new Date().toISOString(),
      });
    }

    return results;
  }

  private async fetchText(url: string): Promise<string | null> {
    try {
      const response = await this.fetchImpl(url, {
        headers: { "User-Agent": "HukukAI-LegislationWatcher/1.0 (+https://hukukai.com)" },
      });
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }
}
