import { createReadStream } from "node:fs";
import { getOpenAIClient, isOpenAIConfigured } from "@/lib/openai/client";
import type { TranscriptSegment, TranscriptionJobResult } from "./legislativeTranscriptionTypes";

export function isLegislativeTranscriptionEnabled(): boolean {
  return process.env.LEGISLATURE_TRANSCRIPTION_ENABLED === "1" && isOpenAIConfigured();
}

export function createTranscriptionDeferredResult(reason: string): TranscriptionJobResult {
  return {
    status: "TRANSCRIPTION_DEFERRED",
    provider: "DEFERRED",
    segments: [],
    warnings: [reason],
  };
}

export function summarizeTranscriptionProviderReadiness() {
  const enabled = isLegislativeTranscriptionEnabled();
  return {
    enabled,
    openaiConfigured: isOpenAIConfigured(),
    transcriptionFlag: process.env.LEGISLATURE_TRANSCRIPTION_ENABLED === "1",
    model: "whisper-1",
    enableSteps: [
      "Set LEGISLATURE_TRANSCRIPTION_ENABLED=1",
      "Set OPENAI_API_KEY in environment (never commit)",
      "Set LEGISLATURE_AUDIO_EXTRACT=1 and install ffmpeg",
      "Run legislature:intelligence:critical",
    ],
  };
}

type WhisperVerbose = {
  text?: string;
  segments?: Array<{ start: number; end: number; text: string }>;
};

function normalizeTranscriptSegments(
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
    text: r.text,
    startTime: r.startTime,
    endTime: r.endTime,
    transcriptionConfidence: 0.75,
    needsHumanReview: true,
    sourceCitationAnchorId: null,
    createdAt: now,
  }));
}

export function normalizeWhisperTranscriptToSegments(
  raw: WhisperVerbose,
  videoCandidateId: string,
  billNumber: string,
  speakerLabel = "UNKNOWN",
): TranscriptSegment[] {
  if (raw.segments?.length) {
    return normalizeTranscriptSegments(
      raw.segments.map((s) => ({
        text: s.text.trim(),
        startTime: formatWhisperTime(s.start),
        endTime: formatWhisperTime(s.end),
        speakerLabel,
        speakerConfidence: 0,
      })),
      videoCandidateId,
      billNumber,
    );
  }
  if (raw.text?.trim()) {
    return normalizeTranscriptSegments(
      [{ text: raw.text.trim(), startTime: "00:00:00", endTime: "00:00:00", speakerLabel, speakerConfidence: 0 }],
      videoCandidateId,
      billNumber,
    );
  }
  return [];
}

function formatWhisperTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export async function transcribeWithOpenAIWhisper(
  audioPath: string,
  metadata: { videoCandidateId: string; billNumber: string },
): Promise<TranscriptionJobResult> {
  if (!isLegislativeTranscriptionEnabled()) {
    return createTranscriptionDeferredResult(
      "Transcription disabled — set LEGISLATURE_TRANSCRIPTION_ENABLED=1 and OPENAI_API_KEY",
    );
  }

  try {
    const openai = getOpenAIClient();
    const result = (await openai.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: "whisper-1",
      response_format: "verbose_json",
    })) as WhisperVerbose;

    const segments = normalizeWhisperTranscriptToSegments(result, metadata.videoCandidateId, metadata.billNumber);
    if (!segments.length) {
      return createTranscriptionDeferredResult("Whisper returned empty transcript");
    }

    return {
      status: "TRANSCRIBED",
      provider: "OPENAI",
      segments,
      warnings: ["Automated transcript — HUMAN_REVIEW_REQUIRED before quote use"],
    };
  } catch (err) {
    return {
      status: "FAILED",
      provider: "OPENAI",
      segments: [],
      warnings: [err instanceof Error ? err.message.slice(0, 200) : String(err)],
    };
  }
}
