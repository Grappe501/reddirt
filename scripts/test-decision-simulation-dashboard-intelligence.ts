import { readFileSync } from "node:fs";
import {
  buildDashboardIntelligencePayload,
  buildDashboardScorecard,
  duplicateScenario,
  normalizeDashboardMember,
  primarySequence,
  recommendOpeningRevision,
  upsertOutcome,
  upsertScenario,
} from "../src/lib/agents/decision-simulation/dashboard-intelligence";
import type { CommandCenterMember } from "../src/lib/agents/decision-simulation/job-lifecycle";

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

function member(partial: Partial<CommandCenterMember> & { ordinal: number }): CommandCenterMember {
  return {
    futureId: partial.futureId,
    frame: partial.frame,
    final: partial.final,
    confidence: partial.confidence ?? 0.6,
    executiveSummary: partial.executiveSummary,
    error: partial.error,
    moves: partial.moves,
    ordinal: partial.ordinal,
  };
}

console.log("Decision Simulator dashboard intelligence");

const members: CommandCenterMember[] = [
  member({
    ordinal: 1,
    futureId: "EXPECTED",
    frame: "PROCEDURAL",
    final: "Hold the documented line.",
    moves: [
      { moveNumber: 1, side: "COUNTERPARTY", message: "We will review.", predictedFrame: "PROCEDURAL" },
      { moveNumber: 2, side: "OPERATOR", message: "Ask for the vote record." },
      { moveNumber: 6, side: "OPERATOR", message: "Hold the documented line." },
    ],
  }),
  member({
    ordinal: 2,
    futureId: "HOSTILE",
    frame: "ATTACK",
    final: "Do not take the bait.",
    moves: [{ moveNumber: 1, side: "COUNTERPARTY", message: "This is a smear.", predictedFrame: "ATTACK" }],
  }),
  member({
    ordinal: 3,
    futureId: "OPPORTUNITY",
    frame: "PROCEDURAL",
    final: "Offer a public meeting.",
  }),
];

const scorecard = buildDashboardScorecard({
  members,
  modelConfidence: 0.55,
  outlierRate: 0.33,
  robustnessScore: 0.4,
  dominantFrame: "PROCEDURAL",
  strongestCounter: "Hold the documented line.",
});
assert(scorecard.version === "dashboard-intelligence-1.0", "scorecard version is locked");
assert(scorecard.scores.every((score) => score.methodology.length > 20), "every score carries methodology");
assert(scorecard.scores.find((score) => score.id === "CONFIDENCE")?.value === 0.55, "confidence is the supplied mean");
assert((scorecard.scores.find((score) => score.id === "RISK")?.value ?? 0) > 0, "risk rises with outliers and hostility");
assert(scorecard.scores.find((score) => score.id === "OPPORTUNITY")?.value === 1 / 3, "opportunity is the OPPORTUNITY-lane share");
assert(scorecard.uncertainty.some((item) => item.includes("this job only")), "scorecard does not claim out-of-job truth");

const sequence = primarySequence(members, "Housing costs are rising in Central Arkansas.");
assert(sequence[0]?.moveNumber === 0 && sequence[0].side === "OPERATOR", "sequence starts with the opening as move 0");
assert(sequence.some((move) => move.moveNumber === 1 && move.predictedFrame === "PROCEDURAL"), "EXPECTED first response is the primary lane");

const inline = normalizeDashboardMember({
  ordinal: 1,
  result: {
    executiveSummary: "Inline ensemble member.",
    run: { moves: [{ moveNumber: 1, side: "COUNTERPARTY", message: "Noted.", predictedFrame: "PROCEDURAL" }] },
  },
});
assert(inline.moves?.[0]?.predictedFrame === "PROCEDURAL", "inline ensemble members flatten result.run.moves");
assert(!("result" in inline), "normalized members drop the nested result payload");

const revision = recommendOpeningRevision({
  opening: "Please reply on housing.",
  expectedFrame: "PROCEDURAL",
  hostileFrame: "ATTACK",
  robustnessScore: 0.2,
});
assert(revision.sourceState === "HYPOTHESIS", "recommended revision is labeled HYPOTHESIS");
assert(revision.text.includes("ATTACK") && revision.text.includes("not sent"), "hostile-frame draft stays a non-send hypothesis");
assert(!revision.text.toLowerCase().includes("we scraped"), "revision does not invent a vote or scrape claim");

const payload = buildDashboardIntelligencePayload({
  members,
  opening: "Please reply on housing.",
  modelConfidence: 0.55,
  outlierRate: 0.33,
  robustnessScore: 0.4,
  dominantFrame: "PROCEDURAL",
  strongestCounter: "Hold the documented line.",
  expectedFrame: "PROCEDURAL",
  hostileFrame: "ATTACK",
});
assert(payload.branches.length === 6, "branch explorer has all six named futures");
assert(payload.branches.find((lane) => lane.futureId === "SILENCE")?.moves.length === 0, "missing futures stay empty instead of invented");
assert(payload.revision.sourceState === "HYPOTHESIS", "payload revision is not a send instruction");

const saved = upsertScenario([], {
  id: "scenario-1",
  title: "Housing A",
  savedAt: "2026-09-09T00:00:00.000Z",
  opening: "Please reply on housing.",
  channel: "EMAIL",
  objective: "Get a public answer",
  context: "Public facts only",
  operatorId: "chris-jones-ar02",
  counterpartyId: "french-hill-ar02",
  jobId: "job-1",
  robustnessScore: 0.4,
});
const copy = duplicateScenario(saved[0], "2026-09-09T01:00:00.000Z");
assert(copy.id !== saved[0].id && copy.jobId === undefined, "duplicate clears the prior job instead of mutating it");
assert(copy.title.includes("copy"), "duplicate is named as a copy");

const outcomes = upsertOutcome([], {
  jobId: "job-1",
  recordedAt: "2026-09-09T02:00:00.000Z",
  actualResponse: "A public office reply about process.",
  closestFuture: "EXPECTED",
  notes: "Attach only.",
  predictedFrame: "PROCEDURAL",
});
assert(outcomes[0].jobId === "job-1", "outcome attaches to the job");
assert(!JSON.stringify(outcomes).includes("actorModel"), "outcome attach does not carry or mutate an actor model");

const ui = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
const intel = readFileSync("src/components/admin/decision-simulator/DecisionIntelligence.tsx", "utf8");
assert(intel.includes("Six-move sequence") && intel.includes("Branch explorer"), "dashboard renders sequence and branches");
assert(intel.includes("Apply draft to opening") && intel.includes("Attach outcome"), "save/rerun and outcome capture are operator actions");
assert(intel.includes("does not update actor models"), "outcome capture forbids silent model writeback");
assert(!/mailto:|twitter\.com\/intent|send this/i.test(intel), "dashboard intelligence has no send/post action");
assert(ui.includes("DecisionIntelligence"), "mission lab mounts the intelligence panel");

const jobs = readFileSync("src/lib/agents/decision-simulation/jobs.ts", "utf8");
assert(jobs.includes("buildDashboardIntelligencePayload"), "job view exposes the dashboard payload");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-DASHBOARD-INTELLIGENCE-1.0"), "Phase 7 slice is named on the canonical roadmap");
assert(roadmap.includes("V2-29"), "deeper compare-lab ranking is filed as V2, not implemented");

console.log("OK — dashboard intelligence gates passed");
