import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG biçiminde olmalıdır.");

const ruleBasedFieldsSchema = z.object({
  ruleKey: z.string().min(1, "Kural anahtarı zorunludur."),
  startDate: isoDateSchema,
  startEvent: z.string().trim().min(1).max(120).default("MANUAL"),
});

export const calculateDeadlineSchema = ruleBasedFieldsSchema;
export type CalculateDeadlineInput = z.infer<typeof calculateDeadlineSchema>;

export const createDeadlineSchema = z.discriminatedUnion("mode", [
  ruleBasedFieldsSchema.extend({
    mode: z.literal("RULE"),
    title: z.string().trim().min(2, "Başlık en az 2 karakter olmalıdır.").max(160),
    folderId: z.string().min(1).optional(),
    documentId: z.string().min(1).optional(),
  }),
  z.object({
    mode: z.literal("CUSTOM"),
    title: z.string().trim().min(2, "Başlık en az 2 karakter olmalıdır.").max(160),
    dueDate: isoDateSchema,
    folderId: z.string().min(1).optional(),
    documentId: z.string().min(1).optional(),
  }),
]);
export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>;

export const updateDeadlineSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
});
export type UpdateDeadlineInput = z.infer<typeof updateDeadlineSchema>;

export const listUpcomingDeadlinesQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(14),
});
export type ListUpcomingDeadlinesQuery = z.infer<
  typeof listUpcomingDeadlinesQuerySchema
>;
