import { describe, expect, it } from "vitest";
import type { VersionedRule } from "./types";
import { findApplicableRule } from "./find-applicable-rule";

function rule(
  ruleKey: string,
  version: string,
  validFrom: string,
  documentType: string,
): VersionedRule<{ days: number }> {
  return {
    ruleKey,
    version,
    validFrom,
    conditions: [{ field: "documentType", operator: "EQUALS", value: documentType }],
    data: { days: 15 },
    legalBasis: [],
    warnings: [],
  };
}

describe("findApplicableRule", () => {
  const trafficV1 = rule("TR_TRAFFIC_FINE_OBJECTION", "1.0.0", "2020-01-01", "TRAFFIC_ADMINISTRATIVE_FINE");
  const trafficV2 = rule("TR_TRAFFIC_FINE_OBJECTION", "2.0.0", "2026-01-01", "TRAFFIC_ADMINISTRATIVE_FINE");
  const enforcement = rule("TR_ENFORCEMENT_OBJECTION", "1.0.0", "2020-01-01", "ENFORCEMENT_PAYMENT_ORDER");

  const rules = [trafficV1, trafficV2, enforcement];

  it("belge türüne göre doğru kuralı ve tarihe göre doğru sürümü bulur", () => {
    const result = findApplicableRule(
      rules,
      { documentType: "TRAFFIC_ADMINISTRATIVE_FINE" },
      "2024-06-20",
    );
    expect(result?.ruleKey).toBe("TR_TRAFFIC_FINE_OBJECTION");
    expect(result?.version).toBe("1.0.0");
  });

  it("aynı belge türü için farklı tarihte farklı sürüm bulur", () => {
    const result = findApplicableRule(
      rules,
      { documentType: "TRAFFIC_ADMINISTRATIVE_FINE" },
      "2026-06-20",
    );
    expect(result?.version).toBe("2.0.0");
  });

  it("eşleşen belge türü yoksa null döner", () => {
    expect(
      findApplicableRule(rules, { documentType: "SGK_NOTICE" }, "2024-01-01"),
    ).toBeNull();
  });
});
