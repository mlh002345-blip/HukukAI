import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DocumentAnalysisSummary,
  DocumentStatusResponse,
  RecommendedAction,
} from "@hukukai/types";
import { apiRequest } from "../lib/api-client";
import { useAuthStore } from "../stores/auth-store";

function accessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

const PROCESSING_STATUSES = new Set(["OCR_PROCESSING", "AI_PROCESSING"]);
const STATUS_POLL_INTERVAL_MS = 2500;

export function useDocumentStatus(documentId: string | undefined) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["documents", documentId, "status"],
    queryFn: () =>
      apiRequest<DocumentStatusResponse>(`/documents/${documentId}/status`, {
        accessToken: token,
      }),
    enabled: !!token && !!documentId,
    refetchInterval: (query) =>
      query.state.data && PROCESSING_STATUSES.has(query.state.data.status)
        ? STATUS_POLL_INTERVAL_MS
        : false,
  });
}

export function useAnalyzeDocument(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<DocumentStatusResponse>(`/documents/${documentId}/analyze`, {
        method: "POST",
        accessToken: accessToken(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", documentId, "status"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDocumentAnalysisResult(
  documentId: string | undefined,
  enabled: boolean,
) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["documents", documentId, "analysis"],
    queryFn: () =>
      apiRequest<DocumentAnalysisSummary>(`/documents/${documentId}/analysis`, {
        accessToken: token,
      }),
    enabled: !!token && !!documentId && enabled,
  });
}

export function useUpdateExtractedData(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<DocumentAnalysisSummary>(
        `/documents/${documentId}/extracted-data`,
        { method: "PATCH", accessToken: accessToken(), body: { data } },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", documentId, "analysis"] });
      queryClient.invalidateQueries({ queryKey: ["documents", documentId, "status"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useRecommendedActions(
  documentId: string | undefined,
  enabled: boolean,
) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["documents", documentId, "recommended-actions"],
    queryFn: () =>
      apiRequest<RecommendedAction[]>(
        `/documents/${documentId}/recommended-actions`,
        { accessToken: token },
      ),
    enabled: !!token && !!documentId && enabled,
  });
}
