import { DECISION_SIMULATION_DESIGN_MAX_RUNS } from "./scale";

function intEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = Number(process.env[name]);
  if (!Number.isFinite(raw)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(raw)));
}

function floatEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = Number(process.env[name]);
  if (!Number.isFinite(raw)) return fallback;
  return Math.max(min, Math.min(max, raw));
}

export function getDecisionSimulationQueueConfig() {
  return {
    maxLiveRuns: intEnv("DECISION_SIM_MAX_LIVE_RUNS", 10, 1, 10),
    queueConcurrency: intEnv("DECISION_SIM_QUEUE_CONCURRENCY", 1, 1, 4),
    chunkSize100: intEnv("DECISION_SIM_CHUNK_SIZE_100", 1, 1, 10),
    chunkSize1000: intEnv("DECISION_SIM_CHUNK_SIZE_1000", 1, 1, 10),
    maxActiveJobs: intEnv("DECISION_SIM_MAX_ACTIVE_JOBS", 2, 1, 20),
    maxRunsPerJob: intEnv("DECISION_SIM_MAX_RUNS_PER_JOB", 1000, 10, DECISION_SIMULATION_DESIGN_MAX_RUNS),
    maxRetries: intEnv("DECISION_SIM_MAX_RETRIES", 2, 0, 8),
    jobBudgetUsd: floatEnv("DECISION_SIM_JOB_BUDGET_USD", 2, 0.01, 100),
    designMaxRuns: DECISION_SIMULATION_DESIGN_MAX_RUNS,
  };
}

export function chunkSizeForRequestedRuns(requestedRuns: number): number {
  const cfg = getDecisionSimulationQueueConfig();
  if (requestedRuns <= cfg.maxLiveRuns) return requestedRuns;
  if (requestedRuns <= 100) return cfg.chunkSize100;
  return cfg.chunkSize1000;
}

export function depthLabel(requestedRuns: number): {
  label: string;
  mode: "INLINE" | "QUEUED" | "DISTRIBUTED";
  runVerb: string;
} {
  if (requestedRuns <= 1) return { label: "Quick look", mode: "INLINE", runVerb: "Run 1 simulation" };
  if (requestedRuns <= 10) return { label: "Scenario set", mode: "INLINE", runVerb: `Run ${requestedRuns} simulations` };
  if (requestedRuns === 100) return { label: "Ensemble", mode: "QUEUED", runVerb: "Launch 100-Run Ensemble" };
  if (requestedRuns <= 100) return { label: "Ensemble", mode: "QUEUED", runVerb: `Launch ${requestedRuns}-Run Ensemble` };
  if (requestedRuns === 1000) return { label: "Deep ensemble", mode: "QUEUED", runVerb: "Launch 1,000-Run Deep Ensemble" };
  if (requestedRuns <= 1000) return { label: "Deep ensemble", mode: "QUEUED", runVerb: `Launch ${requestedRuns.toLocaleString()}-Run Deep Ensemble` };
  return { label: "Large distributed study", mode: "DISTRIBUTED", runVerb: "Accept distributed study plan" };
}
