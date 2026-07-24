import { useMemo, useState } from "react";
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
import { Icon, useTheme, WarningBanner, type Theme } from "@hukukai/ui";
import type { DeadlineCalculationResponse, DeadlineSummary } from "@hukukai/types";
import { useCalculateDeadline, useCreateDeadline } from "../../src/hooks/useDeadlines";
import { useGenerateDeadlineReport } from "../../src/hooks/useReports";
import { ApiError } from "../../src/lib/api-client";
import { parseTurkishDate } from "../../src/lib/turkish-date";

const LEGISLATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Taslak",
  CHANGE_DETECTED: "Değişiklik tespit edildi",
  TEMPORARILY_RESTRICTED: "Geçici olarak kısıtlı",
  VERIFIED: "Doğrulandı",
  CANARY: "Kademeli yayında",
  ACTIVE: "Yürürlükte",
  SUPERSEDED: "Yerini yeni sürüm aldı",
  REJECTED: "Reddedildi",
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

function extractUnderReviewMessage(error: unknown): string | null {
  if (
    error instanceof ApiError &&
    error.status === 409 &&
    typeof error.details === "object" &&
    error.details !== null &&
    (error.details as { underReview?: boolean }).underReview === true
  ) {
    return error.message;
  }
  return null;
}

export default function CalculateDeadlineScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { ruleKey, title } = useLocalSearchParams<{
    ruleKey: string;
    title: string;
  }>();
  const [dateText, setDateText] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [result, setResult] = useState<DeadlineCalculationResponse | null>(null);
  const [savedDeadline, setSavedDeadline] = useState<DeadlineSummary | null>(null);
  const [underReviewMessage, setUnderReviewMessage] = useState<string | null>(null);

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
    setUnderReviewMessage(null);
    calculateDeadline.mutate(
      { ruleKey, startDate: isoDate, startEvent: "MANUAL" },
      {
        onSuccess: (data) => {
          setResult(data);
          setUnderReviewMessage(null);
        },
        onError: (error) => {
          const underReview = extractUnderReviewMessage(error);
          if (underReview) {
            setResult(null);
            setUnderReviewMessage(underReview);
            return;
          }
          Alert.alert("Hata", error instanceof Error ? error.message : "Hesaplanamadı.");
        },
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
          Alert.alert("Kaydedildi", "Hatırlatıcı takviminize eklendi.", [{ text: "Tamam" }]);
        },
        onError: (error) => showQuotaAwareError(error, "Kaydedilemedi."),
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
        Alert.alert("Hata", error instanceof Error ? error.message : "Rapor oluşturulamadı."),
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tebliğ/Karar Tarihi</Text>
        <View style={styles.inputWrap}>
          <Icon name="event" size={20} color={theme.colors.outline} style={styles.inputIcon} />
          <TextInput
            value={dateText}
            onChangeText={setDateText}
            style={styles.input}
            placeholder="GG.AA.YYYY"
            placeholderTextColor={theme.colors.outline}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={onCalculate}
        disabled={calculateDeadline.isPending}
      >
        {calculateDeadline.isPending ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.primaryButtonText}>Süreyi Hesapla</Text>
        )}
      </Pressable>

      {underReviewMessage ? <WarningBanner message={underReviewMessage} /> : null}

      {result ? (
        <View style={styles.resultBox}>
          <View style={styles.legislationStatusRow}>
            <Icon
              name={
                result.legislationStatus.status === "ACTIVE" ? "verified" : "info"
              }
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.legislationStatusText}>
              Mevzuat güncel · sürüm {result.ruleVersion} ·{" "}
              {LEGISLATION_STATUS_LABELS[result.legislationStatus.status] ??
                result.legislationStatus.status}
              {result.legislationStatus.verifiedAt
                ? ` · son doğrulama: ${new Date(
                    result.legislationStatus.verifiedAt,
                  ).toLocaleDateString("tr-TR")}`
                : ""}
            </Text>
          </View>

          <Text style={styles.resultLabel}>Son gün</Text>
          <Text style={styles.resultValue}>{result.adjustedEndDate}</Text>

          <Text style={styles.resultLabel}>Kalan gün</Text>
          <Text style={styles.resultValue}>
            {result.isExpired ? "Süre dolmuş" : `${result.remainingCalendarDays} gün`}
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
                <View key={warning} style={styles.warningBanner}>
                  <Icon name="warning" size={16} color={theme.colors.error} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </>
          ) : null}

          <Pressable
            style={styles.secondaryButton}
            onPress={onSaveReminder}
            disabled={createDeadline.isPending}
          >
            {createDeadline.isPending ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Icon name="notifications_active" size={18} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>Hatırlatıcı Ekle</Text>
              </>
            )}
          </Pressable>

          {savedDeadline ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={onGenerateReport}
              disabled={generateReport.isPending}
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
        </View>
      ) : null}
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    container: {
      flexGrow: 1,
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 40,
      gap: theme.spacing.stackGapMd,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
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
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    field: { gap: 6 },
    label: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      letterSpacing: 0.5,
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
    },
    inputWrap: { position: "relative", justifyContent: "center" },
    inputIcon: { position: "absolute", left: 14, zIndex: 1 },
    input: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      paddingLeft: 40,
      paddingRight: 16,
      paddingVertical: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 15,
      alignItems: "center",
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
    resultBox: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 16,
      gap: 4,
    },
    legislationStatusRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      paddingBottom: 10,
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    legislationStatusText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    resultLabel: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.onSurfaceVariant,
      marginTop: 10,
      textTransform: "uppercase",
    },
    resultValue: {
      fontFamily: theme.typography.amountDisplay.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    bodyText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    warningBanner: {
      flexDirection: "row",
      gap: 6,
      alignItems: "flex-start",
      marginTop: 4,
    },
    warningText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.error,
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
      marginTop: 16,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontWeight: "700",
      fontSize: 14,
    },
  });
}
