import { describe, expect, it } from "vitest";
import { calculateSelfEmploymentReceipt } from "./self-employment-receipt";

describe("calculateSelfEmploymentReceipt", () => {
  it("stopaj ve KDV'yi ayrı hesaplar", () => {
    const result = calculateSelfEmploymentReceipt({
      grossAmount: "10000",
      withholdingTaxRatePercent: "20",
      vatRatePercent: "20",
    });
    expect(result.withholdingTaxAmount).toBe("2000.00");
    expect(result.vatAmount).toBe("2000.00");
    expect(result.netAmount).toBe("8000.00"); // 10000 - 2000 stopaj
    expect(result.totalCollected).toBe("12000.00"); // 10000 + 2000 KDV
  });
});
