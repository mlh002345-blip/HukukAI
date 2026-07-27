import type { DocumentType } from "@hukukai/types";

/**
 * Belge türünden araç önerisine deterministik eşleme (Bölüm 8 — Belgeden
 * Otomatik Yönlendirme). AI yalnızca belge türünü sınıflandırır; hangi
 * aracın önerileceği bu sabit tablo üzerinden, kural bazlı belirlenir.
 * Slug'lar `packages/search-engine` içindeki `TOOL_CATALOG_SEED` ile
 * birebir eşleşmelidir.
 */
export const DOCUMENT_TYPE_TOOL_SLUGS: Record<DocumentType, string[]> = {
  ENFORCEMENT_PAYMENT_ORDER: [
    "icra-itiraz-suresi",
    "icra-borcu",
    "harc-on-hesabi",
    "vekalet-ucreti",
  ],
  // DÜZELTME: önceden yanlışlıkla "icra-itiraz-suresi" öneriliyordu — o
  // araç ENFORCEMENT_PAYMENT_ORDER (İİK m.62 ödeme emri) kuralına bağlı,
  // bu belge türü (üçüncü şahıs haciz ihbarnamesi) için YANLIŞ süreyi
  // hesaplardı. Doğru araç "haciz-ihbarnamesi-itiraz-suresi" (İİK m.89).
  ENFORCEMENT_NOTICE: ["haciz-ihbarnamesi-itiraz-suresi", "icra-borcu"],
  COURT_REASONED_DECISION: ["infaz-on-hesabi", "vekalet-ucreti", "harc-on-hesabi"],
  // İstinaf/temyiz süresi (istinaf-suresi/temyiz-suresi) bilinçli olarak
  // buraya EKLENMEDİ — hukuk/ceza yargılaması ayrımı belge modelinde yok
  // ve ceza yargılamasında süre farklıdır (bkz. CLAUDE.md); bu iki araç
  // yalnızca Araçlar sekmesinden manuel seçilebilir.
  TAX_NOTICE: [
    "vergi-mahkemesi-dava-suresi",
    "vergi-uzlasma-basvuru-suresi",
    "kdv-hesapla",
    "gelir-vergisi",
    "harc-on-hesabi",
  ],
  SGK_NOTICE: ["sgk-itiraz-suresi", "sgk-isveren-maliyeti"],
  RENT_AGREEMENT: ["kira-artisi"],
  EXECUTION_TIMESHEET: ["infaz-on-hesabi"],
  TRAFFIC_ADMINISTRATIVE_FINE: [
    "trafik-cezasi-itiraz-suresi",
    "trafik-cezasi-indirimli-odeme-suresi",
  ],
  UNKNOWN_OFFICIAL_DOCUMENT: [],
};

export function recommendToolSlugsForDocumentType(
  documentType: DocumentType | null,
): string[] {
  if (!documentType) return [];
  return DOCUMENT_TYPE_TOOL_SLUGS[documentType] ?? [];
}
