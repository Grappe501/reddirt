import {
  DECISION_SIMULATION_DESIGN_MAX_RUNS,
  DECISION_SIMULATION_RUN_PRESETS,
  isSupportedDecisionSimulationRunCount,
  planDecisionSimulationEnsemble,
} from "../src/lib/agents/decision-simulation";

function main() {
  const one = planDecisionSimulationEnsemble({ requestedRuns: 1 });
  const thousand = planDecisionSimulationEnsemble({ requestedRuns: 1000 });
  const million = planDecisionSimulationEnsemble({ requestedRuns: 1_000_000 });

  const presetsCorrect = DECISION_SIMULATION_RUN_PRESETS.join(",") === "1,10,100,1000";
  const maxCorrect = DECISION_SIMULATION_DESIGN_MAX_RUNS === 1_000_000;
  const oneInline = one.executionMode === "INLINE";
  const thousandQueued = thousand.executionMode === "QUEUED";
  const millionDistributed = million.executionMode === "DISTRIBUTED";
  const millionChunked = million.chunkCount > 1 && million.chunkSize <= 1000;
  const validatesBounds =
    isSupportedDecisionSimulationRunCount(1) &&
    isSupportedDecisionSimulationRunCount(1_000_000) &&
    !isSupportedDecisionSimulationRunCount(0) &&
    !isSupportedDecisionSimulationRunCount(1_000_001);

  console.log("Decision Simulation scale checks");
  console.log("  dashboard presets 1/10/100/1000:", presetsCorrect);
  console.log("  design max one million:", maxCorrect);
  console.log("  single run inline:", oneInline);
  console.log("  1000 runs queued:", thousandQueued);
  console.log("  1M runs distributed:", millionDistributed);
  console.log("  1M workload chunked:", millionChunked);
  console.log("  run-count bounds enforced:", validatesBounds);

  if (!(presetsCorrect && maxCorrect && oneInline && thousandQueued && millionDistributed && millionChunked && validatesBounds)) {
    process.exit(1);
  }

  console.log("OK — Decision Simulation scale architecture checks passed");
}

main();
