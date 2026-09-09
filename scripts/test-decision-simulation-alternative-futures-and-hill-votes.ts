import { readFileSync } from "node:fs";
import path from "node:path";
import { assignAlternativeFuture } from "../src/lib/agents/decision-simulation/alternative-futures/assign";
import { ALTERNATIVE_FUTURE_IDS } from "../src/lib/agents/decision-simulation/alternative-futures/contracts";
import { formatAlternativeFuturePrompt } from "../src/lib/agents/decision-simulation/alternative-futures/prompt";
import { scoreRobustnessAcrossFutures } from "../src/lib/agents/decision-simulation/alternative-futures/robustness";
import { buildActorContextForPrompt } from "../src/lib/agents/decision-simulation/actor-context";
import { buildDecisionSimulationCommandCenter } from "../src/lib/agents/decision-simulation/job-lifecycle";
import { frenchHillPersonality } from "../src/lib/agents/decision-simulation/personality-catalog";
import {
  ADMINISTRATION_POSITION_RULE,
  PARTISAN_METHODOLOGY,
  VOTE_CORPUS_DIR_CANDIDATES,
} from "../src/lib/agents/decision-simulation/vote-intelligence/contracts";
import { classifyVote, normalizeVoteChoice } from "../src/lib/agents/decision-simulation/vote-intelligence/classify";
import { discoverHillVoteCorpus } from "../src/lib/agents/decision-simulation/vote-intelligence/discover";
import { getHillLegislativeDashboard } from "../src/lib/agents/decision-simulation/vote-intelligence/dashboard";
import { normalizeSourceVote, uniqueVoteErrors } from "../src/lib/agents/decision-simulation/vote-intelligence/load";
import { buildLegislativeBehaviorProfile, buildLegislativeRecordMeta } from "../src/lib/agents/decision-simulation/vote-intelligence/profile";
import { buildLegislativeOutlierViews } from "../src/lib/agents/decision-simulation/vote-intelligence/outliers";
import { prepareLegislativeEvidenceGraphEdges } from "../src/lib/agents/decision-simulation/vote-intelligence/graph-prep";
import { classifyIssueTags } from "../src/lib/agents/decision-simulation/vote-intelligence/taxonomy";
import { temporalSlices } from "../src/lib/agents/decision-simulation/vote-intelligence/temporal";

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

const fixtures = JSON.parse(
  readFileSync(
    path.join("src/lib/agents/decision-simulation/vote-intelligence/fixtures/methodology-votes.json"),
    "utf8",
  ),
) as Array<Record<string, unknown>>;
const votes = fixtures.map((row, index) => normalizeSourceVote(row, index));
const byId = Object.fromEntries(votes.map((vote) => [vote.voteId, vote]));

console.log("Decision Simulator Alternative Futures + Hill vote bridge");

const discovery = discoverHillVoteCorpus();
assert(VOTE_CORPUS_DIR_CANDIDATES.includes("french-hil-vote-tracker"), "misspelled Steve name is a search candidate");
assert(VOTE_CORPUS_DIR_CANDIDATES.includes("french-hill-vote-tracker"), "corrected spelling is a search candidate");
assert(discovery.searchedNames.includes("vote-tracker"), "generic vote-tracker name is searched");
assert(discovery.found === false, "local checkout has no vote-tracker directory to adapt");
assert(discovery.path === null, "adapter does not invent a corpus path");

assert(uniqueVoteErrors(votes).length === 0, "fixture vote IDs and roll calls are unique");
assert(uniqueVoteErrors([...votes, votes[0]]).some((error) => /duplicate voteId/.test(error)), "duplicate vote IDs are detected");

const withParty = byId["TEST-PARTY-WITH"];
const againstParty = byId["TEST-PARTY-AGAINST"];
const unknownParty = byId["TEST-UNKNOWN-PARTY"];
const adminMissing = byId["TEST-ADMIN-REQUIRED"];
const bipartisan = byId["TEST-BIPARTISAN"];
assert(withParty.classes.includes("VOTED_WITH_PARTY"), "party-alignment classification");
assert(againstParty.classes.includes("VOTED_AGAINST_PARTY"), "party-defection classification");
assert(!unknownParty.classes.includes("VOTED_WITH_PARTY") && !unknownParty.classes.includes("VOTED_AGAINST_PARTY"), "unknown party position stays unclassified");
assert(!adminMissing.classes.includes("VOTED_WITH_DOCUMENTED_ADMINISTRATION"), "administration alignment requires a documented position");
assert(adminMissing.classes.includes("HIGHLY_PARTISAN"), "highly partisan rule uses explicit 80/20 party-split threshold");
assert(bipartisan.classes.includes("BIPARTISAN_MAJORITY"), "bipartisan majority rule");
assert(unknownParty.classes.includes("PROCEDURAL"), "motion to table is procedural");
assert(withParty.classes.includes("FINAL_PASSAGE"), "on passage is final passage");
assert(normalizeVoteChoice("Aye") === "YEA" && normalizeVoteChoice("") === "UNKNOWN", "vote choice normalizer");

assert(classifyIssueTags("housing and infrastructure").includes("HOUSING"), "issue taxonomy maps housing");
assert(classifyIssueTags("housing and infrastructure").includes("INFRASTRUCTURE"), "issue taxonomy maps infrastructure");
assert(classifyIssueTags("unrelated ceremonial").includes("OTHER"), "unknown topics stay OTHER");

const record = buildLegislativeRecordMeta(votes, null, [...VOTE_CORPUS_DIR_CANDIDATES]);
const profile = buildLegislativeBehaviorProfile(votes, record);
assert(profile.partyAlignment.denominator === 5, "party alignment excludes unknown party position");
assert(profile.documentedAdminAlignment.denominator === 3, "admin alignment only counts documented positions");
assert(temporalSlices(votes).some((slice) => slice.window === "LAST_90_DAYS" && slice.voteCount >= 1), "temporal windows include 90 days");
assert(temporalSlices(votes).some((slice) => slice.window === "CURRENT_CONGRESS"), "temporal windows include current congress");

const outliers = buildLegislativeOutlierViews(votes, profile);
assert(outliers.every((view) => Array.isArray(view.voteIds)), "outlier views retain vote ids");
assert((outliers.find((view) => view.id === "AGAINST_REPUBLICAN_POSITION")?.voteIds.length ?? 0) >= 1, "party-defection outlier view keeps roll-call refs");

const edges = prepareLegislativeEvidenceGraphEdges(votes);
assert(edges.some((edge) => edge.fromType === "ACTOR" && edge.toType === "VOTE"), "V1 evidence-graph prep connects actor to vote");
assert(!/secret motive|always attacks|voters should/i.test(JSON.stringify(profile)), "no unsupported behavioral claim promotion");

const dashboard = getHillLegislativeDashboard("french-hill-ar02");
assert(dashboard?.voteCount === 0 && dashboard.provenanceQuality === "MISSING", "hosted dashboard snapshot stays honest about missing corpus");

const ids = [1, 2, 3, 4, 5, 6, 7].map((ordinal) => assignAlternativeFuture(ordinal).futureId);
assert(ids.slice(0, 6).join(",") === ALTERNATIVE_FUTURE_IDS.join(","), "futures rotate in canon order");
assert(ids[6] === "EXPECTED", "seventh run wraps to expected");
assert(formatAlternativeFuturePrompt(assignAlternativeFuture(6)).includes("Move 1 MUST be non-response"), "silence future requires non-response");

const robustness = scoreRobustnessAcrossFutures([
  { ordinal: 1, futureId: "EXPECTED", frame: "Process" },
  { ordinal: 2, futureId: "HOSTILE", frame: "Attack" },
  { ordinal: 3, futureId: "OPPORTUNITY", frame: "Process" },
]);
assert(robustness.futuresWithRuns === 3 && robustness.requiredFutures === 6, "robustness counts named futures, not raw runs");
assert(robustness.robustnessScore != null && robustness.robustnessScore < 1, "disagreement across futures lowers stability");
assert(/across named futures/i.test(robustness.methodology), "methodology rejects single-future likelihood");

const command = buildDecisionSimulationCommandCenter(
  6,
  ALTERNATIVE_FUTURE_IDS.map((futureId, index) => ({
    ordinal: index + 1,
    futureId,
    frame: futureId === "HOSTILE" ? "Attack" : "Process",
    final: "Hold",
    confidence: 0.5,
  })),
  [],
  [],
);
assert(command.representative.silence?.futureId === "SILENCE", "command center uses assigned silence future");
assert(command.representative.escalation?.futureId === "ESCALATION", "command center uses assigned escalation future");
assert((command.robustness?.futuresWithRuns ?? 0) === 6, "six assigned futures produce full coverage");

const hillContext = buildActorContextForPrompt(frenchHillPersonality.model, undefined, {
  future: assignAlternativeFuture(2),
  openingMessage: "Housing costs in central Arkansas are the issue.",
});
assert(hillContext.includes("LEGISLATIVE BEHAVIOR PACKET"), "Hill actor summary includes legislative packet");
assert(hillContext.includes("NOT LOCATED") || hillContext.includes("Votes analyzed=0"), "missing corpus stays unknown in the prompt");
assert(hillContext.includes("ALTERNATIVE FUTURE LANE: HOSTILE"), "hostile future is first-class in the prompt");
assert(!/Hill secretly|Hill always attacks|voters should hear/i.test(hillContext), "no unsupported persuasion or psych claim");
assert(PARTISAN_METHODOLOGY.includes("0.20") && ADMINISTRATION_POSITION_RULE.includes("explicit"), "methodology strings are documented");

const clientSource = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
const intelSource = readFileSync("src/components/admin/decision-simulator/PersonalityIntelligence.tsx", "utf8");
assert(clientSource.includes("Silence / non-response") && clientSource.includes("robustness"), "dashboard shows silence future and robustness");
assert(intelSource.includes("legislative record") && intelSource.includes("Documented administration"), "Hill panel has legislative record section");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(/V2-21/i.test(roadmap) && /Voting-pattern embeddings/i.test(roadmap), "V2 discoveries were filed on the canonical roadmap");

console.log("OK — Alternative Futures and Hill vote-evidence bridge gates passed");
