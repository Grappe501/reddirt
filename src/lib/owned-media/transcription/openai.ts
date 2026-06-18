import { createReadStream } from "node:fs";
import { TranscriptSource } from "@prisma/client";
import { formatOpenAIErrorForClient, getOpenAIClient, isOpenAIConfigured } from "@/lib/openai/client";
import { resolveOwnedMediaAbsolutePath } from "@/lib/owned-media/runtime-storage";
import { prisma } from "@/lib/db";
import type { TranscriptionProvider } from "./types";

export const openaiWhisperTranscriptionProvider: TranscriptionProvider = {
  name: "openai-whisper",
  async transcribe(req) {
    if (!isOpenAIConfigured()) {
      return { ok: false, error: "OPENAI_API_KEY not set — add a human transcript or configure Whisper." };
    }
    try {
      const asset = await prisma.ownedMediaAsset.findUnique({ where: { id: req.assetId } });
      if (!asset) return { ok: false, error: "Asset not found." };
      const abs = await resolveOwnedMediaAbsolutePath(asset);
      const openai = getOpenAIClient();
      const result = await openai.audio.transcriptions.create({
        file: createReadStream(abs),
        model: "whisper-1",
        response_format: "text",
      });
      const text = typeof result === "string" ? result : String(result);
      if (!text.trim()) return { ok: false, error: "Whisper returned empty transcript." };
      return {
        ok: true,
        transcriptText: text.trim(),
        source: TranscriptSource.ASR,
        language: "en",
      };
    } catch (err) {
      return { ok: false, error: formatOpenAIErrorForClient(err) };
    }
  },
};
