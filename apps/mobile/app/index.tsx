import { useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { useAuthStore } from "../src/stores/auth-store";

/**
 * SplashScreen — Bölüm 9.1 Onboarding akışının giriş noktası.
 * Oturum durumuna göre doğrudan ilgili ekrana yönlendirir.
 */
export default function SplashScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === "authenticated" || status === "guest") {
      router.replace("/(tabs)");
    } else if (status === "unauthenticated") {
      router.replace("/onboarding");
    }
  }, [status]);

  return (
    <View style={styles.container}>
      <Icon name="gavel" filled size={48} color={theme.colors.onPrimary} />
      <Text style={styles.logo}>HukukAI</Text>
      <Text style={styles.tagline}>Belgenizi yükleyin, süreleri kaçırmayın.</Text>
      <ActivityIndicator style={styles.spinner} color={theme.colors.onPrimary} />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
    },
    logo: {
      fontFamily: theme.typography.displayLg.fontFamily,
      fontSize: 32,
      fontWeight: "800",
      color: theme.colors.onPrimary,
    },
    tagline: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onPrimary,
      opacity: 0.85,
      textAlign: "center",
    },
    spinner: {
      marginTop: 24,
    },
  });
}
