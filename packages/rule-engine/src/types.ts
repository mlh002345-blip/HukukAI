export const CONDITION_OPERATORS = [
  "EQUALS",
  "NOT_EQUALS",
  "IN",
  "GTE",
  "LTE",
] as const;
export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface LegalBasisRef {
  law: string;
  article?: string;
}

/**
 * Tarihe göre sürümlenmiş, koşullu bir kural (Bölüm 16 — Kural ve Süre
 * Motoru). `TData` kuralın gövdesidir (ör. süre hesaplama parametreleri);
 * kural motoru bu gövdenin içeriğini bilmez, yalnızca hangi sürümün
 * hangi tarihte ve hangi koşullarda geçerli olduğuna karar verir.
 */
export interface VersionedRule<TData> {
  ruleKey: string;
  version: string;
  validFrom: string;
  validTo?: string | null;
  conditions: RuleCondition[];
  data: TData;
  legalBasis: LegalBasisRef[];
  warnings: string[];
}
