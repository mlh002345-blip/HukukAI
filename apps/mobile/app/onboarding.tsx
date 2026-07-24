import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";

const SLIDES = [
  {
    title: "Belgenizi yükleyin",
    description:
      "İcra tebligatı, mahkeme kararı, vergi yazısı veya trafik cezası — hangi belge olursa olsun sistem sizin için okusun.",
    icon: "document_scanner",
  },
  {
    title: "Süreleri kaçırmayın",
    description:
      "Belgenizden çıkarılan tarihlere göre itiraz, ödeme ve dava süreleri otomatik hesaplanır.",
    icon: "event_note",
  },
  {
    title: "Hesaplama ve rapor oluşturun",
    description:
      "Faiz, icra borcu, kira artışı gibi hesaplamaları yapın; sonuçları PDF rapor olarak kaydedin.",
    icon: "analytics",
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      router.push("/(auth)/role-selection");
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Icon name="gavel" size={26} color={theme.colors.primary} />
          <Text style={styles.brand}>HukukAI</Text>
        </View>
        <Pressable onPress={() => router.push("/(auth)/role-selection")} hitSlop={8}>
          <Text style={styles.skip}>Atla</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name={slide?.icon ?? "gavel"} size={72} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>{slide?.title}</Text>
        <Text style={styles.description}>{slide?.description}</Text>
      </View>

      <View style={styles.dotsRow}>
        {SLIDES.map((s, index) => (
          <View
            key={s.title}
            style={[styles.dot, index === step && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.nextButton} onPress={next}>
          <Text style={styles.nextButtonText}>{isLast ? "Başla" : "Devam Et"}</Text>
          <Icon name="arrow_forward" size={20} color={theme.colors.onPrimary} />
        </Pressable>
        <View style={styles.securityRow}>
          <Icon name="security" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.securityText}>
            Verileriniz KVKK kapsamında korunmaktadır
          </Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 24,
      justifyContent: "space-between",
    },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    brand: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    skip: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    content: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    iconCircle: {
      width: 160,
      height: 160,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    title: {
      fontFamily: theme.typography.headlineLgMobile.fontFamily,
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.primary,
      textAlign: "center",
    },
    description: {
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 22,
      paddingHorizontal: 12,
      maxWidth: 300,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 6,
      alignSelf: "center",
      marginBottom: theme.spacing.stackGapLg,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceContainerHigh,
    },
    dotActive: {
      backgroundColor: theme.colors.primary,
      width: 20,
    },
    footer: { gap: theme.spacing.stackGapMd, alignItems: "center" },
    nextButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 15,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    nextButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
    securityRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    securityText: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
  });
}
