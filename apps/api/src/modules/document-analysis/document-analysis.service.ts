import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ConfigService } from "@nestjs/config";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import type { Prisma } from "@prisma/client";
import {
  decideRoute,
  recommendToolSlugsForDocumentType,
  type AIProvider,
} from "@hukukai/ai-provider";
import type { ApiEnv } from "@hukukai/config";
import type {
  DocumentAnalysisSummary,
  DocumentStatusResponse,
  RecommendedAction,
} from "@hukukai/types";
import type { UpdateExtractedDataInput } from "@hukukai/validation";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StorageService } from "../storage/storage.service";
import type { OcrProvider } from "../ocr/ocr-provider";
import { OCR_PROVIDER } from "../ocr/ocr-provider";
import { AI_PROVIDER_TOKEN, DOCUMENT_ANALYSIS_QUEUE } from "./ai-provider.token";
import { encryptOcrText } from "./ocr-text-encryption";

const REVIEW_CONFIDENCE_THRESHOLD = 0.7;
const ANALYZABLE_STATUSES = new Set(["UPLOADED", "FAILED", "COMPLETED", "REVIEW_REQUIRED"]);

type DocumentAnalysisRow = {
  id: string;
  documentId: string;
  provider: string;
  model: string;
  extractedData: unknown;
  summary: string | null;
  warnings: unknown;
  recommendedTools: unknown;
  confidenceScore: Prisma.Decimal | null;
  requiresReview: boolean;
  createdAt: Date;
};

function toAnalysisSummary(row: DocumentAnalysisRow): DocumentAnalysisSummary {
  return {
    id: row.id,
    documentId: row.documentId,
    provider: row.provider,
    model: row.model,
    extractedData: row.extractedData as Record<string, unknown>,
    summary: row.summary,
    warnings: row.warnings as string[],
    recommendedTools: row.recommendedTools as string[],
    confidenceScore: row.confidenceScore ? Number(row.confidenceScore) : null,
    requiresReview: row.requiresReview,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class DocumentAnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    @Inject(OCR_PROVIDER) private readonly ocrProvider: OcrProvider,
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: AIProvider,
    private readonly configService: ConfigService<ApiEnv, true>,
    @InjectQueue(DOCUMENT_ANALYSIS_QUEUE) private readonly queue: Queue,
  ) {}

  async enqueueAnalysis(userId: string, documentId: string): Promise<DocumentStatusResponse> {
    const document = await this.getOwnedDocument(userId, documentId);
    if (!ANALYZABLE_STATUSES.has(document.status)) {
      throw new ConflictException("Belge zaten işleniyor.");
    }

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: "OCR_PROCESSING", errorCode: null, errorMessage: null },
    });
    await this.queue.add("analyze", { documentId });

    return { status: "OCR_PROCESSING", errorCode: null, errorMessage: null };
  }

  async runPipeline(documentId: string): Promise<void> {
    const document = await this.prisma.document.findUniqueOrThrow({
      where: { id: documentId },
      include: { user: { select: { subscriptionPlan: true } } },
    });

    try {
      const buffer = await this.storage.getObjectBuffer(document.storageKey);
      const ocrResult = await this.ocrProvider.recognize({
        buffer,
        mimeType: document.mimeType,
        originalName: document.originalName,
      });

      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: "AI_PROCESSING", pageCount: ocrResult.pageCount },
      });

      const classification = await this.aiProvider.classifyDocument(ocrResult.text);
      const route = decideRoute({
        pageCount: ocrResult.pageCount,
        ocrConfidence: ocrResult.confidence,
        documentType: classification.documentType,
        subscriptionPlan: document.user.subscriptionPlan,
      });

      const extraction = await this.aiProvider.extractStructuredData(
        ocrResult.text,
        classification.documentType,
        route.tier,
      );
      const summary = await this.aiProvider.summarize(ocrResult.text, route.tier);

      const overallConfidence = Math.min(
        classification.confidence,
        extraction.confidence,
        ocrResult.confidence,
      );
      const requiresReview = overallConfidence < REVIEW_CONFIDENCE_THRESHOLD;
      const recommendedTools = recommendToolSlugsForDocumentType(
        classification.documentType,
      );
      const encryptionKey = this.configService.get(
        "DOCUMENT_TEXT_ENCRYPTION_KEY",
        { infer: true },
      );

      await this.prisma.documentAnalysis.create({
        data: {
          documentId,
          schemaVersion: "1.0.0",
          provider: this.aiProvider.name,
          model: this.aiProvider.model,
          promptVersion: "1.0.0",
          extractedData: extraction.data as Prisma.InputJsonValue,
          summary,
          warnings: extraction.warnings as Prisma.InputJsonValue,
          recommendedTools: recommendedTools as Prisma.InputJsonValue,
          confidenceScore: overallConfidence,
          requiresReview,
        },
      });

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: requiresReview ? "REVIEW_REQUIRED" : "COMPLETED",
          documentType: classification.documentType,
          ocrTextEncrypted: encryptOcrText(ocrResult.text, encryptionKey),
        },
      });
    } catch (error) {
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: "FAILED",
          errorCode: "ANALYSIS_FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Bilinmeyen hata.",
        },
      });
      throw error;
    }
  }

  async getStatus(userId: string, documentId: string): Promise<DocumentStatusResponse> {
    const document = await this.getOwnedDocument(userId, documentId);
    return {
      status: document.status,
      errorCode: document.errorCode,
      errorMessage: document.errorMessage,
    };
  }

  async getAnalysis(
    userId: string,
    documentId: string,
  ): Promise<DocumentAnalysisSummary> {
    await this.getOwnedDocument(userId, documentId);
    const analysis = await this.prisma.documentAnalysis.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });
    if (!analysis) {
      throw new NotFoundException("Bu belge için analiz sonucu bulunamadı.");
    }
    return toAnalysisSummary(analysis);
  }

  async updateExtractedData(
    userId: string,
    documentId: string,
    input: UpdateExtractedDataInput,
  ): Promise<DocumentAnalysisSummary> {
    await this.getOwnedDocument(userId, documentId);
    const analysis = await this.prisma.documentAnalysis.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });
    if (!analysis) {
      throw new NotFoundException("Bu belge için analiz sonucu bulunamadı.");
    }

    const mergedData = {
      ...(analysis.extractedData as Record<string, unknown>),
      ...input.data,
    };

    const updated = await this.prisma.documentAnalysis.update({
      where: { id: analysis.id },
      data: {
        extractedData: mergedData as Prisma.InputJsonValue,
        requiresReview: false,
      },
    });

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: "COMPLETED" },
    });

    return toAnalysisSummary(updated);
  }

  async getRecommendedActions(
    userId: string,
    documentId: string,
  ): Promise<RecommendedAction[]> {
    const analysis = await this.getAnalysis(userId, documentId);
    if (analysis.recommendedTools.length === 0) return [];

    const tools = await this.prisma.toolDefinition.findMany({
      where: { slug: { in: analysis.recommendedTools }, isActive: true },
    });

    return analysis.recommendedTools
      .map((slug) => tools.find((tool) => tool.slug === slug))
      .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined)
      .map((tool) => ({
        toolSlug: tool.slug,
        toolName: tool.name,
        route: tool.route,
      }));
  }

  private async getOwnedDocument(userId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!document) {
      throw new NotFoundException("Belge bulunamadı.");
    }
    return document;
  }
}
