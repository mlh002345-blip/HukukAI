import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  OneTimeCreditPackInfo,
  PlanCatalogEntry,
  SubscriptionPlan,
  UsageSummary,
} from "@hukukai/types";
import { apiRequest } from "../lib/api-client";
import { useAuthStore } from "../stores/auth-store";

function accessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function useUsage() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["billing", "usage"],
    queryFn: () => apiRequest<UsageSummary>("/billing/usage", { accessToken: token }),
    enabled: !!token,
  });
}

export function usePlans() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () =>
      apiRequest<{ plans: PlanCatalogEntry[]; oneTimeCreditPack: OneTimeCreditPackInfo }>(
        "/billing/plans",
        { accessToken: token },
      ),
    enabled: !!token,
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: SubscriptionPlan) =>
      apiRequest<UsageSummary>("/billing/subscribe", {
        method: "POST",
        accessToken: accessToken(),
        body: { plan },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

export function usePurchaseOneTimeCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<UsageSummary>("/billing/one-time-credits", {
        method: "POST",
        accessToken: accessToken(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}
