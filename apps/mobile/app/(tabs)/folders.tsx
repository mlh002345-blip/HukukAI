import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { EmptyState, Icon, useTheme, type Theme } from "@hukukai/ui";
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

const FOLDER_TYPE_ICONS: Record<FolderSummary["folderType"], string> = {
  LEGAL: "gavel",
  ENFORCEMENT: "account_balance",
  TAX: "receipt_long",
  SGK: "corporate_fare",
  RENT: "real_estate_agent",
  EXECUTION: "lock_clock",
  TRAFFIC_FINE: "directions_car",
  OTHER: "folder",
};

function FolderCard({ folder, styles, theme }: { folder: FolderSummary; styles: ReturnType<typeof createStyles>; theme: Theme }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/folder/${folder.id}`)}>
      <View style={styles.iconWrap}>
        <Icon name={FOLDER_TYPE_ICONS[folder.folderType]} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.cardTextCol}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {folder.title}
        </Text>
        {folder.clientName ? (
          <Text style={styles.cardMeta} numberOfLines={1}>
            {folder.clientName}
          </Text>
        ) : null}
        <Text style={styles.cardMeta}>{folder.documentCount} belge</Text>
      </View>
      <Text style={styles.cardType}>{FOLDER_TYPE_LABELS[folder.folderType]}</Text>
    </Pressable>
  );
}

/**
 * Dosya kasası — Faz 3 (Bölüm 4.1, Bölüm 9.7). Tasarım: Lexi-Trust
 * Framework/Obsidian "Dosyalarım" ekranı.
 */
export default function FoldersScreen() {
  const foldersQuery = useFolders();
  const folders = foldersQuery.data ?? [];
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dosyalarım</Text>
        <Pressable style={styles.newButton} onPress={() => router.push("/folder/new")}>
          <Icon name="create_new_folder" size={16} color={theme.colors.onPrimary} />
          <Text style={styles.newButtonText}>Yeni Klasör</Text>
        </Pressable>
      </View>

      {foldersQuery.isLoading ? <Text style={styles.mutedText}>Yükleniyor…</Text> : null}

      {folders.length === 0 && !foldersQuery.isLoading ? (
        <EmptyState
          title="Henüz klasörünüz yok"
          description="Belgelerinizi düzenlemek için yeni bir klasör oluşturun."
        />
      ) : null}

      <View style={styles.cardList}>
        {folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} styles={styles} theme={theme} />
        ))}
      </View>
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 60,
      gap: theme.spacing.stackGapMd,
      paddingBottom: 40,
    },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 22,
      color: theme.colors.onBackground,
    },
    newButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    newButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
    },
    mutedText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    cardList: { gap: 10 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 14,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTextCol: { flex: 1, gap: 2 },
    cardTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    cardMeta: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    cardType: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 11,
      color: theme.colors.secondary,
      backgroundColor: theme.colors.surfaceContainerHigh,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.radii.full,
      overflow: "hidden",
    },
  });
}
