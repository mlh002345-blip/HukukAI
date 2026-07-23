import { describe, expect, it } from "vitest";
import { calculateSgkEmployerCost } from "./sgk-employer-cost";

describe("calculateSgkEmployerCost", () => {
  it("SGK ve işsizlik sigortası işveren paylarını brüt maaşa ekler", () => {
    const result = calculateSgkEmployerCost({
      grossSalary: "20000",
      sgkEmployerRatePercent: "20.5",
      unemploymentEmployerRatePercent: "2",
    });
    expect(result.sgkEmployerAmount).toBe("4100.00");
    expect(result.unemploymentEmployerAmount).toBe("400.00");
    expect(result.totalEmployerCost).toBe("24500.00");
  });
});
