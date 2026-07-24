import { useMemo, useState } from "react";
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
import { forgotPasswordSchema } from "@hukukai/validation";
import { apiRequest } from "../../src/lib/api-client";

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );

  const onSubmit = async () => {
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: parsed.data,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
        <Icon name="arrow_back" size={22} color={theme.colors.onSurface} />
      </Pressable>

      <Text style={styles.title}>Parolamı Unuttum</Text>
      <Text style={styles.subtitle}>
        Kayıtlı e-posta adresinizi girin, parola sıfırlama bağlantısı
        gönderelim.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>E-POSTA ADRESİ</Text>
        <View style={styles.inputWrap}>
          <Icon name="mail" size={20} color={theme.colors.outline} style={styles.inputIcon} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="ornek@eposta.com"
            placeholderTextColor={theme.colors.outline}
          />
        </View>
      </View>

      {status === "sent" ? (
        <View style={styles.successBanner}>
          <Icon name="check_circle" filled size={18} color={theme.colors.success} />
          <Text style={styles.successText}>
            E-postanıza bir bağlantı gönderdik. Gelen kutunuzu kontrol edin.
          </Text>
        </View>
      ) : null}
      {status === "error" ? (
        <Text style={styles.errorText}>
          Geçerli bir e-posta adresi girin veya tekrar deneyin.
        </Text>
      ) : null}

      <Pressable
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.submitButtonText}>Bağlantı Gönder</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.back()} style={styles.footerLinkWrap}>
        <Text style={styles.link}>Girişe dön</Text>
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
    backButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 19,
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
      borderRadius: theme.radii.full,
      paddingLeft: 40,
      paddingRight: 16,
      paddingVertical: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    successBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.successContainer,
      borderRadius: theme.radii.lg,
      padding: 12,
    },
    successText: {
      flex: 1,
      color: theme.colors.onSuccessContainer,
      fontSize: 13,
      fontFamily: theme.typography.bodyMd.fontFamily,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      fontFamily: theme.typography.bodyMd.fontFamily,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 4,
    },
    submitButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
    footerLinkWrap: { alignItems: "center", marginTop: 4 },
    link: {
      color: theme.colors.secondary,
      fontSize: 13,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
    },
  });
}
