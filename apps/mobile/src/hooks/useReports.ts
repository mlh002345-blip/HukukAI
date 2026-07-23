import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  GeneratedReportSummary,
  ReportDownloadUrlResponse,
} from "@hukukai/types";
import { apiRequest } from "../lib/api-client";
import { useAuthStore } from "../stores/auth-store";

function accessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function useReports() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["reports"],
    queryFn: () =>
      apiRequest<GeneratedReportSummary[]>("/reports", { accessToken: token }),
    enabled: !!token,
  });
}

export function useReportDownloadUrl(id: string) {
  return useMutation({
    mutationFn: () =>
      apiRequest<ReportDownloadUrlResponse>(`/reports/${id}/download-url`, {
        accessToken: accessToken(),
      }),
  });
}

export function useGenerateDocumentAnalysisReport() {
  return useMutation({
    mutationFn: (documentId: string) =>
      apiRequest<GeneratedReportSummary>("/reports/document-analysis", {
        method: "POST",
        accessToken: accessToken(),
        body: { documentId },
      }),
  });
}

export function useGenerateCalculationReport() {
  return useMutation({
    mutationFn: (calculationId: string) =>
      apiRequest<GeneratedReportSummary>("/reports/calculation", {
        method: "POST",
        accessToken: accessToken(),
        body: { calculationId },
      }),
  });
}

export function useGenerateDeadlineReport() {
  return useMutation({
    mutationFn: (deadlineId: string) =>
      apiRequest<GeneratedReportSummary>("/reports/deadline", {
        method: "POST",
        accessToken: accessToken(),
        body: { deadlineId },
      }),
  });
}
