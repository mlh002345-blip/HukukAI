import {
  addUtcDays,
  addUtcMonths,
  addUtcYears,
  diffInCalendarDays,
  formatIsoDate,
  isWeekend,
  parseIsoDate,
} from "./date-utils";
import type {
  CalculateDeadlineInput,
  CalculateDeadlineResult,
  DeadlineAdjustment,
  DeadlineRuleCalculation,
} from "./types";

/**
 * `base` tarihinden başlayarak (dahil) `count`'uncu iş gününü döner.
 * `base`'in kendisi iş günüyse 1. gün sayılır.
 */
function nthBusinessDayOnOrAfter(
  base: Date,
  count: number,
  holidays: Set<string>,
): Date {
  let current = base;
  let counted = 0;
  for (;;) {
    if (!isWeekend(current) && !holidays.has(formatIsoDate(current))) {
      counted += 1;
      if (counted === count) return current;
    }
    current = addUtcDays(current, 1);
  }
}

function computeRawEndDate(
  calculation: DeadlineRuleCalculation,
  start: Date,
  holidays: Set<string>,
): Date {
  const skipStartDay = !calculation.includeStartDate;

  if (calculation.durationUnit === "MONTH" || calculation.durationUnit === "YEAR") {
    // HMK m.92/2: ay/yıl olarak belirlenen süreler, tebliği izleyen
    // günden itibaren işlemeye başlar ve başlanan güne tekabül eden
    // günde biter; bu yüzden gün birimlerinden farklı olarak burada
    // "başlangıç günü dahil/hariç" ayrımı yalnızca sayaç kaydırması
    // olarak uygulanır, ekstra ±1 gün düzeltmesi gerekmez.
    const base = skipStartDay ? addUtcDays(start, 1) : start;
    return calculation.durationUnit === "MONTH"
      ? addUtcMonths(base, calculation.duration)
      : addUtcYears(base, calculation.duration);
  }

  const durationInDays =
    calculation.durationUnit === "WEEK"
      ? calculation.duration * 7
      : calculation.duration;

  if (calculation.dayType === "BUSINESS_DAY") {
    const base = skipStartDay ? addUtcDays(start, 1) : start;
    return nthBusinessDayOnOrAfter(base, durationInDays, holidays);
  }

  return addUtcDays(start, durationInDays - (skipStartDay ? 0 : 1));
}

function applyHolidayExtension(
  rawEnd: Date,
  extendIfHoliday: boolean,
  holidays: Set<string>,
  halfDays: Set<string>,
): { adjustedEnd: Date; adjustments: DeadlineAdjustment[] } {
  const adjustments: DeadlineAdjustment[] = [];
  let current = rawEnd;

  if (extendIfHoliday) {
    while (isWeekend(current) || holidays.has(formatIsoDate(current))) {
      adjustments.push(
        isWeekend(current)
          ? {
              type: "WEEKEND",
              description: `${formatIsoDate(current)} hafta sonuna denk geldiği için süre bir sonraki iş gününe uzatıldı.`,
            }
          : {
              type: "HOLIDAY",
              description: `${formatIsoDate(current)} resmi tatile denk geldiği için süre bir sonraki iş gününe uzatıldı.`,
            },
      );
      current = addUtcDays(current, 1);
    }
  }

  if (halfDays.has(formatIsoDate(current))) {
    adjustments.push({
      type: "HALF_DAY",
      description: `${formatIsoDate(current)} tarihinde resmi kurumlar yarım gün çalışabilir; işlemi gün içinde erken tamamlamanız önerilir.`,
    });
  }

  return { adjustedEnd: current, adjustments };
}

/**
 * Süre motoru (Bölüm 16). Bir kuralın sabit parametrelerini (duration,
 * dayType, includeStartDate, extendIfHoliday) ve olay tarihini alıp
 * `DeadlineOutput`'un hesaplama kısmını üretir. `ruleId`/`ruleVersion`/
 * `legalBasis` gibi kurala özgü alanlar bu saf fonksiyonun dışında,
 * kuralı seçen tarafça (bkz. `@hukukai/rule-engine`) eklenir.
 */
export function calculateDeadline(
  input: CalculateDeadlineInput,
): CalculateDeadlineResult {
  const holidays = new Set(input.holidays.map((h) => h.date));
  const halfDays = new Set(
    input.holidays.filter((h) => h.isHalfDay).map((h) => h.date),
  );

  const start = parseIsoDate(input.startDate);
  const rawEnd = computeRawEndDate(input.calculation, start, holidays);
  const { adjustedEnd, adjustments } = applyHolidayExtension(
    rawEnd,
    input.calculation.extendIfHoliday,
    holidays,
    halfDays,
  );

  const reference = input.referenceDate
    ? parseIsoDate(input.referenceDate)
    : parseIsoDate(formatIsoDate(new Date()));
  const remainingCalendarDays = diffInCalendarDays(adjustedEnd, reference);

  return {
    startDate: formatIsoDate(start),
    rawEndDate: formatIsoDate(rawEnd),
    adjustedEndDate: formatIsoDate(adjustedEnd),
    remainingCalendarDays,
    isExpired: remainingCalendarDays < 0,
    appliedAdjustments: adjustments,
  };
}
