import type { LegalBasisRef } from "@hukukai/rule-engine";

/**
 * Otonom Mevzuat Sistemi — resmî kaynakları izleyen, değişikliği tespit
 * eden, etkisini analiz eden, yeni kural sürümü üreten, bağımsız
 * doğrulayan ve yalnızca güvenli değişiklikleri otomatik yayınlayan boru
 * hattının tip tanımları. Bu paket saf mantık içerir — ağ çağrısı,
 * Prisma erişimi veya gerçek bir LLM çağrısı yapmaz; enum değerleri
 * `apps/api/prisma/schema.prisma`'daki karşılıklarıyla birebir aynı
 * string değerleri kullanır (Prisma bağımlılığı olmadan).
 */

export const LEGISLATION_SOURCE_CATEGORIES = [
  "RESMI_GAZETE",
  "GIB",
  "SGK",
  "ADALET_BAKANLIGI",
  "CTE_GENEL_MUDURLUGU",
  "ANAYASA_MAHKEMESI",
  "DIGER_KURUM",
] as const;
export type LegislationSourceCategory = (typeof LEGISLATION_SOURCE_CATEGORIES)[number];

export const LEGISLATION_CHANGE_TYPES = [
  "NEW_PROVISION",
  "AMENDED_PROVISION",
  "REPEALED_PROVISION",
  "RATE_CHANGE",
  "THRESHOLD_CHANGE",
  "DEADLINE_CHANGE",
  "TEMPORARY_ARTICLE",
  "EFFECTIVE_DATE_CHANGE",
  "COURT_ANNULMENT",
  "DEADLINE_EXTENSION",
  "ADMINISTRATIVE_HOLIDAY",
  "IMPLEMENTATION_CIRCULAR",
] as const;
export type LegislationChangeType = (typeof LEGISLATION_CHANGE_TYPES)[number];

/**
 * Bu değişiklik türleri, tüm doğrulama katmanları geçerse otomatik
 * yayınlanmaya *uygun aday* olabilir (kesin karar `decideReleaseRisk`
 * fonksiyonundadır — bu liste tek başına yeterli değildir).
 */
export const AUTO_PUBLISH_ELIGIBLE_CHANGE_TYPES: readonly LegislationChangeType[] = [
  "RATE_CHANGE",
  "THRESHOLD_CHANGE",
  "DEADLINE_EXTENSION",
  "ADMINISTRATIVE_HOLIDAY",
  "EFFECTIVE_DATE_CHANGE",
];

/**
 * Bu değişiklik türleri hiçbir koşulda otomatik yayınlanmaz — her zaman
 * insan onayı bekler (kullanıcının talebindeki "otomatik
 * yayımlanmamalı" listesi).
 */
export const NEVER_AUTO_PUBLISH_CHANGE_TYPES: readonly LegislationChangeType[] = [
  "REPEALED_PROVISION",
  "COURT_ANNULMENT",
  "TEMPORARY_ARTICLE",
];

export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RULE_SELECTOR_DATE_TYPES = [
  "TRANSACTION_DATE",
  "OFFENSE_DATE",
  "JUDGMENT_DATE",
  "FINALIZATION_DATE",
  "EXECUTION_DATE",
  "PUBLICATION_DATE",
] as const;
export type RuleSelectorDateType = (typeof RULE_SELECTOR_DATE_TYPES)[number];

export const VERIFICATION_LAYERS = [
  "SOURCE_INTEGRITY",
  "SECOND_SOURCE",
  "MODEL_CONSENSUS",
  "SCHEMA_VALIDATION",
  "GOLDEN_TESTS",
  "REGRESSION",
] as const;
export type VerificationLayer = (typeof VERIFICATION_LAYERS)[number];

export const RELEASE_DECISIONS = ["AUTO_PUBLISH", "HOLD_FOR_REVIEW", "REJECT"] as const;
export type ReleaseDecisionOutcome = (typeof RELEASE_DECISIONS)[number];

/** Source Watcher Agent — bir kaynaktan indirilen belge. */
export interface LegislationDocumentFetch {
  sourceKey: string;
  publicationDate: string;
  gazetteNumber?: string;
  documentType: string;
  title: string;
  contentHash: string;
  sourceUrl: string;
  rawText: string;
  downloadedAt: string;
}

/** Legal Diff Agent çıktısı. */
export interface LegislationChangeDetection {
  affectedLegislation: string;
  changeType: LegislationChangeType;
  affectedSections: string[];
  oldTextHash: string | null;
  newTextHash: string;
  effectiveDate: string;
  publicationDate: string;
}

/** Impact Agent çıktısı. */
export interface RuleImpactAssessmentResult {
  affectedModules: string[];
  affectedRuleIds: string[];
  historicalImpact: boolean;
  prospectiveImpact: boolean;
  requiresMigration: boolean;
  riskLevel: RiskLevel;
  /** İnfaz gibi çok tarihli hesaplamalar için hangi olay tarihinin
   * kural seçimini belirlediğine dair notlar. */
  dateSelectorNotes?: Record<string, unknown>;
}

/** Rule Author Agent çıktısı — aday RuleSet (henüz yayınlanmamış taslak). */
export interface RuleProposal {
  ruleKey: string;
  module: string;
  version: string;
  validFrom: string;
  validTo: string | null;
  selectorDateType: RuleSelectorDateType;
  ruleData: Record<string, unknown>;
  legalBasis: LegalBasisRef[];
  supersedesRuleSetId: string | null;
}

/** Bir doğrulama katmanının sonucu. */
export interface VerificationLayerResult {
  layer: VerificationLayer;
  passed: boolean;
  details: Record<string, unknown>;
}

/** Golden test senaryosu ve beklenen sonucu. */
export interface GoldenTestCase<TFacts = Record<string, unknown>, TOutcome = Record<string, unknown>> {
  ruleKey: string;
  name: string;
  facts: TFacts;
  expectedOutcome: TOutcome;
}

export interface GoldenTestRunResult<TOutcome = Record<string, unknown>> {
  testCase: GoldenTestCase<Record<string, unknown>, TOutcome>;
  passed: boolean;
  actualOutcome: TOutcome;
}

/** Release Decision Agent'a giren toplu doğrulama durumu. */
export interface ReleaseRiskInput {
  changeType: LegislationChangeType;
  verificationResults: VerificationLayerResult[];
  confidenceScore: number;
}

export interface ReleaseDecision {
  outcome: ReleaseDecisionOutcome;
  reasons: string[];
}

/**
 * Source Watcher Agent'ın değiştirilebilir sağlayıcı arayüzü —
 * `@hukukai/ai-provider`/`@hukukai/billing`'deki `AIProvider`/
 * `PaymentProvider` deseniyle birebir aynı: gerçek bir sağlayıcı
 * (Resmî Gazete/GİB/SGK/Adalet Bakanlığı/AYM'ye HTTP istekleri atan,
 * siteye özel bir parser) ayrı bir sonraki fazdır; bu pakette yalnızca
 * arayüz ve deterministik `MockSourceWatcherProvider` bulunur.
 */
export interface SourceWatcherProvider {
  readonly name: string;
  fetchLatestDocuments(sourceKey: string): Promise<LegislationDocumentFetch[]>;
}

/**
 * Bağımsız çoklu model mutabakatı için değiştirilebilir sağlayıcı
 * arayüzü. Gerçek bir ikinci LLM sağlayıcısı entegrasyonu, kullanıcının
 * sağlayıcı/API anahtarı kararını bekleyen ayrı bir sonraki fazdır; bu
 * pakette yalnızca arayüz ve deterministik
 * `MockMultiModelConsensusProvider` bulunur.
 */
export interface MultiModelConsensusProvider {
  readonly name: string;
  /** Verilen ilk taslağı bağımsız olarak yeniden üretir (veya aynı
   * taslağı döner — Mock sağlayıcı her zaman mutabıktır). */
  independentlyReproduce(firstDraft: RuleProposal): Promise<RuleProposal>;
}
