import { assignAlternativeFuture } from "./alternative-futures/assign";
import type { AlternativeFutureId } from "./alternative-futures/contracts";
import { scoreRobustnessAcrossFutures } from "./alternative-futures/robustness";
import { buildDecisionSimulationDistributedChunks } from "./ensemble-orchestrator";
import {
  checkpointDecisionSimulationChunk,
  nextRunnableDecisionSimulationChunks,
  type DecisionSimulationChunkState,
  type DecisionSimulationEnsembleJobState,
  type DecisionSimulationJobStatus,
} from "./job-state";
import { chunkSizeForRequestedRuns, getDecisionSimulationQueueConfig } from "./queue-config";
import { DECISION_SIMULATION_DESIGN_MAX_RUNS, type DecisionSimulationExecutionMode } from "./scale";

export function jobProgressPercent(completed: number, failed: number, requested: number): number {
  const denom = Math.max(1, requested);
  return Math.min(100, Math.round(((completed + failed) / denom) * 1000) / 10);
}

export function planQueuedDecisionSimulationJob(requestedRuns: number): {
  requestedRuns: number;
  executionMode: DecisionSimulationExecutionMode;
  chunkSize: number;
  chunkCount: number;
  executableRuns: number;
  architectureOnly: boolean;
} {
  const cfg = getDecisionSimulationQueueConfig();
  const requested = Math.max(1, Math.min(DECISION_SIMULATION_DESIGN_MAX_RUNS, Math.floor(requestedRuns)));
  if (requested <= cfg.maxLiveRuns) {
    return {
      requestedRuns: requested,
      executionMode: "INLINE",
      chunkSize: requested,
      chunkCount: 1,
      executableRuns: requested,
      architectureOnly: false,
    };
  }
  if (requested > cfg.maxRunsPerJob) {
    const { plan, chunks } = buildDecisionSimulationDistributedChunks({
      requestedRuns: requested,
      executionMode: "DISTRIBUTED",
    });
    return {
      requestedRuns: requested,
      executionMode: "DISTRIBUTED",
      chunkSize: plan.chunkSize,
      chunkCount: chunks.length,
      executableRuns: 0,
      architectureOnly: true,
    };
  }
  const chunkSize = chunkSizeForRequestedRuns(requested);
  const chunkCount = Math.ceil(requested / chunkSize);
  return {
    requestedRuns: requested,
    executionMode: requested <= 1000 ? "QUEUED" : "DISTRIBUTED",
    chunkSize,
    chunkCount,
    executableRuns: requested,
    architectureOnly: false,
  };
}

export function buildInitialJobState(
  requestedRuns: number,
): DecisionSimulationEnsembleJobState {
  const plan = planQueuedDecisionSimulationJob(requestedRuns);
  const chunks: DecisionSimulationChunkState[] = [];
  for (let i = 0; i < plan.chunkCount; i += 1) {
    const start = i * plan.chunkSize + 1;
    const end = Math.min(plan.requestedRuns, start + plan.chunkSize - 1);
    chunks.push({
      chunkOrdinal: i + 1,
      startRunOrdinal: start,
      endRunOrdinal: end,
      status: "PENDING",
      attempts: 0,
      completedRuns: 0,
      failedRuns: 0,
    });
  }
  return {
    status: plan.architectureOnly ? "QUEUED" : plan.executionMode === "INLINE" ? "RUNNING" : "QUEUED",
    requestedRuns: plan.requestedRuns,
    completedRuns: 0,
    failedRuns: 0,
    chunks,
    updatedAt: new Date(0).toISOString(),
  };
}

export function selectRetryableChunks(
  state: DecisionSimulationEnsembleJobState,
  maxRetries: number,
): DecisionSimulationChunkState[] {
  return state.chunks.filter((chunk) => chunk.status === "FAILED" && chunk.attempts <= maxRetries);
}

export function applyCancelledJob(state: DecisionSimulationEnsembleJobState): DecisionSimulationEnsembleJobState {
  return {
    ...state,
    status: "CANCELLED",
    chunks: state.chunks.map((chunk) =>
      chunk.status === "PENDING" || chunk.status === "RUNNING" ? { ...chunk, status: "FAILED", error: "Cancelled" } : chunk,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function applyIdempotentChunkCompletion(
  state: DecisionSimulationEnsembleJobState,
  chunkOrdinal: number,
  update: { completedRuns: number; failedRuns: number; error?: string },
): DecisionSimulationEnsembleJobState {
  const existing = state.chunks.find((chunk) => chunk.chunkOrdinal === chunkOrdinal);
  if (existing?.status === "COMPLETE") return state;
  return checkpointDecisionSimulationChunk(state, chunkOrdinal, {
    status: "COMPLETE",
    completedRuns: update.completedRuns,
    failedRuns: update.failedRuns,
    error: update.error,
  });
}

export function nextClaimableChunks(state: DecisionSimulationEnsembleJobState, limit = 1) {
  if (state.status === "CANCELLED") return [];
  return nextRunnableDecisionSimulationChunks(state, limit);
}

export function mergeFrameCounts(
  existing: Array<{ frame: string; count: number }>,
  incoming: Array<{ frame: string; count: number }>,
): Array<{ frame: string; count: number; share: number }> {
  const map = new Map<string, number>();
  for (const row of [...existing, ...incoming]) {
    if (!row.frame) continue;
    map.set(row.frame, (map.get(row.frame) ?? 0) + row.count);
  }
  const total = [...map.values()].reduce((sum, n) => sum + n, 0) || 1;
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([frame, count]) => ({ frame, count, share: count / total }));
}

export type CommandCenterMember = {
  ordinal: number;
  futureId?: AlternativeFutureId;
  frame?: string;
  final?: string;
  confidence?: number | null;
  executiveSummary?: string;
  error?: string;
  moves?: Array<{
    moveNumber: number;
    side: string;
    message: string;
    predictedFrame?: string;
    rationaleSummary?: string;
  }>;
};

export function buildDecisionSimulationCommandCenter(
  requested: number,
  members: CommandCenterMember[],
  frames: Array<{ frame: string; count: number; share?: number }>,
  finals: Array<{ recommendation?: string; frame?: string; count: number; share?: number }>,
) {
  const completed = members.filter((member) => !member.error);
  const frameRows = frames.length
    ? frames
    : mergeFrameCounts(
        [],
        completed.map((member) => ({ frame: member.frame ?? "Unspecified", count: 1 })),
      );
  const finalRows = finals.length
    ? finals.map((row) => ({
        recommendation: row.recommendation ?? row.frame ?? "Unspecified",
        count: row.count,
        share: row.share ?? 0,
      }))
    : mergeFrameCounts(
        [],
        completed.map((member) => ({ frame: member.final ?? "Unspecified", count: 1 })),
      ).map((row) => ({ recommendation: row.frame, count: row.count, share: row.share }));

  const topFrame = frameRows[0];
  const topFinal = finalRows[0];
  const confidences = completed
    .map((member) => member.confidence)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const meanConfidence =
    confidences.length > 0 ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length : null;
  const outlierRate =
    completed.length && topFrame
      ? (completed.length - (topFrame.count ?? 0)) / completed.length
      : null;

  const moveConsensus: Array<{ moveNumber: number; topPredicted: string[]; topCounters: string[] }> = [];
  for (let moveNumber = 1; moveNumber <= 6; moveNumber += 1) {
    const predicted = mergeFrameCounts(
      [],
      completed
        .map((member) => member.moves?.find((move) => move.moveNumber === moveNumber && move.side === "COUNTERPARTY")?.predictedFrame)
        .filter((value): value is string => Boolean(value))
        .map((frame) => ({ frame, count: 1 })),
    );
    const counters = mergeFrameCounts(
      [],
      completed
        .map((member) => member.moves?.find((move) => move.moveNumber === moveNumber && move.side === "OPERATOR")?.message)
        .filter((value): value is string => Boolean(value))
        .map((frame) => ({ frame, count: 1 })),
    );
    moveConsensus.push({
      moveNumber,
      topPredicted: predicted.slice(0, 3).map((row) => row.frame),
      topCounters: counters.slice(0, 3).map((row) => row.frame),
    });
  }

  const byConfidence = [...completed].sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0));
  const withFuture = members.map((member) => ({
    ...member,
    futureId: member.futureId ?? assignAlternativeFuture(member.ordinal).futureId,
  }));
  const pickFuture = (futureId: AlternativeFutureId) =>
    withFuture.find((member) => !member.error && member.futureId === futureId) ?? null;
  const representative = {
    expected: pickFuture("EXPECTED"),
    highConfidence: byConfidence[byConfidence.length - 1] ?? null,
    hostileOutlier: pickFuture("HOSTILE"),
    opportunity: pickFuture("OPPORTUNITY"),
    escalation: pickFuture("ESCALATION"),
    unusual: pickFuture("SURPRISE"),
    silence: pickFuture("SILENCE"),
  };
  const robustness = scoreRobustnessAcrossFutures(withFuture);

  return {
    simulations: requested,
    dominantResponseFrame: topFrame?.frame ?? null,
    dominantResponseShare: topFrame?.share ?? (topFrame && completed.length ? topFrame.count / completed.length : null),
    strongestRecommendedCounter: topFinal?.recommendation ?? null,
    strongestRecommendedShare: topFinal?.share ?? null,
    modelConfidence: meanConfidence,
    outlierRate,
    robustness,
    frameDistribution: frameRows,
    moveConsensus,
    representative,
    uncertainty: [
      "Estimates are advisory and approximate.",
      "Actor variation is seeded; it is not a researched psychological profile unless a saved actor model is attached.",
      "Robustness is measured across named futures, not as likelihood inside one linear conversation.",
      "Thin ensembles under-represent rare but material futures.",
    ],
  };
}

export type { DecisionSimulationJobStatus };
