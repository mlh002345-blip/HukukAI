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

export interface AdminDashboardSummary {
  totalUsers: number;
  activeUsers: number;
  failedDocumentsCount: number;
  unpublishedRuleSetsCount: number;
  monthlyAiCostUsd: string;
}
