import { useQuery } from "@tanstack/react-query";
import type { ToolDefinition, UserRole } from "@hukukai/types";
import { apiRequest } from "../lib/api-client";

export function useTools(role: UserRole) {
  return useQuery({
    queryKey: ["tools", role],
    queryFn: () =>
      apiRequest<ToolDefinition[]>("/tools", { query: { role } }),
  });
}

export function useToolCategories() {
  return useQuery({
    queryKey: ["tool-categories"],
    queryFn: () => apiRequest<string[]>("/tools/categories"),
  });
}

interface SearchToolsResponse {
  query: string;
  results: Array<{ tool: ToolDefinition; score: number }>;
  suggestIntentClassification: boolean;
}

export function useToolSearch(query: string, role: UserRole) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["tool-search", trimmed, role],
    queryFn: () =>
      apiRequest<SearchToolsResponse>("/search/tools", {
        query: { q: trimmed, role },
      }),
    enabled: trimmed.length > 0,
  });
}
