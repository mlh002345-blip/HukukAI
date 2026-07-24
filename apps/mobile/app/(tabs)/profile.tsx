import { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { useAuthStore } from "../../src/stores/auth-store";

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Vatandaş",
  LAWYER: "Avukat",
  ACCOUNTANT: "Mali Müşavir",
  ADMIN: "Yönetici",
};

const MENU_ITEMS = [
  { key: "reports", label: "Raporlarım", icon: "description", route: "/reports" as const },
  {
    key: "notifications",
    label: "Bildirim Yönetimi",
    icon: "notifications",
    route: "/notifications" as const,
  },
  { key: "security", label: "Güvenlik Ayarları", icon: "security" },
  {
    key: "billing",
    label: "Abonelik",
    icon: "workspace_premium",
    route: "/billing" as const,
  },
  {
    key: "terms",
    label: "Kullanım Koşulları",
    icon: "description",
    route: "/legal/terms" as const,
  },
  {
    key: "kvkk",
    label: "KVKK Aydınlatma Metni",
    icon: "verified_user",
    route: "/legal/kvkk" as const,
  },
  {
    key: "help",
    label: "Yardım Merkezi",
    icon: "help",
    route: "/help" as const,
  },
];

export default function ProfileScreen() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const guestRole = useAuthStore((state) => state.guestRole);
  const signOut = useAuthStore((state) => state.signOut);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Icon name="person" size={28} color={theme.colors.onPrimaryContainer} />
        </View>
        <Text style={styles.name}>{isGuest ? "Misafir Kullanıcı" : (user?.fullName ?? "—")}</Text>
        {!isGuest ? <Text style={styles.email}>{user?.email}</Text> : null}
        <View style={styles.roleBadge}>
          <Icon name="verified" size={12} color={theme.colors.primary} />
          <Text style={styles.roleBadgeText}>{ROLE_LABELS[user?.role ?? guestRole ?? "CITIZEN"]}</Text>
        </View>
      </View>

      {isGuest ? (
        <Pressable style={styles.primaryButton} onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.primaryButtonText}>
            Verilerinizi kaybetmemek için hesap oluşturun
          </Text>
        </Pressable>
      ) : (
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <MenuRow
              key={item.key}
              label={item.label}
              icon={item.icon}
              styles={styles}
              theme={theme}
              onPress={item.route ? () => router.push(item.route) : undefined}
            />
          ))}
        </View>
      )}

      {!isGuest ? (
        <Pressable style={styles.deleteAccountButton} onPress={() => router.push("/account/delete")}>
          <Text style={styles.deleteAccountText}>Hesabımı Sil</Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="logout" size={16} color={theme.colors.error} />
        <Text style={styles.signOutText}>
          {isGuest ? "Misafir oturumunu kapat" : "Çıkış Yap"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function MenuRow({
  label,
  icon,
  onPress,
  styles,
  theme,
}: {
  label: string;
  icon: string;
  onPress?: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Icon name={icon} size={20} color={theme.colors.onSurfaceVariant} />
      <Text style={styles.menuRowText}>{label}</Text>
      <Icon name="chevron_right" size={20} color={theme.colors.outline} />
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.containerPadding,
      paddingTop: 60,
      gap: theme.spacing.stackGapLg,
      paddingBottom: 40,
    },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 22,
      color: theme.colors.onBackground,
    },
    card: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.xl,
      padding: 20,
      gap: 6,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    name: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 18,
      color: theme.colors.onSurface,
    },
    email: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    roleBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "center",
      backgroundColor: theme.colors.surfaceContainerHigh,
      borderRadius: theme.radii.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginTop: 6,
    },
    roleBadgeText: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 11,
      color: theme.colors.primary,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      paddingVertical: 14,
      alignItems: "center",
      paddingHorizontal: 12,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      textAlign: "center",
    },
    menuList: {
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      overflow: "hidden",
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
    },
    menuRowText: {
      flex: 1,
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    deleteAccountButton: { alignItems: "center", paddingVertical: 8 },
    deleteAccountText: {
      color: theme.colors.error,
      fontSize: 12,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
    },
    signOutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.error,
      borderRadius: theme.radii.xl,
      paddingVertical: 14,
      marginTop: "auto",
    },
    signOutText: {
      color: theme.colors.error,
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 14,
    },
  });
}
