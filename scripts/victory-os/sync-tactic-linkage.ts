#!/usr/bin/env tsx
/** Sync tactic linkage from calendar + missions. Run: npm run victory:tactics:sync */
import { weekKeyFromDate } from "../../src/lib/calendar/weekly-time";
import { syncAndPersistTacticLinkage } from "../../src/lib/victory-os/tactic-linkage/load-tactic-linkage";

function parseWeek(): string | undefined {
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--week=")) return a.slice("--week=".length);
  }
  return undefined;
}

const weekKey = parseWeek() ?? weekKeyFromDate(new Date());
const registry = syncAndPersistTacticLinkage(weekKey);
console.log(`Tactic linkage synced — week ${weekKey}`);
console.log(`Linked: ${registry.summary.linkedCount} · Unlinked: ${registry.summary.unlinkedCount} · Total: ${registry.summary.totalCalendarItems}`);
