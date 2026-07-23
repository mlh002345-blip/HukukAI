import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { GeneratedReportSummary } from "@hukukai/types";
import { useReportDownloadUrl, useReports } from "../../src/hooks/useReports";

const REPORT_TYPE_LABELS: Record<string, string> = {
  DOCUMENT_ANALYSIS: "Belge Analiz Raporu",
  CALCULATION: "Hesaplama Raporu",
  DEADLINE: "Süre Raporu",
};

function ReportRow({ report }: { report: GeneratedReportSummary }) {
  const downloadUrl = useReportDownloadUrl(report.id);

  const onPress = () => {
    downloadUrl.mutate(undefined, {
      onSuccess: (data) => {
        Linking.openURL(data.downloadUrl).catch(() =>
          Alert.alert("Hata", "Rapor açılamadı."),
        );
      },
      onError: (error) =>
        Alert.alert(
          "Hata",
          error instanceof Error ? error.message : "İndirme bağlantısı alınamadı.",
        ),
    });
  };

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={downloadUrl.isPending}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>
          {REPORT_TYPE_LABELS[report.documentType] ?? report.documentType}
        </Text>
        <Text style={styles.rowDate}>
          {new Date(report.createdAt).toLocaleDateString("tr-TR")}
        </Text>
      </View>
      {downloadUrl.isPending ? (
        <ActivityIndicator size="small" color="#175CD3" />
      ) : (
        <Text style={styles.rowChevron}>›</Text>
      )}
    </Pressable>
  );
}

export default function ReportsScreen() {
  const reportsQuery = useReports();

  if (reportsQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const reports = reportsQuery.data ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raporlarım</Text>
      {reports.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.mutedText}>Henüz oluşturulmuş bir rapor yok.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReportRow report={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingTop: 60 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#101828", paddingHorizontal: 20 },
  mutedText: { fontSize: 13, color: "#667085" },
  list: { padding: 20, gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 12,
    padding: 14,
  },
  rowText: { gap: 2 },
  rowTitle: { fontSize: 14, fontWeight: "600", color: "#101828" },
  rowDate: { fontSize: 12, color: "#667085" },
  rowChevron: { fontSize: 18, color: "#98A2B3" },
});
