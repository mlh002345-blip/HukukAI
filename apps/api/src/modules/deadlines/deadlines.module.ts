import { Module } from "@nestjs/common";
import { RulesModule } from "../rules/rules.module";
import { DeadlinesController } from "./deadlines.controller";
import { DeadlinesService } from "./deadlines.service";

@Module({
  imports: [RulesModule],
  controllers: [DeadlinesController],
  providers: [DeadlinesService],
  exports: [DeadlinesService],
})
export class DeadlinesModule {}
