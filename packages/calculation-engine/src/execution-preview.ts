import { addUtcDays, formatIsoDate, parseIsoDate } from "@hukukai/deadline-engine";

export const EXECUTION_FRACTIONS = ["HALF", "TWO_THIRDS", "THREE_QUARTERS"] as const;
export type ExecutionFraction = (typeof EXECUTION_FRACTIONS)[number];

const FRACTION_VALUES: Record<ExecutionFraction, number> = {
  HALF: 1 / 2,
  TWO_THIRDS: 2 / 3,
  THREE_QUARTERS: 3 / 4,
};

export interface CalculateExecutionPreviewInput {
  /** Toplam mahkumiyet süresi (gün). */
  sentenceDays: number;
  /** İnfaz oranı (koşullu salıverme için gerekli kesir) — bu motor
   * tarafından ASLA varsayılmaz; hangi oranın uygulanacağı somut olaya
   * (suç türü, tekerrür, özel infaz rejimi) göre kullanıcı/avukat
   * tarafından belirlenmelidir. */
  executionFraction: ExecutionFraction;
  /** Tutuklulukta/gözaltında geçip mahsup edilecek gün sayısı. */
  creditedDays: number;
  /** İnfazın fiilen başladığı tarih (ISO "YYYY-MM-DD"). */
  startDate: string;
  /** Açık ceza infaz kurumuna ayrılma/denetimli serbestlik için koşullu
   * salıverme tarihinden kaç gün önce uygulanacağı (mevzuata göre
   * değişir; varsayılan verilmez). Belirtilmezse hesaplanmaz. */
  probationBufferDays?: number;
}

export interface CalculateExecutionPreviewResult {
  requiredServedDays: number;
  remainingDaysAfterCredit: number;
  conditionalReleaseDate: string;
  probationEligibleDate: string | null;
  warnings: string[];
}

/**
 * İNFAZ UYARISI (Bölüm 17): Bu motor yüksek riskli bir alanı hesaplar.
 * Döndürülen `warnings` listesi HER ZAMAN aşağıdaki dört uyarıyı içerir
 * ve hiçbir çağıran taraf bunları kaldıramaz/gizleyemez.
 */
const MANDATORY_EXECUTION_WARNINGS = [
  "Bu bir ön hesaptır.",
  "Suç tarihi ve suç türü sonucu değiştirebilir.",
  "Birden fazla ilam, tekerrür, mahsup ve özel infaz rejimleri ayrıca incelenmelidir.",
  "Nihai hesap yetkili makamlarca yapılır.",
];

export function calculateExecutionPreview(
  input: CalculateExecutionPreviewInput,
): CalculateExecutionPreviewResult {
  const fraction = FRACTION_VALUES[input.executionFraction];
  const requiredServedDays = Math.ceil(input.sentenceDays * fraction);
  const remainingDaysAfterCredit = Math.max(
    0,
    requiredServedDays - input.creditedDays,
  );

  const startDate = parseIsoDate(input.startDate);
  const conditionalReleaseDate = addUtcDays(startDate, remainingDaysAfterCredit);

  const probationEligibleDate =
    input.probationBufferDays !== undefined
      ? formatIsoDate(
          addUtcDays(conditionalReleaseDate, -input.probationBufferDays),
        )
      : null;

  return {
    requiredServedDays,
    remainingDaysAfterCredit,
    conditionalReleaseDate: formatIsoDate(conditionalReleaseDate),
    probationEligibleDate,
    warnings: [...MANDATORY_EXECUTION_WARNINGS],
  };
}
