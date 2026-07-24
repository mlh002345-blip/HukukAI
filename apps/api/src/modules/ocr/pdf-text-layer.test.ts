import { describe, expect, it } from "vitest";
import { hasSufficientEmbeddedText } from "./pdf-text-layer";

describe("hasSufficientEmbeddedText", () => {
  it("boş metni yetersiz sayar", () => {
    expect(hasSufficientEmbeddedText("")).toBe(false);
  });

  it("yalnızca boşluktan oluşan metni yetersiz sayar", () => {
    expect(hasSufficientEmbeddedText("   \n\t  ")).toBe(false);
  });

  it("kısa metni yetersiz sayar", () => {
    expect(hasSufficientEmbeddedText("kısa")).toBe(false);
  });

  it("yeterince uzun metni geçerli sayar", () => {
    expect(
      hasSufficientEmbeddedText(
        "İCRA DAİRESİ ÖDEME EMRİ — Borçlu adına düzenlenmiştir.",
      ),
    ).toBe(true);
  });
});
