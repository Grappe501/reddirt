/**
 * Evidence Workbench tooling readiness — OpenAI + ffmpeg + HEIC probes (no secrets).
 */
import "server-only";

import {
  describeOpenAIKeySource,
  getOpenAIConfigFromEnv,
  getOpenAIKeySource,
  isOpenAIConfigured,
  type OpenAIKeySource,
} from "@/lib/openai/client";
import { probeVideoTooling, type FfmpegToolingReport } from "@/lib/campaign-media/ffmpeg-tooling";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

export type HeicToolingReport = {
  sharpAvailable: boolean;
  sampleHeicFound: boolean;
  samplePath?: string;
  detail: string;
};

export type EvidenceToolingReadiness = {
  generatedAt: string;
  openaiConfigured: boolean;
  /** Where OPENAI_API_KEY resolved (never the key). */
  openaiKeySource: OpenAIKeySource;
  openaiKeySourceLabel: string;
  openaiImageModel: string;
  ffmpeg: FfmpegToolingReport;
  heic: HeicToolingReport;
  ok: boolean;
  blockers: string[];
  warnings: string[];
};

function probeHeicTooling(): HeicToolingReport {
  let sharpAvailable = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("sharp");
    sharpAvailable = true;
  } catch {
    sharpAvailable = false;
  }

  const photosRoot = path.join(process.cwd(), "public", "media", "campaign-photos");
  let sampleHeicFound = false;
  let samplePath: string | undefined;
  if (existsSync(photosRoot)) {
    try {
      const names = readdirSync(photosRoot);
      const hit = names.find((n) => /\.(heic|heif)$/i.test(n));
      if (hit) {
        sampleHeicFound = true;
        samplePath = `public/media/campaign-photos/${hit}`;
      }
    } catch {
      /* ignore */
    }
  }

  if (!sharpAvailable) {
    return {
      sharpAvailable: false,
      sampleHeicFound,
      samplePath,
      detail: "sharp missing — HEIC→JPEG intake blocked.",
    };
  }
  return {
    sharpAvailable: true,
    sampleHeicFound,
    samplePath,
    detail: sampleHeicFound
      ? `sharp ready · HEIC sample present (${samplePath}) — intake can convert.`
      : "sharp ready · no HEIC fixtures in campaign-photos (intake converts when dropped).",
  };
}

export function getEvidenceToolingReadiness(): EvidenceToolingReadiness {
  const openaiConfigured = isOpenAIConfigured();
  const openaiKeySource = getOpenAIKeySource();
  const openaiKeySourceLabel = describeOpenAIKeySource(openaiKeySource);
  const openaiImageModel = getOpenAIConfigFromEnv().imageModel || "gpt-image-1";
  const ffmpeg = probeVideoTooling();
  const heic = probeHeicTooling();
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!openaiConfigured) {
    blockers.push(
      "OPENAI_API_KEY missing — Suggest, Command, turbo AI, Vision, and Images assists fail until set in RedDirt `.env.local` (preferred) or `.env`.",
    );
  } else if (openaiKeySource === "process.env") {
    warnings.push(
      "OPENAI_API_KEY is coming from process.env / Windows machine env — prefer RedDirt `.env.local` so lane keys win after restart.",
    );
  }
  if (!ffmpeg.ffmpegAvailable) {
    blockers.push(
      `ffmpeg missing — video encode / poster / Pro Edit render blocked. ${ffmpeg.installHint}`,
    );
  } else if (!ffmpeg.ffprobeAvailable) {
    warnings.push("ffprobe missing — some video probes degrade; encode may still work.");
  }
  if (!heic.sharpAvailable) {
    blockers.push(heic.detail);
  } else if (!heic.sampleHeicFound) {
    warnings.push(heic.detail);
  }

  return {
    generatedAt: new Date().toISOString(),
    openaiConfigured,
    openaiKeySource,
    openaiKeySourceLabel,
    openaiImageModel,
    ffmpeg,
    heic,
    ok: blockers.length === 0,
    blockers,
    warnings,
  };
}
