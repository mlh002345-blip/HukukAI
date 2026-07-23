import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

const SLIDES = [
  {
    title: "Belgenizi yükleyin",
    description:
      "İcra tebligatı, mahkeme kararı, vergi yazısı veya trafik cezası — hangi belge olursa olsun sistem sizin için okusun.",
  },
  {
    title: "Süreleri kaçırmayın",
    description:
      "Belgenizden çıkarılan tarihlere göre itiraz, ödeme ve dava süreleri otomatik hesaplanır.",
  },
  {
    title: "Hesaplama ve rapor oluşturun",
    description:
      "Faiz, icra borcu, kira artışı gibi hesaplamaları yapın; sonuçları PDF rapor olarak kaydedin.",
  },
];

export default function OnboardingScreen() {
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
      <View style={styles.dotsRow}>
        {SLIDES.map((s, index) => (
          <View
            key={s.title}
            style={[styles.dot, index === step && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{slide?.title}</Text>
        <Text style={styles.description}>{slide?.description}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push("/(auth)/role-selection")}
          hitSlop={8}
        >
          <Text style={styles.skip}>Atla</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={next}>
          <Text style={styles.nextButtonText}>
            {isLast ? "Başla" : "Devam"}
          </Text>
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
    justifyContent: "space-between",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 48,
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E4E7EC",
  },
  dotActive: {
    backgroundColor: "#175CD3",
    width: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#101828",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#475467",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 24,
  },
  skip: {
    fontSize: 14,
    color: "#667085",
  },
  nextButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
