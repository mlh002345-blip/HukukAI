import { describe, expect, it } from "vitest";
import { MockMultiModelConsensusProvider } from "./mock-multi-model-consensus-provider";
import type { RuleProposal } from "../types";

describe("MockMultiModelConsensusProvider", () => {
  it("ilk taslağın eşdeğer bir kopyasını döner (her zaman mutabık)", async () => {
    const draft: RuleProposal = {
      ruleKey: "TR_KDV_STANDARD_RATE",
      module: "VAT_CALCULATION",
      version: "2026.06.16",
      validFrom: "2026-06-16",
      validTo: null,
      selectorDateType: "TRANSACTION_DATE",
      ruleData: { rate: "0.20" },
      legalBasis: [{ law: "KDV Genel Uygulama Tebliği", article: "1" }],
      supersedesRuleSetId: "rs_1",
    };
    const provider = new MockMultiModelConsensusProvider();
    const reproduced = await provider.independentlyReproduce(draft);
    expect(reproduced).toEqual(draft);
    expect(reproduced).not.toBe(draft);
  });
});
