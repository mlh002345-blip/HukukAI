import { describe, expect, it } from "vitest";
import { calculateCourtFee } from "./court-fee";

describe("calculateCourtFee", () => {
  it("nispi harç + maktu başvurma harcını toplar", () => {
    // 100000 * 68.31/1000 = 6831; + 500 maktu = 7331
    const result = calculateCourtFee({
      disputeValue: "100000",
      proportionalRatePerMille: "68.31",
      fixedApplicationFee: "500",
    });
    expect(result.proportionalFee).toBe("6831.00");
    expect(result.totalFee).toBe("7331.00");
  });
});
