import { ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "@hukukai/ui";

/**
 * Takvim — Faz 5 kapsamında Deadline motoru ile doldurulacaktır
 * (Bölüm 4.1 — Süre motoru, Bölüm 21 — Bildirim altyapısı).
 */
export default function CalendarScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Takvim</Text>
      <View style={styles.body}>
        <EmptyState
          title="Henüz süreniz yok"
          description="Süre hesaplama araçlarını kullandığınızda son günler burada takvim olarak görünecektir."
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20, paddingTop: 60, gap: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#101828" },
  body: { paddingTop: 40 },
});
