import { describe, expect, it, vi } from "vitest";
import { LegislationSourceWatcherService } from "./legislation-source-watcher.service";

function createPrismaMock() {
  return {
    legislationSource: { findMany: vi.fn(), update: vi.fn() },
    legislationDocument: { findFirst: vi.fn(), create: vi.fn() },
  };
}

const FETCHED_DOC = {
  sourceKey: "resmi_gazete",
  publicationDate: "2026-06-16",
  documentType: "TEBLIG",
  title: "KDV Genel Uygulama Tebliğinde Değişiklik",
  contentHash: "sha256:abc",
  sourceUrl: "https://www.resmigazete.gov.tr/ornek",
  rawText: "Madde 1 - ...",
  downloadedAt: "2026-06-16T01:12:00.000Z",
};

describe("LegislationSourceWatcherService.pollAllSources", () => {
  it("yeni bir belgeyi kaydeder ve döner", async () => {
    const prisma = createPrismaMock();
    prisma.legislationSource.findMany.mockResolvedValue([
      { id: "source-1", key: "resmi_gazete" },
    ]);
    prisma.legislationDocument.findFirst.mockResolvedValue(null);
    prisma.legislationDocument.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: "doc-1", ...data }),
    );
    const provider = { name: "mock", fetchLatestDocuments: vi.fn().mockResolvedValue([FETCHED_DOC]) };
    const service = new LegislationSourceWatcherService(prisma as never, provider as never);

    const result = await service.pollAllSources();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "doc-1", contentHash: "sha256:abc" });
    expect(prisma.legislationSource.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "source-1" } }),
    );
  });

  it("aynı contentHash'e sahip bir belgeyi tekrar kaydetmez (idempotent)", async () => {
    const prisma = createPrismaMock();
    prisma.legislationSource.findMany.mockResolvedValue([
      { id: "source-1", key: "resmi_gazete" },
    ]);
    prisma.legislationDocument.findFirst.mockResolvedValue({ id: "existing-doc" });
    const provider = { name: "mock", fetchLatestDocuments: vi.fn().mockResolvedValue([FETCHED_DOC]) };
    const service = new LegislationSourceWatcherService(prisma as never, provider as never);

    const result = await service.pollAllSources();

    expect(result).toHaveLength(0);
    expect(prisma.legislationDocument.create).not.toHaveBeenCalled();
  });
});
