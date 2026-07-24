import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { KVKK_SECTIONS, LEGAL_DRAFT_NOTICE } from "../../src/content/legal";

export default function KvkkScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>KVKK Aydınlatma Metni</Text>
      </View>
      <View style={styles.draftBanner}>
        <Icon name="info" size={16} color={theme.colors.tertiaryContainer} />
        <Text style={styles.draftBannerText}>{LEGAL_DRAFT_NOTICE}</Text>
      </View>
      {KVKK_SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.sectionHeading}>{section.heading}</Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 48,
      gap: theme.spacing.stackGapMd,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      flex: 1,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    draftBanner: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: theme.colors.tertiaryFixed,
      borderColor: theme.colors.tertiaryContainer,
      borderWidth: 1,
      borderRadius: theme.radii.lg,
      padding: 12,
      alignItems: "flex-start",
    },
    draftBannerText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onTertiaryFixed,
      lineHeight: 17,
    },
    section: { gap: 6 },
    sectionHeading: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    paragraph: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 19,
    },
  });
}
