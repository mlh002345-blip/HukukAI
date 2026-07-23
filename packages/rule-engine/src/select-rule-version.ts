import type { VersionedRule } from "./types";

/**
 * Bir kuralın, verilen tarihte (ör. tebliğ/karar tarihi — hesaplamanın
 * yapıldığı "bugün" DEĞİL) yürürlükte olan sürümünü seçer. Aynı olay
 * için 2024'te verilen bir karar ile 2026'da verilen bir karar, aradaki
 * mevzuat değişikliğine göre farklı sürümlerle hesaplanabilir.
 *
 * `validFrom`/`validTo` ISO "YYYY-MM-DD" biçiminde olmalıdır; bu biçimde
 * sözlüksel karşılaştırma kronolojik karşılaştırmayla aynı sonucu verir.
 */
export function selectRuleVersion<TData>(
  candidates: Array<VersionedRule<TData>>,
  onDate: string,
): VersionedRule<TData> | null {
  const applicable = candidates.filter(
    (rule) =>
      rule.validFrom <= onDate && (!rule.validTo || rule.validTo > onDate),
  );

  if (applicable.length === 0) return null;

  return applicable.reduce((latest, current) =>
    current.validFrom > latest.validFrom ? current : latest,
  );
}
