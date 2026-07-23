/**
 * Tüm rapor türlerinin paylaştığı yapı (Bölüm 22 — Rapor Üretimi).
 * Her raporda: başlık, oluşturma tarihi, kullanıcı girdileri, belgeden
 * çıkarılan alanlar / hesaplama-süre sonucu, hesap adımları, kural
 * sürümü, mevzuat dayanağı, uyarılar, sorumluluk açıklaması ve
 * benzersiz rapor numarası bulunmalıdır.
 */
export interface ReportRow {
  label: string;
  value: string;
}

export interface ReportSection {
  heading: string;
  rows: ReportRow[];
}

export interface ReportContent {
  reportNumber: string;
  title: string;
  generatedAt: string;
  sections: ReportSection[];
  warnings: string[];
  disclaimer: string;
  /** Ücretsiz plan kullanıcıları için filigranlı rapor (Bölüm 23). */
  watermark: boolean;
}

export const STANDARD_DISCLAIMER =
  "Bu rapor HukukAI tarafından otomatik olarak üretilmiştir. Sonuçlar bir " +
  "ön hesaplama niteliğindedir; hukuki veya mali danışmanlık yerine " +
  "geçmez. Nihai karar ve işlemler için yetkili bir avukat veya mali " +
  "müşavire danışınız.";

export function buildReportNumber(id: string, createdAt: Date): string {
  const year = createdAt.getUTCFullYear();
  const shortId = id.slice(-8).toUpperCase();
  return `HKA-${year}-${shortId}`;
}
