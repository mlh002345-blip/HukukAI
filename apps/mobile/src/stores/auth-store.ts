import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { PublicUserProfile, UserRole } from "@hukukai/types";

const ACCESS_TOKEN_KEY = "hukukai.accessToken";
const REFRESH_TOKEN_KEY = "hukukai.refreshToken";

interface AuthState {
  status: "idle" | "loading" | "authenticated" | "guest" | "unauthenticated";
  user: PublicUserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  guestRole: UserRole | null;
  hydrate: () => Promise<void>;
  setSession: (params: {
    user: PublicUserProfile;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  continueAsGuest: (role: UserRole) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  user: null,
  accessToken: null,
  refreshToken: null,
  guestRole: null,

  hydrate: async () => {
    set({ status: "loading" });
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (accessToken && refreshToken) {
      // NOT: /auth/me çağrısı ile profil doğrulaması bir sonraki adımda
      // (Faz 3+) React Query üzerinden yapılacaktır; burada yalnızca
      // oturum var/yok bilgisini geri yüklüyoruz.
      set({ status: "authenticated", accessToken, refreshToken });
      return;
    }

    set({ status: "unauthenticated" });
  },

  setSession: async ({ user, accessToken, refreshToken }) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
    set({ status: "authenticated", user, accessToken, refreshToken });
  },

  continueAsGuest: (role) => {
    set({ status: "guest", guestRole: role });
  },

  signOut: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
    set({
      status: "unauthenticated",
      user: null,
      accessToken: null,
      refreshToken: null,
      guestRole: null,
    });
  },
}));

/** Misafir dahil aktif rolü döner; hiçbir yerde erişim kısıtı için değil,
 * yalnızca kişiselleştirme/sıralama için kullanılır (Bölüm 5.1). */
export function useActiveRole(): UserRole {
  return useAuthStore(
    (state) => state.user?.role ?? state.guestRole ?? "CITIZEN",
  );
}
