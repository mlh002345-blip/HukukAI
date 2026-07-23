import { describe, expect, it } from "vitest";
import { buildStorageKey } from "./storage-key";

describe("buildStorageKey", () => {
  it("kullanıcı bazlı, benzersiz ve uzantılı bir anahtar üretir", () => {
    const key = buildStorageKey("user-1", "dilekce.PDF");
    expect(key).toMatch(/^documents\/user-1\/[0-9a-f-]{36}\.pdf$/);
  });

  it("her çağrıda farklı bir anahtar üretir", () => {
    const first = buildStorageKey("user-1", "dilekce.pdf");
    const second = buildStorageKey("user-1", "dilekce.pdf");
    expect(first).not.toEqual(second);
  });

  it("uzantısı olmayan dosya için 'bin' kullanır", () => {
    const key = buildStorageKey("user-1", "dosya");
    expect(key.endsWith(".bin")).toBe(true);
  });
});
