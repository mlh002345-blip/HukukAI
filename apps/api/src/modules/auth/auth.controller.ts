import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  type LoginInput,
  type RefreshTokenInput,
  type RegisterInput,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { AuthService } from "./auth.service";
import type { UsersService } from "../users/users.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("register")
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() body: RegisterInput) {
    return this.authService.register(body);
  }

  // Brute force koruması (Bölüm 20): global limitten daha sıkı bir sınır.
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login")
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() body: LoginInput) {
    return this.authService.login(body);
  }

  @Public()
  @Post("refresh")
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  refresh(@Body() body: RefreshTokenInput) {
    return this.authService.refresh(body);
  }

  @Public()
  @Post("logout")
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  async logout(@Body() body: RefreshTokenInput) {
    await this.authService.logout(body.refreshToken);
    return { success: true };
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.id);
  }

  @Patch("me")
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { fullName?: string; phone?: string },
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Delete("me")
  deleteMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.softDeleteAccount(user.id);
  }
}
