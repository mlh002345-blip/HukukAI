import type { ToolDefinition, UserRole } from "@hukukai/types";
import { rolePriorityKey } from "@hukukai/types";
import { foldForSearch, tokenize } from "./normalize";

/**
 * Bölüm 7.1 — Arama üç aşamalı çalışır:
 *   1. Yerel anahtar kelime ve eş anlamlı arama   (bu dosya)
 *   2. Araç metadata eşleştirme                    (bu dosya)
 *   3. Gerekirse düşük maliyetli niyet sınıflandırma (packages/ai-provider)
 *
 * AI her aramada zorunlu değildir: skor bir eşiğin altında kalırsa
 * çağıran katman (apps/api SearchModule) 3. aşamaya geçebilir.
 */

export interface ScoredTool {
  tool: ToolDefinition;
  score: number;
  matchedOn: MatchReason[];
}

export type MatchReason =
  | "exact_name"
  | "name_contains"
  | "keyword"
  | "synonym"
  | "category"
  | "slug";

const FIELD_WEIGHTS: Record<MatchReason, number> = {
  exact_name: 100,
  slug: 60,
  name_contains: 45,
  keyword: 35,
  synonym: 30,
  category: 15,
};

/** Bir aracın tüm aranabilir alanlarını normalize edilmiş şekilde döner. */
function buildSearchIndex(tool: ToolDefinition) {
  return {
    name: foldForSearch(tool.name),
    slug: foldForSearch(tool.slug),
    keywords: tool.keywords.map(foldForSearch),
    synonyms: tool.synonyms.map(foldForSearch),
    categories: tool.categories.map((c) => foldForSearch(c)),
  };
}

function scoreTool(tool: ToolDefinition, queryTokens: string[]): ScoredTool {
  const index = buildSearchIndex(tool);
  const queryFolded = queryTokens.join(" ");
  let score = 0;
  const matchedOn = new Set<MatchReason>();

  if (index.name === queryFolded) {
    score += FIELD_WEIGHTS.exact_name;
    matchedOn.add("exact_name");
  } else if (index.name.includes(queryFolded) && queryFolded.length > 0) {
    score += FIELD_WEIGHTS.name_contains;
    matchedOn.add("name_contains");
  }

  if (index.slug.includes(queryFolded.replace(/\s+/g, "-"))) {
    score += FIELD_WEIGHTS.slug;
    matchedOn.add("slug");
  }

  for (const token of queryTokens) {
    if (token.length < 2) continue;

    for (const keyword of index.keywords) {
      if (keyword === token || keyword.includes(token)) {
        score += FIELD_WEIGHTS.keyword;
        matchedOn.add("keyword");
        break;
      }
    }

    for (const synonym of index.synonyms) {
      if (synonym === token || synonym.includes(token)) {
        score += FIELD_WEIGHTS.synonym;
        matchedOn.add("synonym");
        break;
      }
    }

    for (const category of index.categories) {
      if (category.includes(token)) {
        score += FIELD_WEIGHTS.category;
        matchedOn.add("category");
        break;
      }
    }

    // Tam kelime eşiği: ayrıca kelimenin isim içinde geçmesi
    if (index.name.includes(token)) {
      score += FIELD_WEIGHTS.name_contains / 2;
      matchedOn.add("name_contains");
    }
  }

  return { tool, score, matchedOn: Array.from(matchedOn) };
}

export interface KeywordSearchOptions {
  category?: string;
  limit?: number;
  /** Skoru bu eşiğin altında kalan sonuçlar elenir. */
  minScore?: number;
}

export const DEFAULT_MIN_SCORE = 1;
/** Bu değerin altında en iyi sonuç skoru varsa AI niyet sınıflandırmaya
 *  düşülmesi önerilir (Bölüm 7.1, aşama 3). */
export const AI_FALLBACK_SCORE_THRESHOLD = 20;

export function searchTools(
  tools: ToolDefinition[],
  rawQuery: string,
  options: KeywordSearchOptions = {},
): ScoredTool[] {
  const { category, limit = 20, minScore = DEFAULT_MIN_SCORE } = options;
  const queryTokens = tokenize(rawQuery);
  if (queryTokens.length === 0) return [];

  const candidates = tools.filter((tool) => {
    if (!tool.isActive) return false;
    if (category && !tool.categories.includes(category as never)) {
      return false;
    }
    return true;
  });

  return candidates
    .map((tool) => scoreTool(tool, queryTokens))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * En iyi eşleşme, AI destekli niyet sınıflandırmasına düşülmesi gereken
 * kadar düşük skorlu mu? (Bölüm 7.1, aşama 3 tetikleyicisi)
 */
export function shouldFallbackToIntentClassification(
  results: ScoredTool[],
): boolean {
  const topScore = results[0]?.score ?? 0;
  return topScore < AI_FALLBACK_SCORE_THRESHOLD;
}

/**
 * Rol bir erişim duvarı değildir — bu fonksiyon HİÇBİR aracı elemez,
 * yalnızca `sortPriorityByRole` alanına göre sıralamayı değiştirir.
 * Bkz. Bölüm 5.1, Faz 2 kabul kriteri: "Rol seçimi hiçbir aracı gizlemez."
 */
export function sortToolsForRole(
  tools: ToolDefinition[],
  role: UserRole,
): ToolDefinition[] {
  const key = rolePriorityKey(role);
  return [...tools].sort((a, b) => {
    const aPriority = key ? (a.sortPriorityByRole[key] ?? 999) : 999;
    const bPriority = key ? (b.sortPriorityByRole[key] ?? 999) : 999;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.name.localeCompare(b.name, "tr");
  });
}
