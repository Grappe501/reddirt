#!/usr/bin/env tsx
/**
 * Seed all 75 Arkansas counties into victory-map-v1.json from win-target heuristics + leadership overrides.
 * Run: npm run victory:map:seed
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

import { buildAllVictoryMapCountyProfiles, summarizeVictoryMapDimensions } from "../../src/lib/victory-os/classify-county-dimensions";
import { loadKellyWinTargetScenarioFile } from "../../src/lib/election-targets/load-win-target-scenario";
import type { VictoryMapFile } from "../../src/lib/victory-os/types";

const OUT = path.join(process.cwd(), "data/strategy-doctrine/victory-map-v1.json");

function main() {
  const win = loadKellyWinTargetScenarioFile();
  if (!win) {
    console.error("Missing data/election/kelly-win-target-scenario-v1.json — run npm run election:targets:build first.");
    process.exit(1);
  }

  const counties = buildAllVictoryMapCountyProfiles(win.counties);
  const dims = summarizeVictoryMapDimensions(counties);

  if (counties.length !== 75) {
    console.error(`Expected 75 counties, got ${counties.length}`);
    process.exit(1);
  }

  const file: VictoryMapFile = {
    version: 1,
    doctrinePath: "docs/campaign-events/VICTORY_OS_DOCTRINE.md",
    updatedAt: new Date().toISOString(),
    classificationStatus: "needs_review",
    meta: {
      note: "Sprint 0 seed — all 75 counties from win-target heuristics + leadership overrides. CM lock required before Decision Engine.",
      exemplarCountiesComplete: dims.leadershipOverrides,
      totalCountiesRequired: 75,
      winTargetSource: "data/election/kelly-win-target-scenario-v1.json",
      registrySource: "src/lib/county/arkansas-county-registry.ts",
      seedScript: "scripts/victory-os/seed-victory-map.ts",
    },
    statewide: {
      workingTargetWithCushion: win.statewide.workingTargetWithCushion,
      statewideVoteGap: win.statewide.statewideVoteGap,
      scenarioNote:
        "Planning scenario from kelly-win-target-scenario-v1.json — not a forecast. CM + data lead replace after file refresh.",
    },
    dimensionDefinitions: {
      electoralImportance: ["critical", "important", "helpful", "maintenance"],
      opportunityLevel: ["high", "medium", "low"],
      organizationalReadiness: ["strong", "moderate", "weak"],
    },
    counties: counties.map((c) => ({
      ...c,
      targetVotes: c.targetVotes ?? null,
      baselineDemVotes: c.baselineDemVotes ?? null,
      targetVoteGain: c.targetVoteGain ?? null,
      countyWinContribution: c.countyWinContribution ?? null,
    })),
  };

  writeFileSync(OUT, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(`Counties: ${counties.length}`);
  console.log(
    `Electoral — critical ${dims.electoral.critical}, important ${dims.electoral.important}, helpful ${dims.electoral.helpful}, maintenance ${dims.electoral.maintenance}`,
  );
  console.log(
    `Readiness — strong ${dims.readiness.strong}, moderate ${dims.readiness.moderate}, weak ${dims.readiness.weak}`,
  );
  console.log(`Leadership overrides: ${dims.leadershipOverrides}`);
}

main();
