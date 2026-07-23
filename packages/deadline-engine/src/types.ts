import type { LegalBasisRef } from "@hukukai/rule-engine";

export const DAY_TYPES = ["CALENDAR_DAY", "BUSINESS_DAY"] as const;
export type DayType = (typeof DAY_TYPES)[number];

export const DURATION_UNITS = ["DAY", "WEEK", "MONTH", "YEAR"] as const;
export type DurationUnit = (typeof DURATION_UNITS)[number];

export interface DeadlineRuleCalculation {
  duration: number;
  durationUnit: DurationUnit;
  dayType: DayType;
  includeStartDate: boolean;
  extendIfHoliday: boolean;
}

export interface HolidayInput {
  date: string;
  isHalfDay: boolean;
}

export const DEADLINE_ADJUSTMENT_TYPES = [
  "WEEKEND",
  "HOLIDAY",
  "HALF_DAY",
  "SPECIAL_RULE",
] as const;
export type DeadlineAdjustmentType = (typeof DEADLINE_ADJUSTMENT_TYPES)[number];

export interface DeadlineAdjustment {
  type: DeadlineAdjustmentType;
  description: string;
}

export interface CalculateDeadlineInput {
  calculation: DeadlineRuleCalculation;
  startDate: string;
  holidays: HolidayInput[];
  /** Test edilebilirlik için "bugün"ü enjekte etmeye izin verir. */
  referenceDate?: string;
}

/** Bkz. Doküman Bölüm 16 — `DeadlineOutput` (ruleId/ruleVersion hariç;
 * bunlar kural motorunun seçtiği sürümden çağıran tarafça eklenir). */
export interface CalculateDeadlineResult {
  startDate: string;
  rawEndDate: string;
  adjustedEndDate: string;
  remainingCalendarDays: number;
  isExpired: boolean;
  appliedAdjustments: DeadlineAdjustment[];
}

export type { LegalBasisRef };
