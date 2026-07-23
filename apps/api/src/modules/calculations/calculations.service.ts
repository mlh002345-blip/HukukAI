import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import {
  calculateAttorneyFee,
  calculateCourtFee,
  calculateEnforcementDebt,
  calculateExecutionPreview,
  calculateIncomeTax,
  calculateLegalInterest,
  calculateRentIncrease,
  calculateSelfEmploymentReceipt,
  calculateSgkEmployerCost,
  calculateVat,
} from "@hukukai/calculation-engine";
import type {
  CalculateAttorneyFeeRequest,
  CalculateCourtFeeRequest,
  CalculateEnforcementDebtRequest,
  CalculateExecutionPreviewRequest,
  CalculateIncomeTaxRequest,
  CalculateLegalInterestRequest,
  CalculateRentIncreaseRequest,
  CalculateSelfEmploymentReceiptRequest,
  CalculateSgkEmployerCostRequest,
  CalculateVatRequest,
} from "@hukukai/validation";
import type { CalculationSummary, CalculationType } from "@hukukai/types";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Faz 6 kapsam notu: Bu motorların oranları/dilimleri şu an her istekte
 * doğrudan parametre olarak verilir (bkz. `packages/calculation-engine`
 * — hiçbir oran koda gömülü değildir). Faz 5'teki süre kurallarına
 * benzer şekilde bu oranların `RuleSet` üzerinden otomatik çekilmesi
 * ileriki bir iterasyonda eklenebilir; bu, ayrı ve kapsamlı bir
 * doğrulama gerektirdiğinden bilinçli olarak bu fazın dışında
 * bırakılmıştır.
 */
const ENGINE_VERSION = "1.0.0";
const RULE_SET_VERSION_NOT_APPLICABLE = "N/A";

type CalculationRow = {
  id: string;
  folderId: string | null;
  documentId: string | null;
  calculationType: string;
  engineVersion: string;
  inputData: unknown;
  outputData: unknown;
  status: string;
  createdAt: Date;
};

function toSummary(row: CalculationRow): CalculationSummary {
  return {
    id: row.id,
    folderId: row.folderId,
    documentId: row.documentId,
    calculationType: row.calculationType as CalculationType,
    engineVersion: row.engineVersion,
    inputData: row.inputData as Record<string, unknown>,
    outputData: row.outputData as Record<string, unknown>,
    status: row.status as CalculationSummary["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class CalculationsService {
  constructor(private readonly prisma: PrismaService) {}

  async legalInterest(userId: string, input: CalculateLegalInterestRequest) {
    const result = calculateLegalInterest(input);
    return this.persist(userId, "LEGAL_INTEREST", input, result);
  }

  async enforcementDebt(userId: string, input: CalculateEnforcementDebtRequest) {
    const result = calculateEnforcementDebt({
      principal: input.principal,
      interest: { principal: input.principal, periods: input.periods },
      expenses: input.expenses,
    });
    return this.persist(userId, "ENFORCEMENT_DEBT", input, result);
  }

  async rentIncrease(userId: string, input: CalculateRentIncreaseRequest) {
    const result = calculateRentIncrease(input);
    return this.persist(userId, "RENT_INCREASE", input, result);
  }

  async attorneyFee(userId: string, input: CalculateAttorneyFeeRequest) {
    const result = calculateAttorneyFee(input);
    return this.persist(userId, "ATTORNEY_FEE", input, result);
  }

  async courtFee(userId: string, input: CalculateCourtFeeRequest) {
    const result = calculateCourtFee(input);
    return this.persist(userId, "COURT_FEE", input, result);
  }

  async selfEmploymentReceipt(
    userId: string,
    input: CalculateSelfEmploymentReceiptRequest,
  ) {
    const result = calculateSelfEmploymentReceipt(input);
    return this.persist(userId, "SELF_EMPLOYMENT_RECEIPT", input, result);
  }

  async incomeTax(userId: string, input: CalculateIncomeTaxRequest) {
    const result = calculateIncomeTax(input);
    return this.persist(userId, "INCOME_TAX", input, result);
  }

  async vat(userId: string, input: CalculateVatRequest) {
    const result = calculateVat(input);
    return this.persist(userId, "VAT", input, result);
  }

  async sgkEmployerCost(userId: string, input: CalculateSgkEmployerCostRequest) {
    const result = calculateSgkEmployerCost(input);
    return this.persist(userId, "SGK_EMPLOYER_COST", input, result);
  }

  async executionPreview(userId: string, input: CalculateExecutionPreviewRequest) {
    const result = calculateExecutionPreview(input);
    return this.persist(userId, "EXECUTION_PREVIEW", input, result);
  }

  async findAll(userId: string): Promise<CalculationSummary[]> {
    const calculations = await this.prisma.calculation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return calculations.map(toSummary);
  }

  async findOne(userId: string, id: string): Promise<CalculationSummary> {
    const calculation = await this.prisma.calculation.findFirst({
      where: { id, userId },
    });
    if (!calculation) {
      throw new NotFoundException("Hesaplama bulunamadı.");
    }
    return toSummary(calculation);
  }

  private async persist(
    userId: string,
    calculationType: CalculationType,
    input: { folderId?: string; documentId?: string } & Record<string, unknown>,
    output: unknown,
  ): Promise<CalculationSummary> {
    if (input.folderId) await this.assertFolderOwnership(userId, input.folderId);
    if (input.documentId) {
      await this.assertDocumentOwnership(userId, input.documentId);
    }

    const { folderId, documentId, ...inputData } = input;

    const calculation = await this.prisma.calculation.create({
      data: {
        userId,
        folderId: folderId ?? null,
        documentId: documentId ?? null,
        calculationType,
        engineVersion: ENGINE_VERSION,
        ruleSetVersion: RULE_SET_VERSION_NOT_APPLICABLE,
        inputData: inputData as unknown as Prisma.InputJsonValue,
        outputData: output as unknown as Prisma.InputJsonValue,
        status: "COMPLETED",
      },
    });

    return toSummary(calculation);
  }

  private async assertFolderOwnership(
    userId: string,
    folderId: string,
  ): Promise<void> {
    const folder = await this.prisma.caseFolder.findFirst({
      where: { id: folderId, userId, deletedAt: null },
    });
    if (!folder) {
      throw new NotFoundException("Klasör bulunamadı.");
    }
  }

  private async assertDocumentOwnership(
    userId: string,
    documentId: string,
  ): Promise<void> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
    });
    if (!document) {
      throw new NotFoundException("Belge bulunamadı.");
    }
  }
}
