import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { LegislativeVideoCandidate } from "./legislativeVideoArchiveStore";

const execFileP = promisify(execFile);

export const AUDIO_CACHE_DIR = "data/legislature/audio";

export type AudioExtractionResult = {
  status: "AUDIO_READY" | "AUDIO_EXTRACTION_DEFERRED" | "FAILED";
  audioPath: string | null;
  reason: string;
  warnings: string[];
};

let ffmpegAvailable: boolean | null = null;

export function isAudioExtractionEnabled(): boolean {
  return process.env.LEGISLATURE_AUDIO_EXTRACT === "1";
}

export async function detectFfmpegAvailability(): Promise<boolean> {
  if (ffmpegAvailable !== null) return ffmpegAvailable;
  try {
    await execFileP("ffmpeg", ["-version"], { timeout: 5000, windowsHide: true });
    ffmpegAvailable = true;
  } catch {
    ffmpegAvailable = false;
  }
  return ffmpegAvailable;
}

export function resolveVideoCandidateMediaUrl(candidate: LegislativeVideoCandidate): string {
  return candidate.videoUrl;
}

function audioCachePath(candidateId: string, repoRoot: string): string {
  return path.join(repoRoot, AUDIO_CACHE_DIR, `${candidateId}.mp3`);
}

function audioMetaPath(candidateId: string, repoRoot: string): string {
  return path.join(repoRoot, AUDIO_CACHE_DIR, `${candidateId}.meta.json`);
}

export function cacheExtractedAudio(
  candidate: LegislativeVideoCandidate,
  audioPath: string,
  repoRoot: string = process.cwd(),
): void {
  mkdirSync(path.dirname(audioMetaPath(candidate.id, repoRoot)), { recursive: true });
  writeFileSync(
    audioMetaPath(candidate.id, repoRoot),
    `${JSON.stringify(
      {
        candidateId: candidate.id,
        billNumber: candidate.billNumber,
        videoUrl: candidate.videoUrl,
        audioPath,
        extractedAt: new Date().toISOString(),
        urlHash: createHash("sha256").update(candidate.videoUrl).digest("hex").slice(0, 16),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

export function getCachedAudioPath(candidateId: string, repoRoot: string = process.cwd()): string | null {
  const meta = audioMetaPath(candidateId, repoRoot);
  if (!existsSync(meta)) return null;
  const parsed = JSON.parse(readFileSync(meta, "utf8")) as { audioPath: string };
  return existsSync(parsed.audioPath) ? parsed.audioPath : null;
}

export async function extractAudioForVideoCandidate(
  candidate: LegislativeVideoCandidate,
  repoRoot: string = process.cwd(),
): Promise<AudioExtractionResult> {
  const warnings: string[] = [];

  if (!isAudioExtractionEnabled()) {
    return {
      status: "AUDIO_EXTRACTION_DEFERRED",
      audioPath: null,
      reason: "LEGISLATURE_AUDIO_EXTRACT=1 not set",
      warnings,
    };
  }

  const cached = getCachedAudioPath(candidate.id, repoRoot);
  if (cached) {
    return { status: "AUDIO_READY", audioPath: cached, reason: "cached", warnings };
  }

  const hasFfmpeg = await detectFfmpegAvailability();
  if (!hasFfmpeg) {
    return {
      status: "AUDIO_EXTRACTION_DEFERRED",
      audioPath: null,
      reason: "ffmpeg not found on PATH — install ffmpeg or set FFMPEG_PATH",
      warnings,
    };
  }

  if (!candidate.videoUrl) {
    return {
      status: "AUDIO_EXTRACTION_DEFERRED",
      audioPath: null,
      reason: "No video URL on candidate",
      warnings,
    };
  }

  mkdirSync(path.join(repoRoot, AUDIO_CACHE_DIR), { recursive: true });
  const outPath = audioCachePath(candidate.id, repoRoot);
  const maxSeconds = Number(process.env.LEGISLATURE_AUDIO_MAX_SECONDS ?? 600);

  try {
    warnings.push("Sliq URLs may require browser session — ffmpeg direct extract may fail");
    await execFileP(
      "ffmpeg",
      [
        "-y",
        "-i",
        candidate.videoUrl,
        "-vn",
        "-acodec",
        "libmp3lame",
        "-t",
        String(maxSeconds),
        outPath,
      ],
      { timeout: 120000, windowsHide: true },
    );
    if (!existsSync(outPath)) {
      return {
        status: "FAILED",
        audioPath: null,
        reason: "ffmpeg completed but output file missing",
        warnings,
      };
    }
    cacheExtractedAudio(candidate, outPath, repoRoot);
    return { status: "AUDIO_READY", audioPath: outPath, reason: "extracted", warnings };
  } catch (err) {
    return {
      status: "AUDIO_EXTRACTION_DEFERRED",
      audioPath: null,
      reason: err instanceof Error ? err.message.slice(0, 200) : String(err),
      warnings,
    };
  }
}

export async function summarizeAudioExtractionReadiness(repoRoot: string = process.cwd()) {
  const enabled = isAudioExtractionEnabled();
  const ffmpeg = await detectFfmpegAvailability();
  return {
    enabled,
    ffmpegAvailable: ffmpeg,
    cacheDir: path.join(repoRoot, AUDIO_CACHE_DIR),
    ready: enabled && ffmpeg,
    enableSteps: [
      "Set LEGISLATURE_AUDIO_EXTRACT=1",
      "Install ffmpeg on PATH",
      "Set LEGISLATURE_LIVE_DISCOVERY=1 for video URL discovery",
    ],
  };
}
