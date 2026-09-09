import { readFileSync } from "node:fs";
import { attachObservedOutcome, compareObservedOutcome } from "../src/lib/agents/decision-simulation/observed-outcome";
import { buildDecisionSimulationUserPrompt } from "../src/lib/agents/decision-simulation/prompt";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

console.log("Decision Simulator observed-outcome learning");

const branches = [
  { futureId: "EXPECTED", frame: "Process", firstMessage: "We will review the housing request through regular office process." },
  { futureId: "HOSTILE", frame: "Attack", firstMessage: "This is a partisan smear and we will not engage the premise." },
];

const match = compareObservedOutcome({
  actualResponse: "Our office will review the housing request through the regular process.",
  closestFuture: "EXPECTED",
  observedFrame: "Process",
  branches,
});
assert(match.frameMatch === true, "matching frames score as a hit");
assert((match.contentOverlap ?? 0) > 0.15, "overlapping public process language scores lexical overlap");
assert(match.suggestedFuture === "EXPECTED", "lexical guess agrees when the operator mapped EXPECTED");
assert(match.writeback === "FORBIDDEN", "comparison never authorizes writeback");

const miss = attachObservedOutcome({
  jobId: "job-public-1",
  recordedAt: "2026-09-09T16:00:00.000Z",
  actualResponse: "This is a partisan smear and we will not engage the premise of that attack.",
  closestFuture: "EXPECTED",
  observedFrame: "Attack",
  actorId: "french-hill-ar02",
  notes: "Public statement only.",
  branches,
});
assert(miss.comparison?.frameMatch === false, "frame miss is recorded");
assert(miss.comparison?.suggestedFuture === "HOSTILE", "lexical guess can disagree with the operator map");
assert(miss.modelChangeProposal?.applied === false, "proposal is stored and not applied");
assert(miss.modelChangeProposal?.status === "PENDING_OPERATOR_APPROVAL", "proposal stays pending operator approval");
assert(miss.actualResponse.length <= 280, "observed excerpt stays short");
assert(!JSON.stringify(miss).includes("actorModel"), "outcome record does not carry or mutate an actor model");

const catalog = readFileSync("src/lib/agents/decision-simulation/personality-catalog.ts", "utf8");
assert(catalog.includes("jones-ar02-research-1.2") && catalog.includes("hill-ar02-research-1.2"), "personality versions stay unchanged");

const promptSource = readFileSync("src/lib/agents/decision-simulation/prompt.ts", "utf8");
assert(!promptSource.includes("observed-outcome"), "simulation prompt does not import observed outcomes");
assert(
  !buildDecisionSimulationUserPrompt({ message: "Asking about housing.", channel: "EMAIL" }).includes("PENDING_OPERATOR_APPROVAL"),
  "a fresh prompt does not receive an unapproved outcome",
);

const ui = readFileSync("src/components/admin/decision-simulator/DecisionIntelligence.tsx", "utf8");
assert(ui.includes("PENDING_OPERATOR_APPROVAL") && ui.includes("Writeback stays forbidden"), "dashboard shows compare and forbidden writeback");
assert(!/mailto:|twitter\.com\/intent|send this/i.test(ui), "outcome learning has no send/post action");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-OBSERVED-OUTCOME-1.0"), "Phase 10 slice is named on the canonical roadmap");
assert(roadmap.includes("DEC-SIM-CAMPAIGN-PRIORITIES-1.0") && roadmap.includes("DEC-SIM-MEDIA-RESEARCH-1.0"), "later-phase capability names stay on the canonical roadmap");
assert(roadmap.includes("V2-35"), "calibration-grade outcome learning stays V2");
assert(/Phase 10/i.test(roadmap) && /capability started/i.test(roadmap), "this slice does not close Phase 10");

console.log("OK — observed-outcome gates passed");
