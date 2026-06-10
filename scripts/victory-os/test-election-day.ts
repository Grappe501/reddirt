#!/usr/bin/env tsx
/** Verify Election Day ops center. Run: npm run victory:election-day:verify */
import { composeElectionDayViewModel } from "../../src/lib/victory-os/election-day/compose-election-day-view-model";

const vm = composeElectionDayViewModel();
if (vm.countyCards.length < 75) {
  console.error(`FAIL: expected 75 counties, got ${vm.countyCards.length}`);
  process.exit(1);
}
if (vm.sidePanels.length < 6) {
  console.error("FAIL: missing side panels");
  process.exit(1);
}
console.log(vm.intelligenceNarrative);
console.log(`\nOK: Election Day ops · ${vm.countyCards.length} counties · ${vm.criticalCounties.length} critical · ${vm.daysUntilElection}d out`);
