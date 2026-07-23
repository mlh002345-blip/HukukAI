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
import { useLocalSearchParams } from "expo-router";
import type { CalculationSummary } from "@hukukai/types";
import { useSubmitCalculation } from "../../src/hooks/useCalculations";
import { CALCULATOR_CONFIGS } from "../../src/lib/calculator-config";

export default function CalculatorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const config = CALCULATOR_CONFIGS[slug ?? ""];

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (config?.fields ?? []).map((field) => [
        field.key,
        field.defaultValue ?? "",
      ]),
    ),
  );
  const [result, setResult] = useState<CalculationSummary | null>(null);

  const submitCalculation = useSubmitCalculation(config?.endpoint ?? "");

  if (!config) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Bu araç bulunamadı.</Text>
      </View>
    );
  }

  const onCalculate = () => {
    const missingField = config.fields.find(
      (field) => field.kind === "decimal" && !values[field.key]?.trim(),
    );
    if (missingField) {
      Alert.alert("Eksik alan", `${missingField.label} alanı zorunludur.`);
      return;
    }

    submitCalculation.mutate(values, {
      onSuccess: setResult,
      onError: (error) =>
        Alert.alert(
          "Hata",
          error instanceof Error ? error.message : "Hesaplanamadı.",
        ),
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{config.title}</Text>

      {config.fields.map((field) => (
        <View key={field.key} style={styles.field}>
          <Text style={styles.label}>{field.label}</Text>
          {field.kind === "select" ? (
            <View style={styles.optionRow}>
              {(field.options ?? []).map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionChip,
                    values[field.key] === option.value &&
                      styles.optionChipSelected,
                  ]}
                  onPress={() =>
                    setValues((prev) => ({ ...prev, [field.key]: option.value }))
                  }
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      values[field.key] === option.value &&
                        styles.optionChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <TextInput
              value={values[field.key] ?? ""}
              onChangeText={(text) =>
                setValues((prev) => ({ ...prev, [field.key]: text }))
              }
              style={styles.input}
              placeholder={field.placeholder}
              keyboardType="decimal-pad"
            />
          )}
        </View>
      ))}

      <Pressable
        style={styles.primaryButton}
        onPress={onCalculate}
        disabled={submitCalculation.isPending}
      >
        {submitCalculation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Hesapla</Text>
        )}
      </Pressable>

      {result ? (
        <View style={styles.resultBox}>
          {config.resultFields.map((field) => (
            <View key={field.key} style={styles.resultRow}>
              <Text style={styles.resultLabel}>{field.label}</Text>
              <Text style={styles.resultValue}>
                {String(result.outputData[field.key] ?? "-")}
              </Text>
            </View>
          ))}
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  errorText: { color: "#B42318", fontSize: 14 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionChip: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionChipSelected: { backgroundColor: "#175CD3", borderColor: "#175CD3" },
  optionChipText: { fontSize: 13, color: "#344054" },
  optionChipTextSelected: { color: "#FFFFFF", fontWeight: "600" },
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
    gap: 10,
  },
  resultRow: { gap: 2 },
  resultLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
    textTransform: "uppercase",
  },
  resultValue: { fontSize: 18, fontWeight: "700", color: "#101828" },
});
