-- CreateEnum
CREATE TYPE "LegislationSourceCategory" AS ENUM ('RESMI_GAZETE', 'GIB', 'SGK', 'ADALET_BAKANLIGI', 'CTE_GENEL_MUDURLUGU', 'ANAYASA_MAHKEMESI', 'DIGER_KURUM');

-- CreateEnum
CREATE TYPE "LegislationChangeType" AS ENUM ('NEW_PROVISION', 'AMENDED_PROVISION', 'REPEALED_PROVISION', 'RATE_CHANGE', 'THRESHOLD_CHANGE', 'DEADLINE_CHANGE', 'TEMPORARY_ARTICLE', 'EFFECTIVE_DATE_CHANGE', 'COURT_ANNULMENT', 'DEADLINE_EXTENSION', 'ADMINISTRATIVE_HOLIDAY', 'IMPLEMENTATION_CIRCULAR');

-- CreateEnum
CREATE TYPE "LegislationChangeStatus" AS ENUM ('DETECTED', 'ANALYZING', 'RULE_PROPOSED', 'VERIFIED', 'PUBLISHED', 'REJECTED', 'HOLD_FOR_REVIEW');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RuleSetStatus" AS ENUM ('DRAFT', 'CHANGE_DETECTED', 'TEMPORARILY_RESTRICTED', 'VERIFIED', 'CANARY', 'ACTIVE', 'SUPERSEDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RuleSelectorDateType" AS ENUM ('TRANSACTION_DATE', 'OFFENSE_DATE', 'JUDGMENT_DATE', 'FINALIZATION_DATE', 'EXECUTION_DATE', 'PUBLICATION_DATE');

-- CreateEnum
CREATE TYPE "VerificationLayer" AS ENUM ('SOURCE_INTEGRITY', 'SECOND_SOURCE', 'MODEL_CONSENSUS', 'SCHEMA_VALIDATION', 'GOLDEN_TESTS', 'REGRESSION');

-- CreateEnum
CREATE TYPE "RemediationStatus" AS ENUM ('PENDING', 'RECALCULATED', 'NOTIFIED');

-- AlterTable
ALTER TABLE "deadlines" ADD COLUMN     "invalidatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "rule_sets" ADD COLUMN     "changeId" TEXT,
ADD COLUMN     "confidenceScore" DECIMAL(5,4),
ADD COLUMN     "requiresFavorableLawComparison" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selectorDateType" "RuleSelectorDateType",
ADD COLUMN     "status" "RuleSetStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "supersedesRuleSetId" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "legislation_sources" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "LegislationSourceCategory" NOT NULL,
    "pollIntervalMinutes" INTEGER NOT NULL,
    "lastPolledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legislation_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legislation_documents" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "gazetteNumber" TEXT,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legislation_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legislation_changes" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "affectedLegislation" TEXT NOT NULL,
    "changeType" "LegislationChangeType" NOT NULL,
    "affectedSections" JSONB NOT NULL,
    "oldTextHash" TEXT,
    "newTextHash" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "status" "LegislationChangeStatus" NOT NULL DEFAULT 'DETECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legislation_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_impact_assessments" (
    "id" TEXT NOT NULL,
    "changeId" TEXT NOT NULL,
    "affectedModules" JSONB NOT NULL,
    "affectedRuleIds" JSONB NOT NULL,
    "historicalImpact" BOOLEAN NOT NULL,
    "prospectiveImpact" BOOLEAN NOT NULL,
    "requiresMigration" BOOLEAN NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "dateSelectorNotes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_impact_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_verification_results" (
    "id" TEXT NOT NULL,
    "ruleSetId" TEXT NOT NULL,
    "layer" "VerificationLayer" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_verification_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_test_cases" (
    "id" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "expectedOutcome" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "golden_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_test_results" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "ruleSetId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "actualOutcome" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "golden_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_remediations" (
    "id" TEXT NOT NULL,
    "supersededRuleSetId" TEXT NOT NULL,
    "newRuleSetId" TEXT NOT NULL,
    "affectedDeadlineIds" JSONB NOT NULL,
    "status" "RemediationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_remediations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legislation_sources_key_key" ON "legislation_sources"("key");

-- CreateIndex
CREATE INDEX "legislation_documents_sourceId_publicationDate_idx" ON "legislation_documents"("sourceId", "publicationDate");

-- CreateIndex
CREATE INDEX "legislation_documents_contentHash_idx" ON "legislation_documents"("contentHash");

-- CreateIndex
CREATE INDEX "legislation_changes_documentId_idx" ON "legislation_changes"("documentId");

-- CreateIndex
CREATE INDEX "legislation_changes_status_idx" ON "legislation_changes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rule_impact_assessments_changeId_key" ON "rule_impact_assessments"("changeId");

-- CreateIndex
CREATE INDEX "rule_verification_results_ruleSetId_layer_idx" ON "rule_verification_results"("ruleSetId", "layer");

-- CreateIndex
CREATE INDEX "golden_test_cases_ruleKey_idx" ON "golden_test_cases"("ruleKey");

-- CreateIndex
CREATE INDEX "golden_test_results_ruleSetId_idx" ON "golden_test_results"("ruleSetId");

-- CreateIndex
CREATE INDEX "rule_sets_status_idx" ON "rule_sets"("status");

-- AddForeignKey
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_changeId_fkey" FOREIGN KEY ("changeId") REFERENCES "legislation_changes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_supersedesRuleSetId_fkey" FOREIGN KEY ("supersedesRuleSetId") REFERENCES "rule_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legislation_documents" ADD CONSTRAINT "legislation_documents_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "legislation_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legislation_changes" ADD CONSTRAINT "legislation_changes_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "legislation_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_impact_assessments" ADD CONSTRAINT "rule_impact_assessments_changeId_fkey" FOREIGN KEY ("changeId") REFERENCES "legislation_changes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_verification_results" ADD CONSTRAINT "rule_verification_results_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "rule_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golden_test_results" ADD CONSTRAINT "golden_test_results_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "golden_test_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golden_test_results" ADD CONSTRAINT "golden_test_results_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "rule_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- DataMigration: mevcut (seed) yayınlanmış RuleSet satırları için status
-- alanını isPublished ile tutarlı hale getirir. Yeni eklenen "status"
-- sütunu DEFAULT 'DRAFT' ile geldiği için, halihazırda isPublished=true
-- olan satırlar (canlı kabul edilen kurallar) 'ACTIVE' olarak işaretlenir.
UPDATE "rule_sets" SET "status" = 'ACTIVE' WHERE "isPublished" = true;
