import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type {
  CalculationType,
  GeneratedReportSummary,
  ReportDownloadUrlResponse,
} from "@hukukai/types";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StorageService, DOWNLOAD_URL_TTL_SECONDS } from "../storage/storage.service";
import type { ReportContent } from "./report-content";
import { renderReportPdf } from "./render-report-pdf";
import { buildDocumentAnalysisReportContent } from "./templates/document-analysis-report";
import { buildCalculationReportContent } from "./templates/calculation-report";
import { buildDeadlineReportContent } from "./templates/deadline-report";

const TEMPLATE_VERSION = "1.0.0";

type GeneratedDocumentRow = {
  id: string;
  folderId: string | null;
  documentType: string;
  templateVersion: string;
  createdAt: Date;
};

function toSummary(row: GeneratedDocumentRow): GeneratedReportSummary {
  return {
    id: row.id,
    folderId: row.folderId,
    documentType: row.documentType,
    templateVersion: row.templateVersion,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async generateDocumentAnalysisReport(
    userId: string,
    documentId: string,
  ): Promise<GeneratedReportSummary> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
      include: { user: { select: { subscriptionPlan: true } } },
    });
    if (!document) {
      throw new NotFoundException("Belge bulunamadı.");
    }
    const analysis = await this.prisma.documentAnalysis.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });
    if (!analysis) {
      throw new NotFoundException("Bu belge için analiz sonucu bulunamadı.");
    }

    return this.render(userId, document.folderId, "DOCUMENT_ANALYSIS", (reportId, createdAt) =>
      buildDocumentAnalysisReportContent({
        reportId,
        createdAt,
        document: {
          originalName: document.originalName,
          documentType: document.documentType,
          createdAt: document.createdAt,
        },
        analysis: {
          summary: analysis.summary,
          extractedData: analysis.extractedData as Record<string, unknown>,
          warnings: analysis.warnings as string[],
          recommendedTools: analysis.recommendedTools as string[],
        },
        isFreePlan: document.user.subscriptionPlan === "FREE",
      }),
    );
  }

  async generateCalculationReport(
    userId: string,
    calculationId: string,
  ): Promise<GeneratedReportSummary> {
    const calculation = await this.prisma.calculation.findFirst({
      where: { id: calculationId, userId },
      include: { user: { select: { subscriptionPlan: true } } },
    });
    if (!calculation) {
      throw new NotFoundException("Hesaplama bulunamadı.");
    }

    return this.render(userId, calculation.folderId, "CALCULATION", (reportId, createdAt) =>
      buildCalculationReportContent({
        reportId,
        createdAt,
        calculationType: calculation.calculationType as CalculationType,
        inputData: calculation.inputData as Record<string, unknown>,
        outputData: calculation.outputData as Record<string, unknown>,
        isFreePlan: calculation.user.subscriptionPlan === "FREE",
      }),
    );
  }

  async generateDeadlineReport(
    userId: string,
    deadlineId: string,
  ): Promise<GeneratedReportSummary> {
    const deadline = await this.prisma.deadline.findFirst({
      where: { id: deadlineId, userId },
      include: { user: { select: { subscriptionPlan: true } } },
    });
    if (!deadline) {
      throw new NotFoundException("Süre bulunamadı.");
    }

    return this.render(userId, deadline.folderId, "DEADLINE", (reportId, createdAt) =>
      buildDeadlineReportContent({
        reportId,
        createdAt,
        deadline: {
          title: deadline.title,
          ruleId: deadline.ruleId,
          ruleVersion: deadline.ruleVersion,
          startEvent: deadline.startEvent,
          startDate: deadline.startDate,
          calculatedEndDate: deadline.calculatedEndDate,
          adjustedEndDate: deadline.adjustedEndDate,
          legalBasis: deadline.legalBasis as Array<{ law: string; article?: string }>,
          warnings: deadline.warnings as string[],
        },
        isFreePlan: deadline.user.subscriptionPlan === "FREE",
      }),
    );
  }

  async findAll(userId: string): Promise<GeneratedReportSummary[]> {
    const reports = await this.prisma.generatedDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return reports.map(toSummary);
  }

  async getDownloadUrl(
    userId: string,
    id: string,
  ): Promise<ReportDownloadUrlResponse> {
    const report = await this.prisma.generatedDocument.findFirst({
      where: { id, userId },
    });
    if (!report || !report.storageKey) {
      throw new NotFoundException("Rapor bulunamadı.");
    }
    const downloadUrl = await this.storage.createDownloadUrl(report.storageKey);
    return { downloadUrl, expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS };
  }

  private async render(
    userId: string,
    folderId: string | null,
    reportType: string,
    buildContent: (reportId: string, createdAt: Date) => ReportContent,
  ): Promise<GeneratedReportSummary> {
    const reportId = randomUUID();
    const createdAt = new Date();
    const content = buildContent(reportId, createdAt);
    const pdfBuffer = await renderReportPdf(content);
    const storageKey = `reports/${userId}/${reportId}.pdf`;
    await this.storage.putObjectBuffer(storageKey, pdfBuffer, "application/pdf");

    const generatedDocument = await this.prisma.generatedDocument.create({
      data: {
        id: reportId,
        userId,
        folderId,
        documentType: reportType,
        templateVersion: TEMPLATE_VERSION,
        inputData: { reportNumber: content.reportNumber } as Prisma.InputJsonValue,
        storageKey,
      },
    });

    return toSummary(generatedDocument);
  }
}
