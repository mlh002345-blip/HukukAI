import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CategoryChip,
  EmptyState,
  GlobalSearchBar,
  ToolCard,
} from "@hukukai/ui";
import type { ToolDefinition } from "@hukukai/types";
import { useActiveRole } from "../../src/stores/auth-store";
import {
  useToolCategories,
  useToolSearch,
  useTools,
} from "../../src/hooks/useTools";

export default function ToolsScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const role = useActiveRole();

  const toolsQuery = useTools(role);
  const categoriesQuery = useToolCategories();
  const searchQuery = useToolSearch(query, role);

  const isSearching = query.trim().length > 0;

  const filteredTools = useMemo(() => {
    const all = toolsQuery.data ?? [];
    if (!category) return all;
    return all.filter((tool) => tool.categories.includes(category as never));
  }, [toolsQuery.data, category]);

  const displayedTools: ToolDefinition[] = isSearching
    ? (searchQuery.data?.results ?? []).map((r) => r.tool)
    : filteredTools;

  const onToolPress = (tool: ToolDefinition) => {
    // Faz 5-6'da ilgili CalculatorForm/DeadlineCalculator ekranına
    // yönlendirilecektir; bugün için araç rotası bilgilendirilir.
    Alert.alert(tool.name, tool.shortDescription);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Araçlar</Text>

      <GlobalSearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Araç ara…"
      />

      {!isSearching ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <CategoryChip
            label="Tümü"
            selected={category === null}
            onPress={() => setCategory(null)}
          />
          {(categoriesQuery.data ?? []).map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.cardList}>
        {toolsQuery.isLoading && !isSearching ? (
          <Text style={styles.mutedText}>Yükleniyor…</Text>
        ) : null}

        {displayedTools.length === 0 &&
        !toolsQuery.isLoading &&
        !searchQuery.isLoading ? (
          <EmptyState
            title="Araç bulunamadı"
            description="Farklı bir kategori veya arama terimi deneyin."
          />
        ) : null}

        {displayedTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onPress={() => onToolPress(tool)}
          />
        ))}
      </View>
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
    gap: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#101828",
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  cardList: {
    gap: 10,
  },
  mutedText: {
    fontSize: 13,
    color: "#667085",
  },
});
