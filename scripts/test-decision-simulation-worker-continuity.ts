import { readFileSync } from "node:fs";
import { isChunkClaimable } from "../src/lib/agents/decision-simulation/worker-continuity";
import { kickDecisionSimulationWorker } from "../src/lib/agents/decision-simulation/worker-continuity";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

console.log("Decision Simulator worker continuity");

const now = Date.parse("2026-09-09T16:00:00.000Z");
assert(isChunkClaimable({ status: "PENDING" }, now), "unclaimed pending chunks are claimable");
assert(isChunkClaimable({ status: "FAILED", claimedAt: "2026-09-09T15:50:00.000Z" }, now), "failed chunks can be retried after they go stale");
assert(isChunkClaimable({ status: "RUNNING", claimedAt: "2026-09-09T15:57:00.000Z" }, now), "a two-minute-old running chunk is reclaimed");
assert(isChunkClaimable({ status: "RUNNING", claimedAt: null }, now), "a running chunk with no claim timestamp is reclaimable");
assert(!isChunkClaimable({ status: "RUNNING", claimedAt: "2026-09-09T15:59:30.000Z" }, now), "a live running chunk is not reclaimed");
assert(!isChunkClaimable({ status: "COMPLETE", claimedAt: "2026-09-09T15:00:00.000Z" }, now), "complete chunks stay complete");

async function main() {
const previous = process.env.DECISION_SIM_WORKER_SECRET;
const previousAdmin = process.env.ADMIN_SECRET;
delete process.env.DECISION_SIM_WORKER_SECRET;
delete process.env.ADMIN_SECRET;
const denied = await kickDecisionSimulationWorker("job-test", "https://dec-sim.netlify.app");
assert(denied.kicked === false && denied.reason === "missing-worker-secret", "kick refuses to fire without a worker secret");
if (previous) process.env.DECISION_SIM_WORKER_SECRET = previous;
if (previousAdmin) process.env.ADMIN_SECRET = previousAdmin;

const work = readFileSync("src/app/api/admin/decision-simulator/jobs/[jobId]/work/route.ts", "utf8");
const jobs = readFileSync("src/app/api/admin/decision-simulator/jobs/route.ts", "utf8");
const claim = readFileSync("src/lib/agents/decision-simulation/jobs.ts", "utf8");
const client = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
const sweep = readFileSync("src/app/api/admin/decision-simulator/jobs/sweep/route.ts", "utf8");
assert(work.includes("after(") && jobs.includes("after("), "create and work chain the next chunk after the response");
assert(
  jobs.includes("const jobId = created.job.id") && !jobs.includes("kickDecisionSimulationWorker(created.job.id"),
  "create kick captures job id so Netlify typecheck accepts the after() callback",
);
assert(
  claim.includes("status IN ('PENDING', 'FAILED', 'RUNNING')") && claim.includes("claimed_at IS NULL"),
  "claim SQL reclaims running chunks with a null or stale claim",
);
assert(!/jobs\/\$\{job\.id\}\/work/.test(client), "the open tab is no longer the worker heartbeat");
assert(client.includes("keep moving after this tab closes"), "dashboard names closed-tab continuity");
assert(sweep.includes("isDecisionSimSite") && sweep.includes("isDecisionSimWorkerAuthorized"), "sweep stays on dec-sim and requires worker or admin");
assert(!work.includes("sendEmail") && !sweep.includes("publishPost"), "continuity has no send/post path");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-WORKER-CONTINUITY-1.0"), "Phase 12 continuity slice is named on the canonical roadmap");
assert(roadmap.includes("DEC-SIM-OBSERVED-OUTCOME-1.0") && roadmap.includes("DEC-SIM-ENSEMBLE-LANE-INTELLIGENCE-1.0") && roadmap.includes("DEC-SIM-STALE-RUNNING-RECLAIM-1.0"), "prior capability names stay on the canonical roadmap");
assert(roadmap.includes("V2-36"), "dedicated background workers stay V2");
assert(/Phase 12/i.test(roadmap) && /capability started/i.test(roadmap), "this slice does not close Phase 12");

console.log("OK — worker continuity gates passed");
}

void main();
