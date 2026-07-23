import { describe, expect, it } from "vitest";
import Decimal from "decimal.js";
import { percentOf, toDecimal, toMoneyString } from "./money";

describe("toDecimal", () => {
  it("string/number/Decimal girdilerini Decimal'e çevirir", () => {
    expect(toDecimal("10.5").toString()).toBe("10.5");
    expect(toDecimal(10.5).toString()).toBe("10.5");
    expect(toDecimal(new Decimal("10.5")).toString()).toBe("10.5");
  });
});

describe("toMoneyString", () => {
  it("iki ondalık basamağa yuvarlar", () => {
    expect(toMoneyString(new Decimal("10"))).toBe("10.00");
    expect(toMoneyString(new Decimal("10.005"))).toBe("10.01");
  });

  it("ikili kayan nokta hatasına düşmez (0.1 + 0.2)", () => {
    const sum = toDecimal("0.1").plus(toDecimal("0.2"));
    expect(toMoneyString(sum)).toBe("0.30");
  });
});

describe("percentOf", () => {
  it("yüzde hesaplar", () => {
    expect(percentOf(new Decimal(1000), 20).toString()).toBe("200");
  });
});
