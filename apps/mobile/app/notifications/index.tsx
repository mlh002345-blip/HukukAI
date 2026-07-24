import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { EmptyState, Icon, useTheme, type Theme } from "@hukukai/ui";
import type { NotificationSummary } from "@hukukai/types";
import { useNotifications } from "../../src/hooks/usePushNotifications";

type Tab = "history" | "settings";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Yarın";
  if (diffDays === -1) return "Dün";
  if (diffDays > 1) return `${diffDays} gün sonra`;
  return `${Math.abs(diffDays)} gün önce`;
}

function statusOf(notification: NotificationSummary): { label: string; icon: string } {
  if (notification.sentAt) return { label: "Gönderildi", icon: "task_alt" };
  if (notification.failedAt) return { label: "İletilemedi", icon: "error" };
  return { label: "Bekliyor", icon: "schedule" };
}

function NotificationRow({
  notification,
  styles,
  theme,
}: {
  notification: NotificationSummary;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  const status = statusOf(notification);
  const iconColor = notification.failedAt ? theme.colors.error : theme.colors.secondary;
  const iconBg = notification.failedAt ? theme.colors.errorContainer : theme.colors.secondaryContainer;

  return (
    <View style={styles.notifRow}>
      <View style={[styles.notifIconWrap, { backgroundColor: iconBg }]}>
        <Icon name={status.icon} filled size={18} color={iconColor} />
      </View>
      <View style={styles.notifTextCol}>
        <View style={styles.notifHeaderRow}>
          <Text style={styles.notifTitle}>{notification.title}</Text>
          <Text style={styles.notifTime}>{formatRelativeTime(notification.scheduledAt)}</Text>
        </View>
        <Text style={styles.notifBody}>{notification.body}</Text>
        <View style={styles.notifStatusChip}>
          <View style={[styles.notifStatusDot, { backgroundColor: iconColor }]} />
          <Text style={styles.notifStatusText}>{status.label}</Text>
        </View>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [tab, setTab] = useState<Tab>("history");
  const notificationsQuery = useNotifications();
  const notifications = notificationsQuery.data ?? [];

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Bildirim Yönetimi</Text>
          <Text style={styles.subtitle}>
            Süre hatırlatıcılarınızı takip edin ve bildirim ayarlarınızı görüntüleyin.
          </Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, tab === "history" && styles.tabButtonActive]}
          onPress={() => setTab("history")}
        >
          <Text style={[styles.tabButtonText, tab === "history" && styles.tabButtonTextActive]}>
            Bildirimler
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === "settings" && styles.tabButtonActive]}
          onPress={() => setTab("settings")}
        >
          <Text style={[styles.tabButtonText, tab === "settings" && styles.tabButtonTextActive]}>
            Ayarlar
          </Text>
        </Pressable>
      </View>

      {tab === "history" ? (
        <ScrollView contentContainerStyle={styles.content}>
          {notificationsQuery.isLoading ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loadingSpinner} />
          ) : null}

          {!notificationsQuery.isLoading && notifications.length === 0 ? (
            <EmptyState
              title="Henüz bildiriminiz yok"
              description="Bir süre kaydettiğinizde hatırlatıcılarınız burada listelenir."
            />
          ) : null}

          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              styles={styles}
              theme={theme}
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.settingsCard}>
            <View style={styles.settingsCardHeader}>
              <Text style={styles.settingsCardTitle}>İletişim Kanalı</Text>
            </View>
            <View style={styles.settingsRow}>
              <Icon name="notifications_active" size={20} color={theme.colors.primary} />
              <View style={styles.settingsTextCol}>
                <Text style={styles.settingsRowTitle}>Push Bildirimleri</Text>
                <Text style={styles.settingsRowBody}>
                  Giriş yaptığınızda cihazınıza otomatik olarak kayıt edilir; tüm süre
                  hatırlatıcıları buradan iletilir.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsCardHeader}>
              <Text style={styles.settingsCardTitle}>Süre Uyarı Zamanlaması</Text>
              <Text style={styles.settingsCardSubtitle}>
                Her aktif süre için otomatik olarak dört hatırlatıcı planlanır.
              </Text>
            </View>
            <View style={styles.intervalRow}>
              {["7 gün kala", "3 gün kala", "1 gün kala", "Son gün"].map((label) => (
                <View key={label} style={styles.intervalChip}>
                  <Text style={styles.intervalChipText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    headerRow: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTextCol: { flex: 1, gap: 4 },
    title: {
      fontFamily: theme.typography.headlineLgMobile.fontFamily,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    tabRow: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.xl,
      padding: 4,
      marginHorizontal: theme.spacing.containerPadding,
      gap: 4,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: theme.radii.lg,
      alignItems: "center",
    },
    tabButtonActive: { backgroundColor: theme.colors.surfaceContainerLowest },
    tabButtonText: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    tabButtonTextActive: { color: theme.colors.primary, fontWeight: "700" },
    content: {
      padding: theme.spacing.containerPadding,
      gap: 10,
      paddingBottom: 48,
    },
    loadingSpinner: { marginTop: 24 },
    notifRow: {
      flexDirection: "row",
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 14,
    },
    notifIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      alignItems: "center",
      justifyContent: "center",
    },
    notifTextCol: { flex: 1, gap: 4 },
    notifHeaderRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    notifTitle: {
      flex: 1,
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    notifTime: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    notifBody: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 18,
    },
    notifStatusChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: theme.radii.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
      marginTop: 2,
    },
    notifStatusDot: { width: 6, height: 6, borderRadius: 3 },
    notifStatusText: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 10,
      color: theme.colors.onSurface,
    },
    settingsCard: {
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      overflow: "hidden",
      marginBottom: 4,
    },
    settingsCardHeader: {
      padding: 14,
      backgroundColor: theme.colors.surfaceBright,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
      gap: 2,
    },
    settingsCardTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    settingsCardSubtitle: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    settingsRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
      padding: 14,
    },
    settingsTextCol: { flex: 1, gap: 2 },
    settingsRowTitle: {
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    settingsRowBody: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 17,
    },
    intervalRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      padding: 14,
    },
    intervalChip: {
      backgroundColor: theme.colors.secondaryContainer,
      borderRadius: theme.radii.full,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    intervalChipText: {
      fontFamily: theme.typography.bodySmMedium.fontFamily,
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.onSecondaryContainer,
    },
  });
}
