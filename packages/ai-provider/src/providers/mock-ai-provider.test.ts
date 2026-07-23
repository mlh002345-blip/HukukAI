import { describe, expect, it } from "vitest";
import { MockAIProvider } from "./mock-ai-provider";

describe("MockAIProvider", () => {
  const provider = new MockAIProvider();

  it("anahtar kelimeye göre belge türünü sınıflandırır", async () => {
    const result = await provider.classifyDocument(
      "İşbu kira sözleşmesi kiracı ve kiraya veren arasında düzenlenmiştir.",
    );
    expect(result.documentType).toBe("RENT_AGREEMENT");
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("eşleşme yoksa UNKNOWN_OFFICIAL_DOCUMENT döner", async () => {
    const result = await provider.classifyDocument("alakasız bir metin");
    expect(result.documentType).toBe("UNKNOWN_OFFICIAL_DOCUMENT");
  });

  it("tutar ve tarihi metinden çıkarır", async () => {
    const result = await provider.extractStructuredData(
      "Ödenecek tutar 1.250,00 TL olup son ödeme tarihi 15.03.2026'dır.",
      "TAX_NOTICE",
    );
    expect(result.data.amountText).toBe("1.250,00");
    expect(result.data.dateText).toBe("15.03.2026");
    expect(result.warnings).toHaveLength(0);
  });

  it("alan bulunamazsa uyarı ekler ve güveni düşürür", async () => {
    const result = await provider.extractStructuredData(
      "hiçbir yapılandırılmış alan içermeyen metin",
      "UNKNOWN_OFFICIAL_DOCUMENT",
    );
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(0.8);
  });

  it("boş metin için sabit özet döner", async () => {
    expect(await provider.summarize("   ")).toBe("Belge içeriği okunamadı.");
  });

  it("uzun metni kısaltır", async () => {
    const longText = "a".repeat(300);
    const summary = await provider.summarize(longText);
    expect(summary.length).toBeLessThanOrEqual(241);
    expect(summary.endsWith("…")).toBe(true);
  });
});
