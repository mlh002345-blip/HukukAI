import { describe, expect, it } from "vitest";
import { buildReportNumber } from "./report-content";

describe("buildReportNumber", () => {
  it("yıl ve id'nin son 8 karakterinden benzersiz bir rapor numarası üretir", () => {
    const number = buildReportNumber(
      "abcd1234efgh5678",
      new Date("2026-03-15T00:00:00.000Z"),
    );
    expect(number).toBe("HKA-2026-EFGH5678");
  });
});
