import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { MultiModelConsensusProvider, RuleProposal } from "@hukukai/legislation-agents";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { PrismaService } from "../../prisma/prisma.service";
import { MULTI_MODEL_CONSENSUS_PROVIDER_TOKEN } from "./legislation-queue.token";

type RuleSetRow = {
  id: string;
  ruleKey: string;
  module: string;
  version: string;
  validFrom: Date;
  validTo: Date | null;
  ruleData: unknown;
  legalBasis: unknown;
  supersedesRuleSetId: string | null;
};

function toProposal(row: RuleSetRow): RuleProposal {
  return {
    ruleKey: row.ruleKey,
    module: row.module,
    version: row.version,
    validFrom: row.validFrom.toISOString().slice(0, 10),
    validTo: row.validTo ? row.validTo.toISOString().slice(0, 10) : null,
    selectorDateType: "TRANSACTION_DATE",
    ruleData: row.ruleData as Record<string, unknown>,
    legalBasis: row.legalBasis as RuleProposal["legalBasis"],
    supersedesRuleSetId: row.supersedesRuleSetId,
  };
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Independent Reviewer Agent — Rule Author Agent'ın ürettiği taslağı,
 * `MultiModelConsensusProvider` üzerinden bağımsız olarak yeniden
 * üretir ve alan alan karşılaştırır. Sonuç
 * `RuleVerificationResult(layer=MODEL_CONSENSUS)` olarak kaydedilir.
 * **`Mock` sağlayıcıyla bu katman gerçek bir bağımsız doğrulama
 * yapmaz** (her zaman ilk taslakla mutabıktır) — yalnızca boru
 * hattının geri kalanını uçtan uca çalıştırmaya yarar; gerçek bir
 * ikinci LLM sağlayıcısı entegre edilene kadar bu katmanın sonucuna
 * production'da güvenilmemelidir (bkz. CLAUDE.md kapsam notu).
 */
@Injectable()
export class LegislationIndependentReviewService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MULTI_MODEL_CONSENSUS_PROVIDER_TOKEN)
    private readonly provider: MultiModelConsensusProvider,
  ) {}

  async review(draft: RuleSetRow) {
    const firstDraft = toProposal(draft);
    const reproduced = await this.provider.independentlyReproduce(firstDraft);
    const passed = deepEqual(firstDraft, reproduced);

    return this.prisma.ruleVerificationResult.create({
      data: {
        ruleSetId: draft.id,
        layer: "MODEL_CONSENSUS",
        passed,
        details: {
          provider: this.provider.name,
          firstDraft,
          reproduced,
        } as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
