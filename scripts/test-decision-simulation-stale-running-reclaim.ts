import { readFileSync } from "node:fs";
import { ALTERNATIVE_FUTURE_IDS } from "../src/lib/agents/decision-simulation/alternative-futures/contracts";
import { scoreHostedEnsembleProof } from "../src/lib/agents/decision-simulation/hosted-ensemble-proof";
import { mergeHostedProofIntoAggregate } from "../src/lib/agents/decision-simulation/hosted-ensemble-proof/persist";
import { isChunkClaimable, STALE_RUNNING_CLAIM_SQL } from "../src/lib/agents/decision-simulation/worker-continuity";
import { selectRetryableChunks } from "../src/lib/agents/decision-simulation/job-lifecycle";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

console.log("Decision Simulator stale running reclaim");

const now = Date.parse("2026-09-09T18:00:00.000Z");
assert(isChunkClaimable({ status: "RUNNING", claimedAt: null }, now), "running with a null claim is reclaimable");
assert(
  isChunkClaimable({ status: "RUNNING", claimedAt: "2026-09-09T17:57:00.000Z" }, now),
  "running older than two minutes is reclaimable",
);
assert(
  !isChunkClaimable({ status: "RUNNING", claimedAt: "2026-09-09T17:59:30.000Z" }, now),
  "a live running claim is left alone",
);

const retryable = selectRetryableChunks(
  {
    status: "RUNNING",
    requestedRuns: 100,
    completedRuns: 90,
    failedRuns: 9,
    updatedAt: "2026-09-09T18:00:00.000Z",
    chunks: [
      {
        chunkOrdinal: 23,
        startRunOrdinal: 23,
        endRunOrdinal: 23,
        status: "RUNNING",
        attempts: 1,
        completedRuns: 0,
        failedRuns: 0,
        claimedAt: null,
      },
    ],
  },
  2,
);
assert(retryable.length === 1 && retryable[0].chunkOrdinal === 23, "retry selection returns a stuck running chunk");

const hosted = scoreHostedEnsembleProof({
  requested: 100,
  completed: 91,
  failed: 9,
  status: "COMPLETE",
  executionMode: "QUEUED",
  commandCenter: {
    robustness: {
      futuresWithRuns: 6,
      requiredFutures: 6,
      lanes: [
        { futureId: "EXPECTED", runCount: 16, representativeIsModal: true },
        { futureId: "HOSTILE", runCount: 16, representativeIsModal: true },
        { futureId: "OPPORTUNITY", runCount: 15, representativeIsModal: true },
        { futureId: "ESCALATION", runCount: 17, representativeIsModal: true },
        { futureId: "SURPRISE", runCount: 15, representativeIsModal: true },
        { futureId: "SILENCE", runCount: 12, representativeIsModal: true },
      ],
    },
  },
  dashboard: { branches: ALTERNATIVE_FUTURE_IDS.map((futureId) => ({ futureId, runCount: 12, representativeIsModal: true })) },
});
assert(hosted.status === "PROVEN", "the finished hosted 100 snapshot scores proven");
assert(hosted.minLaneN === 12, "smallest lane n is 12 on that snapshot");

const stored = mergeHostedProofIntoAggregate({ keep: true }, hosted);
assert(stored.keep === true, "proof persist keeps existing aggregate keys");
assert((stored.hostedProof as { status?: string }).status === "PROVEN", "proof persist stores the score on the ensemble");

const jobs = readFileSync("src/lib/agents/decision-simulation/jobs.ts", "utf8");
const work = readFileSync("src/app/api/admin/decision-simulator/jobs/[jobId]/work/route.ts", "utf8");
const retry = readFileSync("src/app/api/admin/decision-simulator/jobs/[jobId]/retry/route.ts", "utf8");
const client = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
assert(jobs.includes(STALE_RUNNING_CLAIM_SQL) || jobs.includes("status IN ('PENDING', 'FAILED', 'RUNNING')"), "claim SQL matches the reclaim contract");
assert(jobs.includes("claimed_at IS NULL") && jobs.includes("status = 'RUNNING'"), "retry resets a stale or unclaimed running chunk");
assert(jobs.includes("mergeHostedProofIntoAggregate"), "a finished job persists the hosted proof on the ensemble");
assert(jobs.includes("claimable: isChunkClaimable"), "job view marks which chunks the worker can take");
assert(work.includes("maxDuration = 60"), "the worker asks Netlify for a longer OpenAI window when the plan allows");
assert(retry.includes("retryFailedDecisionSimulationChunks") && retry.includes("after("), "retry still kicks the worker");
assert(client.includes("Return stuck chunk"), "dashboard can return a stuck running chunk");
assert(!/sendEmail|publishPost|mailto:/.test(client), "reclaim UI has no send/post action");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-STALE-RUNNING-RECLAIM-1.0"), "reclaim slice is named on the canonical roadmap");
assert(
  roadmap.includes("DEC-SIM-WORKER-CONTINUITY-1.0") &&
    roadmap.includes("DEC-SIM-HOSTED-ENSEMBLE-PROOF-1.0") &&
    roadmap.includes("DEC-SIM-CORRESPONDENCE-THREAD-1.0"),
  "prior capability names stay on the canonical roadmap",
);
assert(roadmap.includes("V2-36") && roadmap.includes("V2-40"), "dedicated workers and outliving-the-request OpenAI stay V2");
assert(/Phase 5 remains open/i.test(roadmap), "this slice does not close Phase 5");

console.log("OK — stale running reclaim gates passed");
