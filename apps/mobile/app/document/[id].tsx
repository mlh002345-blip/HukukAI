import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import type { DocumentStatus } from "@hukukai/types";
import { ApiError } from "../../src/lib/api-client";
import { useDocument } from "../../src/hooks/useDocuments";
import {
  useAnalyzeDocument,
  useDocumentAnalysisResult,
  useDocumentStatus,
  useRecommendedActions,
  useUpdateExtractedData,
} from "../../src/hooks/useDocumentAnalysis";
import { useGenerateDocumentAnalysisReport } from "../../src/hooks/useReports";

const STATUS_LABELS: Record<DocumentStatus, string> = {
  UPLOADED: "Yüklendi",
  OCR_PROCESSING: "Metin çıkarılıyor…",
  AI_PROCESSING: "Analiz ediliyor…",
  REVIEW_REQUIRED: "İnceleme gerekli",
  COMPLETED: "Tamamlandı",
  FAILED: "Analiz başarısız",
};

function showQuotaAwareError(error: unknown, fallbackMessage: string): void {
  if (error instanceof ApiError && error.status === 403) {
    Alert.alert("Paket sınırı", error.message, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Paketi Yükselt", onPress: () => router.push("/billing") },
    ]);
    return;
  }
  Alert.alert("Hata", error instanceof Error ? error.message : fallbackMessage);
}

const ANALYZABLE_STATUSES = new Set<DocumentStatus>([
  "UPLOADED",
  "FAILED",
  "COMPLETED",
  "REVIEW_REQUIRED",
]);
const PROCESSING_STATUSES = new Set<DocumentStatus>(["OCR_PROCESSING", "AI_PROCESSING"]);

function ExtractedDataForm({
  initialData,
  onSave,
  isSaving,
  styles,
  theme,
}: {
  initialData: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
  isSaving: boolean;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(initialData).map(([key, value]) => [key, String(value ?? "")]),
    ),
  );

  useEffect(() => {
    setFields(
      Object.fromEntries(
        Object.entries(initialData).map(([key, value]) => [key, String(value ?? "")]),
      ),
    );
  }, [initialData]);

  const fieldEntries = Object.entries(fields);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Çıkarılan Veriler</Text>
      <Text style={styles.helperText}>
        AI tarafından çıkarılan alanları kontrol edin ve gerekirse düzeltin.
      </Text>
      {fieldEntries.length === 0 ? <Text style={styles.mutedText}>Çıkarılan alan yok.</Text> : null}
      {fieldEntries.map(([key, value]) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{key}</Text>
          <TextInput
            value={value}
            onChangeText={(text) => setFields((prev) => ({ ...prev, [key]: text }))}
            style={styles.input}
          />
        </View>
      ))}
      <Pressable style={styles.primaryButton} onPress={() => onSave(fields)} disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator color={theme.colors.onPrimary} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Onayla ve Kaydet</Text>
        )}
      </Pressable>
    </View>
  );
}

export default function DocumentDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const documentQuery = useDocument(id);
  const statusQuery = useDocumentStatus(id);
  const analyzeDocument = useAnalyzeDocument(id ?? "");

  const status = statusQuery.data?.status ?? documentQuery.data?.status;
  const showAnalysis = status === "REVIEW_REQUIRED" || status === "COMPLETED";

  const analysisQuery = useDocumentAnalysisResult(id, showAnalysis);
  const updateExtractedData = useUpdateExtractedData(id ?? "");
  const recommendedActionsQuery = useRecommendedActions(id, status === "COMPLETED");
  const generateReport = useGenerateDocumentAnalysisReport();

  if (documentQuery.isLoading || !documentQuery.data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const document = documentQuery.data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title} numberOfLines={2}>
          {document.originalName}
        </Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusBadgeText}>{status ? STATUS_LABELS[status] : ""}</Text>
      </View>

      {status && ANALYZABLE_STATUSES.has(status) ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            analyzeDocument.mutate(undefined, {
              onError: (error) => showQuotaAwareError(error, "Analiz başlatılamadı."),
            })
          }
          disabled={analyzeDocument.isPending}
        >
          {analyzeDocument.isPending ? (
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
          ) : (
            <>
              <Icon name="auto_awesome" size={18} color={theme.colors.onPrimary} />
              <Text style={styles.primaryButtonText}>
                {status === "FAILED" || status === "COMPLETED" || status === "REVIEW_REQUIRED"
                  ? "Yeniden Analiz Et"
                  : "Belgeyi Analiz Et"}
              </Text>
            </>
          )}
        </Pressable>
      ) : null}

      {status && PROCESSING_STATUSES.has(status) ? (
        <View style={styles.processingBox}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.mutedText}>Belge işleniyor, lütfen bekleyin…</Text>
        </View>
      ) : null}

      {status === "FAILED" && documentQuery.data ? (
        <View style={styles.warningBanner}>
          <Icon name="warning" size={18} color={theme.colors.error} />
          <Text style={styles.warningText}>
            Analiz sırasında bir hata oluştu. Tekrar deneyebilirsiniz.
          </Text>
        </View>
      ) : null}

      {showAnalysis && analysisQuery.data ? (
        <>
          {analysisQuery.data.summary ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Özet</Text>
              <Text style={styles.bodyText}>{analysisQuery.data.summary}</Text>
            </View>
          ) : null}

          {analysisQuery.data.warnings.length > 0 ? (
            <View style={styles.section}>
              {analysisQuery.data.warnings.map((warning) => (
                <View key={warning} style={styles.warningBanner}>
                  <Icon name="warning" size={16} color={theme.colors.error} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {status === "REVIEW_REQUIRED" ? (
            <ExtractedDataForm
              initialData={analysisQuery.data.extractedData}
              isSaving={updateExtractedData.isPending}
              styles={styles}
              theme={theme}
              onSave={(data) =>
                updateExtractedData.mutate(data, {
                  onError: (error) =>
                    Alert.alert("Hata", error instanceof Error ? error.message : "Kaydedilemedi."),
                })
              }
            />
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Çıkarılan Veriler</Text>
              {Object.entries(analysisQuery.data.extractedData).map(([key, value]) => (
                <Text key={key} style={styles.bodyText}>
                  {key}: {String(value)}
                </Text>
              ))}
            </View>
          )}
        </>
      ) : null}

      {status === "COMPLETED" && id ? (
        <Pressable
          style={styles.secondaryButton}
          disabled={generateReport.isPending}
          onPress={() =>
            generateReport.mutate(id, {
              onSuccess: () => {
                Alert.alert(
                  "Rapor oluşturuldu",
                  "Raporu Raporlarım ekranından indirebilirsiniz.",
                  [{ text: "Tamam", onPress: () => router.push("/reports") }],
                );
              },
              onError: (error) =>
                Alert.alert("Hata", error instanceof Error ? error.message : "Rapor oluşturulamadı."),
            })
          }
        >
          {generateReport.isPending ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Icon name="picture_as_pdf" size={18} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Rapor Oluştur</Text>
            </>
          )}
        </Pressable>
      ) : null}

      {status === "COMPLETED" &&
      recommendedActionsQuery.data &&
      recommendedActionsQuery.data.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Önerilen Araçlar</Text>
          {recommendedActionsQuery.data.map((action) => (
            <Pressable
              key={action.toolSlug}
              style={styles.actionRow}
              onPress={() => Alert.alert(action.toolName, action.route)}
            >
              <Text style={styles.actionText}>{action.toolName}</Text>
              <Icon name="chevron_right" size={20} color={theme.colors.primary} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      gap: 14,
      paddingBottom: 48,
    },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
    headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      flex: 1,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    statusBadge: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.surfaceContainerHigh,
      borderRadius: theme.radii.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusBadgeText: {
      color: theme.colors.secondary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 12,
      fontWeight: "600",
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontWeight: "700",
      fontSize: 14,
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontWeight: "700",
      fontSize: 14,
    },
    processingBox: { alignItems: "center", gap: 8, paddingVertical: 16 },
    mutedText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    warningBanner: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: theme.colors.errorContainer,
      borderRadius: theme.radii.lg,
      padding: 12,
      alignItems: "flex-start",
    },
    warningText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onErrorContainer,
      lineHeight: 18,
    },
    section: { gap: 8, marginTop: 8 },
    sectionTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    helperText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    bodyText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
    field: { gap: 4 },
    label: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.onSurfaceVariant,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.lg,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.lg,
      padding: 12,
    },
    actionText: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
  });
}
