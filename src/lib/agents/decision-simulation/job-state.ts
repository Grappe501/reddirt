export type DecisionSimulationJobStatus =
  | "DRAFT"
  | "QUEUED"
  | "RUNNING"
  | "PARTIAL"
  | "COMPLETE"
  | "FAILED"
  | "CANCELLED";

export interface DecisionSimulationChunkState {
  chunkOrdinal: number;
  startRunOrdinal: number;
  endRunOrdinal: number;
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
  attempts: number;
  completedRuns: number;
  failedRuns: number;
  error?: string;
}

export interface DecisionSimulationEnsembleJobState {
  status: DecisionSimulationJobStatus;
  requestedRuns: number;
  completedRuns: number;
  failedRuns: number;
  chunks: DecisionSimulationChunkState[];
  updatedAt: string;
}

export function summarizeDecisionSimulationJobStatus(
  state: DecisionSimulationEnsembleJobState,
): DecisionSimulationJobStatus {
  if (state.status === "CANCELLED") return "CANCELLED";
  if (state.completedRuns >= state.requestedRuns && state.failedRuns === 0) return "COMPLETE";
  if (state.completedRuns > 0 && state.completedRuns + state.failedRuns < state.requestedRuns) return "PARTIAL";
  if (state.failedRuns >= state.requestedRuns) return "FAILED";
  if (state.chunks.some((chunk) => chunk.status === "RUNNING")) return "RUNNING";
  if (state.chunks.some((chunk) => chunk.status === "PENDING")) return "QUEUED";
  return state.status;
}

export function nextRunnableDecisionSimulationChunks(
  state: DecisionSimulationEnsembleJobState,
  limit: number,
): DecisionSimulationChunkState[] {
  const safeLimit = Math.max(1, Math.floor(limit));
  return state.chunks
    .filter((chunk) => chunk.status === "PENDING" || chunk.status === "FAILED")
    .sort((a, b) => a.chunkOrdinal - b.chunkOrdinal)
    .slice(0, safeLimit);
}

export function checkpointDecisionSimulationChunk(
  state: DecisionSimulationEnsembleJobState,
  chunkOrdinal: number,
  update: Pick<DecisionSimulationChunkState, "status" | "completedRuns" | "failedRuns"> & { error?: string },
): DecisionSimulationEnsembleJobState {
  const chunks = state.chunks.map((chunk) =>
    chunk.chunkOrdinal === chunkOrdinal
      ? {
          ...chunk,
          ...update,
          attempts: chunk.attempts + (update.status === "RUNNING" ? 1 : 0),
        }
      : chunk,
  );
  const completedRuns = chunks.reduce((sum, chunk) => sum + chunk.completedRuns, 0);
  const failedRuns = chunks.reduce((sum, chunk) => sum + chunk.failedRuns, 0);
  const next = {
    ...state,
    chunks,
    completedRuns,
    failedRuns,
    updatedAt: new Date().toISOString(),
  };
  return { ...next, status: summarizeDecisionSimulationJobStatus(next) };
}
