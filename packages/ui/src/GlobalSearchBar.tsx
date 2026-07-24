import React, { useMemo } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Icon } from "./Icon";
import { useTheme, type Theme } from "./theme/ThemeContext";

export interface GlobalSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Bölüm 6.1 — Ana Sayfa üst arama alanı: "Ne yapmak istiyorsunuz?"
 * Bu bileşen, ürünün ana keşif mekanizmasının giriş noktasıdır
 * (Bölüm 29, madde 4). Tasarım: Lexi-Trust Framework / Obsidian.
 */
export function GlobalSearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Ne yapmak istiyorsunuz?",
  autoFocus = false,
}: GlobalSearchBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Icon name="search" size={20} color={theme.colors.outline} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={styles.input}
        accessibilityLabel="Araç ve belge arama alanı"
        accessibilityHint="İhtiyacınızı günlük dille yazabilirsiniz, örneğin: icra tebligatı geldi kaç günüm var"
      />
      <Icon name="mic" size={20} color={theme.colors.primary} />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      paddingHorizontal: 16,
      height: 56,
      shadowColor: "#000000",
      shadowOpacity: theme.scheme === "dark" ? 0 : 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    input: {
      flex: 1,
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: theme.typography.bodyLg.fontSize,
      color: theme.colors.onSurface,
    },
  });
}
