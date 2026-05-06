#!/usr/bin/env node
/**
 * EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0 — CLI entry (delegates to TS impl for Prisma + lib reuse).
 * Never prints tokens or OAuth secrets.
 *
 * Usage (from RedDirt/):
 *   npm run gmail:watch:renewal-check
 *   npm run gmail:watch:renewal-check -- --execute   # requires GMAIL_WATCH_RENEWAL_EXECUTE=1
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
process.chdir(root);
try {
  if (typeof process.loadEnvFile === "function") {
    const envPath = join(root, ".env");
    if (existsSync(envPath)) process.loadEnvFile(envPath);
  }
} catch {
  /* ignore */
}

const impl = join(root, "scripts", "gmail-watch-renewal-check.impl.ts");
const tsxCli = join(root, "node_modules", "tsx", "dist", "cli.mjs");
const extra = process.argv.slice(2);
const r = spawnSync(process.execPath, [tsxCli, impl, ...extra], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(typeof r.status === "number" ? r.status : 1);
