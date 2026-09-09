export const DECISION_SIMULATION_RUN_PRESETS = [1, 10, 100, 1000] as const;
export const DECISION_SIMULATION_DESIGN_MAX_RUNS = 1_000_000 as const;

export type DecisionSimulationRunPreset = (typeof DECISION_SIMULATION_RUN_PRESETS)[number];

export type DecisionSimulationExecutionMode =
  | "INLINE"
  | "QUEUED"
  | "DISTRIBUTED";

export type DecisionSimulationEnsembleStatus =
  | "DRAFT"
  | "QUEUED"
  | "RUNNING"
  | "PARTIAL"
  | "COMPLETE"
  | "FAILED"
  | "CANCELLED";

export interface DecisionSimulationEnsembleRequest {
  requestedRuns: number;
  maxConcurrency?: number;
  executionMode?: DecisionSimulationExecutionMode;
  seedStrategy?: "RANDOM" | "DETERMINISTIC" | "MIXED";
  retainIndividualRuns?: boolean;
}

export interface DecisionSimulationEnsemblePlan {
  requestedRuns: number;
  executionMode: DecisionSimulationExecutionMode;
  maxConcurrency: number;
  chunkSize: number;
  chunkCount: number;
  retainIndividualRuns: boolean;
  designMaxRuns: number;
}

export interface DecisionSimulationAggregateSummary {
  completedRuns: number;
  failedRuns: number;
  dominantMove1Frames: Array<{ frame: string; count: number; share: number }>;
  dominantFinalRecommendations: Array<{ recommendation: string; count: number; share: number }>;
  confidenceMean?: number;
  probabilityMean?: number;
  threatDistribution?: Record<string, number>;
  opportunityDistribution?: Record<string, number>;
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

export function planDecisionSimulationEnsemble(
  request: DecisionSimulationEnsembleRequest,
): DecisionSimulationEnsemblePlan {
  const requestedRuns = clampInt(request.requestedRuns, 1, DECISION_SIMULATION_DESIGN_MAX_RUNS);

  const executionMode: DecisionSimulationExecutionMode =
    request.executionMode ??
    (requestedRuns <= 10 ? "INLINE" : requestedRuns <= 1000 ? "QUEUED" : "DISTRIBUTED");

  const defaultConcurrency =
    executionMode === "INLINE" ? Math.min(requestedRuns, 4) :
    executionMode === "QUEUED" ? 20 : 100;

  const maxConcurrency = clampInt(request.maxConcurrency ?? defaultConcurrency, 1, 10_000);
  const chunkSize =
    executionMode === "INLINE" ? requestedRuns :
    executionMode === "QUEUED" ? Math.min(100, requestedRuns) :
    Math.min(1000, requestedRuns);

  return {
    requestedRuns,
    executionMode,
    maxConcurrency,
    chunkSize,
    chunkCount: Math.ceil(requestedRuns / chunkSize),
    retainIndividualRuns: request.retainIndividualRuns ?? requestedRuns <= 10_000,
    designMaxRuns: DECISION_SIMULATION_DESIGN_MAX_RUNS,
  };
}

export function isSupportedDecisionSimulationRunCount(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= DECISION_SIMULATION_DESIGN_MAX_RUNS;
}
