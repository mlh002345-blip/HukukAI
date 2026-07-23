import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPaymentProvider } from "@hukukai/billing";
import type { ApiEnv } from "@hukukai/config";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { PAYMENT_PROVIDER_TOKEN } from "./payment-provider.token";

@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    {
      provide: PAYMENT_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService<ApiEnv, true>) =>
        createPaymentProvider({
          PAYMENT_PROVIDER: configService.get("PAYMENT_PROVIDER", { infer: true }),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [BillingService],
})
export class BillingModule {}
