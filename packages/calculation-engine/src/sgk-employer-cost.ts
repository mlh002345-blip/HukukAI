import { percentOf, toDecimal, toMoneyString } from "./money";

export interface CalculateSgkEmployerCostInput {
  grossSalary: string;
  sgkEmployerRatePercent: string;
  unemploymentEmployerRatePercent: string;
}

export interface CalculateSgkEmployerCostResult {
  grossSalary: string;
  sgkEmployerAmount: string;
  unemploymentEmployerAmount: string;
  totalEmployerCost: string;
}

/**
 * Temel SGK işveren maliyeti: brüt maaş + SGK işveren primi + işsizlik
 * sigortası işveren payı. Teşvik/indirim kalemleri bu MVP'de yer almaz.
 */
export function calculateSgkEmployerCost(
  input: CalculateSgkEmployerCostInput,
): CalculateSgkEmployerCostResult {
  const grossSalary = toDecimal(input.grossSalary);
  const sgkEmployerAmount = percentOf(grossSalary, input.sgkEmployerRatePercent);
  const unemploymentEmployerAmount = percentOf(
    grossSalary,
    input.unemploymentEmployerRatePercent,
  );
  const totalEmployerCost = grossSalary
    .plus(sgkEmployerAmount)
    .plus(unemploymentEmployerAmount);

  return {
    grossSalary: toMoneyString(grossSalary),
    sgkEmployerAmount: toMoneyString(sgkEmployerAmount),
    unemploymentEmployerAmount: toMoneyString(unemploymentEmployerAmount),
    totalEmployerCost: toMoneyString(totalEmployerCost),
  };
}
