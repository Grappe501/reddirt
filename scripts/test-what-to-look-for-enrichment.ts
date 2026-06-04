import assert from "node:assert/strict";
import {
  enrichOperatorGuide,
  getTrapLaneStaffFindings,
  getWhatToLookForEnrichment,
} from "../src/lib/intelligence/v4/debateWhatToLookForEnrichment";
import {
  getPrepSectionGuide,
  getSurfaceGuide,
  getWorkflowStepByHref,
} from "../src/lib/intelligence/v4/debateOperatorNarratives";
import { getTrapLaneDrillDown } from "../src/lib/intelligence/v4/trapLaneDrillDowns";

assert.ok(getWhatToLookForEnrichment("hub")?.offensive.length >= 3);

const hub = getSurfaceGuide("hub");
assert.ok(hub);
assert.ok(hub.whatToLookFor.some((l) => l.startsWith("[OFFENSE]")));
assert.ok(hub.whatToLookFor.some((l) => l.startsWith("[DEFENSE]")));

const integrityPrep = getPrepSectionGuide("integrity-2021");
assert.ok(integrityPrep?.whatToLookFor.some((l) => l.includes("727")));

const integritySurface = getSurfaceGuide("integrity2021");
assert.ok(integritySurface?.whatToLookFor.some((l) => l.includes("727") || l.includes("2021")));

const workflow = getWorkflowStepByHref("/admin/intelligence");
assert.ok(workflow?.guide.whatToLookFor.some((l) => l.startsWith("[OFFENSE]")));

const trapIndex = getSurfaceGuide("trap-lanes-index");
assert.ok(trapIndex?.whatToLookFor.length >= 4);

for (const laneId of [
  "2021-vs-2025-pivot",
  "integrity-without-participation",
  "county-champion",
  "fraud-data-dare",
  "experience-equals-sos-ready",
  "culture-war-escalation",
]) {
  const staff = getTrapLaneStaffFindings(laneId);
  assert.ok(staff?.offensive.length >= 1, laneId);
  const drill = getTrapLaneDrillDown(laneId);
  assert.ok(drill?.whatToLookForOffensive.length >= 1, laneId);
  assert.ok(drill.debateOffensiveUse.length > 10, laneId);
}

const raw = {
  whyItMatters: "x",
  howItFitsDebatePrep: "x",
  whatToLookFor: ["base"],
  howToSetUp: "x",
  howToUseInDebate: "base use",
  whenToUse: "x",
  campaignTrailUse: "x",
  tiesTogether: "x",
};
const enriched = enrichOperatorGuide(raw, "hub");
assert.ok(enriched.whatToLookFor.length > 1);
assert.ok(enriched.howToUseInDebate.includes("OFFENSIVE") || enriched.howToUseInDebate.length > raw.howToUseInDebate.length);

console.log("test-what-to-look-for-enrichment: OK");
