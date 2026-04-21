import type { TranscriptionProvider } from "./types";

/**
 * No network I/O. Reports failure so the job does not look "done" with fake transcript text
 * (original media remains source of truth; staff can add a human transcript).
 */
export const stubTranscriptionProvider: TranscriptionProvider = {
  name: "stub",
  async transcribe() {
    return {
      ok: false,
      error:
        "Transcription is not configured. Set a provider in get-provider.ts, or add a human transcript. Original upload is unchanged.",
    };
  },
};
