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

/** Netlify/Linux CI must not pin npm cache under SOSWebsite/.local — NFT traces then bundle cache tarballs. */
const isCiBuild = Boolean(
  process.env.NETLIFY ||
    process.env.NETLIFY_BUILD_BASE ||
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION,
);

const env = {
  ...process.env,
  TEMP: isCiBuild ? process.env.TEMP : tempDir,
  TMP: isCiBuild ? process.env.TMP : tempDir,
};

if (!env.NODE_OPTIONS?.includes("max-old-space-size")) {
  env.NODE_OPTIONS = [env.NODE_OPTIONS, "--max-old-space-size=6144"].filter(Boolean).join(" ");
}

if (!isCiBuild && process.platform === "win32") {
  env.npm_config_cache = npmCache;
  const ffmpegBin = path.join(localRoot, "ffmpeg", "bin");
  const ytdlpBin = path.join(localRoot, "yt-dlp");
  const extraBins = [ffmpegBin, ytdlpBin].filter((d) => fs.existsSync(d));
  if (extraBins.length) {
    env.PATH = `${extraBins.join(path.delimiter)}${path.delimiter}${env.PATH ?? ""}`;
  }
  const nodeDirs = [
    path.dirname(process.execPath),
    "C:\\Program Files\\nodejs",
  ].filter((d, i, a) => d && a.indexOf(d) === i && fs.existsSync(d));
  if (nodeDirs.length) {
    env.PATH = `${nodeDirs.join(path.delimiter)}${path.delimiter}${env.PATH ?? ""}`;
  }
}

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
