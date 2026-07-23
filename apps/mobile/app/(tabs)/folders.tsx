import { ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "@hukukai/ui";

/**
 * Dosya kasası — Faz 3 kapsamında klasör/belge CRUD ile doldurulacaktır
 * (Bölüm 4.1 — Dosya kasası, Bölüm 9.7). Bugün için iskelet ekrandır.
 */
export default function FoldersScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Dosyalarım</Text>
      <View style={styles.body}>
        <EmptyState
          title="Henüz klasörünüz yok"
          description="Belge yükleme ve klasör oluşturma Faz 3'te eklenecektir."
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
