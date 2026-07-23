import { toDecimal, toMoneyString } from "./money";
import { calculateTieredAmount, type TieredBracket } from "./tiered-amount";

export interface CalculateAttorneyFeeInput {
  disputeValue: string;
  /** Avukatlık Asgari Ücret Tarifesi'ndeki nispi (kademeli) dilimler. */
  brackets: TieredBracket[];
  /** Tarifedeki maktu asgari ücret; hesaplanan tutar bunun altındaysa uygulanır. */
  minimumFee?: string;
}

export interface CalculateAttorneyFeeResult {
  disputeValue: string;
  calculatedFee: string;
  appliedMinimumFee: boolean;
}

/**
 * Nispi vekâlet ücreti: dava değeri, Avukatlık Asgari Ücret
 * Tarifesi'ndeki kademeli dilimlere göre hesaplanır; sonuç tarifedeki
 * maktu asgari ücretin altında kalırsa asgari ücret uygulanır.
 */
export function calculateAttorneyFee(
  input: CalculateAttorneyFeeInput,
): CalculateAttorneyFeeResult {
  const tieredFee = calculateTieredAmount(input.disputeValue, input.brackets);
  const minimumFee = input.minimumFee ? toDecimal(input.minimumFee) : null;

  const appliedMinimumFee = minimumFee !== null && tieredFee.lt(minimumFee);
  const calculatedFee = minimumFee !== null && appliedMinimumFee ? minimumFee : tieredFee;

  return {
    disputeValue: toMoneyString(toDecimal(input.disputeValue)),
    calculatedFee: toMoneyString(calculatedFee),
    appliedMinimumFee,
  };
}
