import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { EmptyState, Icon, useTheme, type Theme } from "@hukukai/ui";
import type { DocumentSummary } from "@hukukai/types";
import { useDeleteFolder, useFolder } from "../../src/hooks/useFolders";
import { useDeleteDocument, useDocuments } from "../../src/hooks/useDocuments";

const DOCUMENT_STATUS_LABELS: Record<DocumentSummary["status"], string> = {
  UPLOADED: "Yüklendi",
  OCR_PROCESSING: "OCR işleniyor",
  AI_PROCESSING: "Analiz ediliyor",
  REVIEW_REQUIRED: "İnceleme gerekli",
  COMPLETED: "Tamamlandı",
  FAILED: "Başarısız",
};

const DOCUMENT_ICONS: Record<string, string> = {
  "application/pdf": "picture_as_pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/heic": "image",
};

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentRow({
  document,
  onDelete,
  styles,
  theme,
}: {
  document: DocumentSummary;
  onDelete: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  return (
    <Pressable style={styles.docRow} onPress={() => router.push(`/document/${document.id}`)}>
      <View style={styles.docIconWrap}>
        <Icon
          name={DOCUMENT_ICONS[document.mimeType] ?? "description"}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName} numberOfLines={1}>
          {document.originalName}
        </Text>
        <Text style={styles.docMeta}>
          {formatFileSize(document.sizeBytes)} · {DOCUMENT_STATUS_LABELS[document.status]}
        </Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Icon name="delete" size={20} color={theme.colors.error} />
      </Pressable>
    </Pressable>
  );
}

export default function FolderDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const folderQuery = useFolder(id);
  const documentsQuery = useDocuments(id);
  const deleteDocument = useDeleteDocument();
  const deleteFolder = useDeleteFolder();

  const folder = folderQuery.data;
  const documents = documentsQuery.data ?? [];

  const onDeleteFolder = () => {
    if (!id) return;
    Alert.alert(
      "Klasörü sil",
      "Bu klasörü silmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () =>
            deleteFolder.mutate(id, {
              onSuccess: () => router.replace("/(tabs)/folders"),
            }),
        },
      ],
    );
  };

  if (folderQuery.isLoading || !folder) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {folder.title}
        </Text>
        <Pressable
          style={styles.editButton}
          onPress={() => router.push(`/folder/${folder.id}/edit`)}
          hitSlop={8}
        >
          <Icon name="edit" size={18} color={theme.colors.primary} />
        </Pressable>
      </View>

      {folder.clientName ? <Text style={styles.meta}>{folder.clientName}</Text> : null}
      {folder.referenceNumber ? (
        <Text style={styles.meta}>Referans: {folder.referenceNumber}</Text>
      ) : null}
      {folder.notes ? <Text style={styles.notes}>{folder.notes}</Text> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Belgeler</Text>
        <Pressable
          style={styles.uploadButton}
          onPress={() => router.push(`/folder/${folder.id}/upload`)}
        >
          <Icon name="upload_file" size={16} color={theme.colors.onPrimary} />
          <Text style={styles.uploadButtonText}>Belge Yükle</Text>
        </Pressable>
      </View>

      {documents.length === 0 && !documentsQuery.isLoading ? (
        <EmptyState
          title="Bu klasörde belge yok"
          description="PDF, JPEG, PNG veya HEIC belge yükleyebilirsiniz."
        />
      ) : null}

      <View style={styles.docList}>
        {documents.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            onDelete={() => deleteDocument.mutate(document.id)}
            styles={styles}
            theme={theme}
          />
        ))}
      </View>

      <Pressable style={styles.deleteFolderButton} onPress={onDeleteFolder}>
        <Icon name="delete" size={16} color={theme.colors.error} />
        <Text style={styles.deleteFolderText}>Klasörü Sil</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      gap: 12,
      paddingBottom: 48,
    },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    editButton: {
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
    meta: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    notes: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
    },
    sectionTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    uploadButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
    },
    docList: { gap: 8 },
    docRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 12,
    },
    docIconWrap: {
      width: 38,
      height: 38,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    docInfo: { flex: 1, gap: 2 },
    docName: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    docMeta: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    deleteFolderButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 24,
    },
    deleteFolderText: {
      color: theme.colors.error,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontWeight: "600",
      fontSize: 13,
    },
  });
}
