import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { CategoryChip, EmptyState, Icon, useTheme, type Theme } from "@hukukai/ui";
import { DOCUMENT_TYPES, type DocumentStatus, type DocumentSummary, type DocumentType } from "@hukukai/types";
import { useDocuments } from "../../src/hooks/useDocuments";
import { parseTurkishDate } from "../../src/lib/turkish-date";

const STATUS_FILTERS: Array<{ key: "ALL" | DocumentStatus; label: string }> = [
  { key: "ALL", label: "Tümü" },
  { key: "COMPLETED", label: "Tamamlandı" },
  { key: "OCR_PROCESSING", label: "İşleniyor" },
  { key: "AI_PROCESSING", label: "İşleniyor" },
  { key: "REVIEW_REQUIRED", label: "İnceleme Gerekli" },
  { key: "FAILED", label: "Başarısız" },
];

const UNIQUE_STATUS_FILTERS = STATUS_FILTERS.filter(
  (filter, index, all) => all.findIndex((other) => other.label === filter.label) === index,
);

const STATUS_BADGE: Record<DocumentStatus, { label: string; colorKey: "success" | "warning" | "error" | "neutral" }> = {
  UPLOADED: { label: "YÜKLENDİ", colorKey: "neutral" },
  OCR_PROCESSING: { label: "İŞLENİYOR", colorKey: "warning" },
  AI_PROCESSING: { label: "İŞLENİYOR", colorKey: "warning" },
  REVIEW_REQUIRED: { label: "İNCELEME GEREKLİ", colorKey: "warning" },
  COMPLETED: { label: "TAMAMLANDI", colorKey: "success" },
  FAILED: { label: "BAŞARISIZ", colorKey: "error" },
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  ENFORCEMENT_PAYMENT_ORDER: "İcra Ödeme Emri",
  ENFORCEMENT_NOTICE: "İcra Tebligatı",
  COURT_REASONED_DECISION: "Mahkeme Kararı",
  TAX_NOTICE: "Vergi Yazısı",
  SGK_NOTICE: "SGK Bildirimi",
  RENT_AGREEMENT: "Kira Sözleşmesi",
  EXECUTION_TIMESHEET: "İnfaz Puantajı",
  TRAFFIC_ADMINISTRATIVE_FINE: "Trafik Cezası",
  UNKNOWN_OFFICIAL_DOCUMENT: "Resmi Belge",
};

const MIME_ICONS: Record<string, string> = {
  "application/pdf": "picture_as_pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/heic": "image",
};

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function DocumentCard({
  document,
  styles,
  theme,
}: {
  document: DocumentSummary;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  const badge = STATUS_BADGE[document.status];
  const badgeColor =
    badge.colorKey === "success"
      ? theme.colors.success
      : badge.colorKey === "warning"
        ? theme.colors.tertiaryContainer
        : badge.colorKey === "error"
          ? theme.colors.error
          : theme.colors.onSurfaceVariant;
  const isPdf = document.mimeType === "application/pdf";

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/document/${document.id}`)}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.cardIconWrap, isPdf ? styles.cardIconWrapError : styles.cardIconWrapNeutral]}>
          <Icon
            name={MIME_ICONS[document.mimeType] ?? "description"}
            size={26}
            color={isPdf ? theme.colors.error : theme.colors.primary}
          />
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={styles.badgeRow}>
            <View style={[styles.badgeDot, { backgroundColor: badgeColor }]} />
            <Text style={styles.badgeText}>{badge.label}</Text>
          </View>
          <Text style={styles.cardDate}>{formatDate(document.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {document.originalName}
      </Text>
      <Text style={styles.cardSubtitle}>
        {document.documentType ? DOCUMENT_TYPE_LABELS[document.documentType] : "Belge türü henüz belirlenmedi"}
      </Text>

      <View style={styles.cardFooterRow}>
        <Text style={styles.cardSize}>{formatFileSize(document.sizeBytes)}</Text>
        <Icon name="chevron_right" size={18} color={theme.colors.onSurfaceVariant} />
      </View>
    </Pressable>
  );
}

export default function AllDocumentsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const documentsQuery = useDocuments(undefined);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | DocumentStatus>("ALL");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<DocumentType>>(new Set());
  const [dateFromText, setDateFromText] = useState("");
  const [dateToText, setDateToText] = useState("");

  const documents = documentsQuery.data ?? [];
  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const dateFromIso = parseTurkishDate(dateFromText);
  const dateToIso = parseTurkishDate(dateToText);
  const activeFilterCount = selectedTypes.size + (dateFromIso ? 1 : 0) + (dateToIso ? 1 : 0);

  const toggleType = (type: DocumentType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const filtered = documents.filter((document) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      document.originalName.toLocaleLowerCase("tr-TR").includes(normalizedQuery);
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "OCR_PROCESSING"
        ? document.status === "OCR_PROCESSING" || document.status === "AI_PROCESSING"
        : document.status === statusFilter);
    const matchesType =
      selectedTypes.size === 0 || (document.documentType !== null && selectedTypes.has(document.documentType));
    const matchesDateFrom = !dateFromIso || document.createdAt.slice(0, 10) >= dateFromIso;
    const matchesDateTo = !dateToIso || document.createdAt.slice(0, 10) <= dateToIso;
    return matchesQuery && matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Tüm Belgeler</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Icon name="search" size={20} color={theme.colors.outline} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder="Dosyalarınızda arayın…"
            placeholderTextColor={theme.colors.outline}
          />
        </View>
        <Pressable
          style={[styles.filterButton, filterPanelOpen && styles.filterButtonActive]}
          onPress={() => setFilterPanelOpen((open) => !open)}
        >
          <Icon
            name="tune"
            size={20}
            color={filterPanelOpen ? theme.colors.onPrimary : theme.colors.onSurface}
          />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {UNIQUE_STATUS_FILTERS.map((filter) => (
          <CategoryChip
            key={filter.label}
            label={filter.label}
            selected={
              statusFilter === filter.key ||
              (filter.key === "OCR_PROCESSING" && statusFilter === "AI_PROCESSING")
            }
            onPress={() => setStatusFilter(filter.key)}
          />
        ))}
      </ScrollView>

      {filterPanelOpen ? (
        <View style={styles.filterPanel}>
          <View style={styles.filterSectionHeaderRow}>
            <Icon name="description" size={16} color={theme.colors.primary} />
            <Text style={styles.filterSectionTitle}>Belge Türü</Text>
          </View>
          <View style={styles.typeGrid}>
            {DOCUMENT_TYPES.map((type) => {
              const selected = selectedTypes.has(type);
              return (
                <Pressable
                  key={type}
                  style={[styles.typeChip, selected && styles.typeChipSelected]}
                  onPress={() => toggleType(type)}
                >
                  <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]} numberOfLines={1}>
                    {DOCUMENT_TYPE_LABELS[type]}
                  </Text>
                  <Icon
                    name={selected ? "check_circle" : "circle"}
                    filled={selected}
                    size={16}
                    color={selected ? theme.colors.onPrimary : theme.colors.outline}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.filterSectionHeaderRow}>
            <Icon name="calendar_today" size={16} color={theme.colors.primary} />
            <Text style={styles.filterSectionTitle}>Tarih Aralığı</Text>
          </View>
          <View style={styles.dateRow}>
            <TextInput
              value={dateFromText}
              onChangeText={setDateFromText}
              style={styles.dateInput}
              placeholder="Başlangıç GG.AA.YYYY"
              placeholderTextColor={theme.colors.outline}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              value={dateToText}
              onChangeText={setDateToText}
              style={styles.dateInput}
              placeholder="Bitiş GG.AA.YYYY"
              placeholderTextColor={theme.colors.outline}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {activeFilterCount > 0 ? (
            <Pressable
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedTypes(new Set());
                setDateFromText("");
                setDateToText("");
              }}
            >
              <Text style={styles.clearFiltersText}>Filtreleri Temizle</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {documentsQuery.isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loadingSpinner} />
        ) : null}

        {!documentsQuery.isLoading && filtered.length === 0 ? (
          <EmptyState
            title="Belge bulunamadı"
            description="Arama veya filtre kriterlerinizi değiştirmeyi deneyin."
          />
        ) : null}

        {filtered.map((document) => (
          <DocumentCard key={document.id} document={document} styles={styles} theme={theme} />
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: theme.spacing.containerPadding,
      marginBottom: 12,
    },
    searchWrap: {
      flex: 1,
      position: "relative",
      justifyContent: "center",
    },
    searchIcon: { position: "absolute", left: 16, zIndex: 1 },
    searchInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.full,
      paddingLeft: 44,
      paddingRight: 16,
      paddingVertical: 14,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    filterButton: {
      position: "relative",
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainerLow,
      alignItems: "center",
      justifyContent: "center",
    },
    filterButtonActive: { backgroundColor: theme.colors.primary },
    filterBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.error,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    filterBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.colors.onError,
    },
    chipRow: {
      paddingHorizontal: theme.spacing.containerPadding,
      gap: 8,
      paddingBottom: 12,
    },
    filterPanel: {
      marginHorizontal: theme.spacing.containerPadding,
      marginBottom: 12,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      padding: 16,
      gap: 10,
    },
    filterSectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
    filterSectionTitle: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    typeChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
      flexBasis: "47%",
      flexGrow: 1,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    typeChipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    typeChipText: {
      flex: 1,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    typeChipTextSelected: { color: theme.colors.onPrimary, fontWeight: "700" },
    dateRow: { flexDirection: "row", gap: 8 },
    dateInput: {
      flex: 1,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    clearFiltersButton: { alignItems: "center", marginTop: 4 },
    clearFiltersText: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.error,
    },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 0,
      gap: 12,
      paddingBottom: 48,
    },
    loadingSpinner: { marginTop: 24 },
    card: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 14,
      gap: 6,
    },
    cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    cardIconWrap: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    cardIconWrapError: { backgroundColor: theme.colors.errorContainer },
    cardIconWrapNeutral: { backgroundColor: theme.colors.surfaceContainerHigh },
    cardHeaderRight: { alignItems: "flex-end", gap: 4 },
    badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: theme.radii.full,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    badgeDot: { width: 6, height: 6, borderRadius: 3 },
    badgeText: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 9,
      fontWeight: "700",
      color: theme.colors.onSurfaceVariant,
    },
    cardDate: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      color: theme.colors.outline,
    },
    cardTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    cardSubtitle: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    cardFooterRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 8,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    cardSize: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      color: theme.colors.outline,
    },
  });
}
