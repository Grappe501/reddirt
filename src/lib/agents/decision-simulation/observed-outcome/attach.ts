import { clipEvidenceText } from "../evidence-provenance/clip";
import type { ObservedOutcome } from "../dashboard-intelligence/library";
import { compareObservedOutcome } from "./compare";
import { OBSERVED_RESPONSE_EXCERPT_MAX, type OutcomeCompareInput } from "./contracts";
import { proposeUnappliedModelChange } from "./proposal";

export function attachObservedOutcome(
  input: OutcomeCompareInput & { jobId: string; recordedAt?: string },
): ObservedOutcome {
  const excerpt = clipEvidenceText(input.actualResponse, OBSERVED_RESPONSE_EXCERPT_MAX);
  const comparison = compareObservedOutcome({ ...input, actualResponse: excerpt });
  return {
    jobId: input.jobId,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    actualResponse: excerpt,
    closestFuture: input.closestFuture,
    notes: input.notes?.trim() ?? "",
    predictedFrame: comparison.predictedFrame,
    observedFrame: comparison.observedFrame,
    comparison,
    modelChangeProposal: proposeUnappliedModelChange(comparison, input.actorId),
  };
}
