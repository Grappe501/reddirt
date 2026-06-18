import { createReadStream } from "node:fs";
import { mkdtemp, readdir, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { getOpenAIClient, isOpenAIConfigured, formatOpenAIErrorForClient } from "@/lib/openai/client";
import { WHISPER_API_MAX_BYTES } from "@/lib/intelligence/v4/largeForumVideoLimits";

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    proc.stderr?.on("data", (d) => {
      err += String(d);
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.slice(-800) || `ffmpeg exited ${code}`));
    });
    proc.on("error", () => reject(new Error("ffmpeg not found on PATH — install ffmpeg for large-video transcription.")));
  });
}

async function ffmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
    proc.on("close", (c) => resolve(c === 0));
    proc.on("error", () => resolve(false));
  });
}

/** ~12 min mono MP3 chunks under Whisper 25 MB cap (64 kbps). */
const SEGMENT_SECONDS = 720;

export async function transcribeForumMediaChunks(
  absoluteVideoPath: string,
): Promise<{ ok: true; text: string; warnings: string[] } | { ok: false; error: string; warnings: string[] }> {
  const warnings: string[] = [];
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not set.", warnings };
  }

  const hasFfmpeg = await ffmpegAvailable();
  if (!hasFfmpeg) {
    const st = await import("node:fs/promises").then((fs) => fs.stat(absoluteVideoPath));
    if (st.size <= WHISPER_API_MAX_BYTES) {
      const { transcribeForumMediaFile } = await import("@/lib/intelligence/v4/forumTranscriptAnalysis");
      const direct = await transcribeForumMediaFile(absoluteVideoPath);
      if (direct.ok) return { ok: true, text: direct.text, warnings };
      return { ok: false, error: direct.error, warnings };
    }
    return {
      ok: false,
      error: "Large video requires ffmpeg on PATH to extract audio chunks for Whisper (25 MB API limit).",
      warnings,
    };
  }

  const workDir = await mkdtemp(path.join(tmpdir(), "forum-whisper-"));
  const pattern = path.join(workDir, "chunk_%03d.mp3");

  try {
    await runFfmpeg([
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      absoluteVideoPath,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-b:a",
      "64k",
      "-f",
      "segment",
      "-segment_time",
      String(SEGMENT_SECONDS),
      "-reset_timestamps",
      "1",
      pattern,
    ]);

    const chunks = (await readdir(workDir))
      .filter((f) => f.startsWith("chunk_") && f.endsWith(".mp3"))
      .sort();

    if (chunks.length === 0) {
      return { ok: false, error: "ffmpeg produced no audio chunks.", warnings };
    }

    warnings.push(`Transcribing ${chunks.length} audio chunk(s) via Whisper…`);
    const openai = getOpenAIClient();
    const parts: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = path.join(workDir, chunks[i]!);
      const st = await import("node:fs/promises").then((fs) => fs.stat(chunkPath));
      if (st.size > WHISPER_API_MAX_BYTES) {
        warnings.push(`Chunk ${i + 1} still ${st.size} bytes — may fail Whisper.`);
      }
      try {
        const result = await openai.audio.transcriptions.create({
          file: createReadStream(chunkPath),
          model: "whisper-1",
          response_format: "text",
        });
        const text = typeof result === "string" ? result : String(result);
        if (text.trim()) parts.push(text.trim());
      } catch (err) {
        warnings.push(`Chunk ${i + 1} failed: ${formatOpenAIErrorForClient(err)}`);
      }
    }

    const combined = parts.join("\n\n").trim();
    if (!combined) return { ok: false, error: "All Whisper chunks returned empty.", warnings };
    return { ok: true, text: combined, warnings };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), warnings };
  } finally {
    try {
      const left = await readdir(workDir);
      await Promise.all(left.map((f) => unlink(path.join(workDir, f))));
    } catch {
      /* temp cleanup best-effort */
    }
  }
}
