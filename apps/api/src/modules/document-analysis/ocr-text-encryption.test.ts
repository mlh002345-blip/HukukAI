import { describe, expect, it } from "vitest";
import { decryptOcrText, encryptOcrText } from "./ocr-text-encryption";

const SECRET = "test-secret-key-at-least-32-characters-long";

describe("encryptOcrText / decryptOcrText", () => {
  it("şifrelenen metni doğru anahtarla geri çözer", () => {
    const plainText = "Türkçe karakterler: ğüşiöç İCRA TEBLİGATI";
    const encrypted = encryptOcrText(plainText, SECRET);
    expect(encrypted).not.toContain(plainText);
    expect(decryptOcrText(encrypted, SECRET)).toBe(plainText);
  });

  it("her şifrelemede farklı bir çıktı üretir (rastgele IV)", () => {
    const plainText = "aynı metin";
    const first = encryptOcrText(plainText, SECRET);
    const second = encryptOcrText(plainText, SECRET);
    expect(first).not.toEqual(second);
  });

  it("yanlış anahtarla çözme işlemi hata fırlatır", () => {
    const encrypted = encryptOcrText("gizli metin", SECRET);
    expect(() =>
      decryptOcrText(encrypted, "farkli-bir-anahtar-en-az-32-karakter-uzunlugunda"),
    ).toThrow();
  });

  it("bozuk biçim için hata fırlatır", () => {
    expect(() => decryptOcrText("gecersiz-payload", SECRET)).toThrow();
  });
});
