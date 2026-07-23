import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { EmptyState } from "@hukukai/ui";
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

function DeadlineRow({ deadline }: { deadline: DeadlineSummary }) {
  const completeDeadline = useCompleteDeadline();
  const deleteDeadline = useDeleteDeadline();
  const remaining = daysUntil(deadline.adjustedEndDate);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {deadline.title}
        </Text>
        <Text
          style={[
            styles.remainingBadge,
            remaining <= 3 && styles.remainingBadgeUrgent,
          ]}
        >
          {remaining === 0
            ? "Bugün"
            : remaining < 0
              ? "Süresi geçti"
              : `${remaining} gün`}
        </Text>
      </View>
      <Text style={styles.cardMeta}>Son gün: {deadline.adjustedEndDate}</Text>
      {deadline.warnings.length > 0 ? (
        <Text style={styles.warningText} numberOfLines={2}>
          ⚠️ {deadline.warnings[0]}
        </Text>
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
 */
export default function CalendarScreen() {
  const upcomingQuery = useUpcomingDeadlines(30);
  const deadlines = upcomingQuery.data ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Takvim</Text>
        <Pressable
          style={styles.newButton}
          onPress={() => router.push("/deadline/custom")}
        >
          <Text style={styles.newButtonText}>+ Özel Süre</Text>
        </Pressable>
      </View>

      {upcomingQuery.isLoading ? (
        <Text style={styles.mutedText}>Yükleniyor…</Text>
      ) : null}

      {deadlines.length === 0 && !upcomingQuery.isLoading ? (
        <EmptyState
          title="Henüz süreniz yok"
          description="Süre hesaplama araçlarını kullandığınızda son günler burada takvim olarak görünecektir."
        />
      ) : null}

      <View style={styles.cardList}>
        {deadlines.map((deadline) => (
          <DeadlineRow key={deadline.id} deadline={deadline} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#101828" },
  newButton: {
    backgroundColor: "#175CD3",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  mutedText: { fontSize: 13, color: "#667085" },
  cardList: { gap: 10 },
  card: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#101828", flex: 1 },
  remainingBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#175CD3",
    backgroundColor: "#EFF8FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  remainingBadgeUrgent: { color: "#B42318", backgroundColor: "#FEF3F2" },
  cardMeta: { fontSize: 13, color: "#667085" },
  warningText: { fontSize: 12, color: "#B54708" },
  actionRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  actionText: { color: "#175CD3", fontWeight: "600", fontSize: 13 },
  actionTextDanger: { color: "#B42318", fontWeight: "600", fontSize: 13 },
});
