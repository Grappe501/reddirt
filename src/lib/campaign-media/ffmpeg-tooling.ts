/**
 * Pass 6 — resolve local ffmpeg/ffprobe under H:/SOSWebsite/.local/ffmpeg first.
 * No network; install/ensure is a separate script.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

export type FfmpegBinarySource = "env" | "local" | "path" | "missing";

export type FfmpegToolingReport = {
  ffmpegAvailable: boolean;
  ffprobeAvailable: boolean;
  ffmpegPath: string | null;
  ffprobePath: string | null;
  source: FfmpegBinarySource;
  localBinDir: string;
  ffmpegVersion: string | null;
  ffprobeVersion: string | null;
  note: string;
  installHint: string;
};

const WIN = process.platform === "win32";

export function workspaceLocalRoot(): string {
  // RedDirt cwd → sibling .local on SOSWebsite workspace
  return path.resolve(process.cwd(), "..", ".local");
}

export function localFfmpegBinDir(): string {
  return path.join(workspaceLocalRoot(), "ffmpeg", "bin");
}

export function localVideoMastersDir(): string {
  return path.join(workspaceLocalRoot(), "video-masters");
}

function versionLine(bin: string): string | null {
  try {
    const out = execFileSync(bin, ["-version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
      timeout: 8000,
    });
    return out.split(/\r?\n/).map((s) => s.trim()).find(Boolean) ?? null;
  } catch {
    return null;
  }
}

function findOnPath(bin: string): string | null {
  try {
    const out = execFileSync(WIN ? "where.exe" : "which", [bin], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)[0];
    return out || null;
  } catch {
    return null;
  }
}

function localBinary(name: string): string | null {
  const exe = WIN ? `${name}.exe` : name;
  const candidate = path.join(localFfmpegBinDir(), exe);
  return existsSync(candidate) ? candidate : null;
}

/**
 * Prefer env → .local/ffmpeg/bin → PATH.
 */
export function resolveFfmpegBinaries(): {
  ffmpegPath: string | null;
  ffprobePath: string | null;
  source: FfmpegBinarySource;
} {
  const envFfmpeg = process.env.FFMPEG_PATH?.trim();
  const envFfprobe = process.env.FFPROBE_PATH?.trim();
  if (envFfmpeg && existsSync(envFfmpeg)) {
    const probe =
      (envFfprobe && existsSync(envFfprobe) ? envFfprobe : null) ??
      localBinary("ffprobe") ??
      findOnPath("ffprobe");
    return { ffmpegPath: envFfmpeg, ffprobePath: probe, source: "env" };
  }

  const localFfmpeg = localBinary("ffmpeg");
  const localFfprobe = localBinary("ffprobe");
  if (localFfmpeg) {
    return {
      ffmpegPath: localFfmpeg,
      ffprobePath: localFfprobe ?? findOnPath("ffprobe"),
      source: "local",
    };
  }

  const pathFfmpeg = findOnPath("ffmpeg");
  const pathFfprobe = findOnPath("ffprobe");
  if (pathFfmpeg) {
    return { ffmpegPath: pathFfmpeg, ffprobePath: pathFfprobe, source: "path" };
  }

  return { ffmpegPath: null, ffprobePath: null, source: "missing" };
}

export function probeVideoTooling(): FfmpegToolingReport {
  const localBinDir = localFfmpegBinDir();
  const installHint =
    "From RedDirt: node scripts/run-with-h-drive-env.cjs node scripts/ensure-local-ffmpeg.cjs";
  const resolved = resolveFfmpegBinaries();
  const ffmpegVersion = resolved.ffmpegPath ? versionLine(resolved.ffmpegPath) : null;
  const ffprobeVersion = resolved.ffprobePath ? versionLine(resolved.ffprobePath) : null;

  if (!resolved.ffmpegPath) {
    return {
      ffmpegAvailable: false,
      ffprobeAvailable: false,
      ffmpegPath: null,
      ffprobePath: null,
      source: "missing",
      localBinDir,
      ffmpegVersion: null,
      ffprobeVersion: null,
      note: `ffmpeg not found. Expected ${path.join(localBinDir, WIN ? "ffmpeg.exe" : "ffmpeg")} or PATH.`,
      installHint,
    };
  }

  const sourceLabel =
    resolved.source === "local"
      ? "H:/SOSWebsite/.local/ffmpeg"
      : resolved.source === "env"
        ? "FFMPEG_PATH"
        : "system PATH";

  return {
    ffmpegAvailable: true,
    ffprobeAvailable: Boolean(resolved.ffprobePath),
    ffmpegPath: resolved.ffmpegPath,
    ffprobePath: resolved.ffprobePath,
    source: resolved.source,
    localBinDir,
    ffmpegVersion,
    ffprobeVersion,
    note: resolved.ffprobePath
      ? `ffmpeg + ffprobe ready (${sourceLabel}) for poster extract and clip probe.`
      : `ffmpeg ready (${sourceLabel}) but ffprobe missing — clip probe limited; poster extract still works.`,
    installHint,
  };
}

export function runFfmpeg(args: string[]): { ok: true; stdout: string } | { ok: false; error: string } {
  const { ffmpegPath } = resolveFfmpegBinaries();
  if (!ffmpegPath) return { ok: false, error: probeVideoTooling().note };
  try {
    const stdout = execFileSync(ffmpegPath, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      maxBuffer: 8 * 1024 * 1024,
    });
    return { ok: true, stdout: String(stdout ?? "") };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ffmpeg failed.";
    const stderr =
      err && typeof err === "object" && "stderr" in err
        ? String((err as { stderr?: Buffer | string }).stderr ?? "")
        : "";
    return { ok: false, error: stderr.trim() || msg };
  }
}

export function runFfprobeJson(fileAbs: string): { ok: true; data: unknown } | { ok: false; error: string } {
  const { ffprobePath } = resolveFfmpegBinaries();
  if (!ffprobePath) {
    return { ok: false, error: "ffprobe not available — run ensure-local-ffmpeg.cjs" };
  }
  if (!existsSync(fileAbs)) return { ok: false, error: `File not found: ${fileAbs}` };
  try {
    const raw = execFileSync(
      ffprobePath,
      [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        fileAbs,
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
      },
    );
    return { ok: true, data: JSON.parse(raw) as unknown };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "ffprobe failed." };
  }
}
