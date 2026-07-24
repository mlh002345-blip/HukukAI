import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  registerPushTokenSchema,
  type RegisterPushTokenInput,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findAllForUser(user.id);
  }

  @Post("push-token")
  @UsePipes(new ZodValidationPipe(registerPushTokenSchema))
  registerPushToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RegisterPushTokenInput,
  ) {
    return this.notificationsService.registerPushToken(user.id, body.token);
  }
}
