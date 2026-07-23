import { NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type {
  AdminDashboardSummary,
  AdminUserDetail,
  AdminUserSummary,
  AiUsageSummary,
  AuditLogEntry,
  DocumentErrorSummary,
  HolidaySummary,
  RuleSetSummary,
} from "@hukukai/types";
import type {
  CreateHolidayInput,
  CreateRuleSetInput,
  ListAuditLogsQuery,
  ListUsersQuery,
} from "@hukukai/validation";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditLogService } from "../audit/audit-log.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async listUsers(query: ListUsersQuery): Promise<AdminUserSummary[]> {
    const users = await this.prisma.user.findMany({
      where: query.query
        ? {
            OR: [
              { email: { contains: query.query, mode: "insensitive" } },
              { fullName: { contains: query.query, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    }));
  }

  async getUser(id: string): Promise<AdminUserDetail> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Kullanıcı bulunamadı.");
    }

    const [documentCount, deadlineCount, calculationCount] = await Promise.all([
      this.prisma.document.count({ where: { userId: id, deletedAt: null } }),
      this.prisma.deadline.count({ where: { userId: id } }),
      this.prisma.calculation.count({ where: { userId: id } }),
    ]);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      documentCount,
      deadlineCount,
      calculationCount,
    };
  }

  async freezeUser(adminUserId: string, id: string): Promise<AdminUserDetail> {
    await this.assertUserExists(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    await this.auditLog.record({
      userId: adminUserId,
      action: "USER_FROZEN",
      entityType: "User",
      entityId: id,
    });
    return this.getUser(id);
  }

  async unfreezeUser(adminUserId: string, id: string): Promise<AdminUserDetail> {
    await this.assertUserExists(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: true } });
    await this.auditLog.record({
      userId: adminUserId,
      action: "USER_UNFROZEN",
      entityType: "User",
      entityId: id,
    });
    return this.getUser(id);
  }

  async listDocumentErrors(): Promise<DocumentErrorSummary[]> {
    const documents = await this.prisma.document.findMany({
      where: { status: "FAILED" },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: { user: { select: { email: true } } },
    });

    return documents.map((document) => ({
      id: document.id,
      userId: document.userId,
      userEmail: document.user.email,
      originalName: document.originalName,
      errorCode: document.errorCode,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt.toISOString(),
    }));
  }

  async listRuleSets(): Promise<RuleSetSummary[]> {
    const ruleSets = await this.prisma.ruleSet.findMany({
      orderBy: [{ module: "asc" }, { ruleKey: "asc" }, { validFrom: "desc" }],
    });
    return ruleSets.map(toRuleSetSummary);
  }

  async createRuleSet(
    adminUserId: string,
    input: CreateRuleSetInput,
  ): Promise<RuleSetSummary> {
    const ruleSet = await this.prisma.ruleSet.create({
      data: {
        module: input.module,
        ruleKey: input.ruleKey,
        version: input.version,
        validFrom: new Date(`${input.validFrom}T00:00:00.000Z`),
        validTo: input.validTo ? new Date(`${input.validTo}T00:00:00.000Z`) : null,
        ruleData: input.ruleData as Prisma.InputJsonValue,
        legalBasis: input.legalBasis as unknown as Prisma.InputJsonValue,
        sourceUrl: input.sourceUrl ?? null,
        sourceHash: input.sourceHash ?? null,
        isPublished: false,
      },
    });
    await this.auditLog.record({
      userId: adminUserId,
      action: "RULE_SET_CREATED",
      entityType: "RuleSet",
      entityId: ruleSet.id,
      metadata: { ruleKey: ruleSet.ruleKey, version: ruleSet.version },
    });
    return toRuleSetSummary(ruleSet);
  }

  async publishRuleSet(adminUserId: string, id: string): Promise<RuleSetSummary> {
    const existing = await this.prisma.ruleSet.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Kural sürümü bulunamadı.");
    }
    const ruleSet = await this.prisma.ruleSet.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
    await this.auditLog.record({
      userId: adminUserId,
      action: "RULE_SET_PUBLISHED",
      entityType: "RuleSet",
      entityId: ruleSet.id,
      metadata: { ruleKey: ruleSet.ruleKey, version: ruleSet.version },
    });
    return toRuleSetSummary(ruleSet);
  }

  async listHolidays(): Promise<HolidaySummary[]> {
    const holidays = await this.prisma.holiday.findMany({ orderBy: { date: "asc" } });
    return holidays.map(toHolidaySummary);
  }

  async createHoliday(
    adminUserId: string,
    input: CreateHolidayInput,
  ): Promise<HolidaySummary> {
    const holiday = await this.prisma.holiday.create({
      data: {
        date: new Date(`${input.date}T00:00:00.000Z`),
        name: input.name,
        isHalfDay: input.isHalfDay,
        source: input.source ?? null,
      },
    });
    await this.auditLog.record({
      userId: adminUserId,
      action: "HOLIDAY_CREATED",
      entityType: "Holiday",
      entityId: holiday.id,
      metadata: { name: holiday.name },
    });
    return toHolidaySummary(holiday);
  }

  async deleteHoliday(adminUserId: string, id: string): Promise<void> {
    const existing = await this.prisma.holiday.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Resmi tatil bulunamadı.");
    }
    await this.prisma.holiday.delete({ where: { id } });
    await this.auditLog.record({
      userId: adminUserId,
      action: "HOLIDAY_DELETED",
      entityType: "Holiday",
      entityId: id,
      metadata: { name: existing.name },
    });
  }

  async getAiUsage(): Promise<AiUsageSummary[]> {
    const grouped = await this.prisma.documentAnalysis.groupBy({
      by: ["provider", "model"],
      _count: { _all: true },
      _sum: { inputTokens: true, outputTokens: true, estimatedCostUsd: true },
    });

    return grouped.map((row) => ({
      provider: row.provider,
      model: row.model,
      analysisCount: row._count._all,
      totalInputTokens: row._sum.inputTokens ?? 0,
      totalOutputTokens: row._sum.outputTokens ?? 0,
      totalEstimatedCostUsd: (row._sum.estimatedCostUsd ?? 0).toString(),
    }));
  }

  async getAuditLogs(filters: ListAuditLogsQuery): Promise<AuditLogEntry[]> {
    const logs = await this.auditLog.findAll(filters);
    return logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: (log.metadata ?? {}) as Record<string, unknown>,
      createdAt: log.createdAt.toISOString(),
    }));
  }

  async getDashboard(): Promise<AdminDashboardSummary> {
    const periodStart = new Date();
    periodStart.setUTCDate(1);
    periodStart.setUTCHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      failedDocumentsCount,
      unpublishedRuleSetsCount,
      monthlyCostAggregate,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.document.count({ where: { status: "FAILED" } }),
      this.prisma.ruleSet.count({ where: { isPublished: false } }),
      this.prisma.documentAnalysis.aggregate({
        where: { createdAt: { gte: periodStart } },
        _sum: { estimatedCostUsd: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      failedDocumentsCount,
      unpublishedRuleSetsCount,
      monthlyAiCostUsd: (monthlyCostAggregate._sum.estimatedCostUsd ?? 0).toString(),
    };
  }

  private async assertUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Kullanıcı bulunamadı.");
    }
  }
}

function toRuleSetSummary(ruleSet: {
  id: string;
  module: string;
  ruleKey: string;
  version: string;
  validFrom: Date;
  validTo: Date | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}): RuleSetSummary {
  return {
    id: ruleSet.id,
    module: ruleSet.module,
    ruleKey: ruleSet.ruleKey,
    version: ruleSet.version,
    validFrom: ruleSet.validFrom.toISOString().slice(0, 10),
    validTo: ruleSet.validTo ? ruleSet.validTo.toISOString().slice(0, 10) : null,
    isPublished: ruleSet.isPublished,
    publishedAt: ruleSet.publishedAt ? ruleSet.publishedAt.toISOString() : null,
    createdAt: ruleSet.createdAt.toISOString(),
  };
}

function toHolidaySummary(holiday: {
  id: string;
  date: Date;
  name: string;
  isHalfDay: boolean;
  source: string | null;
}): HolidaySummary {
  return {
    id: holiday.id,
    date: holiday.date.toISOString().slice(0, 10),
    name: holiday.name,
    isHalfDay: holiday.isHalfDay,
    source: holiday.source,
  };
}
