import { Injectable, NotFoundException } from "@nestjs/common";
import { sortToolsForRole } from "@hukukai/search-engine";
import type { ToolDefinition, UserRole } from "@hukukai/types";
import type { PrismaService } from "../../prisma/prisma.service";

type ToolDefinitionRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  categories: unknown;
  audiences: unknown;
  keywords: unknown;
  synonyms: unknown;
  icon: string;
  route: string;
  isActive: boolean;
  isBeta: boolean;
  requiresSubscription: boolean;
  rolePriorities: unknown;
};

function toDomainTool(row: ToolDefinitionRow): ToolDefinition {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    categories: row.categories as ToolDefinition["categories"],
    audiences: row.audiences as ToolDefinition["audiences"],
    keywords: row.keywords as string[],
    synonyms: row.synonyms as string[],
    icon: row.icon,
    route: row.route,
    isActive: row.isActive,
    isBeta: row.isBeta,
    requiresSubscription: row.requiresSubscription,
    sortPriorityByRole:
      row.rolePriorities as ToolDefinition["sortPriorityByRole"],
  };
}

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * TÜM araçları döner. Rol yalnızca sıralamayı etkiler; hiçbir araç
   * bu metottan gizlenmez (Bölüm 5.1, Bölüm 29 madde 1-2).
   */
  async findAllForRole(role: UserRole): Promise<ToolDefinition[]> {
    const rows = await this.prisma.toolDefinition.findMany({
      where: { isActive: true },
    });
    const tools = rows.map(toDomainTool);
    return sortToolsForRole(tools, role);
  }

  async findByCategory(
    category: string,
    role: UserRole,
  ): Promise<ToolDefinition[]> {
    const all = await this.findAllForRole(role);
    return all.filter((tool) => tool.categories.includes(category as never));
  }

  async findBySlug(slug: string): Promise<ToolDefinition> {
    const row = await this.prisma.toolDefinition.findUnique({
      where: { slug },
    });
    if (!row) {
      throw new NotFoundException("Araç bulunamadı.");
    }
    return toDomainTool(row);
  }

  async listCategories(): Promise<string[]> {
    const rows = await this.prisma.toolDefinition.findMany({
      where: { isActive: true },
      select: { categories: true },
    });
    const set = new Set<string>();
    for (const row of rows) {
      for (const category of row.categories as string[]) {
        set.add(category);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }

  async getRecentTools(
    userId: string,
    limit = 10,
  ): Promise<ToolDefinition[]> {
    // Faz 2 iskeleti: "son kullanılan araçlar" kaydı Calculation/Deadline
    // geçmişinden türetilecektir (sonraki fazda genişletilir).
    const favorites = await this.getFavoriteTools(userId);
    return favorites.slice(0, limit);
  }

  async getFavoriteTools(userId: string): Promise<ToolDefinition[]> {
    const favorites = await this.prisma.userFavoriteTool.findMany({
      where: { userId },
      include: { tool: true },
      orderBy: { createdAt: "desc" },
    });
    return favorites.map(
      (favorite: { tool: ToolDefinitionRow }) => toDomainTool(favorite.tool),
    );
  }

  async addFavorite(userId: string, toolId: string): Promise<void> {
    await this.prisma.userFavoriteTool.upsert({
      where: { userId_toolId: { userId, toolId } },
      create: { userId, toolId },
      update: {},
    });
  }

  async removeFavorite(userId: string, toolId: string): Promise<void> {
    await this.prisma.userFavoriteTool.deleteMany({
      where: { userId, toolId },
    });
  }
}
