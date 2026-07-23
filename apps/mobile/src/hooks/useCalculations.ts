import { useMutation } from "@tanstack/react-query";
import type { CalculationSummary } from "@hukukai/types";
import { apiRequest } from "../lib/api-client";
import { useAuthStore } from "../stores/auth-store";

function accessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function useSubmitCalculation(endpoint: string) {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest<CalculationSummary>(endpoint, {
        method: "POST",
        accessToken: accessToken(),
        body,
      }),
  });
}
