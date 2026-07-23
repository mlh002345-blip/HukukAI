import { useState } from "react";
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
import type { DeadlineCalculationResponse, DeadlineSummary } from "@hukukai/types";
import {
  useCalculateDeadline,
  useCreateDeadline,
} from "../../src/hooks/useDeadlines";
import { useGenerateDeadlineReport } from "../../src/hooks/useReports";
import { parseTurkishDate } from "../../src/lib/turkish-date";

export default function CalculateDeadlineScreen() {
  const { ruleKey, title } = useLocalSearchParams<{
    ruleKey: string;
    title: string;
  }>();
  const [dateText, setDateText] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [result, setResult] = useState<DeadlineCalculationResponse | null>(null);
  const [savedDeadline, setSavedDeadline] = useState<DeadlineSummary | null>(null);

  const calculateDeadline = useCalculateDeadline();
  const createDeadline = useCreateDeadline();
  const generateReport = useGenerateDeadlineReport();

  const onCalculate = () => {
    const isoDate = parseTurkishDate(dateText);
    if (!isoDate) {
      setDateError("Tarihi GG.AA.YYYY biçiminde girin.");
      return;
    }
    setDateError(null);
    calculateDeadline.mutate(
      { ruleKey, startDate: isoDate, startEvent: "MANUAL" },
      {
        onSuccess: setResult,
        onError: (error) =>
          Alert.alert(
            "Hata",
            error instanceof Error ? error.message : "Hesaplanamadı.",
          ),
      },
    );
  };

  const onSaveReminder = () => {
    const isoDate = parseTurkishDate(dateText);
    if (!isoDate) return;
    createDeadline.mutate(
      {
        mode: "RULE",
        ruleKey,
        startDate: isoDate,
        startEvent: "MANUAL",
        title,
      },
      {
        onSuccess: (deadline) => {
          setSavedDeadline(deadline);
          Alert.alert("Kaydedildi", "Hatırlatıcı takviminize eklendi.", [
            { text: "Tamam" },
          ]);
        },
        onError: (error) =>
          Alert.alert(
            "Hata",
            error instanceof Error ? error.message : "Kaydedilemedi.",
          ),
      },
    );
  };

  const onGenerateReport = () => {
    if (!savedDeadline) return;
    generateReport.mutate(savedDeadline.id, {
      onSuccess: () => {
        Alert.alert("Rapor oluşturuldu", "Raporu Raporlarım ekranından indirebilirsiniz.", [
          { text: "Tamam", onPress: () => router.push("/reports") },
        ]);
      },
      onError: (error) =>
        Alert.alert(
          "Hata",
          error instanceof Error ? error.message : "Rapor oluşturulamadı.",
        ),
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{title}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Tebliğ/Karar Tarihi</Text>
        <TextInput
          value={dateText}
          onChangeText={setDateText}
          style={styles.input}
          placeholder="GG.AA.YYYY"
          keyboardType="numbers-and-punctuation"
        />
        {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={onCalculate}
        disabled={calculateDeadline.isPending}
      >
        {calculateDeadline.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Süreyi Hesapla</Text>
        )}
      </Pressable>

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Son gün</Text>
          <Text style={styles.resultValue}>{result.adjustedEndDate}</Text>

          <Text style={styles.resultLabel}>Kalan gün</Text>
          <Text style={styles.resultValue}>
            {result.isExpired
              ? "Süre dolmuş"
              : `${result.remainingCalendarDays} gün`}
          </Text>

          {result.legalBasis.length > 0 ? (
            <>
              <Text style={styles.resultLabel}>Dayanak</Text>
              {result.legalBasis.map((basis) => (
                <Text key={`${basis.law}-${basis.article}`} style={styles.bodyText}>
                  {basis.law}
                  {basis.article ? ` m.${basis.article}` : ""}
                </Text>
              ))}
            </>
          ) : null}

          {result.appliedAdjustments.length > 0 ? (
            <>
              <Text style={styles.resultLabel}>Uygulanan Düzeltmeler</Text>
              {result.appliedAdjustments.map((adjustment, index) => (
                <Text key={`${adjustment.type}-${index}`} style={styles.bodyText}>
                  {adjustment.description}
                </Text>
              ))}
            </>
          ) : null}

          {result.warnings.length > 0 ? (
            <>
              <Text style={styles.resultLabel}>Uyarılar</Text>
              {result.warnings.map((warning) => (
                <Text key={warning} style={styles.warningText}>
                  ⚠️ {warning}
                </Text>
              ))}
            </>
          ) : null}

          <Pressable
            style={styles.secondaryButton}
            onPress={onSaveReminder}
            disabled={createDeadline.isPending}
          >
            {createDeadline.isPending ? (
              <ActivityIndicator color="#175CD3" />
            ) : (
              <Text style={styles.secondaryButtonText}>Hatırlatıcı Ekle</Text>
            )}
          </Pressable>

          {savedDeadline ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={onGenerateReport}
              disabled={generateReport.isPending}
            >
              {generateReport.isPending ? (
                <ActivityIndicator color="#175CD3" />
              ) : (
                <Text style={styles.secondaryButtonText}>Rapor Oluştur</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 64,
    gap: 16,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#101828" },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500", color: "#344054" },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#101828",
  },
  errorText: { color: "#B42318", fontSize: 12 },
  primaryButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  resultBox: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
    marginTop: 10,
    textTransform: "uppercase",
  },
  resultValue: { fontSize: 20, fontWeight: "700", color: "#101828" },
  bodyText: { fontSize: 13, color: "#344054" },
  warningText: { fontSize: 12, color: "#B54708" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  secondaryButtonText: { color: "#175CD3", fontWeight: "700", fontSize: 14 },
});
