import { useMemo, useState } from "react";
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
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { useCreateDeadline } from "../../src/hooks/useDeadlines";
import { parseTurkishDate } from "../../src/lib/turkish-date";

export default function CustomDeadlineScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="close" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Özel Süre Ekle</Text>
        <View style={styles.backButtonSpacer} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Başlık</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Örn. Sözleşme yenileme"
          placeholderTextColor={theme.colors.outline}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Son Gün</Text>
        <View style={styles.inputWrap}>
          <Icon name="event" size={20} color={theme.colors.outline} style={styles.inputIcon} />
          <TextInput
            value={dateText}
            onChangeText={setDateText}
            style={[styles.input, styles.inputWithLeadingIcon]}
            placeholder="GG.AA.YYYY"
            placeholderTextColor={theme.colors.outline}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {createDeadline.isError ? (
        <Text style={styles.errorText}>
          {createDeadline.error instanceof Error ? createDeadline.error.message : "Kaydedilemedi."}
        </Text>
      ) : null}

      <Pressable
        style={styles.primaryButton}
        onPress={onSubmit}
        disabled={createDeadline.isPending}
      >
        {createDeadline.isPending ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.primaryButtonText}>Kaydet</Text>
        )}
      </Pressable>
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
    inputWrap: { position: "relative", justifyContent: "center" },
    inputIcon: { position: "absolute", left: 14, zIndex: 1 },
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
    inputWithLeadingIcon: { paddingLeft: 40 },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 4,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
  });
}
