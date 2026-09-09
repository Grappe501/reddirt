import { readFileSync } from "node:fs";
import { ALTERNATIVE_FUTURE_IDS, type AlternativeFutureId } from "../src/lib/agents/decision-simulation/alternative-futures/contracts";
import { scoreRobustnessAcrossFutures } from "../src/lib/agents/decision-simulation/alternative-futures/robustness";
import { buildBranchExplorer } from "../src/lib/agents/decision-simulation/dashboard-intelligence/sequence";
import { buildDecisionSimulationCommandCenter } from "../src/lib/agents/decision-simulation/job-lifecycle";
import type { CommandCenterMember } from "../src/lib/agents/decision-simulation/job-lifecycle";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

function member(
  ordinal: number,
  futureId: AlternativeFutureId,
  frame: string,
): CommandCenterMember {
  return {
    ordinal,
    futureId,
    frame,
    final: "Hold the documented line.",
    confidence: 0.5,
    moves: [{ moveNumber: 1, side: "COUNTERPARTY", message: frame, predictedFrame: frame }],
  };
}

console.log("Decision Simulator ensemble lane intelligence");

const six = ALTERNATIVE_FUTURE_IDS.map((futureId, index) =>
  member(index + 1, futureId, futureId === "HOSTILE" ? "Attack" : "Process"),
);
const sixScore = scoreRobustnessAcrossFutures(six);
assert(sixScore.futuresWithRuns === 6 && sixScore.requiredFutures === 6, "six assigned futures still produce full coverage");
assert(
  sixScore.lanes.every((lane) => lane.runCount === 1 && lane.modalShare === 1 && lane.representativeIsModal),
  "a 6-run job is n=1 per lane — a single draw, not within-lane stability",
);
assert(sixScore.robustnessScore != null && sixScore.robustnessScore < 1, "disagreement across futures still lowers stability");
assert(/across named futures/i.test(sixScore.methodology), "methodology still rejects single-future likelihood");
assert(
  sixScore.uncertainty.some((item) => /n=1 per lane/i.test(item)),
  "uncertainty names the 6-run n=1 limit",
);

const deep: CommandCenterMember[] = [];
for (let wave = 0; wave < 3; wave += 1) {
  for (const [index, futureId] of ALTERNATIVE_FUTURE_IDS.entries()) {
    const ordinal = wave * 6 + index + 1;
    let frame = "Process";
    if (futureId === "EXPECTED" && wave === 0) frame = "Attack";
    if (futureId === "HOSTILE") frame = wave === 2 ? "Process" : "Attack";
    if (futureId === "SILENCE") frame = "Silence";
    deep.push(member(ordinal, futureId, frame));
  }
}

const deepScore = scoreRobustnessAcrossFutures(deep);
const expected = deepScore.lanes.find((lane) => lane.futureId === "EXPECTED");
const hostile = deepScore.lanes.find((lane) => lane.futureId === "HOSTILE");
assert(expected?.runCount === 3 && expected.modalFrame === "Process" && expected.modalShare === 2 / 3, "EXPECTED reports within-lane modal share");
assert(expected?.representativeOrdinal === 7 && expected.representativeIsModal, "EXPECTED representative is a modal Process run, not the first Attack draw");
assert(hostile?.runCount === 3 && hostile.modalFrame === "Attack" && hostile.modalShare === 2 / 3, "HOSTILE reports its own modal share");
assert(expected?.frames[0]?.frame === "Process" && expected.frames[1]?.frame === "Attack", "lane keeps the top competing frames");

const command = buildDecisionSimulationCommandCenter(18, deep, [], []);
assert(command.representative.expected?.ordinal === 7, "command center Expected card uses the modal-typical run");
assert(command.representative.expected?.frame === "Process", "command center Expected card is not the first Attack draw");
assert(command.representative.hostileOutlier?.frame === "Attack", "command center Hostile card stays on the modal Attack lane");
assert(command.uncertainty.some((item) => /n=1 per lane/i.test(item)), "command center uncertainty names the 6-run limit");

const branches = buildBranchExplorer(deep);
const expectedBranch = branches.find((lane) => lane.futureId === "EXPECTED");
assert(expectedBranch?.ordinal === 7 && expectedBranch.representativeIsModal, "branch explorer shows the typical EXPECTED sequence");
assert(expectedBranch?.runCount === 3 && expectedBranch.modalShare === 2 / 3, "branch explorer surfaces lane n and modal share");

const sixBranches = buildBranchExplorer(six);
assert(
  sixBranches.every((lane) => lane.runCount === 1 && lane.representativeIsModal),
  "branch explorer marks a 6-run job as a single draw per lane",
);

const ui = readFileSync("src/components/admin/decision-simulator/DecisionIntelligence.tsx", "utf8");
const client = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
assert(ui.includes("typical of this lane") && ui.includes("within-lane outlier"), "branch drawer names typical vs atypical samples");
assert(client.includes("displayed sample is atypical") && client.includes("modal"), "command center lists per-lane n and modal share");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-ENSEMBLE-LANE-INTELLIGENCE-1.0"), "Phase 5 ensemble-lane slice is named on the canonical roadmap");
assert(roadmap.includes("DEC-SIM-CAMPAIGN-PRIORITIES-1.0") && roadmap.includes("DEC-SIM-MEDIA-RESEARCH-1.0"), "later-phase capability names stay on the canonical roadmap");
assert(roadmap.includes("V2-34"), "full-tree clustering remains filed as V2");
assert(/Phase 5 remains open/i.test(roadmap), "this slice does not close Phase 5");

console.log("OK — ensemble lane intelligence gates passed");
