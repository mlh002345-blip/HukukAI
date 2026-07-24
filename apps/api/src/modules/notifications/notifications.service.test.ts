import { describe, expect, it, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

function createPrismaMock() {
  return {
    user: { update: vi.fn() },
    notification: { findMany: vi.fn(), update: vi.fn() },
  };
}

function createExpoPushMock() {
  return {
    isValidToken: vi.fn().mockReturnValue(true),
    send: vi.fn(),
  };
}

function buildService() {
  const prisma = createPrismaMock();
  const expoPush = createExpoPushMock();
  const service = new NotificationsService(prisma as never, expoPush as never);
  return { service, prisma, expoPush };
}

describe("NotificationsService.findAllForUser", () => {
  it("kullanıcının bildirimlerini scheduledAt'e göre azalan sırada döner", async () => {
    const { service, prisma } = buildService();
    const notifications = [
      { id: "notif-2", scheduledAt: new Date("2026-01-02T00:00:00.000Z") },
      { id: "notif-1", scheduledAt: new Date("2026-01-01T00:00:00.000Z") },
    ];
    prisma.notification.findMany.mockResolvedValue(notifications);

    const result = await service.findAllForUser("user-1");

    expect(result).toBe(notifications);
    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { scheduledAt: "desc" },
      take: 100,
    });
  });
});

describe("NotificationsService.registerPushToken", () => {
  it("geçerli token'ı kaydeder", async () => {
    const { service, prisma } = buildService();

    const result = await service.registerPushToken("user-1", "ExponentPushToken[abc]");

    expect(result).toEqual({ success: true });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { expoPushToken: "ExponentPushToken[abc]" },
    });
  });

  it("geçersiz token için BadRequestException fırlatır", async () => {
    const { service, expoPush } = buildService();
    expoPush.isValidToken.mockReturnValue(false);

    await expect(service.registerPushToken("user-1", "invalid")).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe("NotificationsService.deliverDueNotifications", () => {
  it("push token'ı olan bildirimi gönderir ve sentAt'ı işaretler", async () => {
    const { service, prisma, expoPush } = buildService();
    const now = new Date("2026-01-01T00:00:00.000Z");
    prisma.notification.findMany.mockResolvedValue([
      {
        id: "notif-1",
        title: "Süre Hatırlatıcısı",
        body: "Son gün yarın.",
        user: { expoPushToken: "ExponentPushToken[abc]" },
      },
    ]);
    expoPush.send.mockResolvedValue({ success: true, ticketId: "ticket-1" });

    const summary = await service.deliverDueNotifications(now);

    expect(summary).toEqual({ sent: 1, failed: 0, skipped: 0 });
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: "notif-1" },
      data: { sentAt: now, providerId: "ticket-1" },
    });
  });

  it("push token'ı olmayan kullanıcı için bildirimi atlar (failedAt işaretler)", async () => {
    const { service, prisma, expoPush } = buildService();
    const now = new Date("2026-01-01T00:00:00.000Z");
    prisma.notification.findMany.mockResolvedValue([
      {
        id: "notif-2",
        title: "Süre Hatırlatıcısı",
        body: "Son gün bugün.",
        user: { expoPushToken: null },
      },
    ]);

    const summary = await service.deliverDueNotifications(now);

    expect(summary).toEqual({ sent: 0, failed: 0, skipped: 1 });
    expect(expoPush.send).not.toHaveBeenCalled();
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: "notif-2" },
      data: { failedAt: now },
    });
  });

  it("Expo gönderimi başarısız olursa failedAt işaretler", async () => {
    const { service, prisma, expoPush } = buildService();
    const now = new Date("2026-01-01T00:00:00.000Z");
    prisma.notification.findMany.mockResolvedValue([
      {
        id: "notif-3",
        title: "Süre Hatırlatıcısı",
        body: "Son gün 3 gün sonra.",
        user: { expoPushToken: "ExponentPushToken[xyz]" },
      },
    ]);
    expoPush.send.mockResolvedValue({ success: false, error: "DeviceNotRegistered" });

    const summary = await service.deliverDueNotifications(now);

    expect(summary).toEqual({ sent: 0, failed: 1, skipped: 0 });
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: "notif-3" },
      data: { failedAt: now },
    });
  });

  it("zamanı gelmiş bildirim yoksa boş özet döner", async () => {
    const { service, prisma } = buildService();
    prisma.notification.findMany.mockResolvedValue([]);

    const summary = await service.deliverDueNotifications();

    expect(summary).toEqual({ sent: 0, failed: 0, skipped: 0 });
  });
});
