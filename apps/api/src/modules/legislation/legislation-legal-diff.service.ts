import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { compareLegislationTexts } from "@hukukai/legislation-agents";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type LegislationDocumentRow = {
  id: string;
  sourceId: string;
  title: string;
  rawText: string;
  publicationDate: Date;
};

/**
 * Legal Diff Agent — yeni kaydedilen bir belgeyi, aynı kaynaktan ve aynı
 * başlıktan gelen bir önceki belgeyle karşılaştırır
 * (`@hukukai/legislation-agents`'ın saf `compareLegislationTexts`
 * fonksiyonunu kullanır). Fark tespit edilirse bir `LegislationChange`
 * kaydı oluşturur; ilk kez görülen bir başlık (önceki belge yok) her
 * zaman `NEW_PROVISION` olarak işlenir.
 */
@Injectable()
export class LegislationLegalDiffService {
  constructor(private readonly prisma: PrismaService) {}

  async detectChange(document: LegislationDocumentRow) {
    const previous = await this.prisma.legislationDocument.findFirst({
      where: {
        sourceId: document.sourceId,
        title: document.title,
        id: { not: document.id },
        publicationDate: { lt: document.publicationDate },
      },
      orderBy: { publicationDate: "desc" },
    });

    const detection = compareLegislationTexts({
      affectedLegislation: document.title,
      oldText: previous?.rawText ?? null,
      newText: document.rawText,
      effectiveDate: toIsoDate(document.publicationDate),
      publicationDate: toIsoDate(document.publicationDate),
    });
    if (!detection) return null;

    return this.prisma.legislationChange.create({
      data: {
        documentId: document.id,
        affectedLegislation: detection.affectedLegislation,
        changeType: detection.changeType,
        affectedSections: detection.affectedSections as unknown as Prisma.InputJsonValue,
        oldTextHash: detection.oldTextHash,
        newTextHash: detection.newTextHash,
        effectiveDate: new Date(`${detection.effectiveDate}T00:00:00.000Z`),
        publicationDate: new Date(`${detection.publicationDate}T00:00:00.000Z`),
        status: "DETECTED",
      },
    });
  }
}
