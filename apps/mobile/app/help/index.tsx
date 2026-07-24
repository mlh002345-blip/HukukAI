import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { EmptyState, Icon, useTheme, type Theme } from "@hukukai/ui";
import { HELP_ARTICLES, HELP_CATEGORIES, type HelpCategory } from "../../src/content/help";

export default function HelpCenterScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const isSearching = normalizedQuery.length > 0;
  const searchResults = isSearching
    ? HELP_ARTICLES.filter((article) =>
        article.title.toLocaleLowerCase("tr-TR").includes(normalizedQuery),
      )
    : [];

  const popularArticles = HELP_ARTICLES.filter((article) => article.popular);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
      </View>

      <Text style={styles.heroTitle}>Size nasıl yardımcı olabiliriz?</Text>

      <View style={styles.searchWrap}>
        <Icon name="search" size={20} color={theme.colors.outline} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          placeholder="Bir konu veya soru arayın…"
          placeholderTextColor={theme.colors.outline}
        />
      </View>

      {isSearching ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arama sonuçları</Text>
          {searchResults.length === 0 ? (
            <EmptyState
              title="Sonuç bulunamadı"
              description="Farklı bir kelimeyle tekrar aramayı deneyin."
            />
          ) : (
            <View style={styles.listCard}>
              {searchResults.map((article) => (
                <Pressable
                  key={article.slug}
                  style={styles.listRow}
                  onPress={() => router.push(`/help/${article.slug}`)}
                >
                  <Text style={styles.listRowText}>{article.title}</Text>
                  <Icon name="chevron_right" size={18} color={theme.colors.onSurfaceVariant} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategoriler</Text>
            <View style={styles.categoryGrid}>
              {HELP_CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  styles={styles}
                  theme={theme}
                  onPress={() => setQuery(category.label)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="trending_up" size={18} color={theme.colors.tertiaryContainer} />
              <Text style={styles.sectionTitle}>Popüler Sorular</Text>
            </View>
            <View style={styles.listCard}>
              {popularArticles.map((article) => (
                <Pressable
                  key={article.slug}
                  style={styles.listRow}
                  onPress={() => router.push(`/help/${article.slug}`)}
                >
                  <Text style={styles.listRowText}>{article.title}</Text>
                  <Icon name="chevron_right" size={18} color={theme.colors.onSurfaceVariant} />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destek Ekibiyle İletişim</Text>
            <Pressable
              style={styles.contactRow}
              onPress={() =>
                router.push({
                  pathname: "/help/[slug]",
                  params: { slug: "belge-analizi-nasil-calisir" },
                })
              }
            >
              <Icon name="chat_bubble" size={20} color={theme.colors.primary} />
              <View style={styles.contactTextCol}>
                <Text style={styles.contactTitle}>Sorunuzu bulamadınız mı?</Text>
                <Text style={styles.contactBody}>
                  Yardım Merkezi'ndeki içerikler sorununuzu çözmüyorsa destek ekibimize
                  ulaşabilirsiniz.
                </Text>
              </View>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function CategoryCard({
  category,
  onPress,
  styles,
  theme,
}: {
  category: HelpCategory;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  return (
    <Pressable style={styles.categoryCard} onPress={onPress}>
      <View style={styles.categoryIconWrap}>
        <Icon name={category.icon} size={22} color={theme.colors.primary} />
      </View>
      <Text style={styles.categoryLabel}>{category.label}</Text>
      <Text style={styles.categoryDescription}>{category.description}</Text>
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    container: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 48,
      gap: theme.spacing.stackGapLg,
    },
    headerRow: { flexDirection: "row" },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    heroTitle: {
      fontFamily: theme.typography.headlineLgMobile.fontFamily,
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.onBackground,
      textAlign: "center",
    },
    searchWrap: { position: "relative", justifyContent: "center" },
    searchIcon: { position: "absolute", left: 16, zIndex: 1 },
    searchInput: {
      backgroundColor: theme.colors.surfaceContainer,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.full,
      paddingLeft: 44,
      paddingRight: 16,
      paddingVertical: 14,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    section: { gap: 12 },
    sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    sectionTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    categoryCard: {
      flexBasis: "47%",
      flexGrow: 1,
      backgroundColor: theme.colors.surfaceContainer,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      padding: 16,
      gap: 6,
      minHeight: 130,
      justifyContent: "space-between",
    },
    categoryIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryLabel: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    categoryDescription: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    listCard: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: theme.radii.xl,
      overflow: "hidden",
    },
    listRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    listRowText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurface,
      marginRight: 8,
    },
    contactRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
      backgroundColor: theme.colors.surfaceContainer,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      padding: 16,
    },
    contactTextCol: { flex: 1, gap: 2 },
    contactTitle: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    contactBody: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 17,
    },
  });
}
