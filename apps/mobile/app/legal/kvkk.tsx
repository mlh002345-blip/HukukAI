import { ScrollView, StyleSheet, Text, View } from "react-native";
import { KVKK_SECTIONS, LEGAL_DRAFT_NOTICE } from "../../src/content/legal";

export default function KvkkScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>KVKK Aydınlatma Metni</Text>
      <View style={styles.draftBanner}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48, gap: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#101828" },
  draftBanner: {
    backgroundColor: "#FFFAEB",
    borderWidth: 1,
    borderColor: "#FEDF89",
    borderRadius: 10,
    padding: 12,
  },
  draftBannerText: { fontSize: 12, color: "#B54708" },
  section: { gap: 6 },
  sectionHeading: { fontSize: 14, fontWeight: "700", color: "#101828" },
  paragraph: { fontSize: 13, color: "#344054", lineHeight: 19 },
});
