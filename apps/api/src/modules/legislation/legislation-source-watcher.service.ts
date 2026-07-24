import { Inject, Injectable } from "@nestjs/common";
import type { SourceWatcherProvider } from "@hukukai/legislation-agents";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";
import { SOURCE_WATCHER_PROVIDER_TOKEN } from "./legislation-queue.token";

/**
 * Source Watcher Agent — kayıtlı her `LegislationSource` için sağlayıcıdan
 * (Mock veya gerçek) en güncel belgeleri çeker. Aynı `contentHash`e sahip
 * bir belge zaten kaydedilmişse atlar (idempotent — aynı belge iki kez
 * işlenmez). Yeni kaydedilen belgeleri döner; bunlar bir sonraki adımda
 * (`LegislationLegalDiffService`) karşılaştırmaya girer.
 */
@Injectable()
export class LegislationSourceWatcherService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SOURCE_WATCHER_PROVIDER_TOKEN)
    private readonly provider: SourceWatcherProvider,
  ) {}

  async pollAllSources() {
    const sources = await this.prisma.legislationSource.findMany();
    const newDocuments = [];

    for (const source of sources) {
      const fetched = await this.provider.fetchLatestDocuments(source.key);

      for (const doc of fetched) {
        const existing = await this.prisma.legislationDocument.findFirst({
          where: { sourceId: source.id, contentHash: doc.contentHash },
        });
        if (existing) continue;

        const created = await this.prisma.legislationDocument.create({
          data: {
            sourceId: source.id,
            publicationDate: new Date(`${doc.publicationDate}T00:00:00.000Z`),
            gazetteNumber: doc.gazetteNumber ?? null,
            documentType: doc.documentType,
            title: doc.title,
            contentHash: doc.contentHash,
            rawText: doc.rawText,
            sourceUrl: doc.sourceUrl,
            downloadedAt: new Date(doc.downloadedAt),
          },
        });
        newDocuments.push(created);
      }

      await this.prisma.legislationSource.update({
        where: { id: source.id },
        data: { lastPolledAt: new Date() },
      });
    }

    return newDocuments;
  }
}
