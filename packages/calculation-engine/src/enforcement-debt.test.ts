import { describe, expect, it } from "vitest";
import { calculateEnforcementDebt } from "./enforcement-debt";

describe("calculateEnforcementDebt", () => {
  it("anapara, faiz ve masrafları toplar", () => {
    const result = calculateEnforcementDebt({
      principal: "10000",
      interest: { principal: "10000", periods: [{ annualRatePercent: 9, days: 365 }] },
      expenses: [
        { label: "Tebligat gideri", amount: "50" },
        { label: "İcra harcı", amount: "150" },
      ],
    });

    expect(result.interestAmount).toBe("900.00");
    expect(result.expensesTotal).toBe("200.00");
    expect(result.totalDebt).toBe("11100.00"); // 10000 + 900 + 200
    expect(result.expenses).toEqual([
      { label: "Tebligat gideri", amount: "50.00" },
      { label: "İcra harcı", amount: "150.00" },
    ]);
  });

  it("masraf listesi boşsa yalnızca anapara + faiz döner", () => {
    const result = calculateEnforcementDebt({
      principal: "1000",
      interest: { principal: "1000", periods: [] },
      expenses: [],
    });
    expect(result.totalDebt).toBe("1000.00");
  });
});
