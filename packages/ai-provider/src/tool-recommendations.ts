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
  ENFORCEMENT_NOTICE: ["icra-itiraz-suresi", "icra-borcu"],
  COURT_REASONED_DECISION: ["infaz-on-hesabi", "vekalet-ucreti", "harc-on-hesabi"],
  TAX_NOTICE: ["kdv-hesapla", "gelir-vergisi", "harc-on-hesabi"],
  SGK_NOTICE: ["sgk-isveren-maliyeti"],
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
