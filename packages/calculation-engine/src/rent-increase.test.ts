import { describe, expect, it } from "vitest";
import { calculateRentIncrease } from "./rent-increase";

describe("calculateRentIncrease", () => {
  it("kira artışını doğru hesaplar", () => {
    const result = calculateRentIncrease({
      currentRent: "10000",
      increaseRatePercent: "25",
    });
    expect(result.increaseAmount).toBe("2500.00");
    expect(result.newRent).toBe("12500.00");
  });

  it("oran sıfırsa kira değişmez", () => {
    const result = calculateRentIncrease({
      currentRent: "5000",
      increaseRatePercent: "0",
    });
    expect(result.newRent).toBe("5000.00");
  });
});
