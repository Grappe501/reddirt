import type { ObservedOutcome } from "../dashboard-intelligence/library";

export const ENSEMBLE_OUTCOME_PERSIST_VERSION = "ensemble-outcome-persist-1.0" as const;
export const ENSEMBLE_OUTCOME_STORAGE = "ENSEMBLE_AGGREGATE" as const;

export type PersistedObservedOutcome = ObservedOutcome & {
  persistVersion: typeof ENSEMBLE_OUTCOME_PERSIST_VERSION;
  storage: typeof ENSEMBLE_OUTCOME_STORAGE;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

export function serializeObservedOutcomeForEnsemble(outcome: ObservedOutcome): PersistedObservedOutcome {
  const { actorModel: _actorModel, ...safe } = asRecord(outcome);
  void _actorModel;
  return {
    ...(safe as ObservedOutcome),
    jobId: String(outcome.jobId),
    recordedAt: outcome.recordedAt,
    actualResponse: outcome.actualResponse,
    closestFuture: outcome.closestFuture,
    notes: outcome.notes ?? "",
    predictedFrame: outcome.predictedFrame ?? null,
    persistVersion: ENSEMBLE_OUTCOME_PERSIST_VERSION,
    storage: ENSEMBLE_OUTCOME_STORAGE,
  };
}

export function mergeObservedOutcomeIntoAggregate(
  summary: unknown,
  outcome: ObservedOutcome,
): Record<string, unknown> {
  const base = asRecord(summary);
  return {
    ...base,
    observedOutcome: serializeObservedOutcomeForEnsemble(outcome),
  };
}

export function readObservedOutcomeFromAggregate(summary: unknown): PersistedObservedOutcome | null {
  const stored = asRecord(summary).observedOutcome;
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return null;
  const row = stored as Partial<PersistedObservedOutcome>;
  if (!row.jobId || !row.actualResponse) return null;
  return serializeObservedOutcomeForEnsemble(row as ObservedOutcome);
}
