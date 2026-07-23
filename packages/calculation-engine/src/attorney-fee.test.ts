import { describe, expect, it } from "vitest";
import { calculateAttorneyFee } from "./attorney-fee";

const brackets = [
  { upTo: "100000", ratePercent: 10 },
  { upTo: null, ratePercent: 5 },
];

describe("calculateAttorneyFee", () => {
  it("nispi ücreti kademeli tarifeye göre hesaplar", () => {
    // 100000*%10 + 50000*%5 = 10000 + 2500 = 12500
    const result = calculateAttorneyFee({
      disputeValue: "150000",
      brackets,
    });
    expect(result.calculatedFee).toBe("12500.00");
    expect(result.appliedMinimumFee).toBe(false);
  });

  it("hesaplanan ücret asgari ücretin altındaysa asgari ücreti uygular", () => {
    const result = calculateAttorneyFee({
      disputeValue: "1000",
      brackets,
      minimumFee: "5000",
    });
    expect(result.calculatedFee).toBe("5000.00");
    expect(result.appliedMinimumFee).toBe(true);
  });

  it("asgari ücret verilmemişse yalnızca tarifeye göre hesaplar", () => {
    const result = calculateAttorneyFee({ disputeValue: "1000", brackets });
    expect(result.appliedMinimumFee).toBe(false);
  });
});
