import { describe, expect, it } from "vitest";
import type { VersionedRule } from "./types";
import { selectRuleVersion } from "./select-rule-version";

function rule(
  version: string,
  validFrom: string,
  validTo?: string,
): VersionedRule<{ days: number }> {
  return {
    ruleKey: "TEST",
    version,
    validFrom,
    validTo,
    conditions: [],
    data: { days: 7 },
    legalBasis: [],
    warnings: [],
  };
}

describe("selectRuleVersion", () => {
  const v1 = rule("1.0.0", "2020-01-01", "2025-01-01");
  const v2 = rule("2.0.0", "2025-01-01");

  it("2024'teki bir tarih için eski sürümü seçer", () => {
    expect(selectRuleVersion([v1, v2], "2024-06-20")?.version).toBe("1.0.0");
  });

  it("2026'daki bir tarih için yeni sürümü seçer (aynı gün farklı sonuç)", () => {
    expect(selectRuleVersion([v1, v2], "2026-06-20")?.version).toBe("2.0.0");
  });

  it("validTo sınırında yeni sürüme geçer (validTo hariç)", () => {
    expect(selectRuleVersion([v1, v2], "2025-01-01")?.version).toBe("2.0.0");
  });

  it("hiçbir sürüm geçerli değilse null döner", () => {
    expect(selectRuleVersion([v1, v2], "2019-01-01")).toBeNull();
  });

  it("birden fazla aday arasında en güncel validFrom'u seçer", () => {
    const older = rule("1.5.0", "2022-01-01");
    const newer = rule("1.6.0", "2023-01-01");
    expect(selectRuleVersion([older, newer], "2024-01-01")?.version).toBe(
      "1.6.0",
    );
  });
});
