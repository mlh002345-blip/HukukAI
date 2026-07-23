import { Body, Controller, Delete, Get, Param, Post, Query, UsePipes } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  createHolidaySchema,
  createRuleSetSchema,
  listAuditLogsQuerySchema,
  listUsersQuerySchema,
  type CreateHolidayInput,
  type CreateRuleSetInput,
  type ListAuditLogsQuery,
  type ListUsersQuery,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { AdminService } from "./admin.service";

@ApiTags("admin")
@Roles("ADMIN")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  dashboard() {
    return this.adminService.getDashboard();
  }

  @Get("users")
  @UsePipes(new ZodValidationPipe(listUsersQuerySchema))
  listUsers(@Query() query: ListUsersQuery) {
    return this.adminService.listUsers(query);
  }

  @Get("users/:id")
  getUser(@Param("id") id: string) {
    return this.adminService.getUser(id);
  }

  @Post("users/:id/freeze")
  freezeUser(@CurrentUser() admin: AuthenticatedUser, @Param("id") id: string) {
    return this.adminService.freezeUser(admin.id, id);
  }

  @Post("users/:id/unfreeze")
  unfreezeUser(@CurrentUser() admin: AuthenticatedUser, @Param("id") id: string) {
    return this.adminService.unfreezeUser(admin.id, id);
  }

  @Get("document-errors")
  listDocumentErrors() {
    return this.adminService.listDocumentErrors();
  }

  @Get("rule-sets")
  listRuleSets() {
    return this.adminService.listRuleSets();
  }

  @Post("rule-sets")
  @UsePipes(new ZodValidationPipe(createRuleSetSchema))
  createRuleSet(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() body: CreateRuleSetInput,
  ) {
    return this.adminService.createRuleSet(admin.id, body);
  }

  @Post("rule-sets/:id/publish")
  publishRuleSet(@CurrentUser() admin: AuthenticatedUser, @Param("id") id: string) {
    return this.adminService.publishRuleSet(admin.id, id);
  }

  @Get("holidays")
  listHolidays() {
    return this.adminService.listHolidays();
  }

  @Post("holidays")
  @UsePipes(new ZodValidationPipe(createHolidaySchema))
  createHoliday(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() body: CreateHolidayInput,
  ) {
    return this.adminService.createHoliday(admin.id, body);
  }

  @Delete("holidays/:id")
  deleteHoliday(@CurrentUser() admin: AuthenticatedUser, @Param("id") id: string) {
    return this.adminService.deleteHoliday(admin.id, id);
  }

  @Get("ai-usage")
  getAiUsage() {
    return this.adminService.getAiUsage();
  }

  @Get("audit-logs")
  @UsePipes(new ZodValidationPipe(listAuditLogsQuerySchema))
  getAuditLogs(@Query() query: ListAuditLogsQuery) {
    return this.adminService.getAuditLogs(query);
  }
}
