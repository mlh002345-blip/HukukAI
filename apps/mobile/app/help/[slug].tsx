import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { findHelpArticle, relatedArticles } from "../../src/content/help";

export default function HelpArticleScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = findHelpArticle(slug ?? "");
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  if (!article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.bodyText}>Bu makale bulunamadı.</Text>
      </View>
    );
  }

  const related = relatedArticles(article);
  const displayedHelpfulCount = article.helpfulCount + (feedback === "up" ? 1 : 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
      </View>

      <View style={styles.breadcrumbRow}>
        <Pressable onPress={() => router.push("/help")}>
          <Text style={styles.breadcrumbText}>Yardım Merkezi</Text>
        </Pressable>
        <Icon name="chevron_right" size={14} color={theme.colors.onSurfaceVariant} />
        <Text style={styles.breadcrumbTextCurrent}>{article.title}</Text>
      </View>

      <Text style={styles.title}>{article.title}</Text>
      <View style={styles.metaRow}>
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarBadgeText}>AI</Text>
        </View>
        <Text style={styles.metaText}>HukukAI Destek Ekibi</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{article.updatedLabel}</Text>
      </View>

      {article.sections.map((section, index) => (
        <View key={section.heading ?? index} style={styles.section}>
          {section.heading ? <Text style={styles.sectionHeading}>{section.heading}</Text> : null}
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>Bu makale yardımcı oldu mu?</Text>
        <View style={styles.feedbackRow}>
          <Pressable
            style={[styles.feedbackButton, feedback === "up" && styles.feedbackButtonActive]}
            onPress={() => setFeedback("up")}
          >
            <Icon
              name="thumb_up"
              filled={feedback === "up"}
              size={18}
              color={feedback === "up" ? theme.colors.onSecondary : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.feedbackButtonText,
                feedback === "up" && styles.feedbackButtonTextActive,
              ]}
            >
              Evet
            </Text>
          </Pressable>
          <Pressable
            style={[styles.feedbackButton, feedback === "down" && styles.feedbackButtonActiveError]}
            onPress={() => setFeedback("down")}
          >
            <Icon
              name="thumb_down"
              filled={feedback === "down"}
              size={18}
              color={feedback === "down" ? theme.colors.onError : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.feedbackButtonText,
                feedback === "down" && styles.feedbackButtonTextActiveError,
              ]}
            >
              Hayır
            </Text>
          </Pressable>
        </View>
        <Text style={styles.feedbackCount}>
          {displayedHelpfulCount} kişi bu makaleyi yararlı buldu
        </Text>
      </View>

      {related.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>İlgili Makaleler</Text>
          <View style={styles.relatedList}>
            {related.map((item) => (
              <Pressable
                key={item.slug}
                style={styles.relatedRow}
                onPress={() => router.push(`/help/${item.slug}`)}
              >
                <Icon name="description" size={18} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.relatedText} numberOfLines={1}>
                  {item.title}
                </Text>
                <Icon name="arrow_forward" size={16} color={theme.colors.onSurfaceVariant} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    container: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 48,
      gap: theme.spacing.stackGapMd,
    },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
    headerRow: { flexDirection: "row" },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    breadcrumbRow: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
    breadcrumbText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.secondary,
    },
    breadcrumbTextCurrent: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    title: {
      fontFamily: theme.typography.headlineLgMobile.fontFamily,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    avatarBadge: {
      width: 22,
      height: 22,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarBadgeText: {
      fontSize: 9,
      fontWeight: "700",
      color: theme.colors.onPrimaryContainer,
    },
    metaText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    metaDot: { color: theme.colors.onSurfaceVariant },
    section: { gap: 8 },
    sectionHeading: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    paragraph: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 21,
    },
    bodyText: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    feedbackSection: {
      alignItems: "center",
      gap: 12,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      marginTop: 8,
    },
    feedbackTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    feedbackRow: { flexDirection: "row", gap: 12 },
    feedbackButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    feedbackButtonActive: { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary },
    feedbackButtonActiveError: { backgroundColor: theme.colors.error, borderColor: theme.colors.error },
    feedbackButtonText: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    feedbackButtonTextActive: { color: theme.colors.onSecondary, fontWeight: "700" },
    feedbackButtonTextActiveError: { color: theme.colors.onError, fontWeight: "700" },
    feedbackCount: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    relatedList: { gap: 8 },
    relatedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: theme.radii.lg,
      padding: 12,
    },
    relatedText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurface,
    },
  });
}
