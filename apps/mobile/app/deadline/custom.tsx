import { useState } from "react";
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
import { useCreateDeadline } from "../../src/hooks/useDeadlines";
import { parseTurkishDate } from "../../src/lib/turkish-date";

export default function CustomDeadlineScreen() {
  const [title, setTitle] = useState("");
  const [dateText, setDateText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createDeadline = useCreateDeadline();

  const onSubmit = () => {
    if (title.trim().length < 2) {
      setError("Başlık en az 2 karakter olmalıdır.");
      return;
    }
    const isoDate = parseTurkishDate(dateText);
    if (!isoDate) {
      setError("Tarihi GG.AA.YYYY biçiminde girin.");
      return;
    }
    setError(null);
    createDeadline.mutate(
      { mode: "CUSTOM", title: title.trim(), dueDate: isoDate },
      { onSuccess: () => router.replace("/(tabs)/calendar") },
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Özel Süre Ekle</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Başlık</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Örn. Sözleşme yenileme"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Son Gün</Text>
        <TextInput
          value={dateText}
          onChangeText={setDateText}
          style={styles.input}
          placeholder="GG.AA.YYYY"
          keyboardType="numbers-and-punctuation"
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {createDeadline.isError ? (
        <Text style={styles.errorText}>
          {createDeadline.error instanceof Error
            ? createDeadline.error.message
            : "Kaydedilemedi."}
        </Text>
      ) : null}

      <Pressable
        style={styles.primaryButton}
        onPress={onSubmit}
        disabled={createDeadline.isPending}
      >
        {createDeadline.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Kaydet</Text>
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
    marginTop: 8,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
