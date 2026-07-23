import Decimal from "decimal.js";

/**
 * Para işlemlerinde JS `number` yerine `decimal.js` kullanılır (Bölüm 17
 * — Para işlemleri) — ikili kayan noktalı sayıların yuvarlama hatalarını
 * (ör. 0.1 + 0.2 !== 0.3) önlemek için.
 */
export function toDecimal(value: string | number | Decimal): Decimal {
  return value instanceof Decimal ? value : new Decimal(value);
}

/** İki ondalık basamağa, yarısı yukarı yuvarlanarak para birimi metnine çevirir. */
export function toMoneyString(value: Decimal): string {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
}

export function percentOf(base: Decimal, ratePercent: string | number | Decimal): Decimal {
  return base.mul(toDecimal(ratePercent)).div(100);
}
