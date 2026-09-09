import type { ModelChangeProposal, OutcomeComparison } from "./contracts";

export function proposeUnappliedModelChange(
  comparison: OutcomeComparison,
  actorId?: string,
): ModelChangeProposal {
  const miss = comparison.misses[0] ?? "Outcome attached. No automatic model edit.";
  return {
    status: "PENDING_OPERATOR_APPROVAL",
    applied: false,
    writeback: "FORBIDDEN",
    actorId,
    summary: `${miss} If this miss repeats, create a new personality version by hand. This record does not rewrite prompts or actor models.`,
  };
}
