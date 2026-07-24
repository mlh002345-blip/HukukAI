export interface NotificationSummary {
  id: string;
  deadlineId: string | null;
  title: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  failedAt: string | null;
  createdAt: string;
}
