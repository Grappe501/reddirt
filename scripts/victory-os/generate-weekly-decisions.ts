#!/usr/bin/env tsx
/**
 * Generate and persist weekly Top 10 decision brief.
 * Run: npm run victory:decisions [-- --week=2026-06-09] [-- --dry]
 */
import { weekKeyFromDate } from "../../src/lib/calendar/weekly-time";
import { generateWeeklyDecisionBrief } from "../../src/lib/victory-os/decision-engine/generate-weekly-decisions";
import {
  loadWeeklyDecisionBriefSnapshot,
  mergeDecisionStatuses,
  persistWeeklyDecisionBrief,
} from "../../src/lib/victory-os/decision-engine/load-decision-brief";

function parseArgs() {
  const args = process.argv.slice(2);
  let weekKey: string | undefined;
  let dry = false;
  for (const a of args) {
    if (a === "--dry") dry = true;
    else if (a.startsWith("--week=")) weekKey = a.slice("--week=".length);
  }
  return { weekKey: weekKey ?? weekKeyFromDate(new Date()), dry };
}

function main() {
  const { weekKey, dry } = parseArgs();
  const existing = loadWeeklyDecisionBriefSnapshot(weekKey);
  const merged = mergeDecisionStatuses(generateWeeklyDecisionBrief({ weekKey }), existing);

  console.log(`Victory OS Decision Engine — week ${weekKey}`);
  console.log(`Season: ${merged.seasonLabel}`);
  console.log(`Statewide: ${merged.statewideVictory.summary}`);
  console.log(`\nTop ${merged.topDecisions.length} decisions:\n`);

  for (const d of merged.topDecisions) {
    console.log(
      `#${d.rank} ${d.displayName} [${d.opsStatus}] · ${d.recommendation}\n   Resource: ${d.resourceType} · Kelly tier ${d.kellyTier} · Priority ${d.deploymentPriority}\n   Outcome: ${d.expectedOutcome}\n   Reason: ${d.reason}\n`,
    );
  }

  console.log(`Kelly deployment slots: ${merged.kellyDeployment.length}`);
  console.log(`Volunteer actions: ${merged.volunteerDeployment.length}`);
  console.log(`Fundraising unlocks: ${merged.fundraisingDeployment.length}`);
  console.log(`Counties at risk: ${merged.countiesAtRisk.length}`);

  if (dry) {
    console.log("\n(dry run — not persisted)");
    return;
  }

  const path = persistWeeklyDecisionBrief(merged);
  console.log(`\nWrote ${path}`);
}

main();
