#!/usr/bin/env tsx
/** Verify Victory Board view model. Run: npm run victory:board:verify */
import { composeVictoryBoardViewModel } from "../../src/lib/victory-os/victory-board/compose-victory-board-view-model";
import { victoryBoardExecutiveSummary } from "../../src/lib/victory-os/victory-board-intelligence";

const vm = composeVictoryBoardViewModel();

if (vm.pins.length < 75) {
  console.error(`FAIL: expected 75 county pins, got ${vm.pins.length}`);
  process.exit(1);
}

if (vm.topDecisions.length !== 10) {
  console.error(`FAIL: expected 10 decisions, got ${vm.topDecisions.length}`);
  process.exit(1);
}

if (vm.charts.length < 4) {
  console.error(`FAIL: expected chart series, got ${vm.charts.length}`);
  process.exit(1);
}

if (!vm.intelligenceNarrative.includes("Victory Board")) {
  console.error("FAIL: intelligence narrative missing");
  process.exit(1);
}

console.log(victoryBoardExecutiveSummary());
console.log(`\nOK: Victory Board ready · ${vm.pins.length} pins · ${vm.regionRollups.length} regions · ${vm.statewide.approvalPct}% CM approval`);
