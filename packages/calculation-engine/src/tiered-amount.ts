import Decimal from "decimal.js";
import { toDecimal } from "./money";

/**
 * Kademeli (dilimli) tarife dilimi. `upTo`, bu dilimin üst sınırıdır
 * (kümülatif taban tutar); son (sınırsız) dilim için `null` verilir.
 * Dilimler artan sırada verilmelidir.
 */
export interface TieredBracket {
  upTo: string | null;
  ratePercent: string | number;
}

/**
 * Gelir vergisi dilimleri ve vekâlet ücreti nispi tarifesi gibi kademeli
 * (progresif) hesaplamaların ortak çekirdeği. Her dilim, yalnızca o
 * dilime düşen tutar kadarına kendi oranını uygular.
 */
export function calculateTieredAmount(
  baseAmount: string | number | Decimal,
  brackets: TieredBracket[],
): Decimal {
  let remaining = toDecimal(baseAmount);
  let previousCeiling = new Decimal(0);
  let total = new Decimal(0);

  for (const bracket of brackets) {
    if (remaining.lte(0)) break;

    const ceiling = bracket.upTo === null ? null : toDecimal(bracket.upTo);
    const bracketSize = ceiling ? Decimal.min(remaining, ceiling.minus(previousCeiling)) : remaining;

    if (bracketSize.gt(0)) {
      total = total.plus(bracketSize.mul(toDecimal(bracket.ratePercent)).div(100));
      remaining = remaining.minus(bracketSize);
    }

    if (ceiling) previousCeiling = ceiling;
  }

  return total;
}
