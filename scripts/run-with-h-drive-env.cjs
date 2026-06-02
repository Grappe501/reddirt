#!/usr/bin/env node
/**
 * Run a command with TEMP/TMP and npm cache pinned to H:\SOSWebsite\.local\
 * Usage: node scripts/run-with-h-drive-env.cjs <command> [args...]
 * Example: node scripts/run-with-h-drive-env.cjs next build
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(repoRoot, "..");
const localRoot = path.join(workspaceRoot, ".local");
const tempDir = path.join(localRoot, "temp");
const npmCache = path.join(localRoot, "npm-cache");

for (const dir of [localRoot, tempDir, npmCache]) {
  fs.mkdirSync(dir, { recursive: true });
}

const env = {
  ...process.env,
  TEMP: tempDir,
  TMP: tempDir,
  npm_config_cache: npmCache,
};

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/run-with-h-drive-env.cjs <command> [args...]");
  process.exit(1);
}

const [command, ...rest] = args;
const result = spawnSync(command, rest, {
  cwd: repoRoot,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
