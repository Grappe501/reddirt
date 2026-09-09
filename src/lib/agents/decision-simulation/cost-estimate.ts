export interface DecisionSimulationCostEstimate {
  requestedRuns: number;
  approximateCalls: number;
  approximateGeneratedMoves: number;
  tokenRange: { min: number; max: number };
  costRangeUsd: { min: number; max: number };
  exact: false;
  requiresSecondConfirm: boolean;
  blockedByBudget: boolean;
  budgetUsd: number;
}

/** Conservative gpt-4o-mini-ish ranges. Not a billing quote. */
const TOKENS_PER_RUN_MIN = 900;
const TOKENS_PER_RUN_MAX = 2800;
const USD_PER_MILLION_TOKENS_MIN = 0.2;
const USD_PER_MILLION_TOKENS_MAX = 0.85;

export function estimateDecisionSimulationCost(
  requestedRuns: number,
  budgetUsd: number,
): DecisionSimulationCostEstimate {
  const runs = Math.max(1, Math.floor(requestedRuns));
  const tokenMin = runs * TOKENS_PER_RUN_MIN;
  const tokenMax = runs * TOKENS_PER_RUN_MAX;
  const costMin = (tokenMin / 1_000_000) * USD_PER_MILLION_TOKENS_MIN;
  const costMax = (tokenMax / 1_000_000) * USD_PER_MILLION_TOKENS_MAX;
  return {
    requestedRuns: runs,
    approximateCalls: runs,
    approximateGeneratedMoves: runs * 6,
    tokenRange: { min: tokenMin, max: tokenMax },
    costRangeUsd: { min: Number(costMin.toFixed(4)), max: Number(costMax.toFixed(4)) },
    exact: false,
    requiresSecondConfirm: runs >= 1000,
    blockedByBudget: costMin > budgetUsd,
    budgetUsd,
  };
}

export function formatUsd(value: number): string {
  if (value < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(2)}`;
}
