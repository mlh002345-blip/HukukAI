import Decimal from "decimal.js";
import { percentOf, toDecimal, toMoneyString } from "./money";

/**
 * Yasal faiz dönemi. Oran zaman içinde değişebildiğinden (3095 sayılı
 * Kanun), farklı dönemler farklı oranlarla ayrı ayrı hesaplanıp
 * toplanabilir. Oranlar bu motora hep dışarıdan (RuleSet üzerinden)
 * verilir; hiçbir oran koda gömülmez.
 */
export interface LegalInterestPeriod {
  annualRatePercent: string | number;
  days: number;
}

export interface CalculateLegalInterestInput {
  principal: string;
  periods: LegalInterestPeriod[];
}

export interface LegalInterestPeriodResult {
  annualRatePercent: string;
  days: number;
  interest: string;
}

export interface CalculateLegalInterestResult {
  principal: string;
  totalInterest: string;
  totalAmount: string;
  breakdown: LegalInterestPeriodResult[];
}

const DAYS_PER_YEAR = 365;

/**
 * Basit (bileşik olmayan) yasal faiz: faiz = anapara × (yıllık oran /
 * 100) × (gün sayısı / 365). Türk hukukunda yasal/temerrüt faizi basit
 * usulde hesaplanır.
 */
export function calculateLegalInterest(
  input: CalculateLegalInterestInput,
): CalculateLegalInterestResult {
  const principal = toDecimal(input.principal);

  const breakdown = input.periods.map((period) => {
    const dailyInterest = percentOf(principal, period.annualRatePercent).div(
      DAYS_PER_YEAR,
    );
    const interest = dailyInterest.mul(period.days);
    return {
      annualRatePercent: toDecimal(period.annualRatePercent).toString(),
      days: period.days,
      interest,
    };
  });

  const totalInterest = breakdown.reduce(
    (sum, period) => sum.plus(period.interest),
    new Decimal(0),
  );

  return {
    principal: toMoneyString(principal),
    totalInterest: toMoneyString(totalInterest),
    totalAmount: toMoneyString(principal.plus(totalInterest)),
    breakdown: breakdown.map((period) => ({
      annualRatePercent: period.annualRatePercent,
      days: period.days,
      interest: toMoneyString(period.interest),
    })),
  };
}
