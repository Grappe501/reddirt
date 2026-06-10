#!/usr/bin/env tsx
/** Verify Monday Brief view model. Run: npm run victory:brief:verify */
import { composeMondayBriefViewModel } from "../../src/lib/victory-os/mission-brief/compose-monday-brief-view-model";
import { mondayBriefExecutiveSummary } from "../../src/lib/victory-os/mission-brief-intelligence";

const vm = composeMondayBriefViewModel();

if (vm.brief.topDecisions.length !== 10) {
  console.error(`FAIL: expected 10 decisions, got ${vm.brief.topDecisions.length}`);
  process.exit(1);
}

if (!vm.readiness || vm.electionCountdown.daysRemaining < 0) {
  console.error("FAIL: readiness or countdown missing");
  process.exit(1);
}

console.log(mondayBriefExecutiveSummary());
console.log(`\nOK: Monday Brief ready · ${vm.readiness.approvalPct}% approved · ${vm.readiness.pending} pending`);
