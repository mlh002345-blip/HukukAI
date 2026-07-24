import { describe, expect, it } from "vitest";
import { decideReleaseRisk } from "./decide-release-risk";
import type { VerificationLayerResult } from "./types";

const ALL_LAYERS_PASSED: VerificationLayerResult[] = [
  { layer: "SOURCE_INTEGRITY", passed: true, details: {} },
  { layer: "SECOND_SOURCE", passed: true, details: {} },
  { layer: "MODEL_CONSENSUS", passed: true, details: {} },
  { layer: "SCHEMA_VALIDATION", passed: true, details: {} },
  { layer: "GOLDEN_TESTS", passed: true, details: {} },
  { layer: "REGRESSION", passed: true, details: {} },
];

describe("decideReleaseRisk", () => {
  it("otomatik-uygun changeType + tüm katmanlar geçti + yüksek güven -> AUTO_PUBLISH", () => {
    const decision = decideReleaseRisk({
      changeType: "RATE_CHANGE",
      verificationResults: ALL_LAYERS_PASSED,
      confidenceScore: 0.999,
    });
    expect(decision.outcome).toBe("AUTO_PUBLISH");
  });

  it("asla-otomatik-değil changeType (COURT_ANNULMENT) her zaman HOLD_FOR_REVIEW döner", () => {
    const decision = decideReleaseRisk({
      changeType: "COURT_ANNULMENT",
      verificationResults: ALL_LAYERS_PASSED,
      confidenceScore: 1,
    });
    expect(decision.outcome).toBe("HOLD_FOR_REVIEW");
  });

  it("bir katman başarısız olduysa HOLD_FOR_REVIEW döner", () => {
    const decision = decideReleaseRisk({
      changeType: "RATE_CHANGE",
      verificationResults: [
        ...ALL_LAYERS_PASSED.filter((r) => r.layer !== "MODEL_CONSENSUS"),
        { layer: "MODEL_CONSENSUS", passed: false, details: { reason: "iki model farklı oran önerdi" } },
      ],
      confidenceScore: 0.999,
    });
    expect(decision.outcome).toBe("HOLD_FOR_REVIEW");
  });

  it("güven skoru eşiğin altındaysa AUTO_PUBLISH yapmaz", () => {
    const decision = decideReleaseRisk({
      changeType: "RATE_CHANGE",
      verificationResults: ALL_LAYERS_PASSED,
      confidenceScore: 0.9,
    });
    expect(decision.outcome).toBe("HOLD_FOR_REVIEW");
  });

  it("izinli listede olmayan bir changeType (AMENDED_PROVISION) temkinli olarak HOLD_FOR_REVIEW döner", () => {
    const decision = decideReleaseRisk({
      changeType: "AMENDED_PROVISION",
      verificationResults: ALL_LAYERS_PASSED,
      confidenceScore: 1,
    });
    expect(decision.outcome).toBe("HOLD_FOR_REVIEW");
  });
});
