import Decimal from "decimal.js";
import { toDecimal, toMoneyString } from "./money";
import {
  calculateLegalInterest,
  type CalculateLegalInterestInput,
} from "./legal-interest";

export interface EnforcementExpenseItem {
  label: string;
  amount: string;
}

export interface CalculateEnforcementDebtInput {
  principal: string;
  interest: CalculateLegalInterestInput;
  expenses: EnforcementExpenseItem[];
}

export interface CalculateEnforcementDebtResult {
  principal: string;
  interestAmount: string;
  expensesTotal: string;
  totalDebt: string;
  expenses: EnforcementExpenseItem[];
}

/**
 * İcra takibindeki toplam borç: anapara + işlemiş yasal faiz + icra
 * masrafları (harç, tebligat gideri, vekâlet ücreti vb. — kalemler
 * dışarıdan verilir, bu motor içeriklerini bilmez).
 */
export function calculateEnforcementDebt(
  input: CalculateEnforcementDebtInput,
): CalculateEnforcementDebtResult {
  const principal = toDecimal(input.principal);
  const interestResult = calculateLegalInterest({
    principal: input.principal,
    periods: input.interest.periods,
  });
  const interestAmount = toDecimal(interestResult.totalInterest);

  const expensesTotal = input.expenses.reduce(
    (sum, expense) => sum.plus(toDecimal(expense.amount)),
    new Decimal(0),
  );

  const totalDebt = principal.plus(interestAmount).plus(expensesTotal);

  return {
    principal: toMoneyString(principal),
    interestAmount: toMoneyString(interestAmount),
    expensesTotal: toMoneyString(expensesTotal),
    totalDebt: toMoneyString(totalDebt),
    expenses: input.expenses.map((expense) => ({
      label: expense.label,
      amount: toMoneyString(toDecimal(expense.amount)),
    })),
  };
}
