#!/usr/bin/env tsx
/** Verify county mission registry. Run: npm run victory:missions:verify */
import { auditCountyMissionsRegistry } from "../../src/lib/victory-os/mission-framework-intelligence";
import { expectedCountyCount, loadCountyMissionsRegistry } from "../../src/lib/victory-os/mission-framework/load-county-missions";

const reg = loadCountyMissionsRegistry();
const audit = auditCountyMissionsRegistry();
const critical = audit.filter((a) => a.severity === "critical");

console.log(`Registry counties: ${reg?.countyCount ?? 0} / ${expectedCountyCount()}`);
console.log(`Synced week: ${reg?.syncedWeekKey ?? "none"}`);

const withWeekly = reg?.stacks.filter((s) => s.weekly).length ?? 0;
const withDaily = reg?.stacks.filter((s) => s.dailyTasks.length > 0).length ?? 0;
console.log(`Stacks with weekly mission: ${withWeekly}`);
console.log(`Stacks with daily tasks: ${withDaily}`);

for (const f of audit.slice(0, 10)) {
  console.log(`[${f.severity}] ${f.code}: ${f.message}`);
}

if (!reg || critical.length > 0) {
  console.error("\nFAIL");
  process.exit(1);
}
console.log("\nOK");
