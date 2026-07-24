import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { apiRequest } from "../lib/api-client";
import { useAuthStore } from "../stores/auth-store";

/**
 * Uygulama girişinde bir kez Expo push bildirim izni ister, push
 * token'ı alır ve backend'e kaydeder (Bölüm 21 — Bildirim Altyapısı).
 * Misafir kullanıcılarda çalışmaz (bağlanacak bir hesap yoktur).
 *
 * NOT: `getExpoPushTokenAsync` gerçek bir push token almak için bir
 * EAS proje kimliği gerektirir (`app.json` → `extra.eas.projectId`).
 * Bu ortamda henüz yapılandırılmadığından, prodüksiyona alınmadan önce
 * `eas init` ile bir proje kimliği eklenmelidir; kimlik yoksa bu hook
 * sessizce hiçbir şey yapmaz.
 */
export function usePushNotificationRegistration(): void {
  const status = useAuthStore((state) => state.status);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return;

    let cancelled = false;

    (async () => {
      const permission = await Notifications.getPermissionsAsync();
      let finalStatus = permission.status;
      if (finalStatus !== "granted") {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
      }
      if (finalStatus !== "granted" || cancelled) return;

      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      if (cancelled) return;

      await apiRequest("/notifications/push-token", {
        method: "POST",
        accessToken,
        body: { token },
      });
    })().catch(() => {
      // Push kaydı en iyi çaba (best-effort) niteliğindedir; başarısız
      // olması uygulamanın geri kalanını etkilememelidir.
    });

    return () => {
      cancelled = true;
    };
  }, [status, accessToken]);
}
