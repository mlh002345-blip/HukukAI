import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import type { SubscriptionPlan } from "@hukukai/types";
import {
  usePlans,
  usePurchaseOneTimeCredits,
  useSubscribe,
  useUsage,
} from "../../src/hooks/useBilling";

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE: "Ücretsiz",
  INDIVIDUAL: "Bireysel",
  PRO: "Pro",
  OFFICE: "Ofis",
  ENTERPRISE: "Kurumsal",
};

function formatLimit(value: number | null): string {
  return value === null ? "Sınırsız" : String(value);
}

export default function BillingScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const usageQuery = useUsage();
  const plansQuery = usePlans();
  const subscribe = useSubscribe();
  const purchaseCredits = usePurchaseOneTimeCredits();

  if (usageQuery.isLoading || plansQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const usage = usageQuery.data;
  const plans = plansQuery.data?.plans ?? [];
  const oneTimeCreditPack = plansQuery.data?.oneTimeCreditPack;

  const onSubscribe = (plan: SubscriptionPlan) => {
    subscribe.mutate(plan, {
      onSuccess: () => Alert.alert("Paket güncellendi", `${PLAN_LABELS[plan]} paketine geçtiniz.`),
      onError: (error) =>
        Alert.alert("Hata", error instanceof Error ? error.message : "Paket değiştirilemedi."),
    });
  };

  const onPurchaseCredits = () => {
    purchaseCredits.mutate(undefined, {
      onSuccess: () => Alert.alert("Kredi eklendi", "Tek seferlik analiz krediniz eklendi."),
      onError: (error) =>
        Alert.alert("Hata", error instanceof Error ? error.message : "Kredi satın alınamadı."),
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kullanım ve Paket</Text>

      {usage ? (
        <View style={styles.usageCard}>
          <View style={styles.usageCardHeader}>
            <Icon name="workspace_premium" size={20} color={theme.colors.primary} />
            <Text style={styles.usageCardPlan}>{PLAN_LABELS[usage.plan]} Paket</Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Bu ay belge analizi</Text>
            <Text style={styles.usageValue}>
              {usage.monthlyDocumentAnalysesUsed} /{" "}
              {formatLimit(usage.monthlyDocumentAnalysesLimit)}
            </Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Sayfa sınırı</Text>
            <Text style={styles.usageValue}>{usage.pageLimit}</Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Aktif süre</Text>
            <Text style={styles.usageValue}>
              {usage.activeDeadlineCount} / {formatLimit(usage.activeDeadlineLimit)}
            </Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Tek seferlik kredi</Text>
            <Text style={styles.usageValue}>{usage.oneTimeCreditsRemaining}</Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Rapor filigranı</Text>
            <Text style={styles.usageValue}>{usage.watermarkReports ? "Var" : "Yok"}</Text>
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Paketler</Text>
      {plans.map((entry) => {
        const isCurrent = usage?.plan === entry.plan;
        return (
          <View key={entry.plan} style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <View style={styles.planNameRow}>
                <Text style={styles.planName}>{PLAN_LABELS[entry.plan]}</Text>
                {isCurrent ? (
                  <Icon name="verified_user" filled size={16} color={theme.colors.success} />
                ) : null}
              </View>
              <Text style={styles.planPrice}>
                {Number(entry.monthlyPriceTRY) === 0
                  ? "Ücretsiz"
                  : `${entry.monthlyPriceTRY} TL/ay`}
              </Text>
            </View>
            <Text style={styles.planDetail}>
              Ayda {formatLimit(entry.monthlyDocumentAnalyses)} belge analizi
            </Text>
            <Text style={styles.planDetail}>{entry.pageLimit} sayfa sınırı</Text>
            <Text style={styles.planDetail}>
              {formatLimit(entry.activeDeadlineLimit)} aktif süre
            </Text>
            <Text style={styles.planDetail}>
              {entry.watermarkReports ? "Filigranlı rapor" : "Filigransız rapor"}
            </Text>
            <Pressable
              style={[styles.planButton, isCurrent && styles.planButtonDisabled]}
              disabled={isCurrent || subscribe.isPending}
              onPress={() => onSubscribe(entry.plan)}
            >
              {subscribe.isPending ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <Text style={styles.planButtonText}>
                  {isCurrent ? "Mevcut Paketiniz" : "Bu Pakete Geç"}
                </Text>
              )}
            </Pressable>
          </View>
        );
      })}

      {oneTimeCreditPack ? (
        <View style={styles.planCard}>
          <View style={styles.planCardHeader}>
            <Text style={styles.planName}>Tek Seferlik Kredi</Text>
            <Text style={styles.planPrice}>{oneTimeCreditPack.priceTRY} TL</Text>
          </View>
          <Text style={styles.planDetail}>{oneTimeCreditPack.credits} analiz kredisi</Text>
          <Pressable
            style={styles.planButton}
            disabled={purchaseCredits.isPending}
            onPress={onPurchaseCredits}
          >
            {purchaseCredits.isPending ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={styles.planButtonText}>Satın Al</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <View style={styles.trustBanner}>
        <Icon name="security" size={16} color={theme.colors.onSurfaceVariant} />
        <Text style={styles.trustBannerText}>256-bit SSL güvenli ödeme altyapısı</Text>
      </View>
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      gap: 14,
      paddingBottom: 48,
    },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    sectionTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.onBackground,
      marginTop: 8,
    },
    usageCard: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    usageCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    usageCardPlan: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    usageRow: { flexDirection: "row", justifyContent: "space-between" },
    usageLabel: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    usageValue: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    planCard: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 16,
      gap: 4,
    },
    planCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    planNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    planName: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    planPrice: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    planDetail: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    planButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 10,
    },
    planButtonDisabled: { borderColor: theme.colors.outlineVariant },
    planButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontWeight: "700",
      fontSize: 14,
    },
    trustBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 4,
    },
    trustBannerText: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
  });
}
