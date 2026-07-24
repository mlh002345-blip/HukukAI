import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import type { UserRole } from "@hukukai/types";
import { useAuthStore } from "../../src/stores/auth-store";

const ROLE_OPTIONS: Array<{ role: UserRole; label: string; hint: string; icon: string }> = [
  {
    role: "CITIZEN",
    label: "Vatandaş",
    hint: "Belgemi anlamak ve sürelerimi takip etmek istiyorum",
    icon: "person",
  },
  {
    role: "LAWYER",
    label: "Avukat",
    hint: "Dava, icra ve süre işlerimi hızlandırmak istiyorum",
    icon: "gavel",
  },
  {
    role: "ACCOUNTANT",
    label: "Mali Müşavir",
    hint: "Vergi, SGK ve mali hesaplamalar yapmak istiyorum",
    icon: "account_balance",
  },
];

/**
 * Bölüm 5.1: "Kullanıcı rolü bir erişim duvarı değildir." Bu ekranda
 * seçilen rol yalnızca öneri sıralamasını belirler; sonraki ekranlarda
 * tüm araçlar her zaman görünür kalır.
 */
export default function RoleSelectionScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selected, setSelected] = useState<UserRole>("CITIZEN");
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="gavel" size={26} color={theme.colors.primary} />
        <Text style={styles.brand}>HukukAI</Text>
      </View>

      <Text style={styles.title}>Sizi nasıl tanımlarsınız?</Text>
      <Text style={styles.subtitle}>
        Bu seçim hiçbir aracı gizlemez; yalnızca size önerdiğimiz araçların
        sırasını belirler. Dilediğiniz zaman tüm araçlara erişebilirsiniz.
      </Text>

      <View style={styles.optionsList}>
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selected === option.role;
          return (
            <Pressable
              key={option.role}
              onPress={() => setSelected(option.role)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            >
              {isSelected ? (
                <View style={styles.checkBadge}>
                  <Icon name="check_circle" filled size={18} color={theme.colors.primary} />
                </View>
              ) : null}
              <View
                style={[
                  styles.optionIconWrap,
                  isSelected && styles.optionIconWrapSelected,
                ]}
              >
                <Icon
                  name={option.icon}
                  size={26}
                  color={isSelected ? theme.colors.onPrimaryContainer : theme.colors.primary}
                />
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
              <Text style={styles.optionHint}>{option.hint}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: "/(auth)/register",
              params: { role: selected },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Kayıt Ol</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.secondaryButtonText}>Zaten hesabım var</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            continueAsGuest(selected);
            router.replace("/(tabs)");
          }}
          hitSlop={8}
        >
          <Text style={styles.guestLink}>Misafir olarak devam et</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      gap: theme.spacing.stackGapMd,
    },
    header: { flexDirection: "row", alignItems: "center", gap: 8 },
    brand: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    title: {
      fontFamily: theme.typography.headlineLgMobile.fontFamily,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 19,
    },
    optionsList: { gap: 12 },
    optionCard: {
      position: "relative",
      borderWidth: 1.5,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 16,
      gap: 4,
      alignItems: "center",
    },
    optionCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceContainer,
    },
    checkBadge: {
      position: "absolute",
      top: 12,
      right: 12,
    },
    optionIconWrap: {
      width: 52,
      height: 52,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    optionIconWrapSelected: {
      backgroundColor: theme.colors.primaryContainer,
    },
    optionLabel: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    optionLabelSelected: { color: theme.colors.primary },
    optionHint: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
    footer: { marginTop: "auto", gap: 12, alignItems: "center" },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 15,
      width: "100%",
      alignItems: "center",
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontWeight: "700",
      fontSize: 15,
    },
    secondaryButton: {
      borderRadius: theme.radii.full,
      paddingVertical: 15,
      width: "100%",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    secondaryButtonText: {
      color: theme.colors.onSurface,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontWeight: "600",
      fontSize: 15,
    },
    guestLink: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 13,
      textDecorationLine: "underline",
      marginTop: 4,
    },
  });
}
