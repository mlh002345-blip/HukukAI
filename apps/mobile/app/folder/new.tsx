import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { CategoryChip, Icon, useTheme, type Theme } from "@hukukai/ui";
import { createFolderSchema, type CreateFolderInput } from "@hukukai/validation";
import { FOLDER_TYPES, type FolderType } from "@hukukai/types";
import { useCreateFolder } from "../../src/hooks/useFolders";

const FOLDER_TYPE_LABELS: Record<FolderType, string> = {
  LEGAL: "Hukuki",
  ENFORCEMENT: "İcra",
  TAX: "Vergi",
  SGK: "SGK",
  RENT: "Kira",
  EXECUTION: "İnfaz",
  TRAFFIC_FINE: "Trafik Cezası",
  OTHER: "Diğer",
};

export default function CreateFolderScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const createFolder = useCreateFolder();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFolderInput>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      title: "",
      folderType: "OTHER",
      clientName: "",
      referenceNumber: "",
      notes: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    createFolder.mutate(values, {
      onSuccess: (folder) => router.replace(`/folder/${folder.id}`),
    });
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="close" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Yeni Klasör</Text>
        <View style={styles.backButtonSpacer} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Klasör Adı</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              placeholder="Örn. Ahmet Yılmaz - İcra Dosyası"
              placeholderTextColor={theme.colors.outline}
            />
          )}
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title.message}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Kategori</Text>
        <Controller
          control={control}
          name="folderType"
          render={({ field: { value, onChange } }) => (
            <View style={styles.chipRow}>
              {FOLDER_TYPES.map((type) => (
                <CategoryChip
                  key={type}
                  label={FOLDER_TYPE_LABELS[type]}
                  selected={value === type}
                  onPress={() => onChange(type)}
                />
              ))}
            </View>
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Müvekkil/Müşteri Adı</Text>
        <Controller
          control={control}
          name="clientName"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              placeholder="İsteğe bağlı"
              placeholderTextColor={theme.colors.outline}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Referans Numarası</Text>
        <Controller
          control={control}
          name="referenceNumber"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              placeholder="İsteğe bağlı"
              placeholderTextColor={theme.colors.outline}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Notlar</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={[styles.input, styles.textArea]}
              placeholder="İsteğe bağlı"
              placeholderTextColor={theme.colors.outline}
              multiline
            />
          )}
        />
      </View>

      {createFolder.isError ? (
        <Text style={styles.errorText}>
          {createFolder.error instanceof Error
            ? createFolder.error.message
            : "Klasör oluşturulamadı."}
        </Text>
      ) : null}

      <Pressable
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={createFolder.isPending}
      >
        {createFolder.isPending ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.submitButtonText}>Kaydet</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      flexGrow: 1,
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 40,
      gap: theme.spacing.stackGapMd,
    },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    backButtonSpacer: { width: 36 },
    title: {
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
    input: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    textArea: { minHeight: 80, textAlignVertical: "top" },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 4,
    },
    submitButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
  });
}
