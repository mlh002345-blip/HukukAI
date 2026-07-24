import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { LegislationAdminService } from "./legislation-admin.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LegislationReleaseDecisionService } from "./legislation-release-decision.service";

/**
 * Admin panelindeki "Mevzuat İzleme" ekranının uçları. `HOLD_FOR_REVIEW`
 * durumundaki değişiklikler burada listelenir; admin, aday kuralı
 * onaylayıp yayınlayabilir veya reddedebilir (bu durumda kısıtlanmış
 * eski sürüm yeniden güvenilir kabul edilir).
 */
@ApiTags("admin")
@Roles("ADMIN")
@Controller("admin/legislation-changes")
export class LegislationController {
  constructor(
    private readonly adminService: LegislationAdminService,
    private readonly releaseDecision: LegislationReleaseDecisionService,
  ) {}

  @Get()
  list() {
    return this.adminService.listChanges();
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.adminService.getChange(id);
  }

  @Post(":id/approve")
  async approve(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    const ruleSetId = await this.adminService.getLatestDraftRuleSetId(id);
    await this.releaseDecision.approveManually(user.id, ruleSetId);
    return { success: true };
  }

  @Post(":id/reject")
  async reject(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    const ruleSetId = await this.adminService.getLatestDraftRuleSetId(id);
    await this.releaseDecision.rejectManually(user.id, ruleSetId);
    return { success: true };
  }
}
