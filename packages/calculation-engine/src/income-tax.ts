import Decimal from "decimal.js";
import { toDecimal, toMoneyString } from "./money";
import { calculateTieredAmount, type TieredBracket } from "./tiered-amount";

export interface CalculateIncomeTaxInput {
  taxableIncome: string;
  /** Gelir Vergisi Kanunu'ndaki dilimli tarife (yıla göre değişir). */
  brackets: TieredBracket[];
}

export interface CalculateIncomeTaxResult {
  taxableIncome: string;
  totalTax: string;
  effectiveRatePercent: string;
}

/** Basit (dilimli) gelir vergisi hesabı. */
export function calculateIncomeTax(
  input: CalculateIncomeTaxInput,
): CalculateIncomeTaxResult {
  const taxableIncome = toDecimal(input.taxableIncome);
  const totalTax = calculateTieredAmount(taxableIncome, input.brackets);
  const effectiveRate = taxableIncome.gt(0)
    ? totalTax.div(taxableIncome).mul(100)
    : new Decimal(0);

  return {
    taxableIncome: toMoneyString(taxableIncome),
    totalTax: toMoneyString(totalTax),
    effectiveRatePercent: effectiveRate.toDecimalPlaces(2).toString(),
  };
}
