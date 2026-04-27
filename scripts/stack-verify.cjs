#!/usr/bin/env node
/**
 * Full local gate (mirrors Netlify `scripts/netlify-build.sh` order for DB steps, then `npm run check`).
 * - Requires DATABASE_URL (e.g. `.env` / `.env.local`). Start Postgres first: `docker compose up -d`.
 * - Set SKIP_DB_SEED=1 to skip seed (same semantics as netlify-build.sh).
 * - Writes `stack-verify-last-run.txt` in the repo root for a timestamped transcript.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const logPath = path.join(root, "stack-verify-last-run.txt");

function append(line) {
  fs.appendFileSync(logPath, line + "\n", "utf8");
}

function runStep(label, command) {
  const stamp = new Date().toISOString();
  const header = `[${stamp}] >>> ${label}: ${command}`;
  append(header);
  process.stderr.write(header + "\n");
  const r = spawnSync(command, {
    cwd: root,
    shell: true,
    stdio: "inherit",
    env: process.env,
  });
  const code = r.status ?? 1;
  if (code !== 0) {
    const fail = `[${stamp}] FAIL ${label} (exit ${code})`;
    append(fail);
    process.stderr.write(fail + "\n");
    process.exit(code);
  }
}

fs.writeFileSync(
  logPath,
  `stack-verify started ${new Date().toISOString()}\nroot: ${root}\n`,
  "utf8",
);

runStep("prisma generate", "npx prisma generate");
runStep("prisma migrate deploy", "npx prisma migrate deploy");

const skipSeed = ["1", "true", "yes"].includes(String(process.env.SKIP_DB_SEED || "").toLowerCase());
if (skipSeed) {
  append(`[${new Date().toISOString()}] SKIP prisma db seed (SKIP_DB_SEED)`);
} else {
  runStep("prisma db seed", "npx prisma db seed");
}

runStep("npm run check", "npm run check");

const ok = `[${new Date().toISOString()}] OK — stack verify complete`;
append(ok);
process.stderr.write(ok + "\n");
