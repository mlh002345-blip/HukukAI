import { z } from "zod";
import { FOLDER_TYPES } from "@hukukai/types";

export const createFolderSchema = z.object({
  title: z.string().trim().min(2, "Klasör adı en az 2 karakter olmalıdır.").max(120),
  folderType: z.enum(FOLDER_TYPES),
  clientName: z.string().trim().max(160).optional(),
  referenceNumber: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type CreateFolderInput = z.infer<typeof createFolderSchema>;

export const updateFolderSchema = createFolderSchema.partial();
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
