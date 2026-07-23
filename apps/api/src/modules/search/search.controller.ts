import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { toolSearchQuerySchema } from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { Public } from "../../common/decorators/public.decorator";
import type { SearchService } from "./search.service";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get("tools")
  async searchTools(
    @Query() query: Record<string, string>,
    @Query("role") role: AuthenticatedUser["role"] = "CITIZEN",
  ) {
    const parsed = toolSearchQuerySchema.parse(query);
    return this.searchService.searchTools(parsed.q, role, parsed.category);
  }

  @Public()
  @Post("intent")
  async classifyIntent(
    @Body() body: { query: string; role?: AuthenticatedUser["role"] },
  ) {
    return this.searchService.classifyIntent(
      body.query,
      body.role ?? "CITIZEN",
    );
  }
}
