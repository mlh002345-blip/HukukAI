import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ToolDefinition } from "@hukukai/types";
import { Icon } from "./Icon";
import { resolveToolIconName } from "./tool-icon-map";
import { useTheme, type Theme } from "./theme/ThemeContext";

export interface ToolCardProps {
  tool: Pick<
    ToolDefinition,
    "name" | "shortDescription" | "categories" | "isBeta" | "icon"
  >;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ana sayfa, Araçlar ve Arama Sonuçları ekranlarında kullanılan
 * ortak araç satırı. Tasarım: Lexi-Trust Framework "Önerilen Araçlar"
 * bileşeni — ikon + başlık/açıklama + chevron.
 */
export function ToolCard({
  tool,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  style,
}: ToolCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tool.name}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}
    >
      <View style={styles.iconWrap}>
        <Icon name={resolveToolIconName(tool.icon)} size={22} color={theme.colors.secondary} />
      </View>
      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {tool.name}
          </Text>
          {tool.isBeta ? (
            <View style={styles.betaBadge}>
              <Text style={styles.betaBadgeText}>BETA</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {tool.shortDescription}
        </Text>
      </View>
      {onToggleFavorite ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          hitSlop={8}
          onPress={onToggleFavorite}
        >
          <Icon
            name="star"
            filled={isFavorite}
            size={20}
            color={isFavorite ? theme.colors.tertiaryContainer : theme.colors.outline}
          />
        </Pressable>
      ) : (
        <Icon name="chevron_right" size={22} color={theme.colors.outline} />
      )}
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      padding: 14,
    },
    cardPressed: {
      borderColor: theme.colors.primary,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    textCol: {
      flex: 1,
      gap: 2,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    title: {
      flex: 1,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    description: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      lineHeight: 17,
      color: theme.colors.onSurfaceVariant,
    },
    betaBadge: {
      backgroundColor: theme.colors.tertiaryFixed,
      borderRadius: theme.radii.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    betaBadgeText: {
      fontSize: 10,
      fontFamily: theme.typography.labelMd.fontFamily,
      color: theme.colors.onTertiaryFixed,
    },
  });
}
