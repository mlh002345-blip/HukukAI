import { describe, expect, it } from "vitest";
import { MockPaymentProvider } from "./mock-payment-provider";

describe("MockPaymentProvider", () => {
  it("abonelik yükseltmesini her zaman başarılı sayar", async () => {
    const provider = new MockPaymentProvider();
    const result = await provider.chargeSubscription("user-1", "PRO");
    expect(result.success).toBe(true);
    expect(result.providerReference).toMatch(/^MOCK-SUB-/);
  });

  it("tek seferlik kredi paketini her zaman başarılı sayar", async () => {
    const provider = new MockPaymentProvider();
    const result = await provider.chargeOneTimeCreditPack("user-1");
    expect(result.success).toBe(true);
    expect(result.providerReference).toMatch(/^MOCK-CREDIT-/);
  });
});
