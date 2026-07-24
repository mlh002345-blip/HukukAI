import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { useDeleteAccount } from "../../src/hooks/useAuth";

export default function DeleteAccountScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const deleteAccount = useDeleteAccount();
  const [confirmed, setConfirmed] = useState(false);

  const onConfirm = () => {
    Alert.alert(
      "Hesabınızı silmek üzeresiniz",
      "Bu işlem geri alınamaz. Belgeleriniz, hesaplamalarınız ve süreleriniz kalıcı olarak silinecektir.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Kalıcı Olarak Sil",
          style: "destructive",
          onPress: () => {
            deleteAccount.mutate(undefined, {
              onSuccess: () => router.replace("/onboarding"),
              onError: (error) =>
                Alert.alert("Hata", error instanceof Error ? error.message : "Hesap silinemedi."),
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Hesabımı Sil</Text>
      </View>

      <View style={styles.warningBanner}>
        <Icon name="warning" size={20} color={theme.colors.error} />
        <Text style={styles.body}>
          Hesabınızı sildiğinizde tüm belgeleriniz, hesaplamalarınız, süreleriniz ve
          raporlarınız kalıcı olarak silinir. Bu işlem geri alınamaz.
        </Text>
      </View>

      <Pressable style={styles.confirmRow} onPress={() => setConfirmed((prev) => !prev)}>
        <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
          {confirmed ? <Icon name="check" size={14} color={theme.colors.onError} /> : null}
        </View>
        <Text style={styles.confirmText}>
          Hesabımın ve tüm verilerimin kalıcı olarak silineceğini anladım.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.deleteButton, !confirmed && styles.deleteButtonDisabled]}
        disabled={!confirmed || deleteAccount.isPending}
        onPress={onConfirm}
      >
        {deleteAccount.isPending ? (
          <ActivityIndicator color={theme.colors.onError} />
        ) : (
          <Text style={styles.deleteButtonText}>Hesabımı Kalıcı Olarak Sil</Text>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      gap: theme.spacing.stackGapMd,
    },
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
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    warningBanner: {
      flexDirection: "row",
      gap: 10,
      backgroundColor: theme.colors.errorContainer,
      borderRadius: theme.radii.lg,
      padding: 14,
      alignItems: "flex-start",
    },
    body: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onErrorContainer,
      lineHeight: 20,
    },
    confirmRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: { backgroundColor: theme.colors.error, borderColor: theme.colors.error },
    confirmText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
      borderRadius: theme.radii.xl,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 8,
    },
    deleteButtonDisabled: { opacity: 0.5 },
    deleteButtonText: {
      color: theme.colors.onError,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
  });
}
