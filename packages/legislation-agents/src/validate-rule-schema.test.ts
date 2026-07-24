import { describe, expect, it } from "vitest";
import { validateRuleSchema, type RuleVersionLike } from "./validate-rule-schema";

function version(overrides: Partial<RuleVersionLike> = {}): RuleVersionLike {
  return {
    ruleKey: "TR_KDV_STANDARD_RATE",
    version: "2026.06.16",
    validFrom: "2026-06-16",
    validTo: null,
    legalBasis: [{ law: "KDV Genel Uygulama Tebliği", article: "1" }],
    ...overrides,
  };
}

describe("validateRuleSchema", () => {
  it("geçerli, çakışmayan bir aday için valid:true döner", () => {
    const result = validateRuleSchema(version(), []);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("legalBasis boşsa geçersiz sayar", () => {
    const result = validateRuleSchema(version({ legalBasis: [] }), []);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("legalBasis"))).toBe(true);
  });

  it("geçersiz validFrom formatını yakalar", () => {
    const result = validateRuleSchema(version({ validFrom: "not-a-date" }), []);
    expect(result.valid).toBe(false);
  });

  it("validTo validFrom'dan önceyse geçersiz sayar", () => {
    const result = validateRuleSchema(
      version({ validFrom: "2026-06-16", validTo: "2025-01-01" }),
      [],
    );
    expect(result.valid).toBe(false);
  });

  it("aynı ruleKey+version zaten varsa geçersiz sayar", () => {
    const existing = version();
    const result = validateRuleSchema(version(), [existing]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("zaten var"))).toBe(true);
  });

  it("önceki sürümle çakışan bir aralık için geçersiz sayar", () => {
    const previous = version({ version: "2025.01.01", validFrom: "2025-01-01", validTo: "2026-07-01" });
    const candidate = version({ version: "2026.06.16", validFrom: "2026-06-16", validTo: null });
    const result = validateRuleSchema(candidate, [previous]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("çakışıyor"))).toBe(true);
  });

  it("önceki sürümle boşluk oluşturan bir aralık için geçersiz sayar", () => {
    const previous = version({ version: "2025.01.01", validFrom: "2025-01-01", validTo: "2026-06-01" });
    const candidate = version({ version: "2026.06.16", validFrom: "2026-06-16", validTo: null });
    const result = validateRuleSchema(candidate, [previous]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("boşluk"))).toBe(true);
  });

  it("tam bitişik (boşluksuz, çakışmasız) bir aralık için geçerli sayar", () => {
    const previous = version({ version: "2025.01.01", validFrom: "2025-01-01", validTo: "2026-06-16" });
    const candidate = version({ version: "2026.06.16", validFrom: "2026-06-16", validTo: null });
    const result = validateRuleSchema(candidate, [previous]);
    expect(result.valid).toBe(true);
  });

  it("decimalFields belirtilmişse ruleData'daki değeri denetler", () => {
    const candidate = version({ ruleData: { rate: "not-a-decimal" } });
    const result = validateRuleSchema(candidate, [], { decimalFields: ["rate"] });
    expect(result.valid).toBe(false);
  });

  it("geçerli bir decimal string'i kabul eder", () => {
    const candidate = version({ ruleData: { rate: "0.20" } });
    const result = validateRuleSchema(candidate, [], { decimalFields: ["rate"] });
    expect(result.valid).toBe(true);
  });
});
