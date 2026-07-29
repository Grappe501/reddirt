#!/usr/bin/env node
/**
 * Ensure ffmpeg/ffprobe exist under H:/SOSWebsite/.local/ffmpeg/bin.
 * Prefer existing binaries; optionally extract from local essentials zip.
 *
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node scripts/ensure-local-ffmpeg.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(repoRoot, "..");
const localRoot = path.join(workspaceRoot, ".local");
const ffmpegRoot = path.join(localRoot, "ffmpeg");
const binDir = path.join(ffmpegRoot, "bin");
const zipPath = path.join(ffmpegRoot, "ffmpeg-release-essentials.zip");
const extractDir = path.join(ffmpegRoot, "extract");

const isWin = process.platform === "win32";
const ffmpegName = isWin ? "ffmpeg.exe" : "ffmpeg";
const ffprobeName = isWin ? "ffprobe.exe" : "ffprobe";

function okBin(p) {
  if (!fs.existsSync(p)) return false;
  try {
    execFileSync(p, ["-version"], {
      stdio: ["ignore", "ignore", "ignore"],
      windowsHide: true,
      timeout: 8000,
    });
    return true;
  } catch {
    return false;
  }
}

function findNestedBin(root, name) {
  if (!fs.existsSync(root)) return null;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (ent.isFile() && ent.name.toLowerCase() === name.toLowerCase()) return full;
    }
  }
  return null;
}

function ensureDirs() {
  for (const d of [localRoot, ffmpegRoot, binDir, extractDir, path.join(localRoot, "video-masters")]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function copyIfNeeded(src, dest) {
  if (!src || !fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

function extractZip() {
  if (!fs.existsSync(zipPath)) {
    return {
      ok: false,
      error: `Missing zip: ${zipPath}. Download gyan.dev ffmpeg essentials and place it there.`,
    };
  }
  fs.mkdirSync(extractDir, { recursive: true });
  if (isWin) {
    const ps = `
$ErrorActionPreference = 'Stop'
Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force
`;
    const r = spawnSync(
      "powershell.exe",
      ["-NoProfile", "-Command", ps],
      { encoding: "utf8", windowsHide: true },
    );
    if (r.status !== 0) {
      return { ok: false, error: r.stderr || r.stdout || "Expand-Archive failed" };
    }
  } else {
    const r = spawnSync("unzip", ["-o", zipPath, "-d", extractDir], { encoding: "utf8" });
    if (r.status !== 0) {
      return { ok: false, error: r.stderr || r.stdout || "unzip failed" };
    }
  }
  return { ok: true };
}

function main() {
  ensureDirs();
  const ffmpegDest = path.join(binDir, ffmpegName);
  const ffprobeDest = path.join(binDir, ffprobeName);

  if (okBin(ffmpegDest) && okBin(ffprobeDest)) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          alreadyInstalled: true,
          ffmpegPath: ffmpegDest,
          ffprobePath: ffprobeDest,
          binDir,
        },
        null,
        2,
      ),
    );
    return;
  }

  let extracted = false;
  if (!okBin(ffmpegDest) || !okBin(ffprobeDest)) {
    const ex = extractZip();
    if (!ex.ok) {
      console.error(JSON.stringify({ ok: false, error: ex.error }, null, 2));
      process.exit(1);
    }
    extracted = true;
    const foundFfmpeg = findNestedBin(extractDir, ffmpegName);
    const foundFfprobe = findNestedBin(extractDir, ffprobeName);
    if (!copyIfNeeded(foundFfmpeg, ffmpegDest) || !copyIfNeeded(foundFfprobe, ffprobeDest)) {
      // also try ffplay optional
      const foundFfplay = findNestedBin(extractDir, isWin ? "ffplay.exe" : "ffplay");
      copyIfNeeded(foundFfplay, path.join(binDir, isWin ? "ffplay.exe" : "ffplay"));
      console.error(
        JSON.stringify(
          {
            ok: false,
            error: "Extracted zip but could not locate ffmpeg/ffprobe binaries.",
            foundFfmpeg,
            foundFfprobe,
          },
          null,
          2,
        ),
      );
      process.exit(1);
    }
    const foundFfplay = findNestedBin(extractDir, isWin ? "ffplay.exe" : "ffplay");
    copyIfNeeded(foundFfplay, path.join(binDir, isWin ? "ffplay.exe" : "ffplay"));
  }

  if (!okBin(ffmpegDest) || !okBin(ffprobeDest)) {
    console.error(JSON.stringify({ ok: false, error: "Binaries present but -version failed." }, null, 2));
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        extracted,
        ffmpegPath: ffmpegDest,
        ffprobePath: ffprobeDest,
        binDir,
        note: "run-with-h-drive-env.cjs prepends this bin dir to PATH on Windows.",
      },
      null,
      2,
    ),
  );
}

main();
