-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'LAWYER', 'ACCOUNTANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'INDIVIDUAL', 'PRO', 'OFFICE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'OCR_PROCESSING', 'AI_PROCESSING', 'REVIEW_REQUIRED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FolderType" AS ENUM ('LEGAL', 'ENFORCEMENT', 'TAX', 'SGK', 'RENT', 'EXECUTION', 'TRAFFIC_FINE', 'OTHER');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CalculationStatus" AS ENUM ('DRAFT', 'COMPLETED', 'INVALIDATED');

-- CreateEnum
CREATE TYPE "PaymentTransactionType" AS ENUM ('SUBSCRIPTION_UPGRADE', 'ONE_TIME_CREDIT_PACK');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "oneTimeCreditsRemaining" INTEGER NOT NULL DEFAULT 0,
    "expoPushToken" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acceptedTermsVersion" TEXT,
    "acceptedKvkkVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_counters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "documentAnalysisCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PaymentTransactionType" NOT NULL,
    "plan" "SubscriptionPlan",
    "creditsAdded" INTEGER,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" "PaymentTransactionStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "providerReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_definitions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "audiences" JSONB NOT NULL,
    "keywords" JSONB NOT NULL,
    "synonyms" JSONB NOT NULL,
    "icon" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBeta" BOOLEAN NOT NULL DEFAULT false,
    "requiresSubscription" BOOLEAN NOT NULL DEFAULT false,
    "rolePriorities" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite_tools" (
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_tools_pkey" PRIMARY KEY ("userId","toolId")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "folderType" "FolderType" NOT NULL,
    "clientName" TEXT,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "case_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "pageCount" INTEGER,
    "documentType" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "ocrTextEncrypted" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_analyses" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "extractedData" JSONB NOT NULL,
    "summary" TEXT,
    "warnings" JSONB NOT NULL,
    "recommendedTools" JSONB NOT NULL,
    "confidenceScore" DECIMAL(5,4),
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "estimatedCostUsd" DECIMAL(12,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "documentId" TEXT,
    "calculationType" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "ruleSetVersion" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB NOT NULL,
    "status" "CalculationStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invalidatedAt" TIMESTAMP(3),

    CONSTRAINT "calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deadlines" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "documentId" TEXT,
    "title" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "startEvent" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "calculatedEndDate" TIMESTAMP(3) NOT NULL,
    "adjustedEndDate" TIMESTAMP(3) NOT NULL,
    "status" "DeadlineStatus" NOT NULL DEFAULT 'ACTIVE',
    "legalBasis" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deadlineId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "documentType" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "storageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_sets" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "ruleData" JSONB NOT NULL,
    "legalBasis" JSONB NOT NULL,
    "sourceUrl" TEXT,
    "sourceHash" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "rule_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "isHalfDay" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usage_counters_userId_periodKey_key" ON "usage_counters"("userId", "periodKey");

-- CreateIndex
CREATE INDEX "payment_transactions_userId_idx" ON "payment_transactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tool_definitions_slug_key" ON "tool_definitions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "case_folders_userId_createdAt_idx" ON "case_folders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "case_folders_userId_folderType_idx" ON "case_folders"("userId", "folderType");

-- CreateIndex
CREATE INDEX "documents_userId_createdAt_idx" ON "documents"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "documents_folderId_idx" ON "documents"("folderId");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "documents_userId_checksum_key" ON "documents"("userId", "checksum");

-- CreateIndex
CREATE INDEX "document_analyses_documentId_createdAt_idx" ON "document_analyses"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "calculations_userId_createdAt_idx" ON "calculations"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "calculations_folderId_idx" ON "calculations"("folderId");

-- CreateIndex
CREATE INDEX "calculations_calculationType_idx" ON "calculations"("calculationType");

-- CreateIndex
CREATE INDEX "deadlines_userId_adjustedEndDate_idx" ON "deadlines"("userId", "adjustedEndDate");

-- CreateIndex
CREATE INDEX "deadlines_status_adjustedEndDate_idx" ON "deadlines"("status", "adjustedEndDate");

-- CreateIndex
CREATE INDEX "notifications_scheduledAt_sentAt_idx" ON "notifications"("scheduledAt", "sentAt");

-- CreateIndex
CREATE INDEX "notifications_userId_scheduledAt_idx" ON "notifications"("userId", "scheduledAt");

-- CreateIndex
CREATE INDEX "generated_documents_userId_createdAt_idx" ON "generated_documents"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "rule_sets_module_isPublished_idx" ON "rule_sets"("module", "isPublished");

-- CreateIndex
CREATE INDEX "rule_sets_validFrom_validTo_idx" ON "rule_sets"("validFrom", "validTo");

-- CreateIndex
CREATE UNIQUE INDEX "rule_sets_ruleKey_version_key" ON "rule_sets"("ruleKey", "version");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_date_key" ON "holidays"("date");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_tools" ADD CONSTRAINT "user_favorite_tools_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_tools" ADD CONSTRAINT "user_favorite_tools_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tool_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_folders" ADD CONSTRAINT "case_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "case_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_analyses" ADD CONSTRAINT "document_analyses_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "case_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "case_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "deadlines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "case_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

