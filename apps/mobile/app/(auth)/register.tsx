import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { registerSchema, type RegisterInput } from "@hukukai/validation";
import type { UserRole } from "@hukukai/types";
import { useRegister } from "../../src/hooks/useAuth";
import { LEGAL_TEXT_VERSION } from "../../src/content/legal";

export default function RegisterScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const params = useLocalSearchParams<{ role?: string }>();
  const registrableRoles: Array<Exclude<UserRole, "ADMIN">> = [
    "CITIZEN",
    "LAWYER",
    "ACCOUNTANT",
  ];
  const initialRole = registrableRoles.includes(
    params.role as Exclude<UserRole, "ADMIN">,
  )
    ? (params.role as Exclude<UserRole, "ADMIN">)
    : "CITIZEN";
  const registerMutation = useRegister();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: initialRole,
      acceptedTermsVersion: "",
      acceptedKvkkVersion: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!termsAccepted) return;
    registerMutation.mutate(
      {
        ...values,
        acceptedTermsVersion: LEGAL_TEXT_VERSION,
        acceptedKvkkVersion: LEGAL_TEXT_VERSION,
      },
      { onSuccess: () => router.replace("/(tabs)") },
    );
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Icon name="gavel" size={30} color={theme.colors.primary} />
        <Text style={styles.brand}>HukukAI</Text>
      </View>

      <Text style={styles.title}>Yeni Hesap Oluştur</Text>
      <Text style={styles.subtitle}>
        Profesyonel hukuk araçlarına erişmek için kayıt olun.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>AD SOYAD</Text>
        <View style={styles.inputWrap}>
          <Icon name="person" size={20} color={theme.colors.outline} style={styles.inputIcon} />
          <Controller
            control={control}
            name="fullName"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.input}
                placeholder="Örn: Av. Selin Yılmaz"
                placeholderTextColor={theme.colors.outline}
              />
            )}
          />
        </View>
        {errors.fullName ? <Text style={styles.errorText}>{errors.fullName.message}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>E-POSTA ADRESİ</Text>
        <View style={styles.inputWrap}>
          <Icon name="mail" size={20} color={theme.colors.outline} style={styles.inputIcon} />
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="isim@sirket.com"
                placeholderTextColor={theme.colors.outline}
              />
            )}
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>PAROLA</Text>
        <View style={styles.inputWrap}>
          <Icon name="lock" size={20} color={theme.colors.outline} style={styles.inputIcon} />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={[styles.input, styles.inputWithTrailingIcon]}
                secureTextEntry={!passwordVisible}
                placeholder="En az 10 karakter"
                placeholderTextColor={theme.colors.outline}
              />
            )}
          />
          <Pressable
            style={styles.trailingIcon}
            onPress={() => setPasswordVisible((v) => !v)}
            hitSlop={8}
          >
            <Icon
              name={passwordVisible ? "visibility_off" : "visibility"}
              size={20}
              color={theme.colors.outline}
            />
          </Pressable>
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}
      </View>

      <View style={styles.termsRow}>
        <Switch value={termsAccepted} onValueChange={setTermsAccepted} />
        <Text style={styles.termsText}>
          <Text onPress={() => router.push("/legal/terms")} style={styles.termsLink}>
            Kullanım Koşulları
          </Text>
          'nı ve{" "}
          <Text onPress={() => router.push("/legal/kvkk")} style={styles.termsLink}>
            KVKK Aydınlatma Metni
          </Text>
          'ni okudum, kabul ediyorum.
        </Text>
      </View>

      {registerMutation.isError ? (
        <Text style={styles.errorText}>
          {registerMutation.error instanceof Error
            ? registerMutation.error.message
            : "Kayıt başarısız oldu."}
        </Text>
      ) : null}

      <Pressable
        style={[styles.submitButton, !termsAccepted && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={!termsAccepted || registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <>
            <Text style={styles.submitButtonText}>Kayıt Ol</Text>
            <Icon name="arrow_forward" size={20} color={theme.colors.onPrimary} />
          </>
        )}
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
        <Pressable onPress={() => router.push("/(auth)/login")} hitSlop={8}>
          <Text style={styles.footerLink}>Giriş Yap</Text>
        </Pressable>
      </View>
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
    header: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", marginBottom: 4 },
    brand: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginTop: -8,
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
    trailingIcon: { position: "absolute", right: 14 },
    input: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      paddingLeft: 40,
      paddingRight: 16,
      paddingVertical: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    inputWithTrailingIcon: { paddingRight: 44 },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
    },
    termsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    termsText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 17,
    },
    termsLink: {
      color: theme.colors.secondary,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 4,
    },
    submitButtonDisabled: { opacity: 0.5 },
    submitButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
    footerRow: { flexDirection: "row", justifyContent: "center", paddingTop: 8 },
    footerText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    footerLink: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.primary,
    },
  });
}
