import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  calculateDeadlineSchema,
  createDeadlineSchema,
  listUpcomingDeadlinesQuerySchema,
  updateDeadlineSchema,
  type CalculateDeadlineInput,
  type CreateDeadlineInput,
  type ListUpcomingDeadlinesQuery,
  type UpdateDeadlineInput,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { DeadlinesService } from "./deadlines.service";

@ApiTags("deadlines")
@Controller("deadlines")
export class DeadlinesController {
  constructor(private readonly deadlinesService: DeadlinesService) {}

  @Post("calculate")
  @UsePipes(new ZodValidationPipe(calculateDeadlineSchema))
  calculate(@Body() body: CalculateDeadlineInput) {
    return this.deadlinesService.calculate(body);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createDeadlineSchema))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateDeadlineInput,
  ) {
    return this.deadlinesService.create(user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.deadlinesService.findAll(user.id);
  }

  @Get("upcoming")
  @UsePipes(new ZodValidationPipe(listUpcomingDeadlinesQuerySchema))
  findUpcoming(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListUpcomingDeadlinesQuery,
  ) {
    return this.deadlinesService.findUpcoming(user.id, query.days);
  }

  @Get(":id")
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.deadlinesService.findOne(user.id, id);
  }

  @Patch(":id")
  @UsePipes(new ZodValidationPipe(updateDeadlineSchema))
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateDeadlineInput,
  ) {
    return this.deadlinesService.update(user.id, id, body);
  }

  @Post(":id/complete")
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.deadlinesService.complete(user.id, id);
  }

  @Delete(":id")
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.deadlinesService.remove(user.id, id);
    return { success: true };
  }
}
