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
import { syncAndPersistTacticLinkage } from "../../src/lib/victory-os/tactic-linkage/load-tactic-linkage";
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
  let tacticsLinked = 0;
  try {
    const tacticReg = syncAndPersistTacticLinkage(weekKey);
    tacticsLinked = tacticReg.summary.linkedCount;
  } catch {
    /* optional */
  }
  const vm = composeMondayBriefViewModel(weekKey);

  console.log(`Monday pipeline complete — week ${weekKey}`);
  console.log(`Decisions: ${vm.brief.topDecisions.length} · Missions linked: ${sync.decisionsLinked} · Tactics linked: ${tacticsLinked}`);
  console.log(`#1: ${vm.brief.topDecisions[0]?.displayName} — ${vm.brief.topDecisions[0]?.recommendation}`);
  console.log(`CM approval: ${vm.readiness.approvalPct}% · ${vm.electionCountdown.label}`);
}

main();
