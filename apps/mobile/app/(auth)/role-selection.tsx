import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { UserRole } from "@hukukai/types";
import { useAuthStore } from "../../src/stores/auth-store";

const ROLE_OPTIONS: Array<{ role: UserRole; label: string; hint: string }> = [
  {
    role: "CITIZEN",
    label: "Vatandaş",
    hint: "Belgemi anlamak ve sürelerimi takip etmek istiyorum",
  },
  {
    role: "LAWYER",
    label: "Avukat",
    hint: "Dava, icra ve süre işlerimi hızlandırmak istiyorum",
  },
  {
    role: "ACCOUNTANT",
    label: "Mali Müşavir",
    hint: "Vergi, SGK ve mali hesaplamalar yapmak istiyorum",
  },
];

/**
 * Bölüm 5.1: "Kullanıcı rolü bir erişim duvarı değildir." Bu ekranda
 * seçilen rol yalnızca öneri sıralamasını belirler; sonraki ekranlarda
 * tüm araçlar her zaman görünür kalır.
 */
export default function RoleSelectionScreen() {
  const [selected, setSelected] = useState<UserRole>("CITIZEN");
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sizi nasıl tanımlarsınız?</Text>
      <Text style={styles.subtitle}>
        Bu seçim hiçbir aracı gizlemez; yalnızca size önerdiğimiz araçların
        sırasını belirler. Dilediğiniz zaman tüm araçlara erişebilirsiniz.
      </Text>

      <View style={styles.optionsList}>
        {ROLE_OPTIONS.map((option) => (
          <Pressable
            key={option.role}
            onPress={() => setSelected(option.role)}
            style={[
              styles.optionCard,
              selected === option.role && styles.optionCardSelected,
            ]}
          >
            <Text
              style={[
                styles.optionLabel,
                selected === option.role && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            <Text style={styles.optionHint}>{option.hint}</Text>
          </Pressable>
        ))}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 64,
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#101828",
  },
  subtitle: {
    fontSize: 13,
    color: "#667085",
    lineHeight: 19,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 1.5,
    borderColor: "#E4E7EC",
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  optionCardSelected: {
    borderColor: "#175CD3",
    backgroundColor: "#EFF4FF",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#101828",
  },
  optionLabelSelected: {
    color: "#175CD3",
  },
  optionHint: {
    fontSize: 12,
    color: "#667085",
  },
  footer: {
    marginTop: "auto",
    gap: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },
  secondaryButtonText: {
    color: "#101828",
    fontWeight: "600",
    fontSize: 15,
  },
  guestLink: {
    color: "#667085",
    fontSize: 13,
    textDecorationLine: "underline",
    marginTop: 4,
  },
});
