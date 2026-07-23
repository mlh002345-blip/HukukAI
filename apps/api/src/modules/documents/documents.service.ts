import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  CompleteUploadInput,
  RequestUploadUrlInput,
} from "@hukukai/validation";
import type { DocumentSummary, UploadUrlResponse } from "@hukukai/types";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StorageService, UPLOAD_URL_TTL_SECONDS } from "../storage/storage.service";
import {
  UploadValidationError,
  validateUploadRequest,
} from "./document-validation";
import { buildStorageKey } from "./storage-key";
import { scanChecksum } from "./virus-scan";

type DocumentRow = {
  id: string;
  folderId: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  documentType: string | null;
  pageCount: number | null;
  createdAt: Date;
};

function toDocumentSummary(row: DocumentRow): DocumentSummary {
  return {
    id: row.id,
    folderId: row.folderId,
    originalName: row.originalName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    status: row.status as DocumentSummary["status"],
    documentType: row.documentType as DocumentSummary["documentType"],
    pageCount: row.pageCount,
    createdAt: row.createdAt.toISOString(),
  };
}

function toBadRequest(error: unknown): never {
  if (error instanceof UploadValidationError) {
    throw new BadRequestException({ message: error.message, code: error.code });
  }
  throw error;
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async createUploadUrl(
    userId: string,
    input: RequestUploadUrlInput,
  ): Promise<UploadUrlResponse> {
    try {
      validateUploadRequest(input);
    } catch (error) {
      toBadRequest(error);
    }

    if (input.folderId) {
      await this.assertFolderOwnership(userId, input.folderId);
    }

    const storageKey = buildStorageKey(userId, input.fileName);
    const uploadUrl = await this.storage.createUploadUrl(
      storageKey,
      input.mimeType,
    );

    return {
      uploadUrl,
      storageKey,
      expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
    };
  }

  async completeUpload(
    userId: string,
    input: CompleteUploadInput,
  ): Promise<DocumentSummary> {
    try {
      validateUploadRequest(input);
    } catch (error) {
      toBadRequest(error);
    }

    if (input.folderId) {
      await this.assertFolderOwnership(userId, input.folderId);
    }

    const existing = await this.prisma.document.findUnique({
      where: { userId_checksum: { userId, checksum: input.checksum } },
    });
    if (existing) {
      throw new ConflictException("Bu belge daha önce yüklenmiş.");
    }

    const stored = await this.storage.headObject(input.storageKey);
    if (!stored) {
      throw new BadRequestException(
        "Yüklenen dosya bulunamadı. Lütfen tekrar yükleyin.",
      );
    }
    if (stored.sizeBytes !== input.sizeBytes) {
      throw new BadRequestException("Dosya boyutu doğrulanamadı.");
    }

    const scanResult = scanChecksum(input.checksum);
    if (!scanResult.clean) {
      await this.storage.deleteObject(input.storageKey);
      throw new BadRequestException("Dosya virüs taramasından geçemedi.");
    }

    const document = await this.prisma.document.create({
      data: {
        userId,
        folderId: input.folderId ?? null,
        originalName: input.fileName,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        checksum: input.checksum,
        status: "UPLOADED",
      },
    });

    return toDocumentSummary(document);
  }

  async findAll(userId: string, folderId?: string): Promise<DocumentSummary[]> {
    const documents = await this.prisma.document.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(folderId ? { folderId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return documents.map(toDocumentSummary);
  }

  async findOne(userId: string, id: string): Promise<DocumentSummary> {
    const document = await this.getOwnedDocument(userId, id);
    return toDocumentSummary(document);
  }

  async remove(userId: string, id: string): Promise<void> {
    const document = await this.getOwnedDocument(userId, id);
    await this.prisma.document.update({
      where: { id: document.id },
      data: { deletedAt: new Date() },
    });
    await this.storage.deleteObject(document.storageKey);
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
}
