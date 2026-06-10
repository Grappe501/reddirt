#!/usr/bin/env tsx
/** Compose and persist Victory Board snapshot. Run: npm run victory:board:compose */
import { weekKeyFromDate } from "../../src/lib/calendar/weekly-time";
import { loadOrGenerateWeeklyDecisionBrief } from "../../src/lib/victory-os/decision-engine/load-decision-brief";
import { composeVictoryBoardViewModel } from "../../src/lib/victory-os/victory-board/compose-victory-board-view-model";
import { persistVictoryBoardSnapshot } from "../../src/lib/victory-os/victory-board/load-victory-board-snapshot";

function parseWeek(): string | undefined {
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--week=")) return a.slice("--week=".length);
  }
  return undefined;
}

function main() {
  const weekKey = parseWeek() ?? weekKeyFromDate(new Date());
  const vm = composeVictoryBoardViewModel(weekKey);
  const brief = loadOrGenerateWeeklyDecisionBrief(weekKey);
  const snapshot = persistVictoryBoardSnapshot(vm, brief.briefId);

  console.log(`Victory Board snapshot saved — week ${weekKey}`);
  console.log(`Pins: ${vm.pins.length} · Charts: ${vm.charts.length} · Regions: ${vm.regionRollups.length}`);
  console.log(`Path: data/victory-board/board-v1.json · ${snapshot.generatedAt}`);
}

main();
