#!/usr/bin/env node
/**
 * Filesystem audit: Kelly ops drill-down pages must exist under App Router.
 * Run: node scripts/audit-operator-drilldowns.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "src", "app");

/** App-router paths relative to src/app that must have page.tsx (or page.ts). */
const REQUIRED_DRILLDOWNS = [
  "election-plan/(portal)/operators/page.tsx",
  "election-plan/(portal)/operators/my-work/page.tsx",
  "election-plan/(portal)/operators/volunteer-intake/page.tsx",
  "election-plan/(portal)/operators/projects/page.tsx",
  "election-plan/(portal)/operators/projects/[slug]/page.tsx",
  "election-plan/(portal)/operators/leaders/command/page.tsx",
  "election-plan/(portal)/operators/leaders/me/page.tsx",
  "election-plan/(portal)/operators/leaders/[slug]/page.tsx",
  "election-plan/(portal)/operators/leaders/[slug]/lane/[laneId]/page.tsx",
  "election-plan/(portal)/operators/leaders/me/lane/[laneId]/page.tsx",
  "election-plan/(portal)/operators/leader-dashboard/page.tsx",
  "election-plan/(portal)/operators/comms-command/page.tsx",
  "election-plan/(portal)/operators/voter-registration/page.tsx",
  "election-plan/(portal)/operators/events-command/page.tsx",
  "election-plan/(portal)/operators/coalition-command/page.tsx",
  "election-plan/(portal)/operators/lane-coverage/page.tsx",
  "election-plan/(portal)/operators/grassroots-fundraising-settlement/page.tsx",
  "election-plan/(portal)/operators/field/page.tsx",
  "admin/(board)/campaign-manager-dashboard/page.tsx",
  "admin/(board)/my-work/page.tsx",
  "admin/(board)/projects/page.tsx",
  "admin/(board)/projects/[slug]/page.tsx",
  "admin/(board)/campaign-events/calendar-promotion/page.tsx",
  "admin/(board)/campaign-events/workbench/page.tsx",
  "admin/(board)/campaign-events/[recordId]/page.tsx",
];

function exists(rel) {
  return fs.existsSync(path.join(APP, rel));
}

const missing = [];
for (const rel of REQUIRED_DRILLDOWNS) {
  if (!exists(rel)) missing.push(rel);
}

console.log("\n=== Operator drill-down page audit ===");
console.log(`Checked: ${REQUIRED_DRILLDOWNS.length}`);
console.log(`OK: ${REQUIRED_DRILLDOWNS.length - missing.length} | MISSING: ${missing.length}\n`);

if (missing.length) {
  console.log("--- MISSING page.tsx ---");
  for (const rel of missing) console.log(`  ${rel}`);
  process.exit(1);
}

console.log("All Kelly ops drill-down routes present.");
