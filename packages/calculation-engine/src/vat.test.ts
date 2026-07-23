import { describe, expect, it } from "vitest";
import { calculateVat } from "./vat";

describe("calculateVat — ADD_VAT", () => {
  it("KDV hariç tutara KDV ekler", () => {
    const result = calculateVat({
      amount: "1000",
      vatRatePercent: "20",
      mode: "ADD_VAT",
    });
    expect(result.baseAmount).toBe("1000.00");
    expect(result.vatAmount).toBe("200.00");
    expect(result.totalAmount).toBe("1200.00");
  });
});

describe("calculateVat — EXTRACT_VAT", () => {
  it("KDV dahil tutardan KDV'yi ayrıştırır", () => {
    const result = calculateVat({
      amount: "1200",
      vatRatePercent: "20",
      mode: "EXTRACT_VAT",
    });
    expect(result.totalAmount).toBe("1200.00");
    expect(result.baseAmount).toBe("1000.00");
    expect(result.vatAmount).toBe("200.00");
  });

  it("ADD_VAT ve EXTRACT_VAT birbirinin tersidir", () => {
    const added = calculateVat({
      amount: "537.42",
      vatRatePercent: "18",
      mode: "ADD_VAT",
    });
    const extracted = calculateVat({
      amount: added.totalAmount,
      vatRatePercent: "18",
      mode: "EXTRACT_VAT",
    });
    expect(extracted.baseAmount).toBe(added.baseAmount);
  });
});
