import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { EmptyState, Icon, useTheme, type Theme } from "@hukukai/ui";
import type { DeadlineSummary } from "@hukukai/types";
import {
  useCompleteDeadline,
  useDeleteDeadline,
  useUpcomingDeadlines,
} from "../../src/hooks/useDeadlines";

function daysUntil(adjustedEndDate: string): number {
  const today = new Date(new Date().toISOString().slice(0, 10));
  const end = new Date(adjustedEndDate);
  return Math.round((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function DeadlineRow({
  deadline,
  styles,
  theme,
}: {
  deadline: DeadlineSummary;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  const completeDeadline = useCompleteDeadline();
  const deleteDeadline = useDeleteDeadline();
  const remaining = daysUntil(deadline.adjustedEndDate);
  const isUrgent = remaining <= 3;

  return (
    <View style={[styles.card, isUrgent && styles.cardUrgent]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Icon
            name={isUrgent ? "priority_high" : "event"}
            size={18}
            color={isUrgent ? theme.colors.onTertiaryContainer : theme.colors.primary}
          />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {deadline.title}
        </Text>
        <Text style={[styles.remainingBadge, isUrgent && styles.remainingBadgeUrgent]}>
          {remaining === 0 ? "Bugün" : remaining < 0 ? "Süresi geçti" : `${remaining} gün`}
        </Text>
      </View>
      <Text style={styles.cardMeta}>Son gün: {deadline.adjustedEndDate}</Text>
      {deadline.warnings.length > 0 ? (
        <View style={styles.warningRow}>
          <Icon name="warning" size={14} color={theme.colors.tertiaryContainer} />
          <Text style={styles.warningText} numberOfLines={2}>
            {deadline.warnings[0]}
          </Text>
        </View>
      ) : null}
      <View style={styles.actionRow}>
        <Pressable onPress={() => completeDeadline.mutate(deadline.id)}>
          <Text style={styles.actionText}>Tamamlandı</Text>
        </Pressable>
        <Pressable onPress={() => deleteDeadline.mutate(deadline.id)}>
          <Text style={styles.actionTextDanger}>Sil</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Takvim — Süre motoru (Bölüm 4.1, Bölüm 21 — Bildirim altyapısı).
 * Tasarım: Lexi-Trust Framework/Obsidian "Takvim" ekranı.
 */
export default function CalendarScreen() {
  const upcomingQuery = useUpcomingDeadlines(30);
  const deadlines = upcomingQuery.data ?? [];
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Takvim</Text>
        <Pressable style={styles.newButton} onPress={() => router.push("/deadline/custom")}>
          <Icon name="add" size={16} color={theme.colors.onPrimary} />
          <Text style={styles.newButtonText}>Özel Süre</Text>
        </Pressable>
      </View>

      {upcomingQuery.isLoading ? <Text style={styles.mutedText}>Yükleniyor…</Text> : null}

      {deadlines.length === 0 && !upcomingQuery.isLoading ? (
        <EmptyState
          title="Henüz süreniz yok"
          description="Süre hesaplama araçlarını kullandığınızda son günler burada takvim olarak görünecektir."
        />
      ) : null}

      <View style={styles.cardList}>
        {deadlines.map((deadline) => (
          <DeadlineRow key={deadline.id} deadline={deadline} styles={styles} theme={theme} />
        ))}
      </View>
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 60,
      gap: theme.spacing.stackGapMd,
      paddingBottom: 40,
    },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 22,
      color: theme.colors.onBackground,
    },
    newButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    newButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
    },
    mutedText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    cardList: { gap: 10 },
    card: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.xl,
      padding: 14,
      gap: 6,
    },
    cardUrgent: {
      backgroundColor: theme.colors.tertiaryFixed,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.tertiaryContainer,
      borderColor: "transparent",
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: theme.radii.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceContainerHighest,
    },
    cardTitle: {
      flex: 1,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    remainingBadge: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 12,
      color: theme.colors.primary,
      backgroundColor: theme.colors.surfaceContainerHigh,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.radii.full,
      overflow: "hidden",
    },
    remainingBadgeUrgent: {
      color: theme.colors.onTertiaryFixed,
      backgroundColor: "transparent",
    },
    cardMeta: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    warningRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
    warningText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onTertiaryFixed,
    },
    actionRow: { flexDirection: "row", gap: 16, marginTop: 4 },
    actionText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
    },
    actionTextDanger: {
      color: theme.colors.error,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
    },
  });
}
