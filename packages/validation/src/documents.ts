import { z } from "zod";
import { UPLOAD_LIMITS } from "@hukukai/config";

const fileNameSchema = z
  .string()
  .trim()
  .min(1, "Dosya adı zorunludur.")
  .max(255, "Dosya adı çok uzun.");

const mimeTypeSchema = z.enum(UPLOAD_LIMITS.allowedMimeTypes, {
  errorMap: () => ({ message: "Desteklenmeyen dosya türü." }),
});

const sizeBytesSchema = z
  .number()
  .int()
  .positive("Dosya boyutu geçersiz.")
  .max(
    UPLOAD_LIMITS.maxFileSizeBytes,
    "Dosya boyutu izin verilen azami boyutu aşıyor.",
  );

const checksumSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/i, "Geçersiz SHA-256 checksum.");

export const requestUploadUrlSchema = z.object({
  folderId: z.string().min(1).optional(),
  fileName: fileNameSchema,
  mimeType: mimeTypeSchema,
  sizeBytes: sizeBytesSchema,
});
export type RequestUploadUrlInput = z.infer<typeof requestUploadUrlSchema>;

export const completeUploadSchema = z.object({
  storageKey: z.string().min(1),
  folderId: z.string().min(1).optional(),
  fileName: fileNameSchema,
  mimeType: mimeTypeSchema,
  sizeBytes: sizeBytesSchema,
  checksum: checksumSchema,
});
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;

export const listDocumentsQuerySchema = z.object({
  folderId: z.string().min(1).optional(),
});
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
