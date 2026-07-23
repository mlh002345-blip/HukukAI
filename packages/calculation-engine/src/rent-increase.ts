import { percentOf, toDecimal, toMoneyString } from "./money";

export interface CalculateRentIncreaseInput {
  currentRent: string;
  /** TBK m.344 uyarınca üst sınır olan TÜFE oniki aylık ortalama
   * değişim oranı; bu motor tarafından varsayılan bir değer önerilmez. */
  increaseRatePercent: string;
}

export interface CalculateRentIncreaseResult {
  currentRent: string;
  increaseRatePercent: string;
  increaseAmount: string;
  newRent: string;
}

/**
 * Kira artışı: yeniKira = eskiKira × (1 + oran/100). TBK m.344'e göre
 * konut ve çatılı işyeri kiralarında artış oranı, bir önceki kira
 * yılındaki TÜFE oniki aylık ortalamalarına göre değişim oranını
 * geçemez; bu oran mevzuata göre değiştiğinden dışarıdan verilir.
 */
export function calculateRentIncrease(
  input: CalculateRentIncreaseInput,
): CalculateRentIncreaseResult {
  const currentRent = toDecimal(input.currentRent);
  const increaseAmount = percentOf(currentRent, input.increaseRatePercent);
  const newRent = currentRent.plus(increaseAmount);

  return {
    currentRent: toMoneyString(currentRent),
    increaseRatePercent: toDecimal(input.increaseRatePercent).toString(),
    increaseAmount: toMoneyString(increaseAmount),
    newRent: toMoneyString(newRent),
  };
}
