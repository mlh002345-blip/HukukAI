import type { TextStyle } from "react-native";

/** Lexi-Trust Framework tipografi ölçeği (Inter + JetBrains Mono). */
export const typography = {
  displayLg: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.4,
  } satisfies TextStyle,
  headlineLgMobile: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    lineHeight: 36,
  } satisfies TextStyle,
  headlineMd: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
  } satisfies TextStyle,
  headlineSm: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    lineHeight: 28,
  } satisfies TextStyle,
  bodyLg: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 26,
  } satisfies TextStyle,
  bodyMd: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
  } satisfies TextStyle,
  bodySmMedium: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
  } satisfies TextStyle,
  labelMd: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  } satisfies TextStyle,
  amountDisplay: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    lineHeight: 24,
  } satisfies TextStyle,
};

export type TypographyVariant = keyof typeof typography;
