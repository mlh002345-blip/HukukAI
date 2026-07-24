import { useMemo } from "react";
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
import { EmptyState, Icon, useTheme, type Theme } from "@hukukai/ui";
import type { GeneratedReportSummary } from "@hukukai/types";
import { useReportDownloadUrl, useReports } from "../../src/hooks/useReports";

const REPORT_TYPE_LABELS: Record<string, string> = {
  DOCUMENT_ANALYSIS: "Belge Analiz Raporu",
  CALCULATION: "Hesaplama Raporu",
  DEADLINE: "Süre Raporu",
};

function ReportRow({
  report,
  styles,
  theme,
}: {
  report: GeneratedReportSummary;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
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
    <Pressable style={styles.row} onPress={onPress} disabled={downloadUrl.isPending}>
      <View style={styles.iconWrap}>
        <Icon name="picture_as_pdf" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>
          {REPORT_TYPE_LABELS[report.documentType] ?? report.documentType}
        </Text>
        <Text style={styles.rowDate}>
          {new Date(report.createdAt).toLocaleDateString("tr-TR")}
        </Text>
      </View>
      {downloadUrl.isPending ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <Icon name="download" size={20} color={theme.colors.onSurfaceVariant} />
      )}
    </Pressable>
  );
}

export default function ReportsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const reportsQuery = useReports();

  if (reportsQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const reports = reportsQuery.data ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raporlarım</Text>
      {reports.length === 0 ? (
        <EmptyState
          title="Henüz oluşturulmuş bir rapor yok"
          description="Belge analizi, hesaplama veya süre sonuçlarından rapor oluşturabilirsiniz."
        />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReportRow report={item} styles={styles} theme={theme} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 56 },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.onBackground,
      paddingHorizontal: theme.spacing.containerPadding,
      marginBottom: 8,
    },
    list: { padding: theme.spacing.containerPadding, gap: 10 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 14,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    rowText: { flex: 1, gap: 2 },
    rowTitle: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    rowDate: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
  });
}
