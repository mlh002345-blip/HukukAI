"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PublicUserProfile } from "@hukukai/types";
import { ApiError, apiRequest } from "../lib/api-client";
import { getStoredToken, setStoredToken } from "../lib/token-storage";

interface LoginResponse {
  user: PublicUserProfile;
  accessToken: string;
  refreshToken: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthorized" | "unauthenticated";

interface AdminAuthState {
  status: AuthStatus;
  user: PublicUserProfile | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<PublicUserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }
    apiRequest<PublicUserProfile>("/auth/me", { accessToken: token })
      .then((profile) => {
        if (profile.role !== "ADMIN") {
          setStoredToken(null);
          setStatus("unauthorized");
          return;
        }
        setAccessToken(token);
        setUser(profile);
        setStatus("authenticated");
      })
      .catch(() => {
        setStoredToken(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (response.user.role !== "ADMIN") {
      throw new ApiError("Bu panele yalnızca yöneticiler erişebilir.", 403);
    }
    setStoredToken(response.accessToken);
    setAccessToken(response.accessToken);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, accessToken, login, logout }),
    [status, user, accessToken, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth, AdminAuthProvider içinde kullanılmalıdır.");
  }
  return context;
}
