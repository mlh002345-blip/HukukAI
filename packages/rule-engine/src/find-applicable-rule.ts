import type { VersionedRule } from "./types";
import { evaluateConditions } from "./evaluate-conditions";
import { selectRuleVersion } from "./select-rule-version";

/**
 * Bir modüldeki tüm kural sürümleri arasından, verilen olgularla (facts)
 * eşleşen VE verilen tarihte yürürlükte olan sürümü bulur. Belge
 * analizinden otomatik yönlendirme (Bölüm 8) gibi, hangi `ruleKey`'in
 * kullanılacağının önceden bilinmediği durumlar için kullanılır.
 */
export function findApplicableRule<TData>(
  rules: Array<VersionedRule<TData>>,
  facts: Record<string, unknown>,
  onDate: string,
): VersionedRule<TData> | null {
  const matching = rules.filter((rule) =>
    evaluateConditions(rule.conditions, facts),
  );
  return selectRuleVersion(matching, onDate);
}
