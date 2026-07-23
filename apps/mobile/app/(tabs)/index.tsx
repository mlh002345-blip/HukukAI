import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { GlobalSearchBar, ToolCard, EmptyState } from "@hukukai/ui";
import { useActiveRole, useAuthStore } from "../../src/stores/auth-store";
import { useToolSearch, useTools } from "../../src/hooks/useTools";

const TASK_CARDS = [
  { icon: "📄", label: "Belge Analiz Et", route: "belge-analiz-et" },
  { icon: "🧮", label: "Hesaplama Yap", route: "hesaplama" },
  { icon: "⏱️", label: "Süre Hesapla", route: "sure-hesapla" },
  { icon: "📝", label: "Belge Oluştur", route: "belge-olustur" },
] as const;

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const role = useActiveRole();
  const user = useAuthStore((state) => state.user);

  const toolsQuery = useTools(role);
  const searchQuery = useToolSearch(query, role);

  const isSearching = query.trim().length > 0;
  const recommended = useMemo(
    () => (toolsQuery.data ?? []).slice(0, 5),
    [toolsQuery.data],
  );

  const greetingName = user?.fullName?.split(" ")[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.greeting}>
        {greetingName ? `Merhaba, ${greetingName}` : "Merhaba"}
      </Text>

      <GlobalSearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Ne yapmak istiyorsunuz?"
      />

      {isSearching ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arama sonuçları</Text>
          {searchQuery.isLoading ? (
            <Text style={styles.mutedText}>Aranıyor…</Text>
          ) : null}
          {searchQuery.data && searchQuery.data.results.length === 0 ? (
            <EmptyState
              title="Sonuç bulunamadı"
              description="Farklı bir kelimeyle veya günlük dille tekrar deneyin, örn. 'trafik cezasına itiraz'."
            />
          ) : null}
          <View style={styles.cardList}>
            {(searchQuery.data?.results ?? []).map(({ tool }) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onPress={() => router.push(`/(tabs)/tools?slug=${tool.slug}`)}
              />
            ))}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.taskGrid}>
            {TASK_CARDS.map((card) => (
              <Pressable
                key={card.route}
                style={styles.taskCard}
                onPress={() => router.push("/(tabs)/tools")}
              >
                <Text style={styles.taskIcon}>{card.icon}</Text>
                <Text style={styles.taskLabel}>{card.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Size önerilenler</Text>
              <Pressable onPress={() => router.push("/(tabs)/tools")}>
                <Text style={styles.sectionAction}>Tüm araçları gör</Text>
              </Pressable>
            </View>

            {toolsQuery.isLoading ? (
              <Text style={styles.mutedText}>Yükleniyor…</Text>
            ) : null}
            {toolsQuery.isError ? (
              <Text style={styles.errorText}>
                Araçlar yüklenemedi. API çalışıyor mu kontrol edin.
              </Text>
            ) : null}

            <View style={styles.cardList}>
              {recommended.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onPress={() =>
                    router.push(`/(tabs)/tools?slug=${tool.slug}`)
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yaklaşan süreler</Text>
            <EmptyState
              title="Henüz aktif süreniz yok"
              description="Bir belge yükleyin veya süre hesaplama aracını kullanın; süreleriniz burada listelenir."
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    gap: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#101828",
  },
  taskGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  taskCard: {
    width: "47%",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  taskIcon: {
    fontSize: 24,
  },
  taskLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#101828",
  },
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#101828",
  },
  sectionAction: {
    fontSize: 12,
    color: "#175CD3",
    fontWeight: "600",
  },
  cardList: {
    gap: 10,
  },
  mutedText: {
    fontSize: 13,
    color: "#667085",
  },
  errorText: {
    fontSize: 13,
    color: "#B42318",
  },
});
