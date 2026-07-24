import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "./Icon";
import { useTheme, type Theme } from "./theme/ThemeContext";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
    </View>
  );
}

export function WarningBanner({ message }: { message: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.warningContainer}>
      <Icon name="warning" size={18} color={theme.colors.tertiaryContainer} />
      <Text style={styles.warningText}>{message}</Text>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      gap: 6,
    },
    emptyTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    emptyDescription: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      paddingHorizontal: 24,
    },
    warningContainer: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: theme.colors.tertiaryFixed,
      borderColor: theme.colors.tertiaryContainer,
      borderWidth: 1,
      borderRadius: theme.radii.lg,
      padding: 12,
      alignItems: "flex-start",
    },
    warningText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onTertiaryFixed,
      lineHeight: 18,
    },
  });
}
