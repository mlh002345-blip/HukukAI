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
import { useLocalSearchParams, router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import type { CalculationSummary } from "@hukukai/types";
import { useSubmitCalculation } from "../../src/hooks/useCalculations";
import { useGenerateCalculationReport } from "../../src/hooks/useReports";
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

function buildPayload(config: CalculatorConfig, values: FormValues): Record<string, unknown> {
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
  styles,
  theme,
}: {
  field: CalculatorListFieldConfig;
  items: ListValues;
  onChange: (items: ListValues) => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
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
                placeholderTextColor={theme.colors.outline}
                keyboardType={itemField.kind === "text" ? "default" : "decimal-pad"}
              />
            </View>
          ))}
          {items.length > 1 ? (
            <Pressable
              style={styles.removeRow}
              onPress={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Icon name="remove_circle_outline" size={16} color={theme.colors.error} />
              <Text style={styles.removeRowText}>Bu satırı kaldır</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      <Pressable style={styles.addRowButton} onPress={() => onChange([...items, { ...field.emptyItem }])}>
        <Icon name="add" size={16} color={theme.colors.primary} />
        <Text style={styles.addRowButtonText}>{field.addButtonLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function CalculatorScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const config = CALCULATOR_CONFIGS[slug ?? ""];

  const [values, setValues] = useState<FormValues>(() =>
    config ? buildInitialValues(config) : {},
  );
  const [result, setResult] = useState<CalculationSummary | null>(null);

  const submitCalculation = useSubmitCalculation(config?.endpoint ?? "");
  const generateReport = useGenerateCalculationReport();

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
        field.kind === "decimal" && !field.optional && !(values[field.key] as string)?.trim(),
    );
    if (missingField) {
      Alert.alert("Eksik alan", `${missingField.label} alanı zorunludur.`);
      return;
    }

    const payload = buildPayload(config, values);
    submitCalculation.mutate(payload, {
      onSuccess: setResult,
      onError: (error) =>
        Alert.alert("Hata", error instanceof Error ? error.message : "Hesaplanamadı."),
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
        <Text style={styles.title}>{config.title}</Text>
      </View>

      {config.fields.map((field) => {
        if (field.kind === "list") {
          return (
            <ListFieldEditor
              key={field.key}
              field={field}
              items={(values[field.key] as ListValues) ?? []}
              onChange={(items) => setValues((prev) => ({ ...prev, [field.key]: items }))}
              styles={styles}
              theme={theme}
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
                      values[field.key] === option.value && styles.optionChipSelected,
                    ]}
                    onPress={() => setValues((prev) => ({ ...prev, [field.key]: option.value }))}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        values[field.key] === option.value && styles.optionChipTextSelected,
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
                onChangeText={(text) => setValues((prev) => ({ ...prev, [field.key]: text }))}
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor={theme.colors.outline}
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
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <>
            <Icon name="calculate" size={18} color={theme.colors.onPrimary} />
            <Text style={styles.primaryButtonText}>Hesapla</Text>
          </>
        )}
      </Pressable>

      {result ? (
        <View style={styles.resultBox}>
          {config.resultFields.map((field) => {
            const rawValue = result.outputData[field.key];
            const displayValue =
              field.format === "boolean" ? (rawValue ? "Evet" : "Hayır") : String(rawValue ?? "-");
            return (
              <View key={field.key} style={styles.resultRow}>
                <Text style={styles.resultLabel}>{field.label}</Text>
                <Text style={styles.resultValue}>{displayValue}</Text>
              </View>
            );
          })}

          <Pressable
            style={styles.secondaryButton}
            disabled={generateReport.isPending}
            onPress={() =>
              generateReport.mutate(result.id, {
                onSuccess: () => {
                  Alert.alert("Rapor oluşturuldu", "Raporu Raporlarım ekranından indirebilirsiniz.", [
                    { text: "Tamam", onPress: () => router.push("/reports") },
                  ]);
                },
                onError: (error) =>
                  Alert.alert("Hata", error instanceof Error ? error.message : "Rapor oluşturulamadı."),
              })
            }
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
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      fontFamily: theme.typography.bodyMd.fontFamily,
    },
    optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    optionChip: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: theme.radii.full,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    optionChipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    optionChipText: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    optionChipTextSelected: { color: theme.colors.onPrimary, fontWeight: "600" },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
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
      gap: 10,
    },
    resultRow: { gap: 2 },
    secondaryButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 12,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontWeight: "700",
      fontSize: 14,
    },
    resultLabel: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
    },
    resultValue: {
      fontFamily: theme.typography.amountDisplay.fontFamily,
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    listItem: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.lg,
      padding: 12,
      gap: 8,
      marginTop: 8,
    },
    listItemField: { gap: 4 },
    listItemLabel: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    removeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    removeRowText: {
      color: theme.colors.error,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 12,
      fontWeight: "600",
    },
    addRowButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 8,
    },
    addRowButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontWeight: "700",
      fontSize: 13,
    },
  });
}
