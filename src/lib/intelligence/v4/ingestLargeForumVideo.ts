import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readdir, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import {
  OwnedMediaKind,
  OwnedMediaReviewStatus,
  OwnedMediaRole,
  OwnedMediaSourceType,
  OwnedMediaStorageBackend,
  TranscriptionJobStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildIngestOriginalCanonicalName } from "@/lib/owned-media/campaign-filename";
import { buildOwnedStorageKey, storageKeyToAbsoluteFilePath } from "@/lib/owned-media/paths";
import { getAcca2026SosForumDropAbsolute } from "@/lib/intelligence/v4/forumVideoDropPath";
import { LOCAL_FORUM_VIDEO_MAX_BYTES, formatBytes } from "@/lib/intelligence/v4/largeForumVideoLimits";
import {
  loadForumTranscriptLab,
  saveForumTranscriptLab,
  type ForumTranscriptLabRecord,
} from "@/lib/intelligence/v4/forumTranscriptLab";
import { analyzeForumTranscript, analyzeForumTranscriptDeep } from "@/lib/intelligence/v4/forumTranscriptAnalysis";
import { transcribeForumMediaChunks } from "@/lib/intelligence/v4/transcribeForumVideoChunks";

const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".m4v", ".mkv", ".avi"]);

export type IngestLargeForumVideoResult = {
  ok: boolean;
  message: string;
  videoPath?: string;
  assetId?: string;
  transcriptChars?: number;
  errors?: string[];
};

async function findLargestVideoInDir(dir: string): Promise<string | null> {
  let best: { path: string; size: number } | null = null;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (!VIDEO_EXT.has(ext)) continue;
    const full = path.join(dir, ent.name);
    const st = await stat(full);
    if (st.size <= 0) continue;
    if (!best || st.size > best.size) best = { path: full, size: st.size };
  }
  return best?.path ?? null;
}

async function moveOrStreamCopy(src: string, dest: string): Promise<void> {
  await mkdir(path.dirname(dest), { recursive: true });
  try {
    await rename(src, dest);
  } catch {
    await pipeline(createReadStream(src), createWriteStream(dest));
    await unlink(src);
  }
}

/**
 * Register a large forum video from the ACCA drop folder (disk move, no browser upload).
 * Chunks audio for Whisper when ffmpeg is available.
 */
export async function ingestLargeForumVideoFromDrop(options?: {
  dropDir?: string;
  runAnalysis?: boolean;
  title?: string;
  eventLabel?: string;
}): Promise<IngestLargeForumVideoResult> {
  const dropDir = options?.dropDir ?? getAcca2026SosForumDropAbsolute();
  const videoPath = await findLargestVideoInDir(dropDir);
  if (!videoPath) {
    return {
      ok: false,
      message: `No video file found in ${dropDir}. Drop .mp4/.mov/.webm here first.`,
    };
  }

  const st = await stat(videoPath);
  if (st.size > LOCAL_FORUM_VIDEO_MAX_BYTES) {
    return {
      ok: false,
      message: `Video is ${formatBytes(st.size)} — local forum ingest max is ${formatBytes(LOCAL_FORUM_VIDEO_MAX_BYTES)}. Re-encode or split the file.`,
    };
  }

  const assetId = randomUUID();
  const year = 2026;
  const origName = path.basename(videoPath);
  const { fileName: canonicalName } = buildIngestOriginalCanonicalName({
    originalBaseName: origName,
    anchorDate: new Date("2026-06-11T18:00:00Z"),
    ext: path.extname(origName) || ".mp4",
    ingestMode: "upload",
    countySlug: "stone-county",
    subjectHint: "ACCA SOS three-candidate forum Mountain View",
    uniquenessKey: assetId,
  });
  const storageKey = buildOwnedStorageKey({ assetId, year, fileName: canonicalName });
  const destAbs = storageKeyToAbsoluteFilePath(storageKey);

  await moveOrStreamCopy(videoPath, destAbs);

  const hash = await new Promise<string>((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(destAbs)
      .on("data", (c) => h.update(c))
      .on("end", () => resolve(h.digest("hex")))
      .on("error", reject);
  });

  const title = options?.title ?? "ACCA 2026 SOS three-candidate forum — Mountain View";
  const eventLabel =
    options?.eventLabel ??
    "Arkansas County Clerks Convention · Kelly Grappe · Sen. Kim Hammer · Dr. Pakko · 11 Jun 2026";

  await prisma.ownedMediaAsset.create({
    data: {
      id: assetId,
      storageKey,
      storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
      fileName: canonicalName,
      originalFileName: origName,
      canonicalFileName: canonicalName,
      fileSizeBytes: st.size,
      mimeType: "video/mp4",
      kind: OwnedMediaKind.VIDEO,
      role: OwnedMediaRole.INTERVIEW,
      title,
      description: eventLabel,
      countySlug: "stone-county",
      city: "Mountain View",
      issueTags: ["acca", "forum", "sos", "debate-prep", "county-clerks"],
      sourceType: OwnedMediaSourceType.LOCAL_INDEXED,
      reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
      indexSourceLabel: "acca-forum-drop",
      localIngestRelativePath: origName,
      ingestContentSha256: hash,
      transcriptJobStatus: TranscriptionJobStatus.QUEUED,
      enrichmentMetadata: {
        ingress: { eventId: "acca-summer-conference-2026-mountain-view-sos-panel", originalSizeBytes: st.size },
      },
    },
  });

  const tx = await transcribeForumMediaChunks(destAbs);
  const transcriptText = tx.ok ? tx.text : "";
  const transcriptSource: ForumTranscriptLabRecord["transcriptSource"] = tx.ok ? "upload_whisper" : "pending";

  if (tx.ok && transcriptText.length >= 50) {
    await prisma.ownedMediaTranscript.create({
      data: {
        ownedMediaId: assetId,
        transcriptText,
        source: "ASR",
        language: "en",
        reviewStatus: "PENDING",
      },
    });
    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: { transcriptJobStatus: TranscriptionJobStatus.SUCCEEDED },
    });
  } else {
    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: {
        transcriptJobStatus: TranscriptionJobStatus.FAILED,
        transcriptionLastError: tx.ok ? "Empty transcript" : tx.error,
      },
    });
  }

  const lab = loadForumTranscriptLab();
  const record: ForumTranscriptLabRecord = {
    ...lab,
    title,
    eventLabel,
    ownedMediaAssetId: assetId,
    transcriptText,
    transcriptSource,
    analysisStatus: transcriptText.length >= 50 ? "pending" : "error",
    analysisError: transcriptText.length >= 50 ? null : tx.ok ? "Transcript too short" : tx.error,
    deepAnalysisStatus: "not_started",
    deepAnalysisError: null,
  };

  if (options?.runAnalysis !== false && transcriptText.length >= 50) {
    try {
      record.analysis = await analyzeForumTranscript(transcriptText);
      record.analysisStatus = "ready";
      record.deepAnalysis = await analyzeForumTranscriptDeep(transcriptText);
      record.deepAnalysisStatus = "ready";
    } catch (e) {
      record.analysisStatus = "error";
      record.analysisError = e instanceof Error ? e.message : String(e);
    }
  }

  saveForumTranscriptLab(record);

  return {
    ok: true,
    message: tx.ok
      ? `Ingested ${formatBytes(st.size)} video · transcript ${transcriptText.length.toLocaleString()} chars · asset ${assetId}`
      : `Video registered (${formatBytes(st.size)}) · Whisper: ${tx.error}. Paste transcript in forum lab or install ffmpeg.`,
    videoPath: destAbs,
    assetId,
    transcriptChars: transcriptText.length,
    errors: tx.warnings,
  };
}
