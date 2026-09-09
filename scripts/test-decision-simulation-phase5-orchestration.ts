import {
  buildDecisionSimulationDistributedChunks,
  checkpointDecisionSimulationChunk,
  nextRunnableDecisionSimulationChunks,
  planDecisionSimulationEnsemble,
  type DecisionSimulationEnsembleJobState,
} from "../src/lib/agents/decision-simulation";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const one = planDecisionSimulationEnsemble({ requestedRuns: 1 });
  const thousand = planDecisionSimulationEnsemble({ requestedRuns: 1000 });
  const million = buildDecisionSimulationDistributedChunks({ requestedRuns: 1_000_000, maxConcurrency: 500 });

  assert(one.executionMode === "INLINE", "1 run should be INLINE");
  assert(thousand.executionMode === "QUEUED", "1000 runs should be QUEUED");
  assert(million.plan.executionMode === "DISTRIBUTED", "1M runs should be DISTRIBUTED");
  assert(million.chunks.length === 1000, "1M runs should create 1000 chunks at 1000 runs/chunk");
  assert(million.chunks[0].startRunOrdinal === 1, "first chunk must start at run 1");
  assert(million.chunks.at(-1)?.endRunOrdinal === 1_000_000, "last chunk must end at run 1M");

  let job: DecisionSimulationEnsembleJobState = {
    status: "QUEUED",
    requestedRuns: 2000,
    completedRuns: 0,
    failedRuns: 0,
    chunks: [
      { chunkOrdinal: 1, startRunOrdinal: 1, endRunOrdinal: 1000, status: "PENDING", attempts: 0, completedRuns: 0, failedRuns: 0 },
      { chunkOrdinal: 2, startRunOrdinal: 1001, endRunOrdinal: 2000, status: "PENDING", attempts: 0, completedRuns: 0, failedRuns: 0 },
    ],
    updatedAt: new Date(0).toISOString(),
  };

  assert(nextRunnableDecisionSimulationChunks(job, 1)[0]?.chunkOrdinal === 1, "first pending chunk should be runnable");
  job = checkpointDecisionSimulationChunk(job, 1, { status: "RUNNING", completedRuns: 0, failedRuns: 0 });
  assert(job.status === "RUNNING", "job should become RUNNING");
  job = checkpointDecisionSimulationChunk(job, 1, { status: "COMPLETE", completedRuns: 1000, failedRuns: 0 });
  assert(job.status === "PARTIAL", "partially completed job should be PARTIAL");
  job = checkpointDecisionSimulationChunk(job, 2, { status: "COMPLETE", completedRuns: 1000, failedRuns: 0 });
  assert(job.status === "COMPLETE", "all completed chunks should yield COMPLETE");

  console.log("OK — Decision Simulation Phase 5 orchestration gate passed");
  console.log({
    presets: [one.requestedRuns, thousand.requestedRuns],
    millionMode: million.plan.executionMode,
    millionChunkCount: million.chunks.length,
    finalJobStatus: job.status,
  });
}

main();
