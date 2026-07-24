import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { EmptyState, Icon, useTheme, type Theme } from "@hukukai/ui";
import type { DocumentStatus, DocumentSummary } from "@hukukai/types";
import { useAuthStore } from "../src/stores/auth-store";
import { useUpcomingDeadlines } from "../src/hooks/useDeadlines";
import { useDocuments } from "../src/hooks/useDocuments";

const URGENT_THRESHOLD_DAYS = 3;

function daysUntil(dateIso: string): number {
  const diffMs = new Date(`${dateIso}T00:00:00.000Z`).getTime() - Date.now();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

const QUICK_ACTIONS = [
  { key: "upload", label: "Belge Yükle", icon: "upload_file", route: "/(tabs)/folders" as const },
  { key: "deadline", label: "Süre Hesapla", icon: "calculate", route: "/(tabs)/calendar" as const },
  { key: "reminder", label: "Hatırlatıcı", icon: "alarm_add", route: "/deadline/custom" as const },
  { key: "tools", label: "Tüm Araçlar", icon: "build_circle", route: "/(tabs)/tools" as const },
];

const PROCESSING_STATUSES = new Set<DocumentStatus>(["OCR_PROCESSING", "AI_PROCESSING"]);

const ANALYSIS_STATUS_LABEL: Record<DocumentStatus, string> = {
  UPLOADED: "YÜKLENDİ",
  OCR_PROCESSING: "TARANIYOR",
  AI_PROCESSING: "ANALİZ EDİLİYOR",
  REVIEW_REQUIRED: "İNCELEME GEREKLİ",
  COMPLETED: "TAMAMLANDI",
  FAILED: "BAŞARISIZ",
};

function AnalysisRow({
  document,
  styles,
  theme,
}: {
  document: DocumentSummary;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  const progress = document.status === "AI_PROCESSING" ? 0.7 : 0.35;
  return (
    <Pressable style={styles.analysisRow} onPress={() => router.push(`/document/${document.id}`)}>
      <View style={styles.analysisHeaderRow}>
        <View style={styles.analysisIconWrap}>
          <Icon name="description" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.analysisTextCol}>
          <Text style={styles.analysisTitle} numberOfLines={1}>
            {document.originalName}
          </Text>
        </View>
        <Text style={styles.analysisStatus}>{ANALYSIS_STATUS_LABEL[document.status]}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useAuthStore((state) => state.user);
  const deadlinesQuery = useUpcomingDeadlines(30);
  const documentsQuery = useDocuments(undefined);

  const upcomingDeadlines = (deadlinesQuery.data ?? []).slice(0, 4);
  const activeAnalyses = (documentsQuery.data ?? []).filter((document) =>
    PROCESSING_STATUSES.has(document.status),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <View style={styles.headerTextCol}>
          <Text style={styles.greeting}>Merhaba, {user?.fullName ?? "Kullanıcı"}</Text>
          <Text style={styles.summaryText}>
            {activeAnalyses.length > 0
              ? `${activeAnalyses.length} aktif analiz`
              : "Aktif analiziniz yok"}
            {upcomingDeadlines.length > 0
              ? ` ve yaklaşan ${upcomingDeadlines.length} süreniz bulunuyor.`
              : "."}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.quickActionGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              style={styles.quickActionCard}
              onPress={() => router.push(action.route)}
            >
              <Icon name={action.icon} size={22} color={theme.colors.primary} />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Kritik Süreler</Text>
          <Pressable onPress={() => router.push("/(tabs)/calendar")}>
            <Text style={styles.sectionLink}>Tümünü Gör</Text>
          </Pressable>
        </View>

        {deadlinesQuery.isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : upcomingDeadlines.length === 0 ? (
          <EmptyState
            title="Yaklaşan süreniz yok"
            description="Yeni bir süre kaydettiğinizde burada görünür."
          />
        ) : (
          <View style={styles.deadlineGrid}>
            {upcomingDeadlines.map((deadline) => {
              const remaining = daysUntil(deadline.adjustedEndDate);
              const isUrgent = remaining <= URGENT_THRESHOLD_DAYS;
              return (
                <Pressable
                  key={deadline.id}
                  style={[styles.deadlineCard, isUrgent && styles.deadlineCardUrgent]}
                  onPress={() => router.push("/(tabs)/calendar")}
                >
                  <Text style={[styles.deadlineBadge, isUrgent && styles.deadlineBadgeUrgent]}>
                    {remaining <= 0 ? "BUGÜN" : `${remaining} GÜN KALDI`}
                  </Text>
                  <Text style={styles.deadlineTitle} numberOfLines={2}>
                    {deadline.title}
                  </Text>
                  <View style={styles.deadlineFooterRow}>
                    <Icon
                      name={isUrgent ? "warning" : "event"}
                      size={14}
                      color={isUrgent ? theme.colors.error : theme.colors.secondary}
                    />
                    <Text style={[styles.deadlineFooterText, isUrgent && styles.deadlineFooterTextUrgent]}>
                      {new Date(deadline.adjustedEndDate).toLocaleDateString("tr-TR")}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktif Analizler</Text>
        {documentsQuery.isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : activeAnalyses.length === 0 ? (
          <EmptyState
            title="Aktif analiziniz yok"
            description="Bir belge yükleyip analiz başlattığınızda burada görünür."
          />
        ) : (
          <View style={styles.analysisList}>
            {activeAnalyses.map((document) => (
              <AnalysisRow key={document.id} document={document} styles={styles} theme={theme} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    container: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 48,
      gap: theme.spacing.stackGapLg,
    },
    headerRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTextCol: { flex: 1, gap: 4 },
    greeting: {
      fontFamily: theme.typography.headlineLgMobile.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    summaryText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 18,
    },
    section: { gap: 12 },
    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    sectionTitle: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      color: theme.colors.secondary,
      textTransform: "uppercase",
    },
    sectionLink: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    quickActionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    quickActionCard: {
      flexBasis: "47%",
      flexGrow: 1,
      backgroundColor: theme.colors.surfaceContainer,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      padding: 16,
      gap: 8,
    },
    quickActionLabel: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    deadlineGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    deadlineCard: {
      flexBasis: "47%",
      flexGrow: 1,
      backgroundColor: theme.colors.surfaceContainer,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.secondary,
      borderRadius: theme.radii.lg,
      padding: 14,
      gap: 8,
    },
    deadlineCardUrgent: { borderLeftColor: theme.colors.error },
    deadlineBadge: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.secondaryContainer,
      color: theme.colors.onSecondaryContainer,
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 10,
      fontWeight: "700",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.radii.md,
      overflow: "hidden",
    },
    deadlineBadgeUrgent: {
      backgroundColor: theme.colors.errorContainer,
      color: theme.colors.onErrorContainer,
    },
    deadlineTitle: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    deadlineFooterRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    deadlineFooterText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 11,
      color: theme.colors.secondary,
    },
    deadlineFooterTextUrgent: { color: theme.colors.error, fontWeight: "700" },
    analysisList: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: theme.radii.xl,
      overflow: "hidden",
    },
    analysisRow: {
      padding: 14,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    analysisHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    analysisIconWrap: {
      width: 34,
      height: 34,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    analysisTextCol: { flex: 1 },
    analysisTitle: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    analysisStatus: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 10,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    progressTrack: {
      height: 5,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.outlineVariant,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primary,
    },
  });
}
