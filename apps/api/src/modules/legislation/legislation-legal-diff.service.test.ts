import { describe, expect, it, vi } from "vitest";
import { LegislationLegalDiffService } from "./legislation-legal-diff.service";

function createPrismaMock() {
  return {
    legislationDocument: { findFirst: vi.fn() },
    legislationChange: { create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "change-1", ...data })) },
  };
}

describe("LegislationLegalDiffService.detectChange", () => {
  it("önceki belge yoksa NEW_PROVISION değişikliği kaydeder", async () => {
    const prisma = createPrismaMock();
    prisma.legislationDocument.findFirst.mockResolvedValue(null);
    const service = new LegislationLegalDiffService(prisma as never);

    const change = await service.detectChange({
      id: "doc-1",
      sourceId: "source-1",
      title: "Yeni Tebliğ",
      rawText: "Madde 1 - Yeni bir yükümlülük getirilmiştir.",
      publicationDate: new Date("2026-06-16T00:00:00.000Z"),
    });

    expect(change).not.toBeNull();
    expect(prisma.legislationChange.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ documentId: "doc-1", changeType: "NEW_PROVISION" }),
      }),
    );
  });

  it("önceki belgeyle metin aynıysa null döner (LegislationChange oluşturmaz)", async () => {
    const prisma = createPrismaMock();
    const sameText = "Madde 1 - KDV oranı %20'dir.";
    prisma.legislationDocument.findFirst.mockResolvedValue({
      id: "doc-0",
      rawText: sameText,
    });
    const service = new LegislationLegalDiffService(prisma as never);

    const change = await service.detectChange({
      id: "doc-1",
      sourceId: "source-1",
      title: "KDV Tebliği",
      rawText: sameText,
      publicationDate: new Date("2026-06-16T00:00:00.000Z"),
    });

    expect(change).toBeNull();
    expect(prisma.legislationChange.create).not.toHaveBeenCalled();
  });

  it("aynı kaynak+başlıktan daha eski bir belgeyle karşılaştırır (id != kendisi, publicationDate < yeni belge)", async () => {
    const prisma = createPrismaMock();
    prisma.legislationDocument.findFirst.mockResolvedValue({
      id: "doc-0",
      rawText: "Madde 2 - Başvuru süresi 15 gündür.",
    });
    const service = new LegislationLegalDiffService(prisma as never);

    await service.detectChange({
      id: "doc-1",
      sourceId: "source-1",
      title: "Başvuru Tebliği",
      rawText: "Madde 2 - Başvuru süresi uzatılmıştır, 30 güne çıkarılmıştır.",
      publicationDate: new Date("2026-06-16T00:00:00.000Z"),
    });

    expect(prisma.legislationDocument.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sourceId: "source-1",
          title: "Başvuru Tebliği",
          id: { not: "doc-1" },
        }),
      }),
    );
  });
});
