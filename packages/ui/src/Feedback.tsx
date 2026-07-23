import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? (
        <Text style={styles.emptyDescription}>{description}</Text>
      ) : null}
    </View>
  );
}

export function WarningBanner({ message }: { message: string }) {
  return (
    <View style={styles.warningContainer}>
      <Text style={styles.warningIcon}>⚠️</Text>
      <Text style={styles.warningText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#101828",
  },
  emptyDescription: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  warningContainer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFFAEB",
    borderColor: "#FEDF89",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "flex-start",
  },
  warningIcon: {
    fontSize: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#93370D",
    lineHeight: 18,
  },
});
