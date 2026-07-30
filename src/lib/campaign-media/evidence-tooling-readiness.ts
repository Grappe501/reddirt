/**
 * Evidence Workbench tooling readiness — OpenAI + ffmpeg probes (no secrets).
 */
import "server-only";

import { isOpenAIConfigured } from "@/lib/openai/client";
import { probeVideoTooling, type FfmpegToolingReport } from "@/lib/campaign-media/ffmpeg-tooling";

export type EvidenceToolingReadiness = {
  generatedAt: string;
  openaiConfigured: boolean;
  ffmpeg: FfmpegToolingReport;
  ok: boolean;
  blockers: string[];
  warnings: string[];
};

export function getEvidenceToolingReadiness(): EvidenceToolingReadiness {
  const openaiConfigured = isOpenAIConfigured();
  const ffmpeg = probeVideoTooling();
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!openaiConfigured) {
    blockers.push(
      "OPENAI_API_KEY missing — Suggest, Command, turbo AI, and metadata packets will fail until set in RedDirt .env / .env.local.",
    );
  }
  if (!ffmpeg.ffmpegAvailable) {
    blockers.push(
      `ffmpeg missing — video encode / poster / Pro Edit render blocked. ${ffmpeg.installHint}`,
    );
  } else if (!ffmpeg.ffprobeAvailable) {
    warnings.push("ffprobe missing — some video probes degrade; encode may still work.");
  }

  return {
    generatedAt: new Date().toISOString(),
    openaiConfigured,
    ffmpeg,
    ok: blockers.length === 0,
    blockers,
    warnings,
  };
}
