import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./providers/mock-payment-provider";

export interface PaymentProviderEnv {
  PAYMENT_PROVIDER: "mock";
}

/**
 * Ödeme sağlayıcısının değiştirilebilir olması gereken tek giriş
 * noktası (bkz. `createAIProvider`, `@hukukai/ai-provider`).
 */
export function createPaymentProvider(env: PaymentProviderEnv): PaymentProvider {
  if (env.PAYMENT_PROVIDER === "mock") {
    return new MockPaymentProvider();
  }
  throw new Error(`Bilinmeyen ödeme sağlayıcısı: ${String(env.PAYMENT_PROVIDER)}`);
}
