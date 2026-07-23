import { useEffect, useState } from "react";
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
import type { DocumentStatus } from "@hukukai/types";
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

const ANALYZABLE_STATUSES = new Set<DocumentStatus>([
  "UPLOADED",
  "FAILED",
  "COMPLETED",
  "REVIEW_REQUIRED",
]);
const PROCESSING_STATUSES = new Set<DocumentStatus>([
  "OCR_PROCESSING",
  "AI_PROCESSING",
]);

function ExtractedDataForm({
  initialData,
  onSave,
  isSaving,
}: {
  initialData: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
  isSaving: boolean;
}) {
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(initialData).map(([key, value]) => [key, String(value ?? "")]),
    ),
  );

  useEffect(() => {
    setFields(
      Object.fromEntries(
        Object.entries(initialData).map(([key, value]) => [
          key,
          String(value ?? ""),
        ]),
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
      {fieldEntries.length === 0 ? (
        <Text style={styles.mutedText}>Çıkarılan alan yok.</Text>
      ) : null}
      {fieldEntries.map(([key, value]) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{key}</Text>
          <TextInput
            value={value}
            onChangeText={(text) =>
              setFields((prev) => ({ ...prev, [key]: text }))
            }
            style={styles.input}
          />
        </View>
      ))}
      <Pressable
        style={styles.primaryButton}
        onPress={() => onSave(fields)}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Onayla ve Kaydet</Text>
        )}
      </Pressable>
    </View>
  );
}

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const documentQuery = useDocument(id);
  const statusQuery = useDocumentStatus(id);
  const analyzeDocument = useAnalyzeDocument(id ?? "");

  const status = statusQuery.data?.status ?? documentQuery.data?.status;
  const showAnalysis = status === "REVIEW_REQUIRED" || status === "COMPLETED";

  const analysisQuery = useDocumentAnalysisResult(id, showAnalysis);
  const updateExtractedData = useUpdateExtractedData(id ?? "");
  const recommendedActionsQuery = useRecommendedActions(
    id,
    status === "COMPLETED",
  );
  const generateReport = useGenerateDocumentAnalysisReport();

  if (documentQuery.isLoading || !documentQuery.data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const document = documentQuery.data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title} numberOfLines={2}>
        {document.originalName}
      </Text>
      <Text style={styles.statusBadge}>
        {status ? STATUS_LABELS[status] : ""}
      </Text>

      {status && ANALYZABLE_STATUSES.has(status) ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            analyzeDocument.mutate(undefined, {
              onError: (error) =>
                Alert.alert(
                  "Hata",
                  error instanceof Error
                    ? error.message
                    : "Analiz başlatılamadı.",
                ),
            })
          }
          disabled={analyzeDocument.isPending}
        >
          {analyzeDocument.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {status === "FAILED" || status === "COMPLETED" || status === "REVIEW_REQUIRED"
                ? "Yeniden Analiz Et"
                : "Belgeyi Analiz Et"}
            </Text>
          )}
        </Pressable>
      ) : null}

      {status && PROCESSING_STATUSES.has(status) ? (
        <View style={styles.processingBox}>
          <ActivityIndicator />
          <Text style={styles.mutedText}>Belge işleniyor, lütfen bekleyin…</Text>
        </View>
      ) : null}

      {status === "FAILED" && documentQuery.data ? (
        <Text style={styles.errorText}>
          Analiz sırasında bir hata oluştu. Tekrar deneyebilirsiniz.
        </Text>
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
                <Text key={warning} style={styles.warningText}>
                  ⚠️ {warning}
                </Text>
              ))}
            </View>
          ) : null}

          {status === "REVIEW_REQUIRED" ? (
            <ExtractedDataForm
              initialData={analysisQuery.data.extractedData}
              isSaving={updateExtractedData.isPending}
              onSave={(data) =>
                updateExtractedData.mutate(data, {
                  onError: (error) =>
                    Alert.alert(
                      "Hata",
                      error instanceof Error
                        ? error.message
                        : "Kaydedilemedi.",
                    ),
                })
              }
            />
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Çıkarılan Veriler</Text>
              {Object.entries(analysisQuery.data.extractedData).map(
                ([key, value]) => (
                  <Text key={key} style={styles.bodyText}>
                    {key}: {String(value)}
                  </Text>
                ),
              )}
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
                Alert.alert(
                  "Hata",
                  error instanceof Error ? error.message : "Rapor oluşturulamadı.",
                ),
            })
          }
        >
          {generateReport.isPending ? (
            <ActivityIndicator color="#175CD3" />
          ) : (
            <Text style={styles.secondaryButtonText}>Rapor Oluştur</Text>
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
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20, paddingTop: 60, gap: 14, paddingBottom: 48 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", color: "#101828" },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF8FF",
    color: "#175CD3",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  primaryButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#175CD3", fontWeight: "700", fontSize: 14 },
  processingBox: { alignItems: "center", gap: 8, paddingVertical: 16 },
  mutedText: { fontSize: 13, color: "#667085" },
  errorText: { fontSize: 13, color: "#B42318" },
  section: { gap: 8, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#101828" },
  helperText: { fontSize: 12, color: "#667085" },
  bodyText: { fontSize: 14, color: "#344054", lineHeight: 20 },
  warningText: { fontSize: 13, color: "#B54708" },
  field: { gap: 4 },
  label: { fontSize: 12, fontWeight: "600", color: "#344054" },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#101828",
  },
  actionRow: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 10,
    padding: 12,
  },
  actionText: { fontSize: 14, fontWeight: "600", color: "#175CD3" },
});
