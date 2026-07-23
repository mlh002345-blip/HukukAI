import { describe, expect, it } from "vitest";
import { evaluateConditions } from "./evaluate-conditions";

describe("evaluateConditions", () => {
  it("boş koşul listesi her zaman doğrudur", () => {
    expect(evaluateConditions([], {})).toBe(true);
  });

  it("EQUALS eşleşmesini doğrular", () => {
    expect(
      evaluateConditions(
        [{ field: "documentType", operator: "EQUALS", value: "RENT_AGREEMENT" }],
        { documentType: "RENT_AGREEMENT" },
      ),
    ).toBe(true);
    expect(
      evaluateConditions(
        [{ field: "documentType", operator: "EQUALS", value: "RENT_AGREEMENT" }],
        { documentType: "TAX_NOTICE" },
      ),
    ).toBe(false);
  });

  it("NOT_EQUALS koşulunu doğrular", () => {
    expect(
      evaluateConditions(
        [{ field: "documentType", operator: "NOT_EQUALS", value: "TAX_NOTICE" }],
        { documentType: "RENT_AGREEMENT" },
      ),
    ).toBe(true);
  });

  it("IN koşulunu doğrular", () => {
    expect(
      evaluateConditions(
        [{ field: "documentType", operator: "IN", value: ["A", "B"] }],
        { documentType: "B" },
      ),
    ).toBe(true);
    expect(
      evaluateConditions(
        [{ field: "documentType", operator: "IN", value: ["A", "B"] }],
        { documentType: "C" },
      ),
    ).toBe(false);
  });

  it("GTE ve LTE koşullarını doğrular", () => {
    expect(
      evaluateConditions([{ field: "amount", operator: "GTE", value: 100 }], {
        amount: 150,
      }),
    ).toBe(true);
    expect(
      evaluateConditions([{ field: "amount", operator: "LTE", value: 100 }], {
        amount: 150,
      }),
    ).toBe(false);
  });

  it("birden fazla koşulun TÜMÜ sağlanmalıdır (AND)", () => {
    const conditions = [
      { field: "documentType", operator: "EQUALS" as const, value: "TRAFFIC_ADMINISTRATIVE_FINE" },
      { field: "amount", operator: "GTE" as const, value: 0 },
    ];
    expect(evaluateConditions(conditions, { documentType: "TRAFFIC_ADMINISTRATIVE_FINE", amount: 500 })).toBe(true);
    expect(evaluateConditions(conditions, { documentType: "TRAFFIC_ADMINISTRATIVE_FINE", amount: -1 })).toBe(false);
  });
});
