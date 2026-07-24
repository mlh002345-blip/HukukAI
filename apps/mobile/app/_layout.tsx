import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { queryClient } from "../src/lib/query-client";
import { useAuthStore } from "../src/stores/auth-store";
import { usePushNotificationRegistration } from "../src/hooks/usePushNotifications";
import { Sentry } from "../src/lib/sentry";
import { ThemeProvider, useTheme } from "../src/theme/ThemeProvider";
import { useAppFonts } from "../src/theme/useAppFonts";

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const theme = useTheme();
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  usePushNotificationRegistration();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </QueryClientProvider>
  );
}

function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
