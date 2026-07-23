import { percentOf, toDecimal, toMoneyString } from "./money";

export interface CalculateSelfEmploymentReceiptInput {
  grossAmount: string;
  withholdingTaxRatePercent: string;
  vatRatePercent: string;
}

export interface CalculateSelfEmploymentReceiptResult {
  grossAmount: string;
  vatAmount: string;
  withholdingTaxAmount: string;
  netAmount: string;
  totalCollected: string;
}

/**
 * Serbest meslek makbuzu: brüt ücret üzerinden gelir vergisi stopajı
 * kesilir (netAmount = brüt − stopaj); KDV brüt tutar üzerinden ayrıca
 * hesaplanıp müşteriden tahsil edilir (KDV mükellefin geliri değildir).
 */
export function calculateSelfEmploymentReceipt(
  input: CalculateSelfEmploymentReceiptInput,
): CalculateSelfEmploymentReceiptResult {
  const grossAmount = toDecimal(input.grossAmount);
  const vatAmount = percentOf(grossAmount, input.vatRatePercent);
  const withholdingTaxAmount = percentOf(
    grossAmount,
    input.withholdingTaxRatePercent,
  );
  const netAmount = grossAmount.minus(withholdingTaxAmount);
  const totalCollected = grossAmount.plus(vatAmount);

  return {
    grossAmount: toMoneyString(grossAmount),
    vatAmount: toMoneyString(vatAmount),
    withholdingTaxAmount: toMoneyString(withholdingTaxAmount),
    netAmount: toMoneyString(netAmount),
    totalCollected: toMoneyString(totalCollected),
  };
}
