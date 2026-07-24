import type { SubscriptionPlan, UserRole } from "./user";

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  documentCount: number;
  deadlineCount: number;
  calculationCount: number;
}

export interface DocumentErrorSummary {
  id: string;
  userId: string;
  userEmail: string;
  originalName: string;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface RuleSetSummary {
  id: string;
  module: string;
  ruleKey: string;
  version: string;
  validFrom: string;
  validTo: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface HolidaySummary {
  id: string;
  date: string;
  name: string;
  isHalfDay: boolean;
  source: string | null;
}

export interface AiUsageSummary {
  provider: string;
  model: string;
  analysisCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCostUsd: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface LegislationChangeSummary {
  id: string;
  affectedLegislation: string;
  changeType: string;
  status: string;
  effectiveDate: string;
  publicationDate: string;
  createdAt: string;
  document: {
    title: string;
    source: { name: string; category: string };
  };
  impactAssessment: { riskLevel: string } | null;
}

export interface LegislationVerificationResultSummary {
  id: string;
  layer: string;
  passed: boolean;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface LegislationCandidateRuleSetSummary {
  id: string;
  ruleKey: string;
  module: string;
  version: string;
  status: string;
  confidenceScore: string | null;
  supersedesRuleSetId: string | null;
  ruleData: Record<string, unknown>;
  legalBasis: unknown;
  createdAt: string;
  verificationResults: LegislationVerificationResultSummary[];
}

export interface LegislationChangeImpactAssessmentDetail {
  riskLevel: string;
  affectedModules: unknown;
  affectedRuleIds: unknown;
  historicalImpact: boolean;
  prospectiveImpact: boolean;
  requiresMigration: boolean;
  dateSelectorNotes: unknown;
}

export interface LegislationChangeDetail
  extends Omit<LegislationChangeSummary, "impactAssessment"> {
  affectedSections: unknown;
  oldTextHash: string | null;
  newTextHash: string;
  impactAssessment: LegislationChangeImpactAssessmentDetail | null;
  ruleSets: LegislationCandidateRuleSetSummary[];
}

export interface AdminDashboardSummary {
  totalUsers: number;
  activeUsers: number;
  failedDocumentsCount: number;
  unpublishedRuleSetsCount: number;
  monthlyAiCostUsd: string;
}
