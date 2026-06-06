#!/usr/bin/env node
/**
 * Intelligence upgrade phase sandbox — run at end of every phase before GitHub push.
 * Order: strategy manual → intelligence tests → lint → typecheck → production build.
 */
import { spawnSync } from "node:child_process";

const steps = [
  { label: "strategy-manual:verify", cmd: "npm", args: ["run", "strategy-manual:verify"] },
  { label: "test-pakko-command-center", cmd: "npx", args: ["tsx", "scripts/test-pakko-command-center.ts"] },
  { label: "test-dossier-briefing-book", cmd: "npx", args: ["tsx", "scripts/test-dossier-briefing-book.ts"] },
  { label: "test-phase2-diligence-field-book", cmd: "npx", args: ["tsx", "scripts/test-phase2-diligence-field-book.ts"] },
  { label: "test-phase3-debate-spine-depth", cmd: "npx", args: ["tsx", "scripts/test-phase3-debate-spine-depth.ts"] },
  { label: "test-phase4-canon-loop", cmd: "npx", args: ["tsx", "scripts/test-phase4-canon-loop.ts"] },
  { label: "test-phase5-glossary-connectivity", cmd: "npx", args: ["tsx", "scripts/test-phase5-glossary-connectivity.ts"] },
  { label: "test-phase6-debate-ready-governance", cmd: "npx", args: ["tsx", "scripts/test-phase6-debate-ready-governance.ts"] },
  { label: "test-intelligence-hardening", cmd: "npm", args: ["run", "agents:test-intelligence-hardening"] },
  { label: "lint:all", cmd: "npm", args: ["run", "lint:all"] },
  { label: "typecheck", cmd: "npm", args: ["run", "typecheck"] },
  { label: "build", cmd: "npm", args: ["run", "build"] },
];

console.log("=== Intelligence phase sandbox run ===\n");

for (const step of steps) {
  process.stdout.write(`→ ${step.label}...\n`);
  const result = spawnSync(step.cmd, step.args, { stdio: "inherit", shell: true, env: process.env });
  if (result.status !== 0) {
    console.error(`\n✗ FAILED at step: ${step.label}`);
    process.exit(result.status ?? 1);
  }
  console.log(`✓ ${step.label}\n`);
}

console.log("=== All sandbox checks passed — safe to commit and push main for Netlify ===");
