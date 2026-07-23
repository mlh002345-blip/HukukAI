import { randomUUID } from "node:crypto";
import type { SubscriptionPlan } from "@hukukai/types";
import type { PaymentChargeResult, PaymentProvider } from "../types";

/**
 * Faz 8 varsayılan sağlayıcısı (`PAYMENT_PROVIDER=mock`). Gerçek bir
 * ödeme altyapısına bağlanmaz; her isteği başarılı kabul edip
 * sahte bir işlem referansı döner. Üretime alınmadan önce gerçek bir
 * ödeme sağlayıcısı (ör. Iyzico) ile değiştirilmelidir.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async chargeSubscription(
    _userId: string,
    _plan: SubscriptionPlan,
  ): Promise<PaymentChargeResult> {
    return Promise.resolve({
      success: true,
      providerReference: `MOCK-SUB-${randomUUID()}`,
    });
  }

  async chargeOneTimeCreditPack(_userId: string): Promise<PaymentChargeResult> {
    return Promise.resolve({
      success: true,
      providerReference: `MOCK-CREDIT-${randomUUID()}`,
    });
  }
}
