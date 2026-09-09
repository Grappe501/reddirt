import { readFileSync } from "node:fs";
import { attachObservedOutcome } from "../src/lib/agents/decision-simulation/observed-outcome/attach";
import {
  ENSEMBLE_OUTCOME_PERSIST_VERSION,
  ENSEMBLE_OUTCOME_STORAGE,
  mergeObservedOutcomeIntoAggregate,
  readObservedOutcomeFromAggregate,
} from "../src/lib/agents/decision-simulation/observed-outcome/persist";
import { buildDecisionSimulationUserPrompt } from "../src/lib/agents/decision-simulation/prompt";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

console.log("Decision Simulator ensemble outcome persist");

const attached = attachObservedOutcome({
  jobId: "job-persist-1",
  recordedAt: "2026-09-09T17:00:00.000Z",
  actualResponse: "Our office will review the housing request through the regular process.",
  closestFuture: "EXPECTED",
  observedFrame: "Process",
  actorId: "french-hill-ar02",
  notes: "Public reply only.",
  branches: [
    { futureId: "EXPECTED", frame: "Process", firstMessage: "We will review the housing request through regular office process." },
  ],
});

const merged = mergeObservedOutcomeIntoAggregate({ keep: true }, attached);
const stored = readObservedOutcomeFromAggregate(merged);
assert(merged.keep === true, "existing aggregate keys stay in place");
assert(stored?.storage === ENSEMBLE_OUTCOME_STORAGE, "outcome is stored on the ensemble aggregate");
assert(stored?.persistVersion === ENSEMBLE_OUTCOME_PERSIST_VERSION, "persist version is tagged");
assert(stored?.comparison?.writeback === "FORBIDDEN", "persisted compare never authorizes writeback");
assert(stored?.modelChangeProposal?.applied === false, "persisted proposal stays unapplied");
assert(!JSON.stringify(stored).includes("actorModel"), "persisted outcome does not carry an actor model");

const jobs = readFileSync("src/lib/agents/decision-simulation/jobs.ts", "utf8");
assert(jobs.includes("mergeObservedOutcomeIntoAggregate"), "job view persist uses the ensemble merge");
assert(!jobs.includes("decision_simulation_outcome"), "legacy outcome table is not written");
assert(jobs.includes("persistObservedOutcomeOnJob"), "ensemble job can store the attached outcome");

const route = readFileSync("src/app/api/admin/decision-simulator/jobs/[jobId]/outcome/route.ts", "utf8");
assert(route.includes("assertAdminApi") && route.includes("rateLimit"), "outcome API is admin-protected and rate-limited");
assert(route.includes("persistObservedOutcomeOnJob"), "outcome API writes the ensemble job");
assert(!/sendEmail|publishPost|mailto:/.test(route), "outcome API has no send/post action");

const ui = readFileSync("src/components/admin/decision-simulator/DecisionIntelligence.tsx", "utf8");
assert(ui.includes("/api/admin/decision-simulator/jobs/${jobId}/outcome"), "dashboard posts the outcome to the ensemble job");
assert(ui.includes("saved on this ensemble job") || ui.includes("saved on the ensemble job"), "dashboard names ensemble persist");
assert(ui.includes("PENDING_OPERATOR_APPROVAL") && ui.includes("Writeback stays forbidden"), "dashboard still shows forbidden writeback");

const catalog = readFileSync("src/lib/agents/decision-simulation/personality-catalog.ts", "utf8");
assert(catalog.includes("jones-ar02-research-1.2") && catalog.includes("hill-ar02-research-1.2"), "personality versions stay unchanged");

const promptSource = readFileSync("src/lib/agents/decision-simulation/prompt.ts", "utf8");
assert(!promptSource.includes("observed-outcome") && !promptSource.includes("ensemble-outcome-persist"), "simulation prompt does not import persisted outcomes");
assert(
  !buildDecisionSimulationUserPrompt({ message: "Asking about housing.", channel: "EMAIL" }).includes("PENDING_OPERATOR_APPROVAL"),
  "a fresh prompt does not receive a persisted outcome",
);

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-ENSEMBLE-OUTCOME-PERSIST-1.0"), "ensemble persist slice is named on the canonical roadmap");
assert(roadmap.includes("DEC-SIM-OBSERVED-OUTCOME-1.0") && roadmap.includes("DEC-SIM-HOSTED-ENSEMBLE-PROOF-1.0"), "prior capability names stay on the canonical roadmap");
assert(roadmap.includes("V2-38"), "operator-approved personality versioning stays V2");
assert(/Phase 10/i.test(roadmap) && /capability started/i.test(roadmap), "this slice does not close Phase 10");
assert(/Phase 5 remains open/i.test(roadmap), "this slice does not close Phase 5");

console.log("OK — ensemble outcome persist gates passed");
