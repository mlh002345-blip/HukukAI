import { describe, expect, it } from "vitest";
import { MockOcrProvider } from "./mock-ocr-provider";

describe("MockOcrProvider", () => {
  const provider = new MockOcrProvider();

  it("düşük ve sabit bir güven skoru döner (zorunlu inceleme için)", async () => {
    const result = await provider.recognize({
      buffer: Buffer.from("test"),
      mimeType: "image/png",
      originalName: "belge.png",
    });
    expect(result.confidence).toBe(0.5);
    expect(result.pageCount).toBe(1);
    expect(result.text).toContain("belge.png");
  });

  it("PDF için sayfa sayısını tahmin eder", async () => {
    const result = await provider.recognize({
      buffer: Buffer.from("/Type /Page /Type /Page"),
      mimeType: "application/pdf",
      originalName: "dilekce.pdf",
    });
    expect(result.pageCount).toBe(2);
  });
});
