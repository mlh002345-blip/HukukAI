import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme, type Theme } from "./theme/ThemeContext";

export interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function CategoryChip({ label, selected = false, onPress }: CategoryChipProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    chip: {
      borderRadius: theme.radii.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: theme.colors.surfaceContainer,
      borderWidth: 1,
      borderColor: "transparent",
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
    },
    label: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    labelSelected: {
      color: theme.colors.onPrimary,
    },
  });
}
