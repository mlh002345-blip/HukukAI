import { toDecimal, toMoneyString } from "./money";

export interface CalculateCourtFeeInput {
  disputeValue: string;
  /** Harçlar Kanunu'ndaki nispi harç oranı (binde). */
  proportionalRatePerMille: string;
  /** Maktu başvurma/peşin harç tutarı. */
  fixedApplicationFee: string;
}

export interface CalculateCourtFeeResult {
  disputeValue: string;
  proportionalFee: string;
  fixedApplicationFee: string;
  totalFee: string;
}

/**
 * Harç ön hesabı: nispi harç (dava değeri × binde oran) + maktu
 * başvurma harcı. Harçlar Kanunu'na tabi kalem sayısı davaya göre
 * değişebileceğinden bu, yalnızca bir ön hesaptır.
 */
export function calculateCourtFee(
  input: CalculateCourtFeeInput,
): CalculateCourtFeeResult {
  const disputeValue = toDecimal(input.disputeValue);
  const proportionalFee = disputeValue
    .mul(toDecimal(input.proportionalRatePerMille))
    .div(1000);
  const fixedApplicationFee = toDecimal(input.fixedApplicationFee);
  const totalFee = proportionalFee.plus(fixedApplicationFee);

  return {
    disputeValue: toMoneyString(disputeValue),
    proportionalFee: toMoneyString(proportionalFee),
    fixedApplicationFee: toMoneyString(fixedApplicationFee),
    totalFee: toMoneyString(totalFee),
  };
}
