#!/usr/bin/env tsx
/** Sync county missions from decision brief. Run: npm run victory:missions:sync */
import { weekKeyFromDate } from "../../src/lib/calendar/weekly-time";
import { listWeeklyDecisionBriefWeekKeys } from "../../src/lib/victory-os/decision-engine/load-decision-brief";
import { syncCountyMissionsFromBrief } from "../../src/lib/victory-os/mission-framework/sync-missions-from-brief";

function parseWeek(): string {
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--week=")) return a.slice("--week=".length);
  }
  const snaps = listWeeklyDecisionBriefWeekKeys();
  return snaps[0] ?? weekKeyFromDate(new Date());
}

function main() {
  const weekKey = parseWeek();
  const result = syncCountyMissionsFromBrief({ weekKey });
  console.log(`Synced missions for week ${result.weekKey}`);
  console.log(`Stacks: ${result.stacksUpdated} · Weekly: ${result.weeklyMissionsCreated} · Daily tasks: ${result.dailyTasksCreated}`);
  console.log(`Decisions linked: ${result.decisionsLinked}`);
  console.log(`Registry: ${result.registryPath}`);
}

main();
