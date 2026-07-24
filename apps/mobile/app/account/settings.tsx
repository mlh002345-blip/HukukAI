import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { useUpdateProfile } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/stores/auth-store";

export default function AccountSettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const onSave = () => {
    if (fullName.trim().length < 2) {
      Alert.alert("Eksik alan", "Ad Soyad en az 2 karakter olmalıdır.");
      return;
    }
    updateProfile.mutate(
      { fullName: fullName.trim(), phone: phone.trim() },
      {
        onSuccess: () => Alert.alert("Kaydedildi", "Profil bilgileriniz güncellendi."),
        onError: (error) =>
          Alert.alert("Hata", error instanceof Error ? error.message : "Güncellenemedi."),
      },
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Hesap ve Güvenlik</Text>
          <Text style={styles.subtitle}>Kişisel bilgilerinizi görüntüleyin ve güncelleyin.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Icon name="person" size={20} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>Profil Bilgileri</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>AD SOYAD</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            placeholder="Ad Soyad"
            placeholderTextColor={theme.colors.outline}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>E-POSTA</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{user?.email}</Text>
            <Icon name="lock" size={16} color={theme.colors.outline} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>TELEFON</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="+90 5XX XXX XX XX"
            placeholderTextColor={theme.colors.outline}
            keyboardType="phone-pad"
          />
        </View>

        <Pressable style={styles.saveButton} onPress={onSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>DEĞİŞİKLİKLERİ KAYDET</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.infoBanner}>
        <Icon name="info" size={18} color={theme.colors.tertiaryContainer} />
        <Text style={styles.infoBannerText}>
          Parola değiştirme ve iki adımlı doğrulama (2FA) bu sürümde henüz desteklenmiyor.
          Parolanızı unuttuysanız giriş ekranındaki "Şifremi Unuttum" bağlantısını kullanın.
        </Text>
      </View>
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    container: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 48,
      gap: theme.spacing.stackGapMd,
    },
    headerRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTextCol: { flex: 1, gap: 4 },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    card: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      padding: theme.spacing.stackGapLg,
      gap: theme.spacing.stackGapMd,
    },
    cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.onSurface,
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
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    readOnlyField: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    readOnlyText: {
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 13,
      alignItems: "center",
      alignSelf: "flex-end",
      paddingHorizontal: 28,
      marginTop: 4,
    },
    saveButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    infoBanner: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: theme.colors.tertiaryFixed,
      borderColor: theme.colors.tertiaryContainer,
      borderWidth: 1,
      borderRadius: theme.radii.lg,
      padding: 12,
      alignItems: "flex-start",
    },
    infoBannerText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onTertiaryFixed,
      lineHeight: 17,
    },
  });
}
