#!/usr/bin/env tsx
/** Verify daily brief. Run: npm run victory:daily:verify */
import { composeDailyBriefViewModel } from "../../src/lib/victory-os/daily-decisions/load-daily-brief";

const vm = composeDailyBriefViewModel();
if (vm.brief.kellyToday.length === 0) {
  console.error("FAIL: no Kelly deployments");
  process.exit(1);
}
console.log(vm.intelligenceNarrative);
console.log(`\nOK: Daily brief · ${vm.brief.kellyToday.length} Kelly slots · Season 5 active: ${vm.isSeason5}`);
