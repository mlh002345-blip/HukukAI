import { describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { FoldersService } from "./folders.service";

function createPrismaMock() {
  return {
    caseFolder: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  };
}

const now = new Date("2026-01-01T00:00:00.000Z");

describe("FoldersService", () => {
  it("yeni bir klasör oluşturur", async () => {
    const prisma = createPrismaMock();
    prisma.caseFolder.create.mockResolvedValue({
      id: "folder-1",
      title: "İcra Dosyası",
      folderType: "ENFORCEMENT",
      clientName: null,
      referenceNumber: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
      _count: { documents: 0 },
    });

    const service = new FoldersService(prisma as never);
    const result = await service.create("user-1", {
      title: "İcra Dosyası",
      folderType: "ENFORCEMENT",
    });

    expect(result.id).toBe("folder-1");
    expect(result.documentCount).toBe(0);
    expect(prisma.caseFolder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1" }),
      }),
    );
  });

  it("başkasına ait klasörü bulamayınca NotFoundException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.caseFolder.findFirst.mockResolvedValue(null);
    const service = new FoldersService(prisma as never);

    await expect(service.findOne("user-1", "folder-2")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("silme işlemi soft-delete uygular", async () => {
    const prisma = createPrismaMock();
    prisma.caseFolder.findFirst.mockResolvedValue({
      id: "folder-1",
      title: "İcra Dosyası",
      folderType: "ENFORCEMENT",
      clientName: null,
      referenceNumber: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
      _count: { documents: 0 },
    });
    const service = new FoldersService(prisma as never);

    await service.remove("user-1", "folder-1");

    expect(prisma.caseFolder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "folder-1" },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
  });
});
