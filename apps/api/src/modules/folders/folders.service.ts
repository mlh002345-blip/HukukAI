import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateFolderInput, UpdateFolderInput } from "@hukukai/validation";
import type { FolderSummary } from "@hukukai/types";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";

type FolderRow = {
  id: string;
  title: string;
  folderType: string;
  clientName: string | null;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { documents: number };
};

function toFolderSummary(row: FolderRow): FolderSummary {
  return {
    id: row.id,
    title: row.title,
    folderType: row.folderType as FolderSummary["folderType"],
    clientName: row.clientName,
    referenceNumber: row.referenceNumber,
    notes: row.notes,
    documentCount: row._count?.documents ?? 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    input: CreateFolderInput,
  ): Promise<FolderSummary> {
    const folder = await this.prisma.caseFolder.create({
      data: {
        userId,
        title: input.title,
        folderType: input.folderType,
        clientName: input.clientName,
        referenceNumber: input.referenceNumber,
        notes: input.notes,
      },
      include: { _count: { select: { documents: true } } },
    });
    return toFolderSummary(folder);
  }

  async findAll(userId: string): Promise<FolderSummary[]> {
    const folders = await this.prisma.caseFolder.findMany({
      where: { userId, deletedAt: null },
      include: { _count: { select: { documents: true } } },
      orderBy: { createdAt: "desc" },
    });
    return folders.map(toFolderSummary);
  }

  async findOne(userId: string, id: string): Promise<FolderSummary> {
    const folder = await this.getOwnedFolder(userId, id);
    return toFolderSummary(folder);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateFolderInput,
  ): Promise<FolderSummary> {
    await this.getOwnedFolder(userId, id);
    const folder = await this.prisma.caseFolder.update({
      where: { id },
      data: input,
      include: { _count: { select: { documents: true } } },
    });
    return toFolderSummary(folder);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwnedFolder(userId, id);
    await this.prisma.caseFolder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async getOwnedFolder(userId: string, id: string): Promise<FolderRow> {
    const folder = await this.prisma.caseFolder.findFirst({
      where: { id, userId, deletedAt: null },
      include: { _count: { select: { documents: true } } },
    });
    if (!folder) {
      throw new NotFoundException("Klasör bulunamadı.");
    }
    return folder;
  }
}
