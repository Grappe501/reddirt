#!/usr/bin/env tsx
/** Verify Victory Map Sprint 0 completeness. Run: npm run victory:map:verify */
import { auditVictoryMapCompleteness, composeVictoryMapStatewideBrief } from "../../src/lib/victory-os/victory-map-intelligence";
import { loadVictoryMapCounties } from "../../src/lib/victory-os/load-victory-map";

const counties = loadVictoryMapCounties();
const audit = auditVictoryMapCompleteness();
const critical = audit.filter((a) => a.severity === "critical");

console.log(composeVictoryMapStatewideBrief());
console.log("\n--- Audit ---");
for (const f of audit.slice(0, 15)) {
  console.log(`[${f.severity}] ${f.code}: ${f.message}`);
}
if (audit.length > 15) console.log(`… and ${audit.length - 15} more findings`);

if (counties.length !== 75 || critical.length > 0) {
  console.error("\nFAIL: Victory map not Sprint-0 complete.");
  process.exit(1);
}
console.log("\nOK: 75 counties loaded.");
