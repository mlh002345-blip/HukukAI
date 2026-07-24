import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { ThemeProvider as UiThemeProvider } from "@hukukai/ui";
import { useThemeStore } from "./theme-store";

export { useTheme, type Theme } from "@hukukai/ui";

/**
 * Sistem teması + kullanıcı tercihini (bkz. `theme-store.ts`,
 * `expo-secure-store`te saklanır) çözümleyip `@hukukai/ui`'nin saf
 * `ThemeProvider`ına iletir.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);
  const hydrate = useThemeStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const scheme: "light" | "dark" =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  return <UiThemeProvider scheme={scheme}>{children}</UiThemeProvider>;
}
