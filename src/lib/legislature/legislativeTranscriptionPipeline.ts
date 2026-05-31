import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { extractAudioForVideoCandidate } from "./legislativeAudioExtraction";
import type { LegislativeVideoCandidate } from "./legislativeVideoArchiveStore";
import type { TranscriptSegment, TranscriptionJobResult, TranscriptsFile } from "./legislativeTranscriptionTypes";
import {
  createTranscriptionDeferredResult,
  isLegislativeTranscriptionEnabled,
  transcribeWithOpenAIWhisper,
} from "./legislativeTranscriptProvider";

export const TRANSCRIPTS_DIR = "data/legislature/transcripts";

export function getTranscriptionProviderStatus(): "NOT_CONFIGURED" | "OPENAI" | "DEFERRED" {
  if (isLegislativeTranscriptionEnabled()) return "OPENAI";
  return "NOT_CONFIGURED";
}

export function normalizeTranscriptSegments(
  raw: Array<{
    text: string;
    startTime: string;
    endTime: string;
    speakerLabel?: string;
    speakerConfidence?: number;
  }>,
  videoCandidateId: string,
  billNumber: string,
): TranscriptSegment[] {
  const now = new Date().toISOString();
  return raw.map((r, i) => ({
    id: `lts-${videoCandidateId}-${i}`,
    videoCandidateId,
    billNumber,
    speakerLabel: r.speakerLabel ?? "UNKNOWN",
    speakerConfidence: r.speakerConfidence ?? 0,
    startTime: r.startTime,
    endTime: r.endTime,
    text: r.text,
    transcriptionConfidence: 0.75,
    needsHumanReview: true,
    sourceCitationAnchorId: null,
    createdAt: now,
  }));
}

export function loadTranscriptSegments(repoRoot: string = process.cwd()): TranscriptsFile {
  const abs = path.join(repoRoot, TRANSCRIPTS_DIR, "transcript-segments.json");
  if (!existsSync(abs)) {
    return { version: 1, generatedAt: new Date().toISOString(), segments: [] };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as TranscriptsFile;
}

export function storeTranscriptSegments(segments: TranscriptSegment[], repoRoot: string = process.cwd()): void {
  const abs = path.join(repoRoot, TRANSCRIPTS_DIR, "transcript-segments.json");
  mkdirSync(path.dirname(abs), { recursive: true });
  const existing = loadTranscriptSegments(repoRoot);
  const byId = new Map(existing.segments.map((s) => [s.id, s]));
  for (const s of segments) byId.set(s.id, s);
  writeFileSync(
    abs,
    `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), segments: [...byId.values()] }, null, 2)}\n`,
    "utf8",
  );
}

export async function transcribeAudioFile(
  filePath: string,
  metadata: { videoCandidateId: string; billNumber: string },
): Promise<TranscriptionJobResult> {
  return transcribeWithOpenAIWhisper(filePath, metadata);
}

export async function transcribeVideoCandidate(
  candidate: LegislativeVideoCandidate,
  repoRoot: string = process.cwd(),
): Promise<TranscriptionJobResult> {
  const audio = await extractAudioForVideoCandidate(candidate, repoRoot);
  if (audio.status !== "AUDIO_READY" || !audio.audioPath) {
    return createTranscriptionDeferredResult(audio.reason || "Audio extraction deferred");
  }
  return transcribeWithOpenAIWhisper(audio.audioPath, {
    videoCandidateId: candidate.id,
    billNumber: candidate.billNumber,
  });
}

/** @deprecated use extractAudioForVideoCandidate */
export function prepareAudioForTranscription(candidate: LegislativeVideoCandidate) {
  return {
    ready: false,
    audioPath: null as string | null,
    warnings: ["Use extractAudioForVideoCandidate async path"],
  };
}
