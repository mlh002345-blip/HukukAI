import { describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { CalculationsService } from "./calculations.service";

function createPrismaMock() {
  return {
    calculation: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    caseFolder: { findFirst: vi.fn() },
    document: { findFirst: vi.fn() },
  };
}

function buildService() {
  const prisma = createPrismaMock();
  const service = new CalculationsService(prisma as never);
  return { service, prisma };
}

function calculationRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "calc-1",
    folderId: null,
    documentId: null,
    calculationType: "VAT",
    engineVersion: "1.0.0",
    inputData: { amount: "1000" },
    outputData: { totalAmount: "1200.00" },
    status: "COMPLETED",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("CalculationsService.vat", () => {
  it("KDV'yi hesaplar ve kaydeder", async () => {
    const { service, prisma } = buildService();
    prisma.calculation.create.mockResolvedValue(
      calculationRow({
        outputData: { baseAmount: "1000.00", vatAmount: "200.00", totalAmount: "1200.00" },
      }),
    );

    const result = await service.vat("user-1", {
      amount: "1000",
      vatRatePercent: "20",
      mode: "ADD_VAT",
    });

    expect(result.calculationType).toBe("VAT");
    expect(prisma.calculation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          calculationType: "VAT",
          status: "COMPLETED",
          userId: "user-1",
        }),
      }),
    );
  });

  it("klasör/belge alanlarını inputData içine kaydetmez, ayrı sütuna yazar", async () => {
    const { service, prisma } = buildService();
    prisma.caseFolder.findFirst.mockResolvedValue({ id: "folder-1" });
    prisma.calculation.create.mockResolvedValue(calculationRow({ folderId: "folder-1" }));

    await service.vat("user-1", {
      amount: "1000",
      vatRatePercent: "20",
      mode: "ADD_VAT",
      folderId: "folder-1",
    });

    const createCall = prisma.calculation.create.mock.calls[0]?.[0];
    expect(createCall.data.folderId).toBe("folder-1");
    expect(createCall.data.inputData).not.toHaveProperty("folderId");
  });

  it("başkasına ait klasöre bağlamaya çalışınca NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.caseFolder.findFirst.mockResolvedValue(null);

    await expect(
      service.vat("user-1", {
        amount: "1000",
        vatRatePercent: "20",
        mode: "ADD_VAT",
        folderId: "folder-x",
      }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe("CalculationsService.executionPreview", () => {
  it("infaz ön hesabını hesaplar ve zorunlu uyarıları saklar", async () => {
    const { service, prisma } = buildService();
    prisma.calculation.create.mockResolvedValue(
      calculationRow({
        calculationType: "EXECUTION_PREVIEW",
        outputData: { warnings: ["Bu bir ön hesaptır."] },
      }),
    );

    const result = await service.executionPreview("user-1", {
      sentenceDays: 3650,
      executionFraction: "HALF",
      creditedDays: 0,
      startDate: "2026-01-01",
    });

    expect(result.calculationType).toBe("EXECUTION_PREVIEW");
    const createCall = prisma.calculation.create.mock.calls[0]?.[0];
    expect(createCall.data.outputData.warnings).toContain("Bu bir ön hesaptır.");
  });
});

describe("CalculationsService.findAll / findOne", () => {
  it("kullanıcının hesaplamalarını listeler", async () => {
    const { service, prisma } = buildService();
    prisma.calculation.findMany.mockResolvedValue([calculationRow()]);

    const result = await service.findAll("user-1");
    expect(result).toHaveLength(1);
  });

  it("başkasına ait hesaplama için NotFoundException fırlatır", async () => {
    const { service, prisma } = buildService();
    prisma.calculation.findFirst.mockResolvedValue(null);

    await expect(service.findOne("user-1", "calc-x")).rejects.toThrow(
      NotFoundException,
    );
  });
});
