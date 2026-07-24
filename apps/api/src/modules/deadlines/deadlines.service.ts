import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { calculateDeadline } from "@hukukai/deadline-engine";
import { NOTIFICATION_OFFSETS_DAYS } from "@hukukai/config";
import type {
  CalculateDeadlineInput,
  CreateDeadlineInput,
  UpdateDeadlineInput,
} from "@hukukai/validation";
import type {
  DeadlineCalculationResponse,
  DeadlineSummary,
} from "@hukukai/types";
// Değer olarak import edilir: Nest'in constructor tabanlı DI çözümlemesi
// design:paramtypes metadata'sına ihtiyaç duyar; `import type` bunu Object'e
// düşürüp servis çözümlemesini bozar.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { RulesService } from "../rules/rules.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { BillingService } from "../billing/billing.service";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type DeadlineRow = {
  id: string;
  folderId: string | null;
  documentId: string | null;
  title: string;
  ruleId: string;
  ruleVersion: string;
  startEvent: string;
  startDate: Date;
  calculatedEndDate: Date;
  adjustedEndDate: Date;
  status: string;
  legalBasis: unknown;
  warnings: unknown;
  completedAt: Date | null;
  createdAt: Date;
};

function toDeadlineSummary(row: DeadlineRow): DeadlineSummary {
  return {
    id: row.id,
    folderId: row.folderId,
    documentId: row.documentId,
    title: row.title,
    ruleId: row.ruleId,
    ruleVersion: row.ruleVersion,
    startEvent: row.startEvent,
    startDate: row.startDate.toISOString().slice(0, 10),
    calculatedEndDate: row.calculatedEndDate.toISOString().slice(0, 10),
    adjustedEndDate: row.adjustedEndDate.toISOString().slice(0, 10),
    status: row.status as DeadlineSummary["status"],
    legalBasis: row.legalBasis as DeadlineSummary["legalBasis"],
    warnings: row.warnings as string[],
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class DeadlinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rulesService: RulesService,
    private readonly billingService: BillingService,
  ) {}

  async calculate(
    input: CalculateDeadlineInput,
  ): Promise<DeadlineCalculationResponse> {
    const rule = await this.rulesService.getRuleValidOn(
      input.ruleKey,
      input.startDate,
    );
    const holidays = await this.rulesService.getHolidays();
    const result = calculateDeadline({
      calculation: rule.data,
      startDate: input.startDate,
      holidays,
      referenceDate: todayIso(),
    });

    return {
      ruleId: rule.ruleKey,
      ruleVersion: rule.version,
      ...result,
      legalBasis: rule.legalBasis,
      warnings: rule.warnings,
      legislationStatus: rule.legislationStatus,
    };
  }

  async create(
    userId: string,
    input: CreateDeadlineInput,
  ): Promise<DeadlineSummary> {
    if (input.folderId) await this.assertFolderOwnership(userId, input.folderId);
    if (input.documentId) {
      await this.assertDocumentOwnership(userId, input.documentId);
    }
    await this.billingService.assertActiveDeadlineLimit(userId);

    if (input.mode === "CUSTOM") {
      const dueDate = new Date(`${input.dueDate}T00:00:00.000Z`);
      const deadline = await this.prisma.deadline.create({
        data: {
          userId,
          folderId: input.folderId ?? null,
          documentId: input.documentId ?? null,
          title: input.title,
          ruleId: "CUSTOM",
          ruleVersion: "-",
          startEvent: "MANUAL",
          startDate: new Date(`${todayIso()}T00:00:00.000Z`),
          calculatedEndDate: dueDate,
          adjustedEndDate: dueDate,
          status: "ACTIVE",
          legalBasis: [],
          warnings: [
            "Bu süre kullanıcı tarafından manuel olarak girilmiştir.",
          ],
        },
      });
      await this.scheduleReminders(deadline.id, userId, deadline.title, dueDate);
      return toDeadlineSummary(deadline);
    }

    const rule = await this.rulesService.getRuleValidOn(
      input.ruleKey,
      input.startDate,
    );
    const holidays = await this.rulesService.getHolidays();
    const result = calculateDeadline({
      calculation: rule.data,
      startDate: input.startDate,
      holidays,
      referenceDate: todayIso(),
    });

    const adjustedEndDate = new Date(`${result.adjustedEndDate}T00:00:00.000Z`);
    const warnings = [
      ...rule.warnings,
      ...result.appliedAdjustments.map((adjustment) => adjustment.description),
    ];

    const deadline = await this.prisma.deadline.create({
      data: {
        userId,
        folderId: input.folderId ?? null,
        documentId: input.documentId ?? null,
        title: input.title,
        ruleId: rule.ruleKey,
        ruleVersion: rule.version,
        startEvent: input.startEvent,
        startDate: new Date(`${result.startDate}T00:00:00.000Z`),
        calculatedEndDate: new Date(`${result.rawEndDate}T00:00:00.000Z`),
        adjustedEndDate,
        status: "ACTIVE",
        legalBasis: rule.legalBasis as unknown as Prisma.InputJsonValue,
        warnings: warnings as unknown as Prisma.InputJsonValue,
      },
    });

    await this.scheduleReminders(deadline.id, userId, deadline.title, adjustedEndDate);

    return toDeadlineSummary(deadline);
  }

  async findAll(userId: string): Promise<DeadlineSummary[]> {
    const deadlines = await this.prisma.deadline.findMany({
      where: { userId },
      orderBy: { adjustedEndDate: "asc" },
    });
    return deadlines.map(toDeadlineSummary);
  }

  async findUpcoming(userId: string, days: number): Promise<DeadlineSummary[]> {
    const now = new Date();
    const until = new Date(now.getTime() + days * MS_PER_DAY);
    const deadlines = await this.prisma.deadline.findMany({
      where: {
        userId,
        status: "ACTIVE",
        adjustedEndDate: { gte: now, lte: until },
      },
      orderBy: { adjustedEndDate: "asc" },
    });
    return deadlines.map(toDeadlineSummary);
  }

  async findOne(userId: string, id: string): Promise<DeadlineSummary> {
    return toDeadlineSummary(await this.getOwnedDeadline(userId, id));
  }

  async update(
    userId: string,
    id: string,
    input: UpdateDeadlineInput,
  ): Promise<DeadlineSummary> {
    await this.getOwnedDeadline(userId, id);
    const updated = await this.prisma.deadline.update({
      where: { id },
      data: input,
    });
    return toDeadlineSummary(updated);
  }

  async complete(userId: string, id: string): Promise<DeadlineSummary> {
    await this.getOwnedDeadline(userId, id);
    const updated = await this.prisma.deadline.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    return toDeadlineSummary(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwnedDeadline(userId, id);
    await this.prisma.deadline.delete({ where: { id } });
  }

  private async scheduleReminders(
    deadlineId: string,
    userId: string,
    title: string,
    dueDate: Date,
  ): Promise<void> {
    const now = new Date();
    const reminders = NOTIFICATION_OFFSETS_DAYS.map((offsetDays) => ({
      offsetDays,
      scheduledAt: new Date(dueDate.getTime() - offsetDays * MS_PER_DAY),
    })).filter((reminder) => reminder.scheduledAt.getTime() >= now.getTime());

    if (reminders.length === 0) return;

    await this.prisma.notification.createMany({
      data: reminders.map(({ offsetDays, scheduledAt }) => ({
        userId,
        deadlineId,
        title: "Süre Hatırlatıcısı",
        body:
          offsetDays === 0
            ? `"${title}" için son gün bugün.`
            : `"${title}" için son gün ${offsetDays} gün sonra.`,
        scheduledAt,
      })),
    });
  }

  private async getOwnedDeadline(userId: string, id: string) {
    const deadline = await this.prisma.deadline.findFirst({
      where: { id, userId },
    });
    if (!deadline) {
      throw new NotFoundException("Süre bulunamadı.");
    }
    return deadline;
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
