import { isOpenAIConfigured } from "@/lib/openai/client";
import type { TranscriptionProvider } from "./types";
import { openaiWhisperTranscriptionProvider } from "./openai";
import { stubTranscriptionProvider } from "./stub";

/**
 * Whisper when `OPENAI_API_KEY` is set; otherwise stub fails closed (no fake transcript).
 * Override with `OWNED_MEDIA_ASR=stub` to force stub in dev.
 */
export function getTranscriptionProvider(): TranscriptionProvider {
  if (process.env.OWNED_MEDIA_ASR === "stub") return stubTranscriptionProvider;
  if (isOpenAIConfigured()) return openaiWhisperTranscriptionProvider;
  return stubTranscriptionProvider;
}
