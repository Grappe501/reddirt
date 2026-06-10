#!/usr/bin/env tsx
/** Full Monday pipeline: decisions + mission sync. Run: npm run victory:monday */
import { weekKeyFromDate } from "../../src/lib/calendar/weekly-time";
import {
  listWeeklyDecisionBriefWeekKeys,
  loadWeeklyDecisionBriefSnapshot,
  mergeDecisionStatuses,
  persistWeeklyDecisionBrief,
} from "../../src/lib/victory-os/decision-engine/load-decision-brief";
import { generateWeeklyDecisionBrief } from "../../src/lib/victory-os/decision-engine/generate-weekly-decisions";
import { syncCountyMissionsFromBrief } from "../../src/lib/victory-os/mission-framework/sync-missions-from-brief";
import { composeMondayBriefViewModel } from "../../src/lib/victory-os/mission-brief/compose-monday-brief-view-model";

function parseWeek(): string {
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--week=")) return a.slice("--week=".length);
  }
  return listWeeklyDecisionBriefWeekKeys()[0] ?? weekKeyFromDate(new Date());
}

function main() {
  const weekKey = parseWeek();
  const existing = loadWeeklyDecisionBriefSnapshot(weekKey);
  const merged = mergeDecisionStatuses(generateWeeklyDecisionBrief({ weekKey }), existing);
  persistWeeklyDecisionBrief(merged);
  const sync = syncCountyMissionsFromBrief({ weekKey });
  const vm = composeMondayBriefViewModel(weekKey);

  console.log(`Monday pipeline complete — week ${weekKey}`);
  console.log(`Decisions: ${vm.brief.topDecisions.length} · Missions linked: ${sync.decisionsLinked}`);
  console.log(`#1: ${vm.brief.topDecisions[0]?.displayName} — ${vm.brief.topDecisions[0]?.recommendation}`);
  console.log(`CM approval: ${vm.readiness.approvalPct}% · ${vm.electionCountdown.label}`);
}

main();
