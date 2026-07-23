import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DocumentSummary, UploadUrlResponse } from "@hukukai/types";
import { apiRequest } from "../lib/api-client";
import { computeSha256Hex, readFileAsArrayBuffer } from "../lib/checksum";
import { useAuthStore } from "../stores/auth-store";

function accessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function useDocuments(folderId: string | undefined) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["documents", folderId ?? "all"],
    queryFn: () =>
      apiRequest<DocumentSummary[]>("/documents", {
        accessToken: token,
        query: folderId ? { folderId } : undefined,
      }),
    enabled: !!token,
  });
}

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}

async function uploadPickedFile(
  file: PickedFile,
  folderId: string | undefined,
): Promise<DocumentSummary> {
  const buffer = await readFileAsArrayBuffer(file.uri);
  const sizeBytes = buffer.byteLength;
  const checksum = await computeSha256Hex(buffer);

  const { uploadUrl, storageKey } = await apiRequest<UploadUrlResponse>(
    "/documents/upload-url",
    {
      method: "POST",
      accessToken: accessToken(),
      body: {
        folderId,
        fileName: file.name,
        mimeType: file.mimeType,
        sizeBytes,
      },
    },
  );

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.mimeType },
    body: buffer,
  });
  if (!putResponse.ok) {
    throw new Error("Dosya depolamaya yüklenemedi.");
  }

  return apiRequest<DocumentSummary>("/documents/complete-upload", {
    method: "POST",
    accessToken: accessToken(),
    body: {
      storageKey,
      folderId,
      fileName: file.name,
      mimeType: file.mimeType,
      sizeBytes,
      checksum,
    },
  });
}

export function useUploadDocument(folderId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: PickedFile) => uploadPickedFile(file, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(`/documents/${id}`, {
        method: "DELETE",
        accessToken: accessToken(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
