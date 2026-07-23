import { z } from "zod";

export const toolSearchQuerySchema = z.object({
  q: z.string().trim().min(1, "Arama metni boş olamaz.").max(200),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type ToolSearchQuery = z.infer<typeof toolSearchQuerySchema>;

export const favoriteToolParamsSchema = z.object({
  toolId: z.string().min(1),
});
export type FavoriteToolParams = z.infer<typeof favoriteToolParamsSchema>;
