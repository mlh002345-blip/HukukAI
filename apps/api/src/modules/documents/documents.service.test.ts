import { describe, expect, it, vi } from "vitest";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { DocumentsService } from "./documents.service";

function createPrismaMock() {
  return {
    document: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    caseFolder: {
      findFirst: vi.fn(),
    },
  };
}

function createStorageMock() {
  return {
    createUploadUrl: vi.fn().mockResolvedValue("https://storage.example/upload"),
    headObject: vi.fn(),
    deleteObject: vi.fn(),
  };
}

const validRequest = {
  fileName: "dilekce.pdf",
  mimeType: "application/pdf" as const,
  sizeBytes: 2048,
};

const validChecksum =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("DocumentsService.createUploadUrl", () => {
  it("geçerli istek için presigned URL döner", async () => {
    const prisma = createPrismaMock();
    const storage = createStorageMock();
    const service = new DocumentsService(prisma as never, storage as never);

    const result = await service.createUploadUrl("user-1", validRequest);

    expect(result.uploadUrl).toBe("https://storage.example/upload");
    expect(result.storageKey).toMatch(/^documents\/user-1\//);
  });

  it("desteklenmeyen MIME türünde BadRequestException fırlatır", async () => {
    const prisma = createPrismaMock();
    const storage = createStorageMock();
    const service = new DocumentsService(prisma as never, storage as never);

    await expect(
      service.createUploadUrl("user-1", {
        fileName: "dilekce.exe",
        mimeType: "application/x-msdownload" as never,
        sizeBytes: 2048,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(storage.createUploadUrl).not.toHaveBeenCalled();
  });

  it("başkasına ait klasöre yükleme isteğinde NotFoundException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.caseFolder.findFirst.mockResolvedValue(null);
    const storage = createStorageMock();
    const service = new DocumentsService(prisma as never, storage as never);

    await expect(
      service.createUploadUrl("user-1", { ...validRequest, folderId: "folder-x" }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe("DocumentsService.completeUpload", () => {
  it("mükerrer checksum için ConflictException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.document.findUnique.mockResolvedValue({ id: "existing-doc" });
    const storage = createStorageMock();
    const service = new DocumentsService(prisma as never, storage as never);

    await expect(
      service.completeUpload("user-1", {
        ...validRequest,
        storageKey: "documents/user-1/x.pdf",
        checksum: validChecksum,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("depoda bulunamayan dosya için BadRequestException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.document.findUnique.mockResolvedValue(null);
    const storage = createStorageMock();
    storage.headObject.mockResolvedValue(null);
    const service = new DocumentsService(prisma as never, storage as never);

    await expect(
      service.completeUpload("user-1", {
        ...validRequest,
        storageKey: "documents/user-1/x.pdf",
        checksum: validChecksum,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("boyut uyuşmazlığında BadRequestException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.document.findUnique.mockResolvedValue(null);
    const storage = createStorageMock();
    storage.headObject.mockResolvedValue({ sizeBytes: 999 });
    const service = new DocumentsService(prisma as never, storage as never);

    await expect(
      service.completeUpload("user-1", {
        ...validRequest,
        storageKey: "documents/user-1/x.pdf",
        checksum: validChecksum,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("virüs taramasından geçemeyen dosyayı reddeder ve depodan siler", async () => {
    const prisma = createPrismaMock();
    prisma.document.findUnique.mockResolvedValue(null);
    const storage = createStorageMock();
    storage.headObject.mockResolvedValue({ sizeBytes: validRequest.sizeBytes });
    const service = new DocumentsService(prisma as never, storage as never);

    const eicarChecksum =
      "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0";

    await expect(
      service.completeUpload("user-1", {
        ...validRequest,
        storageKey: "documents/user-1/x.pdf",
        checksum: eicarChecksum,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(storage.deleteObject).toHaveBeenCalledWith("documents/user-1/x.pdf");
    expect(prisma.document.create).not.toHaveBeenCalled();
  });

  it("geçerli yüklemeyi UPLOADED durumunda kaydeder", async () => {
    const prisma = createPrismaMock();
    prisma.document.findUnique.mockResolvedValue(null);
    prisma.document.create.mockResolvedValue({
      id: "doc-1",
      folderId: null,
      originalName: validRequest.fileName,
      mimeType: validRequest.mimeType,
      sizeBytes: validRequest.sizeBytes,
      status: "UPLOADED",
      documentType: null,
      pageCount: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const storage = createStorageMock();
    storage.headObject.mockResolvedValue({ sizeBytes: validRequest.sizeBytes });
    const service = new DocumentsService(prisma as never, storage as never);

    const result = await service.completeUpload("user-1", {
      ...validRequest,
      storageKey: "documents/user-1/x.pdf",
      checksum: validChecksum,
    });

    expect(result.status).toBe("UPLOADED");
    expect(prisma.document.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", checksum: validChecksum }),
      }),
    );
  });
});

describe("DocumentsService.remove", () => {
  it("belgeyi soft-delete yapar ve depodan siler", async () => {
    const prisma = createPrismaMock();
    prisma.document.findFirst.mockResolvedValue({
      id: "doc-1",
      storageKey: "documents/user-1/x.pdf",
    });
    const storage = createStorageMock();
    const service = new DocumentsService(prisma as never, storage as never);

    await service.remove("user-1", "doc-1");

    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "doc-1" },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
    expect(storage.deleteObject).toHaveBeenCalledWith("documents/user-1/x.pdf");
  });

  it("başkasına ait belgeyi silmeye çalışınca NotFoundException fırlatır", async () => {
    const prisma = createPrismaMock();
    prisma.document.findFirst.mockResolvedValue(null);
    const storage = createStorageMock();
    const service = new DocumentsService(prisma as never, storage as never);

    await expect(service.remove("user-1", "doc-x")).rejects.toThrow(
      NotFoundException,
    );
  });
});
