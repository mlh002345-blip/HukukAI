import { describe, expect, it } from "vitest";
import { runGoldenTests, runRegressionCheck } from "./run-golden-tests";
import type { GoldenTestCase } from "./types";

describe("runGoldenTests", () => {
  it("beklenen sonuçla eşleşen senaryoları passed:true işaretler", () => {
    const cases: GoldenTestCase<{ amount: number }, { total: number }>[] = [
      { ruleKey: "TEST", name: "10 birim", facts: { amount: 10 }, expectedOutcome: { total: 20 } },
    ];
    const results = runGoldenTests(cases, (facts) => ({ total: facts.amount * 2 }));
    expect(results[0]?.passed).toBe(true);
  });

  it("beklenenden farklı sonuçları passed:false işaretler ve gerçek sonucu döner", () => {
    const cases: GoldenTestCase<{ amount: number }, { total: number }>[] = [
      { ruleKey: "TEST", name: "yanlış beklenti", facts: { amount: 10 }, expectedOutcome: { total: 999 } },
    ];
    const results = runGoldenTests(cases, (facts) => ({ total: facts.amount * 2 }));
    expect(results[0]?.passed).toBe(false);
    expect(results[0]?.actualOutcome).toEqual({ total: 20 });
  });

  it("iç içe (nested) nesneleri doğru karşılaştırır", () => {
    const cases: GoldenTestCase<null, { nested: { a: number; b: string } }>[] = [
      { ruleKey: "TEST", name: "nested", facts: null, expectedOutcome: { nested: { a: 1, b: "x" } } },
    ];
    const results = runGoldenTests(cases, () => ({ nested: { a: 1, b: "x" } }));
    expect(results[0]?.passed).toBe(true);
  });
});

describe("runRegressionCheck", () => {
  it("eski ve yeni sonuç aynıysa changed:false döner", () => {
    const results = runRegressionCheck({
      records: [{ id: "1" }],
      evaluateOld: () => ({ value: 5 }),
      evaluateNew: () => ({ value: 5 }),
    });
    expect(results[0]?.changed).toBe(false);
  });

  it("eski ve yeni sonuç farklıysa changed:true döner", () => {
    const results = runRegressionCheck({
      records: [{ id: "1" }],
      evaluateOld: () => ({ value: 5 }),
      evaluateNew: () => ({ value: 7 }),
    });
    expect(results[0]?.changed).toBe(true);
  });
});
