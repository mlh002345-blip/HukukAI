import { describe, expect, it } from "vitest";
import { calculateIncomeTax } from "./income-tax";

const brackets = [
  { upTo: "100000", ratePercent: 15 },
  { upTo: "200000", ratePercent: 20 },
  { upTo: null, ratePercent: 27 },
];

describe("calculateIncomeTax", () => {
  it("dilimli vergiyi doğru hesaplar", () => {
    // 100000*%15 + 50000*%20 = 15000 + 10000 = 25000
    const result = calculateIncomeTax({ taxableIncome: "150000", brackets });
    expect(result.totalTax).toBe("25000.00");
  });

  it("efektif oranı hesaplar", () => {
    const result = calculateIncomeTax({ taxableIncome: "150000", brackets });
    // 25000 / 150000 * 100 = 16.666...
    expect(result.effectiveRatePercent).toBe("16.67");
  });

  it("sıfır gelir için sıfır vergi ve sıfır efektif oran döner", () => {
    const result = calculateIncomeTax({ taxableIncome: "0", brackets });
    expect(result.totalTax).toBe("0.00");
    expect(result.effectiveRatePercent).toBe("0");
  });
});
