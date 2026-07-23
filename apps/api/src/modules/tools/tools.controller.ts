import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import type { ToolsService } from "./tools.service";

@ApiTags("tools")
@Controller("tools")
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  /**
   * Misafir kullanıcılar da tüm araçları görebilmelidir
   * (Bölüm 4.1 — Misafir kullanım, sınırlı özelliklerle).
   * Rol bilinmiyorsa CITIZEN varsayımıyla sıralanır; erişim kısıtlamaz.
   */
  @Public()
  @Get()
  findAll(
    @Query("role") role: AuthenticatedUser["role"] = "CITIZEN",
  ) {
    return this.toolsService.findAllForRole(role);
  }

  @Public()
  @Get("categories")
  listCategories() {
    return this.toolsService.listCategories();
  }

  @Get("recent")
  getRecent(@CurrentUser() user: AuthenticatedUser) {
    return this.toolsService.getRecentTools(user.id);
  }

  @Get("favorites")
  getFavorites(@CurrentUser() user: AuthenticatedUser) {
    return this.toolsService.getFavoriteTools(user.id);
  }

  @Get("recommended")
  getRecommended(@CurrentUser() user: AuthenticatedUser) {
    return this.toolsService.findAllForRole(user.role);
  }

  @Public()
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.toolsService.findBySlug(slug);
  }

  @Post(":id/favorite")
  addFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") toolId: string,
  ) {
    return this.toolsService.addFavorite(user.id, toolId);
  }

  @Delete(":id/favorite")
  removeFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") toolId: string,
  ) {
    return this.toolsService.removeFavorite(user.id, toolId);
  }
}
