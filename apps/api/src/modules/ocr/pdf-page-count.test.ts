import { describe, expect, it } from "vitest";
import { estimatePdfPageCount } from "./pdf-page-count";

describe("estimatePdfPageCount", () => {
  it("desen bulunamazsa 1 döner", () => {
    expect(estimatePdfPageCount(Buffer.from("rastgele bayt"))).toBe(1);
  });

  it("/Type /Page girdilerini sayar", () => {
    const content = "/Type /Page /Type /Page /Type /Page";
    expect(estimatePdfPageCount(Buffer.from(content))).toBe(3);
  });

  it("/Type /Pages (kök nesne) girdisini saymaz", () => {
    const content = "/Type /Pages /Type /Page";
    expect(estimatePdfPageCount(Buffer.from(content))).toBe(1);
  });
});
