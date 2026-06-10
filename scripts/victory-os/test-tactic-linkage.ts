#!/usr/bin/env tsx
/** Verify tactic linkage. Run: npm run victory:tactics:verify */
import { composeTacticLinkageViewModel } from "../../src/lib/victory-os/tactic-linkage/load-tactic-linkage";

const vm = composeTacticLinkageViewModel();
if (!vm.registry.summary) {
  console.error("FAIL: missing summary");
  process.exit(1);
}
console.log(vm.intelligenceNarrative);
console.log(`\nOK: Tactic linkage · ${vm.registry.summary.totalCalendarItems} calendar rows · ${vm.registry.summary.linkedCount} linked`);
