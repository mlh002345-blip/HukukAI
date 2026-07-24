import type { CSSProperties } from "react";

const BASE_STYLE: CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};

const NEGATIVE_STATUSES = new Set([
  "HOLD_FOR_REVIEW",
  "TEMPORARILY_RESTRICTED",
  "REJECTED",
  "FAILED",
]);

const POSITIVE_STATUSES = new Set(["PUBLISHED", "ACTIVE", "VERIFIED"]);

export function statusBadgeStyle(status: string): CSSProperties {
  if (NEGATIVE_STATUSES.has(status)) {
    return { ...BASE_STYLE, background: "#FEF3F2", color: "#B42318" };
  }
  if (POSITIVE_STATUSES.has(status)) {
    return { ...BASE_STYLE, background: "#ECFDF3", color: "#027A48" };
  }
  return { ...BASE_STYLE, background: "#F2F4F7", color: "#344054" };
}
