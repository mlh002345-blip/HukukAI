/**
 * Tasarım tokenleri — Stitch tasarım paketinden (kullanıcı tarafından
 * sağlandı). Açık tema "Lexi-Trust Framework", koyu tema "Obsidian"
 * olarak adlandırılmıştır. Bkz. proje köküne yüklenen tasarım
 * dosyaları (lexi_trust_framework/DESIGN.md, obsidian/DESIGN.md).
 */

export interface ThemeColors {
  background: string;
  onBackground: string;
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  tertiaryFixed: string;
  onTertiaryFixed: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  success: string;
  onSuccessContainer: string;
  successContainer: string;
}

/** Lexi-Trust Framework — açık tema. */
export const lightColors: ThemeColors = {
  background: "#f8f9ff",
  onBackground: "#0b1c30",
  surface: "#f8f9ff",
  surfaceDim: "#cbdbf5",
  surfaceBright: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#eff4ff",
  surfaceContainer: "#e5eeff",
  surfaceContainerHigh: "#dce9ff",
  surfaceContainerHighest: "#d3e4fe",
  surfaceVariant: "#d3e4fe",
  onSurface: "#0b1c30",
  onSurfaceVariant: "#444651",
  outline: "#757682",
  outlineVariant: "#c5c5d3",
  primary: "#00236f",
  onPrimary: "#ffffff",
  primaryContainer: "#1e3a8a",
  onPrimaryContainer: "#90a8ff",
  secondary: "#0058be",
  onSecondary: "#ffffff",
  secondaryContainer: "#2170e4",
  onSecondaryContainer: "#fefcff",
  tertiary: "#3e2400",
  onTertiary: "#ffffff",
  tertiaryContainer: "#5c3800",
  onTertiaryContainer: "#ef9900",
  tertiaryFixed: "#ffddb8",
  onTertiaryFixed: "#2a1700",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  success: "#067647",
  successContainer: "#d1fae5",
  onSuccessContainer: "#065f46",
};

/** Obsidian — koyu tema ("Precision in Darkness"). */
export const darkColors: ThemeColors = {
  background: "#09090b",
  onBackground: "#fafafa",
  surface: "#0c0c0f",
  surfaceDim: "#09090b",
  surfaceBright: "#27272a",
  surfaceContainerLowest: "#09090b",
  surfaceContainerLow: "#0f0f12",
  surfaceContainer: "#18181b",
  surfaceContainerHigh: "#1f1f23",
  surfaceContainerHighest: "#27272a",
  surfaceVariant: "#27272a",
  onSurface: "#fafafa",
  onSurfaceVariant: "#a1a1aa",
  outline: "#3f3f46",
  outlineVariant: "#27272a",
  primary: "#a78bfa",
  onPrimary: "#1e1b2e",
  primaryContainer: "#2e1065",
  onPrimaryContainer: "#ddd6fe",
  secondary: "#a78bfa",
  onSecondary: "#1e1b2e",
  secondaryContainer: "#3b2170",
  onSecondaryContainer: "#f4f0ff",
  tertiary: "#34d399",
  onTertiary: "#022c22",
  tertiaryContainer: "#064e3b",
  onTertiaryContainer: "#6ee7b7",
  tertiaryFixed: "#4b2e00",
  onTertiaryFixed: "#fbbf24",
  error: "#ef4444",
  onError: "#450a0a",
  errorContainer: "#7f1d1d",
  onErrorContainer: "#fecaca",
  success: "#34d399",
  successContainer: "#064e3b",
  onSuccessContainer: "#6ee7b7",
};
