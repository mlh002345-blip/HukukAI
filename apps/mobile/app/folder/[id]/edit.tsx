import { useEffect } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { updateFolderSchema, type UpdateFolderInput } from "@hukukai/validation";
import { FOLDER_TYPES, type FolderType } from "@hukukai/types";
import { useFolder, useUpdateFolder } from "../../../src/hooks/useFolders";

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

export default function EditFolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const folderQuery = useFolder(id);
  const updateFolder = useUpdateFolder(id ?? "");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFolderInput>({
    resolver: zodResolver(updateFolderSchema),
    defaultValues: {
      title: "",
      folderType: "OTHER",
      clientName: "",
      referenceNumber: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (folderQuery.data) {
      reset({
        title: folderQuery.data.title,
        folderType: folderQuery.data.folderType,
        clientName: folderQuery.data.clientName ?? "",
        referenceNumber: folderQuery.data.referenceNumber ?? "",
        notes: folderQuery.data.notes ?? "",
      });
    }
  }, [folderQuery.data, reset]);

  const onSubmit = handleSubmit((values) => {
    updateFolder.mutate(values, {
      onSuccess: () => router.back(),
    });
  });

  if (folderQuery.isLoading || !folderQuery.data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Klasörü Düzenle</Text>

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
            />
          )}
        />
        {errors.title ? (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Kategori</Text>
        <Controller
          control={control}
          name="folderType"
          render={({ field: { value, onChange } }) => (
            <View style={styles.chipRow}>
              {FOLDER_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.chip, value === type && styles.chipSelected]}
                  onPress={() => onChange(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      value === type && styles.chipTextSelected,
                    ]}
                  >
                    {FOLDER_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
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
              multiline
            />
          )}
        />
      </View>

      {updateFolder.isError ? (
        <Text style={styles.errorText}>
          {updateFolder.error instanceof Error
            ? updateFolder.error.message
            : "Klasör güncellenemedi."}
        </Text>
      ) : null}

      <Pressable
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={updateFolder.isPending}
      >
        {updateFolder.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Kaydet</Text>
        )}
      </Pressable>
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#101828", marginBottom: 8 },
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
  textArea: { minHeight: 80, textAlignVertical: "top" },
  errorText: { color: "#B42318", fontSize: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipSelected: { backgroundColor: "#175CD3", borderColor: "#175CD3" },
  chipText: { fontSize: 13, color: "#344054" },
  chipTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  submitButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
