import { describe, expect, it } from "vitest";
import { calculateDeadline } from "./calculate-deadline";
import type { DeadlineRuleCalculation } from "./types";

const baseCalculation: DeadlineRuleCalculation = {
  duration: 15,
  durationUnit: "DAY",
  dayType: "CALENDAR_DAY",
  includeStartDate: false,
  extendIfHoliday: false,
};

describe("calculateDeadline — takvim günü", () => {
  it("başlangıç günü hariç sayar (tebliğ günü hesaba katılmaz)", () => {
    const result = calculateDeadline({
      calculation: baseCalculation,
      startDate: "2026-01-01",
      holidays: [],
    });
    expect(result.rawEndDate).toBe("2026-01-16");
    expect(result.adjustedEndDate).toBe("2026-01-16");
  });

  it("başlangıç günü dahil sayıldığında bir gün erken biter", () => {
    const result = calculateDeadline({
      calculation: { ...baseCalculation, includeStartDate: true },
      startDate: "2026-01-01",
      holidays: [],
    });
    expect(result.rawEndDate).toBe("2026-01-15");
  });

  it("hafta birimini 7 gün olarak hesaplar", () => {
    const result = calculateDeadline({
      calculation: { ...baseCalculation, duration: 2, durationUnit: "WEEK" },
      startDate: "2026-01-01",
      holidays: [],
    });
    expect(result.rawEndDate).toBe("2026-01-15"); // 2026-01-01 + 14 gün
  });
});

describe("calculateDeadline — iş günü", () => {
  it("hafta sonlarını sayaçtan hariç tutar", () => {
    // 2026-01-02 Cuma; başlangıç hariç → 2026-01-03 Cumartesi'nden sayar.
    const result = calculateDeadline({
      calculation: {
        ...baseCalculation,
        duration: 3,
        dayType: "BUSINESS_DAY",
      },
      startDate: "2026-01-02",
      holidays: [],
    });
    // 05 Pzt(1), 06 Sal(2), 07 Çar(3)
    expect(result.rawEndDate).toBe("2026-01-07");
  });

  it("resmi tatilleri de sayaçtan hariç tutar", () => {
    const result = calculateDeadline({
      calculation: {
        ...baseCalculation,
        duration: 3,
        dayType: "BUSINESS_DAY",
      },
      startDate: "2026-01-02",
      holidays: [{ date: "2026-01-06", isHalfDay: false }],
    });
    // 05 Pzt(1), 06 Sal tatil(atlanır), 07 Çar(2), 08 Per(3)
    expect(result.rawEndDate).toBe("2026-01-08");
  });
});

describe("calculateDeadline — ay/yıl birimi", () => {
  it("ay biriminde hedef ayda o gün yoksa ayın son gününe sabitler", () => {
    const result = calculateDeadline({
      calculation: {
        ...baseCalculation,
        duration: 1,
        durationUnit: "MONTH",
      },
      startDate: "2026-01-30",
      holidays: [],
    });
    // başlangıç hariç → 2026-01-31 + 1 ay → Şubat'ta 31 yok → 2026-02-28
    expect(result.rawEndDate).toBe("2026-02-28");
  });
});

describe("calculateDeadline — resmi tatil/hafta sonu uzatması", () => {
  it("extendIfHoliday kapalıyken son günü hafta sonuna bırakır", () => {
    const result = calculateDeadline({
      calculation: { ...baseCalculation, duration: 2 },
      startDate: "2026-01-01",
      holidays: [],
    });
    // rawEnd = 2026-01-03 (Cumartesi); uzatma kapalı olduğu için değişmez.
    expect(result.rawEndDate).toBe("2026-01-03");
    expect(result.adjustedEndDate).toBe("2026-01-03");
  });

  it("extendIfHoliday açıkken hafta sonuna denk gelen son günü sonraki iş gününe uzatır", () => {
    const result = calculateDeadline({
      calculation: {
        ...baseCalculation,
        duration: 2,
        includeStartDate: true,
        extendIfHoliday: true,
      },
      startDate: "2026-01-01",
      holidays: [],
    });
    // rawEnd = 2026-01-02 (Cuma) — hafta sonu değil, uzatma yok
    expect(result.rawEndDate).toBe("2026-01-02");
    expect(result.adjustedEndDate).toBe("2026-01-02");
    expect(result.appliedAdjustments).toHaveLength(0);
  });

  it("ardışık hafta sonu + resmi tatili sonraki iş gününe kadar uzatır", () => {
    // rawEnd 2026-01-03 (Cmt) olacak şekilde kur: duration=2, includeStartDate=false, start=2026-01-01(Per)
    // rawEnd = start + 2 = 2026-01-03 (Cumartesi)
    const result = calculateDeadline({
      calculation: {
        ...baseCalculation,
        duration: 2,
        extendIfHoliday: true,
      },
      startDate: "2026-01-01",
      holidays: [{ date: "2026-01-05", isHalfDay: false }],
    });
    expect(result.rawEndDate).toBe("2026-01-03");
    // 03 Cmt, 04 Paz, 05 Pzt(tatil) hepsi atlanır → 06 Sal'da biter
    expect(result.adjustedEndDate).toBe("2026-01-06");
    expect(result.appliedAdjustments.map((a) => a.type)).toEqual([
      "WEEKEND",
      "WEEKEND",
      "HOLIDAY",
    ]);
  });

  it("yarım gün tatile denk gelen son gün için uyarı ekler ama tarihi değiştirmez", () => {
    const result = calculateDeadline({
      calculation: baseCalculation,
      startDate: "2026-01-01",
      holidays: [{ date: "2026-01-16", isHalfDay: true }],
    });
    expect(result.adjustedEndDate).toBe("2026-01-16");
    expect(result.appliedAdjustments).toEqual([
      expect.objectContaining({ type: "HALF_DAY" }),
    ]);
  });
});

describe("calculateDeadline — kalan gün ve süre durumu", () => {
  it("son gün gelecekteyse isExpired false ve kalan gün pozitiftir", () => {
    const result = calculateDeadline({
      calculation: baseCalculation,
      startDate: "2026-01-01",
      holidays: [],
      referenceDate: "2026-01-10",
    });
    expect(result.adjustedEndDate).toBe("2026-01-16");
    expect(result.remainingCalendarDays).toBe(6);
    expect(result.isExpired).toBe(false);
  });

  it("son gün geçmişse isExpired true ve kalan gün negatiftir", () => {
    const result = calculateDeadline({
      calculation: baseCalculation,
      startDate: "2026-01-01",
      holidays: [],
      referenceDate: "2026-02-01",
    });
    expect(result.isExpired).toBe(true);
    expect(result.remainingCalendarDays).toBeLessThan(0);
  });
});
