import { describe, expect, it } from "vitest";
import { decideRoute } from "./router";

const baseInput = {
  pageCount: 2,
  ocrConfidence: 0.9,
  documentType: "RENT_AGREEMENT" as const,
  subscriptionPlan: "PRO" as const,
};

describe("decideRoute", () => {
  it("standart, güvenilir bir belge için FAST seçer", () => {
    const result = decideRoute(baseInput);
    expect(result.tier).toBe("FAST");
    expect(result.reasons).toContain("STANDART_BELGE");
  });

  it("ücretsiz kullanıcı için her koşulda FAST seçer (maliyet limiti)", () => {
    const result = decideRoute({
      ...baseInput,
      ocrConfidence: 0.1,
      pageCount: 100,
      subscriptionPlan: "FREE",
    });
    expect(result.tier).toBe("FAST");
    expect(result.reasons).toContain("ÜCRETSİZ_PAKET_MALİYET_LİMİTİ");
  });

  it("düşük OCR güveninde ACCURATE seçer", () => {
    const result = decideRoute({ ...baseInput, ocrConfidence: 0.5 });
    expect(result.tier).toBe("ACCURATE");
    expect(result.reasons).toContain("DÜŞÜK_OCR_GÜVENİ");
  });

  it("yüksek sayfa sayısında ACCURATE seçer", () => {
    const result = decideRoute({ ...baseInput, pageCount: 25 });
    expect(result.tier).toBe("ACCURATE");
    expect(result.reasons).toContain("YÜKSEK_SAYFA_SAYISI");
  });

  it("düşük ilk geçiş güveninde ACCURATE seçer", () => {
    const result = decideRoute({ ...baseInput, firstPassConfidence: 0.3 });
    expect(result.tier).toBe("ACCURATE");
    expect(result.reasons).toContain("DÜŞÜK_İLK_GEÇİŞ_GÜVENİ");
  });

  it("bilinmeyen belge türünde ACCURATE seçer", () => {
    const result = decideRoute({
      ...baseInput,
      documentType: "UNKNOWN_OFFICIAL_DOCUMENT",
    });
    expect(result.tier).toBe("ACCURATE");
    expect(result.reasons).toContain("BİLİNMEYEN_BELGE_TÜRÜ");
  });
});
