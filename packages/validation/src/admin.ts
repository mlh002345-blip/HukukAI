import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG biçiminde olmalıdır.");

export const listUsersQuerySchema = z.object({
  query: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const listAuditLogsQuerySchema = z.object({
  entityType: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;

export const createRuleSetSchema = z.object({
  module: z.string().trim().min(1).max(60),
  ruleKey: z.string().trim().min(1).max(120),
  version: z.string().trim().min(1).max(40),
  validFrom: isoDateSchema,
  validTo: isoDateSchema.optional(),
  ruleData: z.record(z.unknown()),
  legalBasis: z.array(
    z.object({ law: z.string().min(1), article: z.string().optional() }),
  ),
  sourceUrl: z.string().url().optional(),
  sourceHash: z.string().optional(),
});
export type CreateRuleSetInput = z.infer<typeof createRuleSetSchema>;

export const createHolidaySchema = z.object({
  date: isoDateSchema,
  name: z.string().trim().min(2).max(160),
  isHalfDay: z.boolean().default(false),
  source: z.string().trim().max(200).optional(),
});
export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
