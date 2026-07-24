import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const THEME_PREFERENCE_KEY = "hukukai.themePreference";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeState {
  preference: ThemePreference;
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",

  hydrate: async () => {
    const stored = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      set({ preference: stored });
    }
  },

  setPreference: async (preference) => {
    await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference);
    set({ preference });
  },
}));
