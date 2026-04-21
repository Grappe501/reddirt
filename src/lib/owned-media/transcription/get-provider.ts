import type { TranscriptionProvider } from "./types";
import { stubTranscriptionProvider } from "./stub";

/**
 * When you wire a real ASR, return it from here based on `process.env` (e.g. `OPENAI_API_KEY` + `OWNED_MEDIA_ASR=openai`).
 * Until then, the stub fails closed (no fake transcript) so uploads remain the source of truth.
 */
export function getTranscriptionProvider(): TranscriptionProvider {
  return stubTranscriptionProvider;
}
