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
import {
  CALCULATOR_CONFIGS,
  type CalculatorConfig,
  type CalculatorListFieldConfig,
} from "../../src/lib/calculator-config";

type ListValues = Record<string, string>[];
type FormValues = Record<string, string | ListValues>;

function buildInitialValues(config: CalculatorConfig): FormValues {
  const values: FormValues = {};
  for (const field of config.fields) {
    values[field.key] =
      field.kind === "list" ? [{ ...field.emptyItem }] : field.defaultValue ?? "";
  }
  return values;
}

function buildPayload(
  config: CalculatorConfig,
  values: FormValues,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (field.kind === "list") {
      const items = (values[field.key] as ListValues) ?? [];
      payload[field.key] = items.map((item) => {
        const converted: Record<string, unknown> = {};
        for (const itemField of field.itemFields) {
          const raw = (item[itemField.key] ?? "").trim();
          if (itemField.kind === "integer") {
            converted[itemField.key] = Number(raw);
          } else if (itemField.kind === "nullableDecimal") {
            converted[itemField.key] = raw === "" ? null : raw;
          } else {
            converted[itemField.key] = raw;
          }
        }
        return converted;
      });
      continue;
    }

    const raw = (values[field.key] as string) ?? "";
    if (field.optional && raw.trim() === "") continue;
    payload[field.key] = raw.trim();
  }
  return payload;
}

function ListFieldEditor({
  field,
  items,
  onChange,
}: {
  field: CalculatorListFieldConfig;
  items: ListValues;
  onChange: (items: ListValues) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      {items.map((item, index) => (
        <View key={`${field.key}-${index}`} style={styles.listItem}>
          {field.itemFields.map((itemField) => (
            <View key={itemField.key} style={styles.listItemField}>
              <Text style={styles.listItemLabel}>{itemField.label}</Text>
              <TextInput
                value={item[itemField.key] ?? ""}
                onChangeText={(text) => {
                  const next = [...items];
                  next[index] = { ...next[index], [itemField.key]: text };
                  onChange(next);
                }}
                style={styles.input}
                placeholder={itemField.placeholder}
                keyboardType={
                  itemField.kind === "text" ? "default" : "decimal-pad"
                }
              />
            </View>
          ))}
          {items.length > 1 ? (
            <Pressable
              onPress={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Text style={styles.removeRowText}>Bu satırı kaldır</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      <Pressable
        style={styles.addRowButton}
        onPress={() => onChange([...items, { ...field.emptyItem }])}
      >
        <Text style={styles.addRowButtonText}>{field.addButtonLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function CalculatorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const config = CALCULATOR_CONFIGS[slug ?? ""];

  const [values, setValues] = useState<FormValues>(() =>
    config ? buildInitialValues(config) : {},
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
      (field) =>
        field.kind === "decimal" &&
        !field.optional &&
        !(values[field.key] as string)?.trim(),
    );
    if (missingField) {
      Alert.alert("Eksik alan", `${missingField.label} alanı zorunludur.`);
      return;
    }

    const payload = buildPayload(config, values);
    submitCalculation.mutate(payload, {
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

      {config.fields.map((field) => {
        if (field.kind === "list") {
          return (
            <ListFieldEditor
              key={field.key}
              field={field}
              items={(values[field.key] as ListValues) ?? []}
              onChange={(items) =>
                setValues((prev) => ({ ...prev, [field.key]: items }))
              }
            />
          );
        }

        return (
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
                value={(values[field.key] as string) ?? ""}
                onChangeText={(text) =>
                  setValues((prev) => ({ ...prev, [field.key]: text }))
                }
                style={styles.input}
                placeholder={field.placeholder}
                keyboardType="decimal-pad"
              />
            )}
          </View>
        );
      })}

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
          {config.resultFields.map((field) => {
            const rawValue = result.outputData[field.key];
            const displayValue =
              field.format === "boolean"
                ? rawValue
                  ? "Evet"
                  : "Hayır"
                : String(rawValue ?? "-");
            return (
              <View key={field.key} style={styles.resultRow}>
                <Text style={styles.resultLabel}>{field.label}</Text>
                <Text style={styles.resultValue}>{displayValue}</Text>
              </View>
            );
          })}
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
  listItem: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  listItemField: { gap: 4 },
  listItemLabel: { fontSize: 12, color: "#667085" },
  removeRowText: { color: "#B42318", fontSize: 12, fontWeight: "600" },
  addRowButton: {
    borderWidth: 1,
    borderColor: "#175CD3",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  addRowButtonText: { color: "#175CD3", fontWeight: "700", fontSize: 13 },
});
