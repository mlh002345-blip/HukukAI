import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ToolDefinition } from "@hukukai/types";

export interface ToolCardProps {
  tool: Pick<ToolDefinition, "name" | "shortDescription" | "categories" | "isBeta">;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ana sayfa, Araçlar ve Arama Sonuçları ekranlarında kullanılan
 * ortak araç kartı. Bkz. Bölüm 19 — Tasarım Sistemi Componentleri.
 */
export function ToolCard({
  tool,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  style,
}: ToolCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tool.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {tool.name}
        </Text>
        {tool.isBeta ? (
          <View style={styles.betaBadge}>
            <Text style={styles.betaBadgeText}>BETA</Text>
          </View>
        ) : null}
        {onToggleFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"
            }
            hitSlop={8}
            onPress={onToggleFavorite}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? "★" : "☆"}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {tool.shortDescription}
      </Text>
      <View style={styles.categoryRow}>
        {tool.categories.slice(0, 3).map((category) => (
          <View key={category} style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{category}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 8,
  },
  cardPressed: {
    backgroundColor: "#F8FAFC",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#101828",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: "#475467",
  },
  favoriteIcon: {
    fontSize: 20,
    color: "#B54708",
  },
  betaBadge: {
    backgroundColor: "#FEF0C7",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  betaBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#93370D",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryChip: {
    backgroundColor: "#EFF4FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#175CD3",
  },
});
