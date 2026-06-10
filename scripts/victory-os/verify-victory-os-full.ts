#!/usr/bin/env tsx
/** Full Victory OS verify suite. Run: npm run victory:os:verify */
import { execSync } from "node:child_process";

const scripts = [
  "victory:map:verify",
  "victory:decisions:verify",
  "victory:missions:verify",
  "victory:brief:verify",
  "victory:board:verify",
  "victory:tactics:verify",
  "victory:daily:verify",
  "victory:election-day:verify",
];

for (const s of scripts) {
  console.log(`\n--- ${s} ---`);
  execSync(`npm run ${s}`, { stdio: "inherit", cwd: process.cwd() });
}
console.log("\n=== Victory OS full verify: OK ===");
