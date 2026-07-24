import { createHash } from "node:crypto";
import type { LegislationChangeDetection, LegislationChangeType } from "./types";

export interface CompareLegislationTextsInput {
  affectedLegislation: string;
  oldText: string | null;
  newText: string;
  effectiveDate: string;
  publicationDate: string;
}

export function hashLegislationText(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

const CHANGE_TYPE_KEYWORD_RULES: Array<{ type: LegislationChangeType; keywords: string[] }> = [
  { type: "COURT_ANNULMENT", keywords: ["anayasa mahkemesi", "iptal karar", "iptaline"] },
  { type: "REPEALED_PROVISION", keywords: ["yürürlükten kaldırılmıştır", "ilga edilmiştir"] },
  { type: "DEADLINE_EXTENSION", keywords: ["süre uzatılmıştır", "süresi uzatılmıştır"] },
  { type: "ADMINISTRATIVE_HOLIDAY", keywords: ["idari tatil", "mücbir sebep hali"] },
  { type: "TEMPORARY_ARTICLE", keywords: ["geçici madde"] },
  { type: "EFFECTIVE_DATE_CHANGE", keywords: ["yürürlük tarihi"] },
  { type: "RATE_CHANGE", keywords: ["oran", "yüzde", "%"] },
  { type: "THRESHOLD_CHANGE", keywords: ["tutarı", "tavan", "sınırı", "limit"] },
  { type: "DEADLINE_CHANGE", keywords: ["süre", "gün içinde"] },
];

/** Metinde "madde X", "fıkra Y" veya "II/B-11.3" gibi bölüm referanslarını
 * bulur. Hiçbiri bulunamazsa boş dizi döner — bu bir eksiklik değildir,
 * çağıran taraf (Impact Agent) bölüm bulunamadığında tüm belgeyi
 * etkilenmiş kabul edebilir. */
const SECTION_REFERENCE_PATTERN = /(?:madde\s+\d+(?:\/\d+)?|[IVX]+\/[A-Z]-\d+(?:\.\d+)*)/gi;

function detectChangeType(oldText: string | null, newText: string): LegislationChangeType {
  const normalized = newText.toLocaleLowerCase("tr");
  for (const rule of CHANGE_TYPE_KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.type;
    }
  }
  return oldText === null ? "NEW_PROVISION" : "AMENDED_PROVISION";
}

function extractAffectedSections(text: string): string[] {
  const matches = text.match(SECTION_REFERENCE_PATTERN) ?? [];
  return [...new Set(matches.map((match) => match.trim()))];
}

/**
 * Legal Diff Agent'ın saf çekirdeği. İki metnin hash'ini karşılaştırır;
 * fark yoksa `null` döner (değişiklik yok). Fark varsa değişiklik türünü
 * ve etkilenen bölümleri anahtar kelime/desen eşleştirmesiyle tahmin
 * eder — bu MVP sezgiseldir, kesin bir NLP sınıflandırıcısı değildir;
 * `RuleAuthorService` bu tahmini bir başlangıç noktası olarak kullanır,
 * nihai `changeType` insan/AI incelemesiyle düzeltilebilir.
 */
export function compareLegislationTexts(
  input: CompareLegislationTextsInput,
): LegislationChangeDetection | null {
  const newTextHash = hashLegislationText(input.newText);
  const oldTextHash = input.oldText === null ? null : hashLegislationText(input.oldText);

  if (oldTextHash === newTextHash) {
    return null;
  }

  return {
    affectedLegislation: input.affectedLegislation,
    changeType: detectChangeType(input.oldText, input.newText),
    affectedSections: extractAffectedSections(input.newText),
    oldTextHash,
    newTextHash,
    effectiveDate: input.effectiveDate,
    publicationDate: input.publicationDate,
  };
}
