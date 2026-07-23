import { Module } from "@nestjs/common";
import { RulesModule } from "../rules/rules.module";
import { BillingModule } from "../billing/billing.module";
import { DeadlinesController } from "./deadlines.controller";
import { DeadlinesService } from "./deadlines.service";

@Module({
  imports: [RulesModule, BillingModule],
  controllers: [DeadlinesController],
  providers: [DeadlinesService],
  exports: [DeadlinesService],
})
export class DeadlinesModule {}
