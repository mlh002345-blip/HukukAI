import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  const usageQuery = useUsage();
  const plansQuery = usePlans();
  const subscribe = useSubscribe();
  const purchaseCredits = usePurchaseOneTimeCredits();

  if (usageQuery.isLoading || plansQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
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
          <Text style={styles.usageCardPlan}>{PLAN_LABELS[usage.plan]} Paket</Text>
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
              <Text style={styles.planName}>{PLAN_LABELS[entry.plan]}</Text>
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
                <ActivityIndicator color="#175CD3" />
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
              <ActivityIndicator color="#175CD3" />
            ) : (
              <Text style={styles.planButtonText}>Satın Al</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingTop: 60, gap: 14, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: "700", color: "#101828" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#101828", marginTop: 8 },
  usageCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  usageCardPlan: { fontSize: 16, fontWeight: "700", color: "#175CD3" },
  usageRow: { flexDirection: "row", justifyContent: "space-between" },
  usageLabel: { fontSize: 13, color: "#667085" },
  usageValue: { fontSize: 13, fontWeight: "600", color: "#101828" },
  planCard: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  planCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planName: { fontSize: 15, fontWeight: "700", color: "#101828" },
  planPrice: { fontSize: 14, fontWeight: "700", color: "#175CD3" },
  planDetail: { fontSize: 13, color: "#344054" },
  planButton: {
    borderWidth: 1,
    borderColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  planButtonDisabled: { borderColor: "#D0D5DD" },
  planButtonText: { color: "#175CD3", fontWeight: "700", fontSize: 14 },
});
