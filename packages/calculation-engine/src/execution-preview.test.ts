import { describe, expect, it } from "vitest";
import { calculateExecutionPreview } from "./execution-preview";

describe("calculateExecutionPreview", () => {
  it("infaz oranına göre gerekli yatılacak günü hesaplar", () => {
    const result = calculateExecutionPreview({
      sentenceDays: 3650, // 10 yıl
      executionFraction: "HALF",
      creditedDays: 0,
      startDate: "2026-01-01",
    });
    expect(result.requiredServedDays).toBe(1825);
    // 2026-01-01 + 1825 gün (aralarında 2028 artık yılı vardır).
    expect(result.conditionalReleaseDate).toBe("2030-12-31");
  });

  it("mahsup edilen günleri düşer", () => {
    const result = calculateExecutionPreview({
      sentenceDays: 3650,
      executionFraction: "HALF",
      creditedDays: 100,
      startDate: "2026-01-01",
    });
    expect(result.remainingDaysAfterCredit).toBe(1725); // 1825 - 100
  });

  it("mahsup, gerekli süreyi aşarsa kalan günü sıfırlar (negatif olmaz)", () => {
    const result = calculateExecutionPreview({
      sentenceDays: 100,
      executionFraction: "HALF",
      creditedDays: 1000,
      startDate: "2026-01-01",
    });
    expect(result.remainingDaysAfterCredit).toBe(0);
    expect(result.conditionalReleaseDate).toBe("2026-01-01");
  });

  it("farklı infaz oranlarını doğru uygular (2/3 ve 3/4)", () => {
    const twoThirds = calculateExecutionPreview({
      sentenceDays: 3000,
      executionFraction: "TWO_THIRDS",
      creditedDays: 0,
      startDate: "2026-01-01",
    });
    expect(twoThirds.requiredServedDays).toBe(2000);

    const threeQuarters = calculateExecutionPreview({
      sentenceDays: 3000,
      executionFraction: "THREE_QUARTERS",
      creditedDays: 0,
      startDate: "2026-01-01",
    });
    expect(threeQuarters.requiredServedDays).toBe(2250);
  });

  it("denetimli serbestlik tarihini yalnızca buffer verildiğinde hesaplar", () => {
    const withoutBuffer = calculateExecutionPreview({
      sentenceDays: 3650,
      executionFraction: "HALF",
      creditedDays: 0,
      startDate: "2026-01-01",
    });
    expect(withoutBuffer.probationEligibleDate).toBeNull();

    const withBuffer = calculateExecutionPreview({
      sentenceDays: 3650,
      executionFraction: "HALF",
      creditedDays: 0,
      startDate: "2026-01-01",
      probationBufferDays: 365,
    });
    expect(withBuffer.probationEligibleDate).toBe("2029-12-31");
  });

  it("dört zorunlu infaz uyarısını her zaman döndürür", () => {
    const result = calculateExecutionPreview({
      sentenceDays: 100,
      executionFraction: "HALF",
      creditedDays: 0,
      startDate: "2026-01-01",
    });
    expect(result.warnings).toEqual([
      "Bu bir ön hesaptır.",
      "Suç tarihi ve suç türü sonucu değiştirebilir.",
      "Birden fazla ilam, tekerrür, mahsup ve özel infaz rejimleri ayrıca incelenmelidir.",
      "Nihai hesap yetkili makamlarca yapılır.",
    ]);
  });
});
