import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>
  );
}

/**
 * Ana Navigasyon — Bölüm 6: Ana Sayfa, Araçlar, Dosyalarım, Takvim, Profil.
 * Görev odaklıdır; meslek/rol bazlı ayrı sekmeler YOKTUR (Bölüm 29 madde 3).
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#175CD3",
        tabBarInactiveTintColor: "#98A2B3",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="🏠" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Araçlar",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="🧰" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: "Dosyalarım",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="🗂️" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Takvim",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="📅" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
