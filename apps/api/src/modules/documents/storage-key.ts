import { randomUUID } from "node:crypto";

export function buildStorageKey(userId: string, fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  const extension =
    dotIndex > 0 ? fileName.slice(dotIndex + 1).toLowerCase() : "bin";
  return `documents/${userId}/${randomUUID()}.${extension}`;
}
