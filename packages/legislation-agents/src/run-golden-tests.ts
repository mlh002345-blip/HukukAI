import type { GoldenTestCase, GoldenTestRunResult } from "./types";

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== "object") return false;
  const aEntries = Object.entries(a as Record<string, unknown>);
  const bRecord = b as Record<string, unknown>;
  if (aEntries.length !== Object.keys(bRecord).length) return false;
  return aEntries.every(([key, value]) => deepEqual(value, bRecord[key]));
}

/**
 * Test Generator + otomatik hukuki senaryo testi çalıştırıcısı. Saf
 * fonksiyon — hangi motoru (rule-engine/deadline-engine/calculation-engine)
 * çalıştıracağını bilmez; `evaluate` çağıran taraf (ör.
 * `RuleVerificationService`) tarafından, aday `RuleSet`in `ruleData`sını
 * ilgili motora bağlayan bir kapanış (closure) olarak enjekte edilir.
 * Böylece bu paket hiçbir motor paketine sıkı bağımlı kalmaz.
 */
export function runGoldenTests<TFacts = Record<string, unknown>, TOutcome = Record<string, unknown>>(
  testCases: Array<GoldenTestCase<TFacts, TOutcome>>,
  evaluate: (facts: TFacts) => TOutcome,
): Array<GoldenTestRunResult<TOutcome>> {
  return testCases.map((testCase) => {
    const actualOutcome = evaluate(testCase.facts);
    return {
      testCase: testCase as GoldenTestCase<Record<string, unknown>, TOutcome>,
      passed: deepEqual(actualOutcome, testCase.expectedOutcome),
      actualOutcome,
    };
  });
}

export interface RegressionCheckInput<TRecord> {
  records: TRecord[];
  evaluateOld: (record: TRecord) => unknown;
  evaluateNew: (record: TRecord) => unknown;
}

export interface RegressionCheckResult<TRecord> {
  record: TRecord;
  oldOutcome: unknown;
  newOutcome: unknown;
  changed: boolean;
}

/**
 * Regresyon Agent'ın saf çekirdeği — mevcut kayıtları (ör. son
 * `Deadline` satırları) hem eski hem de aday kuralla yeniden
 * çalıştırıp sonuçları karşılaştırır. `changed: true` olan kayıtlar,
 * kural değişikliğinin geçmişi de etkilediği (geriye dönük düzeltme
 * gerektirebilecek) durumlardır.
 */
export function runRegressionCheck<TRecord>(
  input: RegressionCheckInput<TRecord>,
): Array<RegressionCheckResult<TRecord>> {
  return input.records.map((record) => {
    const oldOutcome = input.evaluateOld(record);
    const newOutcome = input.evaluateNew(record);
    return { record, oldOutcome, newOutcome, changed: !deepEqual(oldOutcome, newOutcome) };
  });
}
