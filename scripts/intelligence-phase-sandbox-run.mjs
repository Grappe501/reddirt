#!/usr/bin/env node
/**
 * Intelligence upgrade phase sandbox — run at end of every phase before GitHub push.
 * Order: strategy manual → intelligence tests → lint → typecheck → production build.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ONLY_SHIM = path.join(__dirname, "tsx-server-only-shim.cjs");

function withTsxSandboxRequire(args) {
  if (args[0] !== "tsx") return args;
  if (args.includes("--require")) return args;
  return ["tsx", "--require", SERVER_ONLY_SHIM, ...args.slice(1)];
}

function runStep(step) {
  const args = step.cmd === "npx" && step.args[0] === "tsx" ? withTsxSandboxRequire(step.args) : step.args;
  return spawnSync(step.cmd, args, { stdio: "inherit", shell: true, env: process.env });
}

const steps = [
  { label: "strategy-manual:verify", cmd: "npm", args: ["run", "strategy-manual:verify"] },
  { label: "test-pakko-command-center", cmd: "npx", args: ["tsx", "scripts/test-pakko-command-center.ts"] },
  { label: "test-dossier-briefing-book", cmd: "npx", args: ["tsx", "scripts/test-dossier-briefing-book.ts"] },
  { label: "test-phase2-diligence-field-book", cmd: "npx", args: ["tsx", "scripts/test-phase2-diligence-field-book.ts"] },
  { label: "test-phase3-debate-spine-depth", cmd: "npx", args: ["tsx", "scripts/test-phase3-debate-spine-depth.ts"] },
  { label: "test-phase4-canon-loop", cmd: "npx", args: ["tsx", "scripts/test-phase4-canon-loop.ts"] },
  { label: "test-phase5-glossary-connectivity", cmd: "npx", args: ["tsx", "scripts/test-phase5-glossary-connectivity.ts"] },
  { label: "test-phase6-debate-ready-governance", cmd: "npx", args: ["tsx", "scripts/test-phase6-debate-ready-governance.ts"] },
  { label: "test-phase7-dossier-diligence-closure", cmd: "npx", args: ["tsx", "scripts/test-phase7-dossier-diligence-closure.ts"] },
  { label: "test-phase8-dossier-research-acca-closure", cmd: "npx", args: ["tsx", "scripts/test-phase8-dossier-research-acca-closure.ts"] },
  { label: "test-phase9-debate-instruction-bridge", cmd: "npx", args: ["tsx", "scripts/test-phase9-debate-instruction-bridge.ts"] },
  { label: "test-phase10-strategy-philosophy-command", cmd: "npx", args: ["tsx", "scripts/test-phase10-strategy-philosophy-command.ts"] },
  { label: "test-phase11-campaign-system-surfacing", cmd: "npx", args: ["tsx", "scripts/test-phase11-campaign-system-surfacing.ts"] },
  { label: "test-phase11-p1-kelly-strategic-plan", cmd: "npx", args: ["tsx", "scripts/test-phase11-p1-kelly-strategic-plan.ts"] },
  { label: "test-phase11-p2-movement-philosophy-staff-strategy", cmd: "npx", args: ["tsx", "scripts/test-phase11-p2-movement-philosophy-staff-strategy.ts"] },
  { label: "test-phase11-p3-strategy-doctrine", cmd: "npx", args: ["tsx", "scripts/test-phase11-p3-strategy-doctrine.ts"] },
  { label: "test-phase11-p4-philosophy-graph-claims-review", cmd: "npx", args: ["tsx", "scripts/test-phase11-p4-philosophy-graph-claims-review.ts"] },
  { label: "test-phase11-p5-field-book-chunk-promotion", cmd: "npx", args: ["tsx", "scripts/test-phase11-p5-field-book-chunk-promotion.ts"] },
  { label: "test-phase11-p6-strategy-alignment-chunk-preview", cmd: "npx", args: ["tsx", "scripts/test-phase11-p6-strategy-alignment-chunk-preview.ts"] },
  { label: "test-phase11-p7-briefing-papers-chunk-attach", cmd: "npx", args: ["tsx", "scripts/test-phase11-p7-briefing-papers-chunk-attach.ts"] },
  { label: "test-phase11-p8-field-book-promotion-execution", cmd: "npx", args: ["tsx", "scripts/test-phase11-p8-field-book-promotion-execution.ts"] },
  { label: "test-phase11-p9-stack-closure", cmd: "npx", args: ["tsx", "scripts/test-phase11-p9-stack-closure.ts"] },
  { label: "test-debate-prep-day2-pathway", cmd: "npx", args: ["tsx", "scripts/test-debate-prep-day2-pathway.ts"] },
  { label: "test-debate-prep-day3-pathway", cmd: "npx", args: ["tsx", "scripts/test-debate-prep-day3-pathway.ts"] },
  { label: "test-debate-prep-day3-pass2", cmd: "npx", args: ["tsx", "scripts/test-debate-prep-day3-pass2.ts"] },
  { label: "test-debate-prep-day3-pass3", cmd: "npx", args: ["tsx", "scripts/test-debate-prep-day3-pass3.ts"] },
  { label: "test-debate-prep-day4-pathway", cmd: "npx", args: ["tsx", "scripts/test-debate-prep-day4-pathway.ts"] },
  { label: "test-debate-prep-day2-pass4", cmd: "npx", args: ["tsx", "scripts/test-debate-prep-day2-pass4.ts"] },
  { label: "test-debate-prep-day2-pass5", cmd: "npx", args: ["tsx", "scripts/test-debate-prep-day2-pass5.ts"] },
  { label: "test-debate-prep-day-parity", cmd: "npx", args: ["tsx", "scripts/test-debate-prep-day-parity.ts"] },
  { label: "test-phase15-p0-p1-candidate-command", cmd: "npx", args: ["tsx", "scripts/test-phase15-p0-p1-candidate-command.ts"] },
  { label: "test-phase15-p2-kelly-prep-week", cmd: "npx", args: ["tsx", "scripts/test-phase15-p2-kelly-prep-week.ts"] },
  { label: "test-phase15-p3-stage-safe-filter", cmd: "npx", args: ["tsx", "scripts/test-phase15-p3-stage-safe-filter.ts"] },
  { label: "test-phase15-p4-top-tier-surfacing", cmd: "npx", args: ["tsx", "scripts/test-phase15-p4-top-tier-surfacing.ts"] },
  { label: "test-phase15-p5-evidence-honesty", cmd: "npx", args: ["tsx", "scripts/test-phase15-p5-evidence-honesty.ts"] },
  { label: "test-phase15-p6-demo-mode", cmd: "npx", args: ["tsx", "scripts/test-phase15-p6-demo-mode.ts"] },
  { label: "test-phase15-p7-ipad-polish", cmd: "npx", args: ["tsx", "scripts/test-phase15-p7-ipad-polish.ts"] },
  { label: "test-phase15-p8-staff-backstage", cmd: "npx", args: ["tsx", "scripts/test-phase15-p8-staff-backstage.ts"] },
  { label: "test-phase15-cce-closure", cmd: "npx", args: ["tsx", "scripts/test-phase15-cce-closure.ts"] },
  { label: "test-phase16-p0-session-launcher", cmd: "npx", args: ["tsx", "scripts/test-phase16-p0-session-launcher.ts"] },
  { label: "test-phase16-p1-run-of-show", cmd: "npx", args: ["tsx", "scripts/test-phase16-p1-run-of-show.ts"] },
  { label: "test-phase16-p2-encounters", cmd: "npx", args: ["tsx", "scripts/test-phase16-p2-encounters.ts"] },
  { label: "test-phase16-p3-drill-queue", cmd: "npx", args: ["tsx", "scripts/test-phase16-p3-drill-queue.ts"] },
  { label: "test-phase16-p4-session-debrief", cmd: "npx", args: ["tsx", "scripts/test-phase16-p4-session-debrief.ts"] },
  { label: "test-phase16-p5-ipad-drill-player", cmd: "npx", args: ["tsx", "scripts/test-phase16-p5-ipad-drill-player.ts"] },
  { label: "test-phase16-p6-session-memory", cmd: "npx", args: ["tsx", "scripts/test-phase16-p6-session-memory.ts"] },
  { label: "test-phase16-p7-staff-coach", cmd: "npx", args: ["tsx", "scripts/test-phase16-p7-staff-coach.ts"] },
  { label: "test-phase16-p8-live-event", cmd: "npx", args: ["tsx", "scripts/test-phase16-p8-live-event.ts"] },
  { label: "test-phase16-sre-closure", cmd: "npx", args: ["tsx", "scripts/test-phase16-sre-closure.ts"] },
  { label: "test-intelligence-hardening", cmd: "npm", args: ["run", "agents:test-intelligence-hardening"] },
  { label: "lint:all", cmd: "npm", args: ["run", "lint:all"] },
  { label: "typecheck", cmd: "npm", args: ["run", "typecheck"] },
  { label: "build", cmd: "npm", args: ["run", "build"] },
];

console.log("=== Intelligence phase sandbox run ===\n");

for (const step of steps) {
  process.stdout.write(`→ ${step.label}...\n`);
  const result = runStep(step);
  if (result.status !== 0) {
    console.error(`\n✗ FAILED at step: ${step.label}`);
    process.exit(result.status ?? 1);
  }
  console.log(`✓ ${step.label}\n`);
}

console.log("=== All sandbox checks passed — safe to commit and push main for Netlify ===");
