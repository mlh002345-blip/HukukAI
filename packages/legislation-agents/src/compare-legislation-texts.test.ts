import { describe, expect, it } from "vitest";
import { compareLegislationTexts, hashLegislationText } from "./compare-legislation-texts";

describe("compareLegislationTexts", () => {
  const base = {
    affectedLegislation: "KDV Genel Uygulama Tebliği",
    effectiveDate: "2026-06-16",
    publicationDate: "2026-06-16",
  };

  it("metin aynıysa null döner (değişiklik yok)", () => {
    const text = "Madde 1 - KDV oranı %20'dir.";
    expect(compareLegislationTexts({ ...base, oldText: text, newText: text })).toBeNull();
  });

  it("eski metin yoksa NEW_PROVISION döner", () => {
    const result = compareLegislationTexts({
      ...base,
      oldText: null,
      newText: "Madde 5 - Yeni bir yükümlülük getirilmiştir.",
    });
    expect(result?.changeType).toBe("NEW_PROVISION");
    expect(result?.oldTextHash).toBeNull();
  });

  it("oran içeren metin değişikliğinde RATE_CHANGE döner", () => {
    const result = compareLegislationTexts({
      ...base,
      oldText: "Madde 1 - KDV oranı %18'dir.",
      newText: "Madde 1 - KDV oranı %20'dir.",
    });
    expect(result?.changeType).toBe("RATE_CHANGE");
  });

  it("iptal kararı içeren metinde COURT_ANNULMENT döner", () => {
    const result = compareLegislationTexts({
      ...base,
      oldText: "Madde 3 - X hükmü yürürlüktedir.",
      newText: "Anayasa Mahkemesi'nin iptal kararı üzerine madde 3 hükümsüzdür.",
    });
    expect(result?.changeType).toBe("COURT_ANNULMENT");
  });

  it("süre uzatımı ifadesinde DEADLINE_EXTENSION döner", () => {
    const result = compareLegislationTexts({
      ...base,
      oldText: "Madde 2 - Başvuru süresi 30 gündür.",
      newText: "Madde 2 - Başvuru süresi uzatılmıştır, bildirim süresi uzatılmıştır.",
    });
    expect(result?.changeType).toBe("DEADLINE_EXTENSION");
  });

  it("madde referanslarını affectedSections içinde döner", () => {
    const result = compareLegislationTexts({
      ...base,
      oldText: "eski",
      newText: "Madde 5 ve Madde 12/3 değiştirilmiştir, oranlar güncellendi.",
    });
    expect(result?.affectedSections).toEqual(
      expect.arrayContaining([expect.stringMatching(/madde 5/i), expect.stringMatching(/madde 12\/3/i)]),
    );
  });

  it("hashLegislationText deterministiktir", () => {
    expect(hashLegislationText("aynı metin")).toBe(hashLegislationText("aynı metin"));
    expect(hashLegislationText("metin a")).not.toBe(hashLegislationText("metin b"));
  });
});
