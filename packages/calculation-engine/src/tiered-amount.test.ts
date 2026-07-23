import { describe, expect, it } from "vitest";
import { calculateTieredAmount } from "./tiered-amount";

describe("calculateTieredAmount", () => {
  const brackets = [
    { upTo: "1000", ratePercent: 10 },
    { upTo: "3000", ratePercent: 20 },
    { upTo: null, ratePercent: 30 },
  ];

  it("tek dilime tam sığan tutarı doğru hesaplar", () => {
    // 500 * %10 = 50
    expect(calculateTieredAmount("500", brackets).toString()).toBe("50");
  });

  it("birden fazla dilime yayılan tutarı kademeli hesaplar", () => {
    // 1000*%10 + 1000*%20 = 100 + 200 = 300
    expect(calculateTieredAmount("2000", brackets).toString()).toBe("300");
  });

  it("son (sınırsız) dilime taşan tutarı doğru hesaplar", () => {
    // 1000*%10 + 2000*%20 + 1000*%30 = 100 + 400 + 300 = 800
    expect(calculateTieredAmount("4000", brackets).toString()).toBe("800");
  });

  it("sıfır veya negatif taban için sıfır döner", () => {
    expect(calculateTieredAmount("0", brackets).toString()).toBe("0");
  });
});
