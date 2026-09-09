import {
  applyCancelledJob,
  applyIdempotentChunkCompletion,
  buildActorVariation,
  buildDecisionSimulationCommandCenter,
  buildGenericActorModel,
  buildInitialJobState,
  estimateDecisionSimulationCost,
  getDecisionSimulationQueueConfig,
  jobProgressPercent,
  mergeFrameCounts,
  planQueuedDecisionSimulationJob,
  selectRetryableChunks,
} from "../src/lib/agents/decision-simulation";

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

function main() {
  console.log("Decision Simulator queue execution gates");

  const one = planQueuedDecisionSimulationJob(1);
  const ten = planQueuedDecisionSimulationJob(10);
  const hundred = planQueuedDecisionSimulationJob(100);
  const thousand = planQueuedDecisionSimulationJob(1000);
  const oversized = planQueuedDecisionSimulationJob(5000);
  const million = planQueuedDecisionSimulationJob(1_000_000);

  assert(one.executionMode === "INLINE" && one.executableRuns === 1, "job creation: 1-run is live/inline");
  assert(ten.executionMode === "INLINE" && ten.chunkCount === 1, "job creation: 10-run is live/inline");
  assert(hundred.executionMode === "QUEUED" && hundred.chunkCount === 100 && hundred.chunkSize === 1, "100-run chunk plan is queued and chunked");
  assert(thousand.executionMode === "QUEUED" && thousand.chunkCount === 1000 && thousand.executableRuns === 1000, "1,000-run chunk plan is queued");
  assert(oversized.architectureOnly && oversized.executableRuns === 0, ">1,000 accepted as architecture-only unless configured higher");
  assert(million.architectureOnly && million.requestedRuns === 1_000_000 && million.executableRuns === 0, "million-run ceiling remains bounded");

  assert(jobProgressPercent(438, 2, 1000) === 44, "job progress calculation uses completed+failed");
  assert(jobProgressPercent(0, 0, 100) === 0, "job progress starts at 0");

  const state = buildInitialJobState(100);
  const cancelled = applyCancelledJob(state);
  assert(cancelled.status === "CANCELLED", "cancellation marks job cancelled");
  assert(cancelled.chunks.every((chunk) => chunk.status === "FAILED"), "cancellation fails unfinished chunks");

  const retryState = {
    ...state,
    chunks: state.chunks.map((chunk, index) =>
      index === 0 ? { ...chunk, status: "FAILED" as const, attempts: 1, error: "timeout" } : chunk,
    ),
  };
  const retryable = selectRetryableChunks(retryState, 2);
  assert(retryable.length === 1 && retryable[0].chunkOrdinal === 1, "retry selection returns failed chunks under max retries");
  const exhausted = selectRetryableChunks(
    {
      ...retryState,
      chunks: retryState.chunks.map((chunk) => ({ ...chunk, status: "FAILED" as const, attempts: 3 })),
    },
    2,
  );
  assert(exhausted.length === 0, "retry selection skips exhausted chunks");

  const first = applyIdempotentChunkCompletion(state, 1, { completedRuns: 1, failedRuns: 0 });
  const again = applyIdempotentChunkCompletion(first, 1, { completedRuns: 1, failedRuns: 0 });
  assert(first.completedRuns === 1 && again.completedRuns === 1, "idempotent chunk completion does not double-count");

  const merged = mergeFrameCounts(
    [{ frame: "Credibility Attack", count: 40 }],
    [{ frame: "Credibility Attack", count: 22 }, { frame: "Ignore", count: 8 }],
  );
  assert(merged[0].frame === "Credibility Attack" && merged[0].count === 62, "aggregate merging sums frames");

  const actor = buildGenericActorModel({
    message: "Test opening",
    channel: "EMAIL",
    operatorActor: { name: "Operator", actorType: "CAMPAIGN" },
    counterpartyActor: { name: "Counterparty", actorType: "CAMPAIGN" },
  });
  const a = buildActorVariation(actor, 7, "job-seed-repro");
  const b = buildActorVariation(actor, 7, "job-seed-repro");
  const c = buildActorVariation(actor, 8, "job-seed-repro");
  assert(JSON.stringify(a) === JSON.stringify(b), "actor variation is reproducible for the same seed+ordinal");
  assert(JSON.stringify(a) !== JSON.stringify(c), "actor variation changes by member ordinal");

  const cheap = estimateDecisionSimulationCost(10, 2);
  const hundredCost = estimateDecisionSimulationCost(100, 2);
  const thousandCost = estimateDecisionSimulationCost(1000, 2);
  const blocked = estimateDecisionSimulationCost(1000, 0.01);
  assert(!cheap.requiresSecondConfirm && !cheap.blockedByBudget, "cost gate: 10-run does not need second confirm");
  assert(hundredCost.approximateCalls === 100 && hundredCost.exact === false, "cost gate: 100-run estimate is approximate");
  assert(thousandCost.requiresSecondConfirm, "cost gate: 1,000-run requires second confirmation");
  assert(blocked.blockedByBudget, "cost gate: blocks when estimated min exceeds budget");

  const command = buildDecisionSimulationCommandCenter(
    3,
    [
      { ordinal: 1, frame: "Credibility Attack", final: "Stay on record", confidence: 0.7 },
      { ordinal: 2, frame: "Credibility Attack", final: "Stay on record", confidence: 0.6 },
      { ordinal: 3, frame: "Ignore", final: "Wait", confidence: 0.2 },
    ],
    [],
    [],
  );
  assert(command.dominantResponseFrame === "Credibility Attack", "command center dominant frame");
  assert(command.outlierRate !== null && command.outlierRate > 0, "command center outlier rate");

  const cfg = getDecisionSimulationQueueConfig();
  assert(cfg.maxLiveRuns === 10 && cfg.queueConcurrency === 1 && cfg.maxRunsPerJob === 1000, "conservative queue defaults");
  assert(cfg.chunkSize100 === 1 && cfg.chunkSize1000 === 1, "Netlify-safe chunk size defaults to 1");
  assert(cfg.jobBudgetUsd === 2, "default job budget is conservative");

  console.log("OK — Decision Simulator queue execution gates passed");
}

main();
