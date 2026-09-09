import { readFileSync } from "node:fs";
import { analyzeFeatures, hashFingerprint } from "../src/lib/agents/decision-simulation/writing-intelligence/analyze";
import {
  assertUniqueSourceUrls,
  authorshipRule,
  buildActorWritingIntelligence,
  customActorHasSources,
  loadWritingCorpus,
} from "../src/lib/agents/decision-simulation/writing-intelligence/catalog";
import { buildWritingIntelligencePromptPacket, writingPacketHasSourceRefs } from "../src/lib/agents/decision-simulation/writing-intelligence/prompt-packet";
import { assertScoreRange, scoreVoiceSimilarity } from "../src/lib/agents/decision-simulation/writing-intelligence/similarity";
import { emptyRhetoric } from "../src/lib/agents/decision-simulation/writing-intelligence/analyze";
import { buildActorContextForPrompt } from "../src/lib/agents/decision-simulation/actor-context";
import { chrisJonesPersonality, frenchHillPersonality, genericPersonality } from "../src/lib/agents/decision-simulation/personality-catalog";

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

console.log("Decision Simulator writing intelligence gates");

const corpus = loadWritingCorpus();
const jones = corpus.filter((item) => item.source.actorId === "chris-jones-ar02");
const hill = corpus.filter((item) => item.source.actorId === "french-hill-ar02");
assert(jones.length >= 20, "Jones corpus meets 20-document floor");
assert(hill.length >= 30, "Hill corpus meets 30-document floor");
assert(assertUniqueSourceUrls(corpus).length === 0, "source URLs are unique and first-party");
assert(
  corpus.every((item) => item.source.provenance === "FIRST_PARTY" && item.source.excerpt.length <= 280),
  "provenance and excerpt limits hold",
);
assert(
  corpus.every((item) => item.source.actorId === "chris-jones-ar02" || item.source.actorId === "french-hill-ar02"),
  "every source is associated to Jones or Hill",
);
assert(authorshipRule("SUBSTACK", true) === "DIRECT_AUTHOR", "bylined Substack is direct-author");
assert(authorshipRule("OFFICIAL_NEWSLETTER", false) === "OFFICIAL_OFFICE", "Hill newsletter is official-office voice");
assert(authorshipRule("CAMPAIGN_ARTICLE", false) === "ATTRIBUTED", "campaign article is attributed");
assert(authorshipRule("OTHER", false) === "UNCERTAIN", "unknown source stays uncertain");

const jonesIntel = buildActorWritingIntelligence("chris-jones-ar02");
const hillIntel = buildActorWritingIntelligence("french-hill-ar02");
assert(jonesIntel.fingerprint.syntax.avgSentenceLength > 0, "Jones fingerprint is generated from corpus");
assert(hillIntel.fingerprint.syntax.avgSentenceLength > 0, "Hill fingerprint is generated from corpus");
assert(jonesIntel.temporal.length === 4 && hillIntel.temporal.length === 4, "temporal windows ALL_TIME / 24m / 12m / 90d exist");
assert(
  jonesIntel.decisionTendencies.every((item) => item.sourceState && item.evidenceSourceIds.length > 0),
  "Jones traits are evidence-backed",
);
assert(
  hillIntel.decisionTendencies.every((item) => item.sourceState && item.evidenceSourceIds.length > 0),
  "Hill traits are evidence-backed",
);
assert(
  !jonesIntel.decisionTendencies.some((item) => /narciss|psychopath|psychiatric|personality disorder/i.test(item.value)),
  "no unsupported psychographic promotion",
);
assert(jonesIntel.issueVoices.length >= 3 && hillIntel.issueVoices.length >= 3, "issue-specific voices exist");

const packet = buildWritingIntelligencePromptPacket("chris-jones-ar02");
assert(Boolean(packet && packet.lines.length < 12 && packet.sourceRefs.length > 0), "compact prompt packet exists");
assert(writingPacketHasSourceRefs("french-hill-ar02"), "Hill packet keeps source references");
assert(!buildWritingIntelligencePromptPacket("custom-1"), "custom actor without corpus has no packet");

const jonesContext = buildActorContextForPrompt({ ...chrisJonesPersonality.model, actorId: "chris-jones-ar02" });
assert(jonesContext.includes("WRITING INTELLIGENCE PACKET") && jonesContext.includes("Evidence refs"), "Jones simulation context includes writing packet");
const genericContext = buildActorContextForPrompt(genericPersonality.model);
assert(!genericContext.includes("WRITING INTELLIGENCE PACKET"), "generic model stays hypothesis without sources");

const score = scoreVoiceSimilarity({
  lexicalOverlap: 0.4,
  avgSentenceLengthA: 14,
  avgSentenceLengthB: 16,
  shortPunchA: 0.4,
  shortPunchB: 0.35,
  structureA: 0.6,
  structureB: 0.55,
  rhetoricA: emptyRhetoric(),
  rhetoricB: emptyRhetoric(),
  issueOverlap: 0.5,
  channelMatch: 1,
});
assert(assertScoreRange(score).length === 0, "voice scores stay in 0-1");
assert(!customActorHasSources(0), "custom actor remains hypothesis until sources added");
assert(frenchHillPersonality.model.communicationStyle.some((item) => /Friends/.test(item)), "Hill catalog reflects office newsletter register");

const features = analyzeFeatures("Friends, housing costs are rising. I am proud to pass the bill. Contact my office.");
assert(features.sentenceCount >= 2 && hashFingerprint(["a"]) !== hashFingerprint(["b"]), "fingerprint helper is deterministic and unique");

const jonesReport = readFileSync("develop_notes/decision-simulation/DEC_SIM_CHRIS_JONES_WRITING_INTELLIGENCE_1_0.md", "utf8");
const hillReport = readFileSync("develop_notes/decision-simulation/DEC_SIM_FRENCH_HILL_WRITING_INTELLIGENCE_1_0.md", "utf8");
const v2 = readFileSync("develop_notes/decision-simulation/DEC_SIM_V2_DECISION_INTELLIGENCE_OS_MASTER_PLAN.md", "utf8");
assert(/corpus/i.test(jonesReport) && !/Jamie Dimon called the economy resilient\. JPMorgan reported record earnings\. Wall Street is thriving\. Meanwhile/.test(jonesReport), "Jones report exists without bulk reprint");
assert(hillReport.includes("eNewsletter") && hillReport.includes("OFFICIAL_OFFICE"), "Hill report names official-office voice");
assert(v2.includes("Personal Voice Engine") && v2.includes("20.") && v2.includes("Do NOT implement all of V2 now"), "V2 master plan is a holding architecture");

console.log("OK — writing intelligence gates passed");
