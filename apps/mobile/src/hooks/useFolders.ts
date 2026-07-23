import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateFolderInput,
  UpdateFolderInput,
} from "@hukukai/validation";
import type { FolderSummary } from "@hukukai/types";
import { apiRequest } from "../lib/api-client";
import { useAuthStore } from "../stores/auth-store";

function accessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function useFolders() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["folders"],
    queryFn: () =>
      apiRequest<FolderSummary[]>("/folders", { accessToken: token }),
    enabled: !!token,
  });
}

export function useFolder(id: string | undefined) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["folders", id],
    queryFn: () =>
      apiRequest<FolderSummary>(`/folders/${id}`, { accessToken: token }),
    enabled: !!token && !!id,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFolderInput) =>
      apiRequest<FolderSummary>("/folders", {
        method: "POST",
        body: input,
        accessToken: accessToken(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useUpdateFolder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateFolderInput) =>
      apiRequest<FolderSummary>(`/folders/${id}`, {
        method: "PATCH",
        body: input,
        accessToken: accessToken(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folders", id] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(`/folders/${id}`, {
        method: "DELETE",
        accessToken: accessToken(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
