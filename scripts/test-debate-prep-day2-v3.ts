/**
 * Day 2 debate-prep v3.0 — Norris coalition county map + location brief integration.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { DEBATE_PREP_DAY2_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day2-release";
import {
  buildNorrisCoalitionDrillLinks,
  getNorrisCoalitionStatewideOneLiner,
} from "../src/lib/election-plan/debate-prep-norris-coalition-drilldown";
import { getGopSos2026CountyBySlug } from "../src/lib/election-plan/load-gop-sos-2026-results";

assert.equal(DEBATE_PREP_DAY2_RELEASE_VERSION, "day-2-read-the-table-v3.0.0");

const dataPath = path.join(process.cwd(), "data/election/2026-gop-sos-primary-runoff-by-county.normalized.json");
assert.ok(fs.existsSync(dataPath), "2026 GOP SOS county data must be committed");

const boone = getGopSos2026CountyBySlug("boone-county");
assert.ok(boone, "Boone County row");
assert.ok(boone!.runoff.totalVotes > 0);
assert.ok(boone!.analysis.headline.length > 20);

const links = buildNorrisCoalitionDrillLinks(6);
assert.ok(links.length >= 5, "high-opportunity drill links");
assert.ok(links.every((l) => l.href.includes("/election-plan/counties/")));

const statewide = getNorrisCoalitionStatewideOneLiner();
assert.ok(statewide.includes("Norris"), statewide);

const root = path.join(process.cwd(), "src");
assert.ok(fs.existsSync(path.join(root, "components/election-plan/LocationGopPrimaryRunoffPanel.tsx")));
assert.ok(fs.existsSync(path.join(root, "components/election-plan/ElectionPlanNorrisCoalitionDrillPanel.tsx")));

const overview = fs.readFileSync(path.join(root, "components/election-plan/ElectionPlanDayDrillDownOverview.tsx"), "utf8");
assert.ok(overview.includes("ElectionPlanNorrisCoalitionDrillPanel"));

const cityPanel = fs.readFileSync(path.join(root, "components/election-plan/CityLocationBriefPanel.tsx"), "utf8");
assert.ok(cityPanel.includes("LocationGopPrimaryRunoffPanel"));

console.log(`test-debate-prep-day2-v3: OK (${links.length} Norris drill links · Day 2 v3.0.0)`);
