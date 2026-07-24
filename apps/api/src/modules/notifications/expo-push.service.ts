import { Injectable } from "@nestjs/common";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";

export interface PushSendResult {
  success: boolean;
  ticketId?: string;
  error?: string;
}

/**
 * Expo push bildirim gönderiminin tek giriş noktası. `AIProvider`/
 * `PaymentProvider`/`OcrProvider` deseninin aksine burada tek bir
 * sağlayıcı (Expo) vardır — mobil uygulama zaten Expo üzerine kuruludur
 * (Bölüm 21 — Bildirim Altyapısı).
 */
@Injectable()
export class ExpoPushService {
  private readonly expo = new Expo();

  isValidToken(token: string): boolean {
    return Expo.isExpoPushToken(token);
  }

  async send(token: string, title: string, body: string): Promise<PushSendResult> {
    if (!this.isValidToken(token)) {
      return { success: false, error: "Geçersiz Expo push token." };
    }

    const message: ExpoPushMessage = { to: token, sound: "default", title, body };

    try {
      const [ticket] = await this.expo.sendPushNotificationsAsync([message]);
      if (!ticket || ticket.status === "error") {
        return {
          success: false,
          error: ticket?.message ?? "Bilinmeyen Expo push hatası.",
        };
      }
      return { success: true, ticketId: ticket.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Bilinmeyen hata.",
      };
    }
  }
}
