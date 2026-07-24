import { Injectable, NotFoundException } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Admin panelindeki "Mevzuat İzleme" ekranı için sorgu katmanı — yalnızca
 * okuma ve en son aday `RuleSet`i bulma; onaylama/reddetme mantığı
 * `LegislationReleaseDecisionService`dedir (Bölüm: Release Decision Agent).
 */
@Injectable()
export class LegislationAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listChanges() {
    return this.prisma.legislationChange.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        impactAssessment: true,
        document: { include: { source: true } },
      },
    });
  }

  async getChange(id: string) {
    const change = await this.prisma.legislationChange.findUnique({
      where: { id },
      include: {
        impactAssessment: true,
        document: { include: { source: true } },
        ruleSets: {
          include: { verificationResults: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!change) {
      throw new NotFoundException("Mevzuat değişikliği bulunamadı.");
    }
    return change;
  }

  async getLatestDraftRuleSetId(changeId: string): Promise<string> {
    const ruleSet = await this.prisma.ruleSet.findFirst({
      where: { changeId },
      orderBy: { createdAt: "desc" },
    });
    if (!ruleSet) {
      throw new NotFoundException(
        "Bu değişiklik için henüz bir kural taslağı üretilmedi.",
      );
    }
    return ruleSet.id;
  }
}
