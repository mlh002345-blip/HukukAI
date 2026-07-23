import type { SubscriptionPlan } from "@hukukai/types";

export interface PaymentChargeResult {
  success: boolean;
  providerReference: string;
}

/**
 * Ödeme sağlayıcı soyutlaması (bkz. `@hukukai/ai-provider`'daki
 * `AIProvider` deseni). Gerçek bir ödeme altyapısı (ör. Iyzico)
 * entegre edildiğinde yalnızca bu arayüzü uygulayan yeni bir sağlayıcı
 * eklenir; servis katmanı değişmez.
 */
export interface PaymentProvider {
  readonly name: string;
  chargeSubscription(
    userId: string,
    plan: SubscriptionPlan,
  ): Promise<PaymentChargeResult>;
  chargeOneTimeCreditPack(userId: string): Promise<PaymentChargeResult>;
}
