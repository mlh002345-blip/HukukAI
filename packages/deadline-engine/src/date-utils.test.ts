import { describe, expect, it } from "vitest";
import {
  addUtcDays,
  addUtcMonths,
  addUtcYears,
  diffInCalendarDays,
  formatIsoDate,
  isWeekend,
  parseIsoDate,
} from "./date-utils";

describe("parseIsoDate / formatIsoDate", () => {
  it("round-trip yapar", () => {
    expect(formatIsoDate(parseIsoDate("2026-03-15"))).toBe("2026-03-15");
  });

  it("geçersiz tarih için hata fırlatır", () => {
    expect(() => parseIsoDate("gecersiz")).toThrow();
  });
});

describe("addUtcDays", () => {
  it("gün ekler (ay sınırını da doğru geçer)", () => {
    expect(formatIsoDate(addUtcDays(parseIsoDate("2026-01-30"), 5))).toBe(
      "2026-02-04",
    );
  });
});

describe("addUtcMonths", () => {
  it("normal durumda aynı güne denk gelir", () => {
    expect(formatIsoDate(addUtcMonths(parseIsoDate("2026-02-01"), 1))).toBe(
      "2026-03-01",
    );
  });

  it("hedef ayda o gün yoksa ayın son gününe sabitler (HMK m.92/2)", () => {
    // 2026 artık yıl değildir, Şubat 28 gün çeker.
    expect(formatIsoDate(addUtcMonths(parseIsoDate("2026-01-31"), 1))).toBe(
      "2026-02-28",
    );
  });
});

describe("addUtcYears", () => {
  it("yıl ekler ve artık yıl sınırını doğru geçer", () => {
    // 2028 artık yıldır (29 Şubat vardır); 2026 değildir.
    expect(formatIsoDate(addUtcYears(parseIsoDate("2028-02-29"), 1))).toBe(
      "2029-02-28",
    );
  });
});

describe("isWeekend", () => {
  it("cumartesi ve pazarı hafta sonu sayar", () => {
    expect(isWeekend(parseIsoDate("2026-01-03"))).toBe(true); // Cumartesi
    expect(isWeekend(parseIsoDate("2026-01-04"))).toBe(true); // Pazar
  });

  it("hafta içi günleri hafta sonu saymaz", () => {
    expect(isWeekend(parseIsoDate("2026-01-05"))).toBe(false); // Pazartesi
  });
});

describe("diffInCalendarDays", () => {
  it("pozitif ve negatif farkları doğru hesaplar", () => {
    expect(
      diffInCalendarDays(parseIsoDate("2026-01-20"), parseIsoDate("2026-01-15")),
    ).toBe(5);
    expect(
      diffInCalendarDays(parseIsoDate("2026-01-10"), parseIsoDate("2026-01-15")),
    ).toBe(-5);
  });
});
