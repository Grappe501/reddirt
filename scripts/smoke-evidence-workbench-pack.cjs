#!/usr/bin/env node
/**
 * Pass 10 — Evidence Workbench smoke pack (runs key smokes in order).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node scripts/smoke-evidence-workbench-pack.cjs
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const wrapper = path.join(root, "scripts", "run-with-h-drive-env.cjs");
const tsx = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

const SMOKES = [
  "scripts/smoke-photo-intake.ts",
  "scripts/smoke-turbo-ingest.ts",
  "scripts/smoke-batch-photo-evidence.ts",
  "scripts/smoke-cluster-photo-selection.ts",
  "scripts/smoke-batch-photo-derivatives.ts",
  "scripts/smoke-promote-photo-derivative.ts",
  "scripts/smoke-focus-crop.ts",
  "scripts/smoke-ffmpeg-foundation.ts",
  "scripts/smoke-encode-video-excerpt.ts",
  "scripts/smoke-video-prep-package.ts",
  "scripts/smoke-transcript-intelligence.ts",
  "scripts/smoke-batch-photo-publish.ts",
  "scripts/smoke-batch-publish-undo.ts",
];

function runOne(rel) {
  const r = spawnSync(
    process.execPath,
    [wrapper, "node", tsx, path.join(root, rel)],
    { cwd: root, encoding: "utf8", windowsHide: true },
  );
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  return { rel, status: r.status ?? 1, out };
}

function main() {
  const results = [];
  for (const rel of SMOKES) {
    process.stdout.write(`→ ${rel} … `);
    const res = runOne(rel);
    results.push(res);
    if (res.status !== 0) {
      console.log("FAIL");
      console.log(res.out.slice(-2000));
      console.error(
        JSON.stringify(
          {
            ok: false,
            failed: rel,
            passed: results.filter((x) => x.status === 0).map((x) => x.rel),
          },
          null,
          2,
        ),
      );
      process.exit(1);
    }
    console.log("OK");
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        count: results.length,
        smokes: results.map((r) => r.rel),
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-evidence-workbench-pack");
}

main();
