import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CalculateDeadlineInput,
  CreateDeadlineInput,
} from "@hukukai/validation";
import type {
  DeadlineCalculationResponse,
  DeadlineSummary,
} from "@hukukai/types";
import { apiRequest } from "../lib/api-client";
import { useAuthStore } from "../stores/auth-store";

function accessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function useUpcomingDeadlines(days = 14) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["deadlines", "upcoming", days],
    queryFn: () =>
      apiRequest<DeadlineSummary[]>("/deadlines/upcoming", {
        accessToken: token,
        query: { days },
      }),
    enabled: !!token,
  });
}

export function useDeadlines() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["deadlines"],
    queryFn: () =>
      apiRequest<DeadlineSummary[]>("/deadlines", { accessToken: token }),
    enabled: !!token,
  });
}

export function useCalculateDeadline() {
  return useMutation({
    mutationFn: (input: CalculateDeadlineInput) =>
      apiRequest<DeadlineCalculationResponse>("/deadlines/calculate", {
        method: "POST",
        accessToken: accessToken(),
        body: input,
      }),
  });
}

export function useCreateDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeadlineInput) =>
      apiRequest<DeadlineSummary>("/deadlines", {
        method: "POST",
        accessToken: accessToken(),
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    },
  });
}

export function useCompleteDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<DeadlineSummary>(`/deadlines/${id}/complete`, {
        method: "POST",
        accessToken: accessToken(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    },
  });
}

export function useDeleteDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(`/deadlines/${id}`, {
        method: "DELETE",
        accessToken: accessToken(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    },
  });
}
