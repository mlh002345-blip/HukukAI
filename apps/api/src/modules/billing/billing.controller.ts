import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { subscribeSchema, type SubscribeInput } from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { BillingService } from "./billing.service";

@ApiTags("billing")
@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get("usage")
  usage(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getUsage(user.id);
  }

  @Get("plans")
  plans() {
    return {
      plans: this.billingService.listPlans(),
      oneTimeCreditPack: this.billingService.getOneTimeCreditPack(),
    };
  }

  @Post("subscribe")
  @UsePipes(new ZodValidationPipe(subscribeSchema))
  subscribe(@CurrentUser() user: AuthenticatedUser, @Body() body: SubscribeInput) {
    return this.billingService.subscribe(user.id, body.plan);
  }

  @Post("one-time-credits")
  purchaseOneTimeCredits(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.purchaseOneTimeCredits(user.id);
  }
}
