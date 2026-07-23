import { describe, expect, it, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { DocumentAnalysisService } from "./document-analysis.service";

function createPrismaMock() {
  return {
    document: {
      findFirst: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    documentAnalysis: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    toolDefinition: {
      findMany: vi.fn(),
    },
  };
}

function createStorageMock() {
  return { getObjectBuffer: vi.fn() };
}

function createBillingServiceMock() {
  return {
    reserveAnalysisQuota: vi.fn().mockResolvedValue(undefined),
    assertPageLimit: vi.fn(),
  };
}

function createOcrProviderMock() {
  return { recognize: vi.fn() };
}

function createAiProviderMock() {
  return {
    name: "mock",
    model: "mock-heuristic-v1",
    classifyDocument: vi.fn(),
    extractStructuredData: vi.fn(),
    summarize: vi.fn(),
  };
}

function createConfigServiceMock() {
  return { get: vi.fn().mockReturnValue("test-secret-key-at-least-32-characters-long") };
}

function createQueueMock() {
  return { add: vi.fn() };
}

function buildService() {
  const prisma = createPrismaMock();
  const storage = createStorageMock();
  const billingService = createBillingServiceMock();
  const ocrProvider = createOcrProviderMock();
  const aiProvider = createAiProviderMock();
  const configService = createConfigServiceMock();
  const queue = createQueueMock();
  const service = new DocumentAnalysisService(
    prisma as never,
    storage as never,
    billingService as never,
    ocrProvider as never,
    aiProvider as never,
    configService as never,
    queue as never,
  );
  return {
    service,
    prisma,
    storage,
    billingService,
    ocrProvider,
    aiProvider,
    configService,
    queue,
  };
}

describe("DocumentAnalysisService.enqueueAnalysis", () => {
  it("belge UPLOADED durumundayken işi kuyruğa ekler", async () => {
    const { service, prisma, queue, billingService } = buildService();
    prisma.document.findFirst.mockResolvedValue({ id: "doc-1", status: "UPLOADED" });

    const result = await service.enqueueAnalysis("user-1", "doc-1");

    expect(result.status).toBe("OCR_PROCESSING");
    expect(billingService.reserveAnalysisQuota).toHaveBeenCalledWith("user-1");
    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "OCR_PROCESSING" }) }),
    );
    expect(queue.add).toHaveBeenCalledWith("analyze", { documentId: "doc-1" });
  });

  it("kota/kredi tükendiyse ForbiddenException fırlatır ve kuyruğa eklemez", async () => {
    const { service, prisma, queue, billingService } = buildService();
    prisma.document.findFirst.mockResolvedValue({ id: "doc-1", status: "UPLOADED" });
    billingService.reserveAnalysisQuota.mockRejectedValue(
      new Error("Bu ay için belge analizi kotanız doldu."),
    );

    await expect(service.enqueueAnalysis("user-1", "doc-1")).rejects.toThrow();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it("belge işlenirken tekrar analiz isteğini reddeder", async () => {
    const { service, prisma } = buildService();
    prisma.document.findFirst.mockResolvedValue({ id: "doc-1", status: "AI_PROCESSING" });

    await expect(service.enqueueAnalysis("user-1", "doc-1")).rejects.toThrow(
      ConflictException,
    );
  });

  it("başkasına ait belge için NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(service.enqueueAnalysis("user-1", "doc-x")).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe("DocumentAnalysisService.runPipeline", () => {
  it("yüksek güven skorunda COMPLETED durumuna geçer", async () => {
    const { service, prisma, storage, ocrProvider, aiProvider } = buildService();
    prisma.document.findUniqueOrThrow.mockResolvedValue({
      id: "doc-1",
      storageKey: "documents/user-1/x.pdf",
      mimeType: "application/pdf",
      originalName: "kira.pdf",
      user: { subscriptionPlan: "PRO" },
    });
    storage.getObjectBuffer.mockResolvedValue(Buffer.from("içerik"));
    ocrProvider.recognize.mockResolvedValue({
      text: "kira sözleşmesi metni",
      confidence: 0.95,
      pageCount: 1,
    });
    aiProvider.classifyDocument.mockResolvedValue({
      documentType: "RENT_AGREEMENT",
      confidence: 0.9,
    });
    aiProvider.extractStructuredData.mockResolvedValue({
      data: { amountText: "1000" },
      warnings: [],
      confidence: 0.9,
    });
    aiProvider.summarize.mockResolvedValue("özet");

    await service.runPipeline("doc-1");

    expect(prisma.documentAnalysis.create).toHaveBeenCalled();
    const updateCalls = prisma.document.update.mock.calls;
    const finalUpdate = updateCalls.at(-1)?.[0] as { data: Record<string, unknown> };
    expect(finalUpdate.data.status).toBe("COMPLETED");
    expect(finalUpdate.data.documentType).toBe("RENT_AGREEMENT");
  });

  it("düşük güven skorunda REVIEW_REQUIRED durumuna geçer", async () => {
    const { service, prisma, storage, ocrProvider, aiProvider } = buildService();
    prisma.document.findUniqueOrThrow.mockResolvedValue({
      id: "doc-1",
      storageKey: "documents/user-1/x.pdf",
      mimeType: "image/png",
      originalName: "belge.png",
      user: { subscriptionPlan: "FREE" },
    });
    storage.getObjectBuffer.mockResolvedValue(Buffer.from("içerik"));
    ocrProvider.recognize.mockResolvedValue({
      text: "[OCR yer tutucusu] belge.png",
      confidence: 0.5,
      pageCount: 1,
    });
    aiProvider.classifyDocument.mockResolvedValue({
      documentType: "UNKNOWN_OFFICIAL_DOCUMENT",
      confidence: 0.4,
    });
    aiProvider.extractStructuredData.mockResolvedValue({
      data: {},
      warnings: ["Tutar alanı bulunamadı."],
      confidence: 0.5,
    });
    aiProvider.summarize.mockResolvedValue("özet");

    await service.runPipeline("doc-1");

    const updateCalls = prisma.document.update.mock.calls;
    const finalUpdate = updateCalls.at(-1)?.[0] as { data: Record<string, unknown> };
    expect(finalUpdate.data.status).toBe("REVIEW_REQUIRED");
  });

  it("sayfa sınırı aşıldıysa belgeyi FAILED yapar", async () => {
    const { service, prisma, storage, ocrProvider, billingService } = buildService();
    prisma.document.findUniqueOrThrow.mockResolvedValue({
      id: "doc-1",
      storageKey: "documents/user-1/x.pdf",
      mimeType: "application/pdf",
      originalName: "kira.pdf",
      user: { subscriptionPlan: "FREE" },
    });
    storage.getObjectBuffer.mockResolvedValue(Buffer.from("içerik"));
    ocrProvider.recognize.mockResolvedValue({
      text: "metin",
      confidence: 0.9,
      pageCount: 20,
    });
    billingService.assertPageLimit.mockImplementation(() => {
      throw new Error("Bu belge paketinizin sayfa sınırını aşıyor.");
    });

    await expect(service.runPipeline("doc-1")).rejects.toThrow();
    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED" }),
      }),
    );
  });

  it("hata durumunda belgeyi FAILED yapar ve hatayı yeniden fırlatır", async () => {
    const { service, prisma, storage } = buildService();
    prisma.document.findUniqueOrThrow.mockResolvedValue({
      id: "doc-1",
      storageKey: "documents/user-1/x.pdf",
      mimeType: "application/pdf",
      originalName: "kira.pdf",
      user: { subscriptionPlan: "PRO" },
    });
    storage.getObjectBuffer.mockRejectedValue(new Error("depo hatası"));

    await expect(service.runPipeline("doc-1")).rejects.toThrow("depo hatası");

    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED", errorCode: "ANALYSIS_FAILED" }),
      }),
    );
  });
});

describe("DocumentAnalysisService.getAnalysis", () => {
  it("analiz yoksa NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.document.findFirst.mockResolvedValue({ id: "doc-1" });
    prisma.documentAnalysis.findFirst.mockResolvedValue(null);

    await expect(service.getAnalysis("user-1", "doc-1")).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe("DocumentAnalysisService.updateExtractedData", () => {
  it("çıkarılan verileri birleştirir ve incelemeyi kapatır", async () => {
    const { service, prisma } = buildService();
    prisma.document.findFirst.mockResolvedValue({ id: "doc-1" });
    prisma.documentAnalysis.findFirst.mockResolvedValue({
      id: "analysis-1",
      documentId: "doc-1",
      provider: "mock",
      model: "mock-heuristic-v1",
      extractedData: { amountText: "1000" },
      summary: "özet",
      warnings: [],
      recommendedTools: [],
      confidenceScore: null,
      requiresReview: true,
      createdAt: new Date(),
    });
    prisma.documentAnalysis.update.mockResolvedValue({
      id: "analysis-1",
      documentId: "doc-1",
      provider: "mock",
      model: "mock-heuristic-v1",
      extractedData: { amountText: "1000", dateText: "01.01.2026" },
      summary: "özet",
      warnings: [],
      recommendedTools: [],
      confidenceScore: null,
      requiresReview: false,
      createdAt: new Date(),
    });

    const result = await service.updateExtractedData("user-1", "doc-1", {
      data: { dateText: "01.01.2026" },
    });

    expect(result.extractedData).toEqual({
      amountText: "1000",
      dateText: "01.01.2026",
    });
    expect(result.requiresReview).toBe(false);
    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "COMPLETED" } }),
    );
  });
});

describe("DocumentAnalysisService.getRecommendedActions", () => {
  it("önerilen araç slug'larını araç meta verisiyle eşler", async () => {
    const { service, prisma } = buildService();
    prisma.document.findFirst.mockResolvedValue({ id: "doc-1" });
    prisma.documentAnalysis.findFirst.mockResolvedValue({
      id: "analysis-1",
      documentId: "doc-1",
      provider: "mock",
      model: "mock-heuristic-v1",
      extractedData: {},
      summary: null,
      warnings: [],
      recommendedTools: ["kira-artisi"],
      confidenceScore: null,
      requiresReview: false,
      createdAt: new Date(),
    });
    prisma.toolDefinition.findMany.mockResolvedValue([
      { slug: "kira-artisi", name: "Kira Artışı", route: "/tools/kira-artisi" },
    ]);

    const result = await service.getRecommendedActions("user-1", "doc-1");

    expect(result).toEqual([
      { toolSlug: "kira-artisi", toolName: "Kira Artışı", route: "/tools/kira-artisi" },
    ]);
  });
});
