import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { EmptyState } from "@hukukai/ui";
import type { FolderSummary } from "@hukukai/types";
import { useFolders } from "../../src/hooks/useFolders";

const FOLDER_TYPE_LABELS: Record<FolderSummary["folderType"], string> = {
  LEGAL: "Hukuki",
  ENFORCEMENT: "İcra",
  TAX: "Vergi",
  SGK: "SGK",
  RENT: "Kira",
  EXECUTION: "İnfaz",
  TRAFFIC_FINE: "Trafik Cezası",
  OTHER: "Diğer",
};

function FolderCard({ folder }: { folder: FolderSummary }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/folder/${folder.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{folder.title}</Text>
        <Text style={styles.cardType}>
          {FOLDER_TYPE_LABELS[folder.folderType]}
        </Text>
      </View>
      {folder.clientName ? (
        <Text style={styles.cardMeta}>{folder.clientName}</Text>
      ) : null}
      <Text style={styles.cardMeta}>{folder.documentCount} belge</Text>
    </Pressable>
  );
}

/**
 * Dosya kasası — Faz 3 (Bölüm 4.1, Bölüm 9.7).
 */
export default function FoldersScreen() {
  const foldersQuery = useFolders();
  const folders = foldersQuery.data ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dosyalarım</Text>
        <Pressable
          style={styles.newButton}
          onPress={() => router.push("/folder/new")}
        >
          <Text style={styles.newButtonText}>+ Yeni Klasör</Text>
        </Pressable>
      </View>

      {foldersQuery.isLoading ? (
        <Text style={styles.mutedText}>Yükleniyor…</Text>
      ) : null}

      {folders.length === 0 && !foldersQuery.isLoading ? (
        <EmptyState
          title="Henüz klasörünüz yok"
          description="Belgelerinizi düzenlemek için yeni bir klasör oluşturun."
        />
      ) : null}

      <View style={styles.cardList}>
        {folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
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
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#101828" },
  cardType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#175CD3",
    backgroundColor: "#EFF8FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  cardMeta: { fontSize: 13, color: "#667085" },
});
