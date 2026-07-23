import { percentOf, toDecimal, toMoneyString } from "./money";

export const VAT_CALCULATION_MODES = ["ADD_VAT", "EXTRACT_VAT"] as const;
export type VatCalculationMode = (typeof VAT_CALCULATION_MODES)[number];

export interface CalculateVatInput {
  amount: string;
  vatRatePercent: string;
  /** ADD_VAT: `amount` KDV hariç tutardır, KDV eklenir.
   * EXTRACT_VAT: `amount` KDV dahil tutardır, KDV ayrıştırılır. */
  mode: VatCalculationMode;
}

export interface CalculateVatResult {
  baseAmount: string;
  vatAmount: string;
  totalAmount: string;
}

export function calculateVat(input: CalculateVatInput): CalculateVatResult {
  const amount = toDecimal(input.amount);
  const rate = toDecimal(input.vatRatePercent);

  if (input.mode === "ADD_VAT") {
    const vatAmount = percentOf(amount, rate);
    return {
      baseAmount: toMoneyString(amount),
      vatAmount: toMoneyString(vatAmount),
      totalAmount: toMoneyString(amount.plus(vatAmount)),
    };
  }

  const baseAmount = amount.div(rate.div(100).plus(1));
  const vatAmount = amount.minus(baseAmount);

  return {
    baseAmount: toMoneyString(baseAmount),
    vatAmount: toMoneyString(vatAmount),
    totalAmount: toMoneyString(amount),
  };
}
