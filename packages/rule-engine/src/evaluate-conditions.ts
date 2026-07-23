import type { RuleCondition } from "./types";

function evaluateCondition(
  condition: RuleCondition,
  facts: Record<string, unknown>,
): boolean {
  const factValue = facts[condition.field];
  switch (condition.operator) {
    case "EQUALS":
      return factValue === condition.value;
    case "NOT_EQUALS":
      return factValue !== condition.value;
    case "IN":
      return (
        Array.isArray(condition.value) && condition.value.includes(factValue)
      );
    case "GTE":
      return (
        typeof factValue === "number" &&
        typeof condition.value === "number" &&
        factValue >= condition.value
      );
    case "LTE":
      return (
        typeof factValue === "number" &&
        typeof condition.value === "number" &&
        factValue <= condition.value
      );
  }
}

export function evaluateConditions(
  conditions: RuleCondition[],
  facts: Record<string, unknown>,
): boolean {
  return conditions.every((condition) => evaluateCondition(condition, facts));
}
