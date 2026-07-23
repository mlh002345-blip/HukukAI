import { describe, expect, it, vi } from "vitest";
import { AuditLogService } from "./audit-log.service";

function createPrismaMock() {
  return {
    auditLog: { create: vi.fn(), findMany: vi.fn() },
  };
}

describe("AuditLogService.record", () => {
  it("işlem kaydını oluşturur", async () => {
    const prisma = createPrismaMock();
    const service = new AuditLogService(prisma as never);

    await service.record({
      userId: "admin-1",
      action: "USER_FROZEN",
      entityType: "User",
      entityId: "user-1",
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "admin-1",
          action: "USER_FROZEN",
          entityType: "User",
          entityId: "user-1",
        }),
      }),
    );
  });
});

describe("AuditLogService.findAll", () => {
  it("varsayılan sayfalama ile filtreler", async () => {
    const prisma = createPrismaMock();
    prisma.auditLog.findMany.mockResolvedValue([]);
    const service = new AuditLogService(prisma as never);

    await service.findAll({ entityType: "User" });

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entityType: "User", userId: undefined },
        skip: 0,
        take: 50,
      }),
    );
  });
});
