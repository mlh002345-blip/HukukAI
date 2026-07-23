import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/stores/auth-store";

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Vatandaş",
  LAWYER: "Avukat",
  ACCOUNTANT: "Mali Müşavir",
  ADMIN: "Yönetici",
};

export default function ProfileScreen() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const guestRole = useAuthStore((state) => state.guestRole);
  const signOut = useAuthStore((state) => state.signOut);

  const isGuest = status === "guest";

  const handleSignOut = () => {
    Alert.alert("Çıkış yap", "Oturumunuzu kapatmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <Text style={styles.name}>
          {isGuest ? "Misafir Kullanıcı" : (user?.fullName ?? "—")}
        </Text>
        {!isGuest ? <Text style={styles.email}>{user?.email}</Text> : null}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {ROLE_LABELS[user?.role ?? guestRole ?? "CITIZEN"]}
          </Text>
        </View>
      </View>

      {isGuest ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.primaryButtonText}>
            Verilerinizi kaybetmemek için hesap oluşturun
          </Text>
        </Pressable>
      ) : (
        <View style={styles.menuList}>
          <MenuRow label="Raporlarım" onPress={() => router.push("/reports")} />
          <MenuRow label="Bildirim Tercihleri" />
          <MenuRow label="Güvenlik Ayarları" />
          <MenuRow label="Abonelik" onPress={() => router.push("/billing")} />
          <MenuRow label="Kullanım Koşulları" onPress={() => router.push("/legal/terms")} />
          <MenuRow
            label="KVKK Aydınlatma Metni"
            onPress={() => router.push("/legal/kvkk")}
          />
        </View>
      )}

      {!isGuest ? (
        <Pressable
          style={styles.deleteAccountButton}
          onPress={() => router.push("/account/delete")}
        >
          <Text style={styles.deleteAccountText}>Hesabımı Sil</Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>
          {isGuest ? "Misafir oturumunu kapat" : "Çıkış Yap"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function MenuRow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Text style={styles.menuRowText}>{label}</Text>
      <Text style={styles.menuRowChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20, paddingTop: 60, gap: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "700", color: "#101828" },
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  name: { fontSize: 18, fontWeight: "700", color: "#101828" },
  email: { fontSize: 13, color: "#667085" },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF4FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  roleBadgeText: { fontSize: 11, fontWeight: "600", color: "#175CD3" },
  primaryButton: {
    backgroundColor: "#175CD3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  menuList: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
  },
  menuRowText: { fontSize: 14, color: "#101828" },
  menuRowChevron: { fontSize: 16, color: "#98A2B3" },
  deleteAccountButton: { alignItems: "center", paddingVertical: 8 },
  deleteAccountText: { color: "#B42318", fontSize: 12, fontWeight: "500" },
  signOutButton: {
    borderWidth: 1,
    borderColor: "#FDA29B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: "auto",
  },
  signOutText: { color: "#B42318", fontWeight: "600", fontSize: 14 },
});
