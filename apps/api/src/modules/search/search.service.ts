import { Injectable } from "@nestjs/common";
import {
  searchTools,
  shouldFallbackToIntentClassification,
  sortToolsForRole,
} from "@hukukai/search-engine";
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

export interface SearchResultItem {
  tool: ToolDefinition;
  score: number;
}

export interface SearchToolsResult {
  query: string;
  results: SearchResultItem[];
  /**
   * Bölüm 7.1 aşama 3 tetikleyicisi: en iyi eşleşme çok düşük skorluysa
   * çağıran istemci (mobil app), günlük dil sorgusunu AI niyet
   * sınıflandırma uç noktasına (/search/intent) yönlendirebilir.
   */
  suggestIntentClassification: boolean;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchTools(
    query: string,
    role: UserRole,
    category?: string,
  ): Promise<SearchToolsResult> {
    const rows = await this.prisma.toolDefinition.findMany({
      where: { isActive: true },
    });
    const tools = rows.map(toDomainTool);

    const scored = searchTools(tools, query, { category });
    const orderedTools = sortToolsForRole(
      scored.map((s) => s.tool),
      role,
    );
    const scoreByToolId = new Map(scored.map((s) => [s.tool.id, s.score]));

    return {
      query,
      results: orderedTools.map((tool) => ({
        tool,
        score: scoreByToolId.get(tool.id) ?? 0,
      })),
      suggestIntentClassification: shouldFallbackToIntentClassification(scored),
    };
  }

  /**
   * AI destekli niyet sınıflandırma (Bölüm 7.1, aşama 3).
   * Faz 4/AIProviderModule tamamlanana kadar deterministik arama
   * sonucunu aynen döner; gerçek AI entegrasyonu ai-provider paketine
   * bağlandığında bu metot güncellenecektir.
   */
  async classifyIntent(query: string, role: UserRole) {
    const keywordResult = await this.searchTools(query, role);
    return {
      ...keywordResult,
      provider: "none" as const,
      note:
        "AI niyet sınıflandırma Faz 4'te AIProviderModule ile entegre edilecektir.",
    };
  }
}
