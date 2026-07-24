import React, { createContext, useContext, useMemo } from "react";
import { darkColors, lightColors, type ThemeColors } from "./colors";
import { typography } from "./typography";
import { radii, spacing } from "./spacing";

export interface Theme {
  scheme: "light" | "dark";
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
}

const ThemeContext = createContext<Theme | null>(null);

function buildTheme(scheme: "light" | "dark"): Theme {
  return {
    scheme,
    colors: scheme === "dark" ? darkColors : lightColors,
    typography,
    spacing,
    radii,
  };
}

export interface ThemeProviderProps {
  /** Çözümlenmiş tema (sistem/tercih mantığı üst katmanda ele alınır). */
  scheme: "light" | "dark";
  children: React.ReactNode;
}

/**
 * Saf/sunumsal sağlayıcı: hangi şemanın kullanılacağına (sistem
 * teması mı, kullanıcı tercihi mi) karar vermez, yalnızca verilen
 * `scheme`e göre tema nesnesini alt bileşenlere sağlar. Karar mantığı
 * (ör. `expo-secure-store`ta saklanan tercih) tüketen uygulamada
 * (apps/mobile) kalır.
 */
export function ThemeProvider({ scheme, children }: ThemeProviderProps) {
  const theme = useMemo(() => buildTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme, ThemeProvider içinde kullanılmalıdır.");
  }
  return theme;
}
