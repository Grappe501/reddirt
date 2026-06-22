/**
 * Opposition research v2.0 — Kelly debate-night card, Pakko depth, export-ready lines.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { OPPOSITION_RESEARCH_RELEASE_VERSION } from "../src/lib/election-plan/opposition-research-release";
import { loadOppositionResearchCandidateBrief } from "../src/lib/election-plan/load-opposition-research-candidate-brief";
import { listOppositionResearchModules } from "../src/lib/election-plan/oppositionResearchModules";
import { loadDebateIntelligenceV4HubPacket } from "../src/lib/intelligence/v4/debateIntelligenceV4";

assert.equal(OPPOSITION_RESEARCH_RELEASE_VERSION, "opposition-research-v2.0.0");

const brief = loadOppositionResearchCandidateBrief();
assert.ok(brief.kellyOneLiner.length > 40);
assert.ok(brief.exportReadyLines.length >= 1, "need export-ready lines");
assert.ok(brief.topHammerRebuttals.length >= 2);
assert.ok(brief.pakkoRespectLines.length >= 4);
assert.ok(brief.readingPaths.some((p) => p.id === "debate-night"));

const v4 = loadDebateIntelligenceV4HubPacket();
const modules = listOppositionResearchModules(v4);
const ids = new Set(modules.map((m) => m.id));
for (const id of ["debate-night", "dossier-pakko", "pakko-quotes", "three-way-geometry", "export-ready-lines"]) {
  assert.ok(ids.has(id), `missing module ${id}`);
}

const root = path.join(process.cwd(), "src");
assert.ok(fs.existsSync(path.join(root, "components/election-plan/ElectionPlanOppositionDebateNightPanel.tsx")));
assert.ok(fs.existsSync(path.join(root, "components/election-plan/ElectionPlanPakkoOppositionPanel.tsx")));
assert.ok(fs.existsSync(path.join(root, "app/election-plan/(portal)/opposition-research/debate-night/page.tsx")));

const hub = fs.readFileSync(path.join(root, "components/election-plan/ElectionPlanOppositionResearchHubPanel.tsx"), "utf8");
assert.ok(hub.includes("Debate night card"));
assert.ok(hub.includes("Kelly reading paths"));

console.log(
  `test-opposition-research-v2: OK (${brief.stats.exportReadyClaimCount} export lines · ${brief.stats.pakkoQuoteCount} Pakko quotes · v2.0.0)`,
);
