import { describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ReportsService } from "./reports.service";

function createPrismaMock() {
  return {
    document: { findFirst: vi.fn() },
    documentAnalysis: { findFirst: vi.fn() },
    calculation: { findFirst: vi.fn() },
    deadline: { findFirst: vi.fn() },
    generatedDocument: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
  };
}

function createStorageMock() {
  return {
    putObjectBuffer: vi.fn().mockResolvedValue(undefined),
    createDownloadUrl: vi.fn().mockResolvedValue("https://storage.example/report.pdf"),
  };
}

function buildService() {
  const prisma = createPrismaMock();
  const storage = createStorageMock();
  const service = new ReportsService(prisma as never, storage as never);
  return { service, prisma, storage };
}

describe("ReportsService.generateDocumentAnalysisReport", () => {
  it("belge analiz raporunu oluşturur, depolar ve kaydeder", async () => {
    const { service, prisma, storage } = buildService();
    prisma.document.findFirst.mockResolvedValue({
      id: "doc-1",
      folderId: "folder-1",
      originalName: "kira.pdf",
      documentType: "RENT_AGREEMENT",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      user: { subscriptionPlan: "FREE" },
    });
    prisma.documentAnalysis.findFirst.mockResolvedValue({
      summary: "özet",
      extractedData: {},
      warnings: [],
      recommendedTools: [],
    });
    prisma.generatedDocument.create.mockResolvedValue({
      id: "report-1",
      folderId: "folder-1",
      documentType: "DOCUMENT_ANALYSIS",
      templateVersion: "1.0.0",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const result = await service.generateDocumentAnalysisReport("user-1", "doc-1");

    expect(result.documentType).toBe("DOCUMENT_ANALYSIS");
    expect(storage.putObjectBuffer).toHaveBeenCalledWith(
      expect.stringMatching(/^reports\/user-1\/.+\.pdf$/),
      expect.any(Buffer),
      "application/pdf",
    );
    expect(prisma.generatedDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", folderId: "folder-1" }),
      }),
    );
  });

  it("başkasına ait belge için NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(
      service.generateDocumentAnalysisReport("user-1", "doc-x"),
    ).rejects.toThrow(NotFoundException);
  });

  it("analiz sonucu yoksa NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.document.findFirst.mockResolvedValue({
      id: "doc-1",
      folderId: null,
      originalName: "kira.pdf",
      documentType: null,
      createdAt: new Date(),
      user: { subscriptionPlan: "PRO" },
    });
    prisma.documentAnalysis.findFirst.mockResolvedValue(null);

    await expect(
      service.generateDocumentAnalysisReport("user-1", "doc-1"),
    ).rejects.toThrow(NotFoundException);
  });
});

describe("ReportsService.generateCalculationReport", () => {
  it("hesaplama raporunu oluşturur", async () => {
    const { service, prisma } = buildService();
    prisma.calculation.findFirst.mockResolvedValue({
      id: "calc-1",
      folderId: null,
      calculationType: "VAT",
      inputData: { amount: "1000" },
      outputData: { totalAmount: "1200.00" },
      user: { subscriptionPlan: "PRO" },
    });
    prisma.generatedDocument.create.mockResolvedValue({
      id: "report-2",
      folderId: null,
      documentType: "CALCULATION",
      templateVersion: "1.0.0",
      createdAt: new Date(),
    });

    const result = await service.generateCalculationReport("user-1", "calc-1");
    expect(result.documentType).toBe("CALCULATION");
  });

  it("başkasına ait hesaplama için NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.calculation.findFirst.mockResolvedValue(null);

    await expect(
      service.generateCalculationReport("user-1", "calc-x"),
    ).rejects.toThrow(NotFoundException);
  });
});

describe("ReportsService.generateDeadlineReport", () => {
  it("süre raporunu oluşturur", async () => {
    const { service, prisma } = buildService();
    prisma.deadline.findFirst.mockResolvedValue({
      id: "deadline-1",
      folderId: null,
      title: "İtiraz süresi",
      ruleId: "TR_TRAFFIC_FINE_OBJECTION",
      ruleVersion: "1.0.0",
      startEvent: "TEBLIGAT",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      calculatedEndDate: new Date("2026-01-16T00:00:00.000Z"),
      adjustedEndDate: new Date("2026-01-16T00:00:00.000Z"),
      legalBasis: [],
      warnings: [],
      user: { subscriptionPlan: "FREE" },
    });
    prisma.generatedDocument.create.mockResolvedValue({
      id: "report-3",
      folderId: null,
      documentType: "DEADLINE",
      templateVersion: "1.0.0",
      createdAt: new Date(),
    });

    const result = await service.generateDeadlineReport("user-1", "deadline-1");
    expect(result.documentType).toBe("DEADLINE");
  });
});

describe("ReportsService.getDownloadUrl", () => {
  it("depolanmış rapor için indirme URL'si döner", async () => {
    const { service, prisma, storage } = buildService();
    prisma.generatedDocument.findFirst.mockResolvedValue({
      id: "report-1",
      storageKey: "reports/user-1/report-1.pdf",
    });

    const result = await service.getDownloadUrl("user-1", "report-1");
    expect(result.downloadUrl).toBe("https://storage.example/report.pdf");
    expect(storage.createDownloadUrl).toHaveBeenCalledWith(
      "reports/user-1/report-1.pdf",
    );
  });

  it("rapor bulunamazsa NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.generatedDocument.findFirst.mockResolvedValue(null);

    await expect(service.getDownloadUrl("user-1", "report-x")).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe("ReportsService.findAll", () => {
  it("kullanıcının raporlarını listeler", async () => {
    const { service, prisma } = buildService();
    prisma.generatedDocument.findMany.mockResolvedValue([
      {
        id: "report-1",
        folderId: null,
        documentType: "CALCULATION",
        templateVersion: "1.0.0",
        createdAt: new Date(),
      },
    ]);

    const result = await service.findAll("user-1");
    expect(result).toHaveLength(1);
  });
});
