import { UPLOAD_LIMITS } from "@hukukai/config";

const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/heic": ["heic"],
};

export class UploadValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export function assertMimeTypeAllowed(mimeType: string): void {
  if (!(UPLOAD_LIMITS.allowedMimeTypes as readonly string[]).includes(mimeType)) {
    throw new UploadValidationError(
      "Desteklenmeyen dosya türü.",
      "UNSUPPORTED_MIME_TYPE",
    );
  }
}

export function assertExtensionMatchesMime(
  fileName: string,
  mimeType: string,
): void {
  const dotIndex = fileName.lastIndexOf(".");
  const extension =
    dotIndex > 0 ? fileName.slice(dotIndex + 1).toLowerCase() : undefined;
  const allowedExtensions = MIME_EXTENSIONS[mimeType] ?? [];
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new UploadValidationError(
      "Dosya uzantısı MIME türüyle uyuşmuyor.",
      "EXTENSION_MISMATCH",
    );
  }
}

export function assertSizeWithinLimit(sizeBytes: number): void {
  if (sizeBytes <= 0) {
    throw new UploadValidationError("Dosya boyutu geçersiz.", "INVALID_SIZE");
  }
  if (sizeBytes > UPLOAD_LIMITS.maxFileSizeBytes) {
    throw new UploadValidationError(
      "Dosya boyutu izin verilen azami boyutu aşıyor.",
      "FILE_TOO_LARGE",
    );
  }
}

export function validateUploadRequest(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}): void {
  assertMimeTypeAllowed(input.mimeType);
  assertExtensionMatchesMime(input.fileName, input.mimeType);
  assertSizeWithinLimit(input.sizeBytes);
}
