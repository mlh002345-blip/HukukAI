import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { loginSchema, type LoginInput } from "@hukukai/validation";
import { useLogin } from "../../src/hooks/useAuth";

export default function LoginScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const loginMutation = useLogin();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: () => router.replace("/(tabs)"),
    });
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="gavel" size={30} color={theme.colors.primary} />
        <Text style={styles.brand}>HukukAI</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Hoş Geldiniz</Text>
          <Text style={styles.heroSubtitle}>Lütfen devam etmek için giriş yapın.</Text>
        </View>

        <View style={styles.card}>
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
                    placeholder="ornek@hukukai.com"
                    placeholderTextColor={theme.colors.outline}
                  />
                )}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>PAROLA</Text>
              <Pressable onPress={() => router.push("/(auth)/forgot-password")} hitSlop={8}>
                <Text style={styles.linkSm}>Şifremi Unuttum</Text>
              </Pressable>
            </View>
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
                    placeholder="••••••••"
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
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            ) : null}
          </View>

          {loginMutation.isError ? (
            <Text style={styles.errorText}>
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Giriş başarısız oldu."}
            </Text>
          ) : null}

          <Pressable
            style={styles.submitButton}
            onPress={onSubmit}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Giriş Yap</Text>
                <Icon name="arrow_forward" size={20} color={theme.colors.onPrimary} />
              </>
            )}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Hesabınız yok mu? </Text>
            <Pressable onPress={() => router.push("/(auth)/role-selection")} hitSlop={8}>
              <Text style={styles.footerLink}>Kayıt Ol</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: theme.spacing.stackGapLg,
    },
    brand: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.containerPadding,
      paddingBottom: 56,
    },
    heroBlock: { alignItems: "center", gap: 8, marginBottom: theme.spacing.stackGapLg },
    heroTitle: {
      fontFamily: theme.typography.displayLg.fontFamily,
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    heroSubtitle: {
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
    },
    card: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      padding: theme.spacing.stackGapLg,
      gap: theme.spacing.stackGapMd,
    },
    field: { gap: 6 },
    labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    label: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      letterSpacing: 0.5,
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
    },
    linkSm: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      color: theme.colors.secondary,
    },
    inputWrap: {
      position: "relative",
      justifyContent: "center",
    },
    inputIcon: {
      position: "absolute",
      left: 14,
      zIndex: 1,
    },
    trailingIcon: {
      position: "absolute",
      right: 14,
    },
    input: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.full,
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
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 4,
    },
    submitButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 4,
    },
    footerText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    footerLink: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.secondary,
    },
  });
}
