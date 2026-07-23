import { useMutation } from "@tanstack/react-query";
import type { LoginInput, RegisterInput } from "@hukukai/validation";
import type { PublicUserProfile } from "@hukukai/types";
import { apiRequest } from "../lib/api-client";
import { useAuthStore } from "../stores/auth-store";

interface AuthResponse {
  user: PublicUserProfile;
  accessToken: string;
  refreshToken: string;
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiRequest<AuthResponse>("/auth/login", { method: "POST", body: input }),
    onSuccess: (data) => setSession(data),
  });
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: input,
      }),
    onSuccess: (data) => setSession(data),
  });
}

export function useDeleteAccount() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const signOut = useAuthStore((state) => state.signOut);
  return useMutation({
    mutationFn: () =>
      apiRequest<{ success: boolean }>("/auth/me", {
        method: "DELETE",
        accessToken,
      }),
    onSuccess: () => signOut(),
  });
}
