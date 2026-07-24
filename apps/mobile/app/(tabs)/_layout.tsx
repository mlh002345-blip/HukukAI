import { Tabs } from "expo-router";
import { Icon, useTheme } from "@hukukai/ui";

/**
 * Ana Navigasyon — Bölüm 6: Ana Sayfa, Araçlar, Dosyalarım, Takvim, Profil.
 * Görev odaklıdır; meslek/rol bazlı ayrı sekmeler YOKTUR (Bölüm 29 madde 3).
 * Tasarım: Lexi-Trust Framework / Obsidian — Material Symbols ikonları.
 */
export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.labelMd.fontFamily,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ focused, color }) => (
            <Icon name="home" filled={focused} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Araçlar",
          tabBarIcon: ({ focused, color }) => (
            <Icon name="build_circle" filled={focused} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: "Dosyalarım",
          tabBarIcon: ({ focused, color }) => (
            <Icon name="folder_open" filled={focused} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Takvim",
          tabBarIcon: ({ focused, color }) => (
            <Icon name="calendar_today" filled={focused} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused, color }) => (
            <Icon name="person" filled={focused} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
