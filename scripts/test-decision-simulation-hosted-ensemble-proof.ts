import { readFileSync } from "node:fs";
import { ALTERNATIVE_FUTURE_IDS } from "../src/lib/agents/decision-simulation/alternative-futures/contracts";
import { scoreHostedEnsembleProof } from "../src/lib/agents/decision-simulation/hosted-ensemble-proof";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

function lanes(n: number, typical = true) {
  return ALTERNATIVE_FUTURE_IDS.map((futureId) => ({
    futureId,
    runCount: n,
    modalShare: n > 1 ? 0.66 : 1,
    representativeIsModal: typical,
  }));
}

console.log("Decision Simulator hosted ensemble proof");

const six = scoreHostedEnsembleProof({
  requested: 6,
  completed: 6,
  status: "COMPLETE",
  executionMode: "QUEUED",
  commandCenter: { robustness: { futuresWithRuns: 6, requiredFutures: 6, lanes: lanes(1) } },
  dashboard: { branches: ALTERNATIVE_FUTURE_IDS.map((futureId) => ({ futureId, runCount: 1, representativeIsModal: true })) },
});
assert(six.status === "NOT_STARTED", "a 6-run job does not count as hosted depth");
assert(six.checks.some((item) => item.id === "WITHIN_LANE_N" && !item.pass), "n=1 per lane fails within-lane proof");

const running = scoreHostedEnsembleProof({
  requested: 100,
  completed: 12,
  status: "RUNNING",
  executionMode: "QUEUED",
  commandCenter: { robustness: { futuresWithRuns: 6, lanes: lanes(2) } },
  dashboard: { branches: ALTERNATIVE_FUTURE_IDS.map((futureId) => ({ futureId, runCount: 2, representativeIsModal: true })) },
});
assert(running.status === "IN_PROGRESS", "a live 100-run job is in-progress proof, not proven");

const proven = scoreHostedEnsembleProof({
  requested: 100,
  completed: 100,
  status: "COMPLETE",
  executionMode: "QUEUED",
  commandCenter: { robustness: { futuresWithRuns: 6, requiredFutures: 6, lanes: lanes(16) } },
  dashboard: { branches: ALTERNATIVE_FUTURE_IDS.map((futureId) => ({ futureId, runCount: 16, representativeIsModal: true })) },
});
assert(proven.status === "PROVEN", "a finished 100-run job with six futures and n>=2 is proven");
assert(proven.checks.every((item) => item.pass), "every hosted-proof check passes on the informative 100-run snapshot");

const failed = scoreHostedEnsembleProof({
  requested: 100,
  completed: 100,
  status: "COMPLETE",
  executionMode: "QUEUED",
  commandCenter: { robustness: { futuresWithRuns: 3, lanes: lanes(16).slice(0, 3) } },
  dashboard: { branches: [] },
});
assert(failed.status === "FAILED", "a finished 100-run job missing futures is not proven");

const jobs = readFileSync("src/lib/agents/decision-simulation/jobs.ts", "utf8");
const client = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
assert(jobs.includes("scoreHostedEnsembleProof"), "job view attaches the hosted proof");
assert(client.includes("Hosted ensemble proof"), "dashboard names the hosted proof");
assert(!/mailto:|twitter\.com\/intent|send this/i.test(client), "proof UI has no send/post action");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-HOSTED-ENSEMBLE-PROOF-1.0"), "hosted proof slice is named on the canonical roadmap");
assert(roadmap.includes("DEC-SIM-WORKER-CONTINUITY-1.0") && roadmap.includes("DEC-SIM-OBSERVED-OUTCOME-1.0") && roadmap.includes("DEC-SIM-STALE-RUNNING-RECLAIM-1.0"), "prior capability names stay on the canonical roadmap");
assert(roadmap.includes("V2-37"), "auto-canary 100-run deploys stay V2");
assert(/Phase 5 remains open/i.test(roadmap), "the proof contract does not close Phase 5");

console.log("OK — hosted ensemble proof gates passed");
