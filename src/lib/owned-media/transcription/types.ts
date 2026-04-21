import type { TranscriptSource } from "@prisma/client";

export type TranscribeRequest = {
  assetId: string;
  storageKey: string;
  mimeType: string;
  fileName: string;
};

export type TranscribeSuccess = {
  ok: true;
  transcriptText: string;
  source: TranscriptSource;
  language?: string | null;
  confidence?: number | null;
  segmentsJson?: unknown;
};

export type TranscribeFailure = { ok: false; error: string };

export type TranscribeResult = TranscribeSuccess | TranscribeFailure;

/**
 * Pluggable ASR: wire Whisper, AssemblyAI, or Supabase in a later pass.
 * Implementations must not mutate review truth — return raw/staged text with review = PENDING.
 */
export type TranscriptionProvider = {
  /** Human-readable name for logging / admin. */
  name: string;
  transcribe: (req: TranscribeRequest) => Promise<TranscribeResult>;
};
