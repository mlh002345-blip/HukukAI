import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";

export interface RecordAuditLogInput {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  entityType?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(filters: AuditLogFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;

    return this.prisma.auditLog.findMany({
      where: {
        entityType: filters.entityType,
        userId: filters.userId,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
}
