import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../src/stores/auth-store";

/**
 * SplashScreen — Bölüm 9.1 Onboarding akışının giriş noktası.
 * Oturum durumuna göre doğrudan ilgili ekrana yönlendirir.
 */
export default function SplashScreen() {
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
      <Text style={styles.logo}>HukukAI</Text>
      <Text style={styles.tagline}>
        Belgenizi yükleyin, süreleri kaçırmayın.
      </Text>
      <ActivityIndicator style={styles.spinner} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#175CD3",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tagline: {
    fontSize: 14,
    color: "#D1E0FF",
    textAlign: "center",
  },
  spinner: {
    marginTop: 24,
  },
});
