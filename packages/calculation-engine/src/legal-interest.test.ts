import { describe, expect, it } from "vitest";
import { calculateLegalInterest } from "./legal-interest";

describe("calculateLegalInterest", () => {
  it("tek dönem için basit faizi doğru hesaplar", () => {
    // 10000 * %9 * (365/365) = 900
    const result = calculateLegalInterest({
      principal: "10000",
      periods: [{ annualRatePercent: 9, days: 365 }],
    });
    expect(result.totalInterest).toBe("900.00");
    expect(result.totalAmount).toBe("10900.00");
    expect(result.breakdown).toHaveLength(1);
  });

  it("farklı oranlı birden fazla dönemi toplar", () => {
    // 10000 * %9 * (182/365) + 10000 * %10.75 * (183/365)
    const result = calculateLegalInterest({
      principal: "10000",
      periods: [
        { annualRatePercent: 9, days: 182 },
        { annualRatePercent: 10.75, days: 183 },
      ],
    });
    const period1 = 10000 * 0.09 * (182 / 365);
    const period2 = 10000 * 0.1075 * (183 / 365);
    expect(result.totalInterest).toBe((period1 + period2).toFixed(2));
    expect(result.breakdown).toHaveLength(2);
  });

  it("sıfır gün için faiz üretmez", () => {
    const result = calculateLegalInterest({
      principal: "10000",
      periods: [{ annualRatePercent: 9, days: 0 }],
    });
    expect(result.totalInterest).toBe("0.00");
  });
});
