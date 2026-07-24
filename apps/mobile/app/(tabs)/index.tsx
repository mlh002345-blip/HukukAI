import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  GlobalSearchBar,
  ToolCard,
  EmptyState,
  Icon,
  useTheme,
  type Theme,
} from "@hukukai/ui";
import { useActiveRole, useAuthStore } from "../../src/stores/auth-store";
import { useToolSearch, useTools } from "../../src/hooks/useTools";
import { useUpcomingDeadlines } from "../../src/hooks/useDeadlines";

const TASK_CARDS = [
  {
    icon: "description",
    label: "Belge Analiz Et",
    description: "AI ile sözleşme & dilekçe tarama",
    variant: "primary" as const,
  },
  {
    icon: "calculate",
    label: "Hesaplama Yap",
    description: "Faiz, tazminat ve harçlar",
    variant: "secondary" as const,
  },
  {
    icon: "schedule",
    label: "Süre Hesapla",
    description: "Yasal itiraz ve başvuru süreleri",
    variant: "surface" as const,
  },
  {
    icon: "edit_document",
    label: "Belge Oluştur",
    description: "Dilekçe ve ihtarname taslakları",
    variant: "surface" as const,
  },
];

const URGENT_THRESHOLD_DAYS = 3;

function daysUntil(dateIso: string): number {
  const diffMs = new Date(`${dateIso}T00:00:00.000Z`).getTime() - Date.now();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const role = useActiveRole();
  const user = useAuthStore((state) => state.user);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const toolsQuery = useTools(role);
  const searchQuery = useToolSearch(query, role);
  const deadlinesQuery = useUpcomingDeadlines(30);

  const isSearching = query.trim().length > 0;
  const recommended = useMemo(() => (toolsQuery.data ?? []).slice(0, 5), [toolsQuery.data]);
  const upcomingDeadlines = useMemo(
    () => (deadlinesQuery.data ?? []).slice(0, 4),
    [deadlinesQuery.data],
  );

  const greetingName = user?.fullName?.split(" ")[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Icon name="gavel" size={22} color={theme.colors.primary} />
          <Text style={styles.brandText}>HukukAI</Text>
        </View>
      </View>

      <Text style={styles.greeting}>
        {greetingName ? `Merhaba, ${greetingName}` : "Ne yapmak istiyorsunuz?"}
      </Text>

      <GlobalSearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Örn: İcra tebligatı geldi, kaç günüm var?"
      />

      {isSearching ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arama sonuçları</Text>
          {searchQuery.isLoading ? <Text style={styles.mutedText}>Aranıyor…</Text> : null}
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
                key={card.label}
                style={[styles.taskCard, taskCardVariantStyle(theme, card.variant)]}
                onPress={() => router.push("/(tabs)/tools")}
              >
                <Icon
                  name={card.icon}
                  filled
                  size={28}
                  color={taskCardIconColor(theme, card.variant)}
                />
                <View>
                  <Text style={[styles.taskLabel, { color: taskCardTextColor(theme, card.variant) }]}>
                    {card.label}
                  </Text>
                  <Text
                    style={[
                      styles.taskDescription,
                      { color: taskCardTextColor(theme, card.variant) },
                    ]}
                  >
                    {card.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Yaklaşan Süreler</Text>
              <Pressable onPress={() => router.push("/(tabs)/calendar")}>
                <Text style={styles.sectionAction}>Tümünü Gör</Text>
              </Pressable>
            </View>

            {upcomingDeadlines.length === 0 ? (
              <EmptyState
                title="Henüz aktif süreniz yok"
                description="Bir belge yükleyin veya süre hesaplama aracını kullanın; süreleriniz burada listelenir."
              />
            ) : (
              <View style={styles.cardList}>
                {upcomingDeadlines.map((deadline) => {
                  const remaining = daysUntil(deadline.adjustedEndDate);
                  const isUrgent = remaining <= URGENT_THRESHOLD_DAYS;
                  return (
                    <Pressable
                      key={deadline.id}
                      style={[styles.deadlineCard, isUrgent && styles.deadlineCardUrgent]}
                      onPress={() => router.push("/(tabs)/calendar")}
                    >
                      <View style={styles.deadlineIconWrap}>
                        <Icon
                          name={isUrgent ? "priority_high" : "event"}
                          size={18}
                          color={isUrgent ? theme.colors.onTertiaryContainer : theme.colors.primary}
                        />
                      </View>
                      <View style={styles.deadlineTextCol}>
                        <Text style={styles.deadlineTitle} numberOfLines={1}>
                          {deadline.title}
                        </Text>
                        <Text style={styles.deadlineSubtitle}>
                          Son: {new Date(deadline.adjustedEndDate).toLocaleDateString("tr-TR")}
                        </Text>
                      </View>
                      <Text style={[styles.deadlineRemaining, isUrgent && styles.deadlineRemainingUrgent]}>
                        {remaining <= 0 ? "Süre doldu" : `${remaining} Gün Kaldı`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Önerilen Araçlar</Text>
              <Pressable onPress={() => router.push("/(tabs)/tools")}>
                <Text style={styles.sectionAction}>Tüm araçları gör</Text>
              </Pressable>
            </View>

            {toolsQuery.isLoading ? <Text style={styles.mutedText}>Yükleniyor…</Text> : null}
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
                  onPress={() => router.push(`/(tabs)/tools?slug=${tool.slug}`)}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function taskCardVariantStyle(theme: Theme, variant: "primary" | "secondary" | "surface") {
  if (variant === "primary") return { backgroundColor: theme.colors.primaryContainer };
  if (variant === "secondary") return { backgroundColor: theme.colors.secondaryContainer };
  return {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  };
}

function taskCardTextColor(theme: Theme, variant: "primary" | "secondary" | "surface") {
  if (variant === "primary") return theme.colors.onPrimaryContainer;
  if (variant === "secondary") return theme.colors.onSecondaryContainer;
  return theme.colors.onSurface;
}

function taskCardIconColor(theme: Theme, variant: "primary" | "secondary" | "surface") {
  if (variant === "primary") return theme.colors.onPrimaryContainer;
  if (variant === "secondary") return theme.colors.onSecondaryContainer;
  return theme.colors.primary;
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 60,
      gap: theme.spacing.stackGapLg,
      paddingBottom: 40,
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    brandText: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 22,
      color: theme.colors.primary,
    },
    greeting: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 20,
      color: theme.colors.onBackground,
    },
    taskGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.stackGapMd,
    },
    taskCard: {
      width: "47%",
      aspectRatio: 1,
      borderRadius: theme.radii.xl,
      padding: 20,
      justifyContent: "space-between",
    },
    taskLabel: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 17,
      lineHeight: 21,
    },
    taskDescription: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      marginTop: 4,
      opacity: 0.85,
    },
    section: { gap: theme.spacing.stackGapMd },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 18,
      color: theme.colors.onBackground,
    },
    sectionAction: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 12,
      color: theme.colors.primary,
    },
    cardList: { gap: theme.spacing.stackGapSm },
    mutedText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    errorText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.error,
    },
    deadlineCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: theme.radii.xl,
      padding: 14,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    deadlineCardUrgent: {
      backgroundColor: theme.colors.tertiaryFixed,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.tertiaryContainer,
      borderColor: "transparent",
    },
    deadlineIconWrap: {
      width: 32,
      height: 32,
      borderRadius: theme.radii.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceContainerHighest,
    },
    deadlineTextCol: { flex: 1, gap: 2 },
    deadlineTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    deadlineSubtitle: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
    },
    deadlineRemaining: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    deadlineRemainingUrgent: {
      color: theme.colors.onTertiaryFixed,
      fontFamily: theme.typography.headlineSm.fontFamily,
    },
  });
}
