/**
 * Shared ingest: OwnedMedia + transcript + SearchChunk (OpenAI) for campaign files.
 * Used by ingest-briefing-zip and ingest-campaign-folder.
 */
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import * as XLSX from "xlsx";
import {
  GeoMetadataSource,
  OwnedMediaKind,
  OwnedMediaReviewStatus,
  OwnedMediaRole,
  OwnedMediaSourceType,
  OwnedMediaStorageBackend,
  TranscriptReviewStatus,
  TranscriptSource,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { chunkTextForSearch } from "../src/lib/campaign-briefings/chunk-for-search";
import { extractTextFromDocxBuffer } from "../src/lib/campaign-briefings/extract-docx";
import { BRIEFING_TAG, COMMS_TAG, COMMUNITY_TRAINING_TAG } from "../src/lib/campaign-briefings/briefing-queries";
import { extractPdfText, htmlToPlainText } from "../src/lib/ingest/extract-document-text";
import { classifyIngestPath, resolveIngestVisibility } from "../src/lib/ingest/sensitive-classification";
import { prisma } from "../src/lib/db";
import { embedTexts } from "../src/lib/openai/embeddings";
import { isOpenAIConfigured } from "../src/lib/openai/client";
import { MAX_UPLOAD_BYTES, saveOwnedMediaFile } from "../src/lib/owned-media/storage";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PDF = "application/pdf";

export type CampaignIngestPreset = "briefing" | "comms" | "community-training";

export type IngestCampaignFileOptions = {
  /**
   * Request public + approved for non-sensitive paths only. Finance / donor / etc. always stay
   * private + pending (see `sensitive-classification`).
   */
  publish: boolean;
  /** Human label: zip name or top-level folder name. */
  sourceBundle: string;
  /** Path within the bundle (use forward slashes). */
  relativePath: string;
  preset: CampaignIngestPreset;
  ingestFrom: "zip" | "folder" | "device";
  /** Optional: links asset to a `MediaIngestBatch` (folder / device runs). */
  mediaIngestBatchId?: string | null;
  /** Relative path under the data root for a preserved mirror copy (device ingest). */
  deviceIngestMirrorRelativePath?: string | null;
  /** Merged into `issueTags` and prepended to chunks for the brain (e.g. path-derived brain-* tags). */
  extraIssueTags?: string[] | null;
};

function recordTags(preset: CampaignIngestPreset): string[] {
  const primary =
    preset === "comms" ? COMMS_TAG : preset === "community-training" ? COMMUNITY_TRAINING_TAG : BRIEFING_TAG;
  return [primary, "secretary-of-state", "arkansas-campaign-2026"];
}

function normalizeRelPath(p: string): string {
  return p.split(path.sep).join("/");
}

/** One SearchChunk per binary so site search / assistant can find photos and videos by title + path. */
async function indexCampaignBinaryForSearch(input: {
  assetId: string;
  preset: CampaignIngestPreset;
  sourceBundle: string;
  relativePath: string;
  title: string;
  description: string;
  kind: "image" | "video" | "audio";
}): Promise<void> {
  if (!isOpenAIConfigured()) {
    return;
  }
  const presetLabel =
    input.preset === "comms"
      ? "Campaign communications media"
      : input.preset === "community-training"
        ? "Community support training media"
        : "Campaign briefing media";
  const kindLabel = input.kind === "image" ? "Image" : input.kind === "video" ? "Video" : "Audio";
  const content = [
    `${presetLabel} (${kindLabel}): ${input.title}`,
    input.description,
    `Source bundle: ${input.sourceBundle}`,
    `Path: ${input.relativePath}`,
    "Library asset — retrieve via owned campaign media API; embedding uses metadata only.",
  ].join("\n\n");
  const basePath = `campaign-media:${input.assetId}`;
  try {
    const [embedding] = await embedTexts([`${input.title}\n\n${content}`]);
    await prisma.searchChunk.upsert({
      where: { path_chunkIndex: { path: basePath, chunkIndex: 0 } },
      create: {
        path: basePath,
        title: `${kindLabel}: ${input.title}`,
        chunkIndex: 0,
        content: `${input.title}\n\n${content}`,
        embedding: JSON.stringify(embedding),
      },
      update: {
        title: `${kindLabel}: ${input.title}`,
        content: `${input.title}\n\n${content}`,
        embedding: JSON.stringify(embedding),
      },
    });
    // eslint-disable-next-line no-console
    console.log(`[ingest] search: 1 metadata chunk for ${input.kind} ${input.title}`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ingest] embedding failed (${input.kind} still saved): ${input.title}`,
      e instanceof Error ? e.message : e,
    );
  }
}

export function mimeForCampaignFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".docx") return DOCX;
  if (ext === ".pdf") return PDF;
  if (ext === ".html" || ext === ".htm") return "text/html; charset=utf-8";
  if (ext === ".txt" || ext === ".md") return "text/plain";
  if (ext === ".csv") return "text/csv";
  if (ext === ".xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === ".xls") return "application/vnd.ms-excel";
  if (ext === ".pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".heic") return "image/heic";
  if (ext === ".heif") return "image/heif";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".m4a") return "audio/mp4";
  return "application/octet-stream";
}

export function isImageExt(ext: string): boolean {
  return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic", ".heif"].includes(ext);
}

export function isVideoExt(ext: string): boolean {
  return [".mp4", ".webm", ".mov"].includes(ext);
}

export function isAudioExt(ext: string): boolean {
  return [".mp3", ".wav", ".m4a"].includes(ext);
}

export function isDocumentExt(ext: string): boolean {
  return [".docx", ".pdf", ".html", ".htm", ".txt", ".md", ".csv", ".xlsx", ".xls", ".pptx"].includes(ext);
}

export function supportedIngestExt(ext: string): boolean {
  return isDocumentExt(ext) || isImageExt(ext) || isVideoExt(ext) || isAudioExt(ext);
}

function extractSpreadsheetText(buffer: Buffer): string {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const parts: string[] = [];
  for (const name of wb.SheetNames) {
    const sh = wb.Sheets[name];
    if (!sh) continue;
    parts.push(`# Sheet: ${name}\n${XLSX.utils.sheet_to_csv(sh)}`);
  }
  return parts.join("\n\n");
}

/**
 * Ingest a single file buffer. Idempotent for duplicate content hash.
 */
export async function ingestCampaignFileBuffer(
  buffer: Buffer,
  entryName: string,
  options: IngestCampaignFileOptions
): Promise<{ id: string; title: string; skipped?: string }> {
  const fileName = path.basename(entryName);
  const ext = path.extname(fileName).toLowerCase();
  const rel = normalizeRelPath(options.relativePath || entryName);

  if (!supportedIngestExt(ext)) {
    return { id: "", title: fileName, skipped: "unsupported extension" };
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    return {
      id: "",
      title: fileName,
      skipped: `file too large (${buffer.length} bytes; max ${MAX_UPLOAD_BYTES}; set OWNED_MEDIA_MAX_BYTES to raise cap)`,
    };
  }

  const contentHash = createHash("sha256").update(buffer).digest("hex");
  const dupe = await prisma.ownedMediaAsset.findFirst({ where: { ingestContentSha256: contentHash } });
  if (dupe) {
    return { id: dupe.id, title: dupe.title, skipped: "duplicate hash (already in DB)" };
  }

  const id = randomUUID();
  const mime = mimeForCampaignFileName(fileName);
  if (mime === "application/octet-stream") {
    return { id: "", title: fileName, skipped: "unknown mime" };
  }

  const file = new File([new Uint8Array(buffer)], fileName, { type: mime });
  const saved = await saveOwnedMediaFile({ assetId: id, file });

  const baseTitle = fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Campaign file";
  const classification = classifyIngestPath(fileName, rel);
  const vis = resolveIngestVisibility({ wantsPublic: options.publish, fileName, relativePath: rel });
  const reviewStatus =
    vis.reviewStatus === "APPROVED" ? OwnedMediaReviewStatus.APPROVED : OwnedMediaReviewStatus.PENDING_REVIEW;
  const isPublic = vis.isPublic;
  const extra = options.extraIssueTags?.filter((t) => typeof t === "string" && t.trim().length > 0) ?? [];
  const tags = [
    ...recordTags(options.preset),
    ...extra,
    ...(classification.level === "SENSITIVE_ADMIN" ? (["ingest-sensitive-review"] as const) : []),
  ];
  const metaBase: Prisma.InputJsonValue = {
    ...(options.preset === "comms"
      ? { commsIngest: true }
      : options.preset === "community-training"
        ? { communitySupportTrainingIngest: true }
        : { briefingIngest: true }),
    ingestFrom: options.ingestFrom,
    ingestSourceBundle: options.sourceBundle,
    originalEntry: rel,
    ingestedAt: new Date().toISOString(),
    secretaryOfStateRecord: true,
    ingestClassification: { level: classification.level, reasons: classification.reasons },
    ...(options.deviceIngestMirrorRelativePath
      ? { deviceIngestMirror: options.deviceIngestMirrorRelativePath }
      : {}),
  };
  const batchId = options.mediaIngestBatchId?.trim() || null;

  if (isImageExt(ext)) {
    const desc =
      options.preset === "comms"
        ? "Campaign communications image — public record room (Secretary of State campaign)."
        : options.preset === "community-training"
          ? "Community support training image — public record room (Secretary of State campaign)."
          : "Campaign image — public record room. Review before wide release.";

    const imageMeta: Prisma.InputJsonValue = { ...metaBase, imageIngest: true };
    const asset = await prisma.ownedMediaAsset.create({
      data: {
        id,
        storageKey: saved.storageKey,
        storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
        publicUrl: null,
        fileName: saved.fileName,
        fileSizeBytes: saved.fileSizeBytes,
        mimeType: saved.mimeType,
        kind: OwnedMediaKind.IMAGE,
        role: OwnedMediaRole.OTHER,
        title: baseTitle,
        description: desc,
        sourceType: OwnedMediaSourceType.IMPORT,
        reviewStatus,
        isPublic,
        issueTags: tags,
        metadataJson: imageMeta,
        geoSource: GeoMetadataSource.NONE,
        needsGeoReview: false,
        ingestContentSha256: contentHash,
        localIngestRelativePath: rel,
        mediaIngestBatchId: batchId || undefined,
      },
    });
    await indexCampaignBinaryForSearch({
      assetId: asset.id,
      preset: options.preset,
      sourceBundle: options.sourceBundle,
      relativePath: rel,
      title: baseTitle,
      description: desc,
      kind: "image",
    });
    return { id: asset.id, title: baseTitle };
  }

  if (isVideoExt(ext) || isAudioExt(ext)) {
    const isVid = isVideoExt(ext);
    const desc = isVid
      ? "Campaign video — file stored; transcript optional in follow-up."
      : "Campaign audio — file stored; transcript optional in follow-up.";
    const mediaMeta: Prisma.InputJsonValue = { ...metaBase, [isVid ? "videoIngest" : "audioIngest"]: true };
    const asset = await prisma.ownedMediaAsset.create({
      data: {
        id,
        storageKey: saved.storageKey,
        storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
        publicUrl: null,
        fileName: saved.fileName,
        fileSizeBytes: saved.fileSizeBytes,
        mimeType: saved.mimeType,
        kind: isVid ? OwnedMediaKind.VIDEO : OwnedMediaKind.AUDIO,
        role: OwnedMediaRole.OTHER,
        title: baseTitle,
        description: desc,
        sourceType: OwnedMediaSourceType.IMPORT,
        reviewStatus,
        isPublic,
        issueTags: tags,
        metadataJson: mediaMeta,
        geoSource: GeoMetadataSource.NONE,
        needsGeoReview: false,
        ingestContentSha256: contentHash,
        localIngestRelativePath: rel,
        mediaIngestBatchId: batchId || undefined,
      },
    });
    await indexCampaignBinaryForSearch({
      assetId: asset.id,
      preset: options.preset,
      sourceBundle: options.sourceBundle,
      relativePath: rel,
      title: baseTitle,
      description: desc,
      kind: isVid ? "video" : "audio",
    });
    return { id: asset.id, title: baseTitle };
  }

  let text = "";
  if (ext === ".docx") {
    try {
      text = await extractTextFromDocxBuffer(buffer);
    } catch (e) {
      text = "";
      // eslint-disable-next-line no-console
      console.warn(`[ingest] docx text extract failed: ${fileName}`, e);
    }
  } else if (ext === ".txt" || ext === ".md") {
    text = buffer.toString("utf8");
  } else if (ext === ".csv") {
    try {
      text = buffer.toString("utf8");
    } catch {
      text = "";
    }
  } else if (ext === ".xlsx" || ext === ".xls") {
    try {
      text = extractSpreadsheetText(buffer);
    } catch (e) {
      text = "";
      // eslint-disable-next-line no-console
      console.warn(`[ingest] spreadsheet text extract failed: ${fileName}`, e);
    }
  } else if (ext === ".html" || ext === ".htm") {
    try {
      text = htmlToPlainText(buffer.toString("utf8"));
    } catch (e) {
      text = "";
      // eslint-disable-next-line no-console
      console.warn(`[ingest] html to text failed: ${fileName}`, e);
    }
  } else if (ext === ".pdf") {
    text = await extractPdfText(buffer);
    if (!text.length) {
      text = "[PDF: no extractable text (scanned or failed extraction). File is still stored.]";
    }
  } else if (ext === ".pptx") {
    text = `[PowerPoint: ${fileName} — file stored. Export to PDF for full text extraction in a follow-up.]`;
  }

  const descDoc =
    options.preset === "comms"
      ? "Campaign communications file — public record room (Secretary of State campaign)."
      : options.preset === "community-training"
        ? "Community support training material — public record (voter registration, field organizing, Secretary of State campaign)."
        : "Campaign briefing document — part of the public “record room” for the Secretary of State race. Review before wide release.";

  const asset = await prisma.ownedMediaAsset.create({
    data: {
      id,
      storageKey: saved.storageKey,
      storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
      publicUrl: null,
      fileName: saved.fileName,
      fileSizeBytes: saved.fileSizeBytes,
      mimeType: saved.mimeType,
      kind: (saved.kind as OwnedMediaKind) || OwnedMediaKind.DOCUMENT,
      role: OwnedMediaRole.OTHER,
      title: baseTitle,
      description: descDoc,
      sourceType: OwnedMediaSourceType.IMPORT,
      reviewStatus,
      isPublic,
      issueTags: tags,
      metadataJson: metaBase,
      geoSource: GeoMetadataSource.NONE,
      needsGeoReview: false,
      ingestContentSha256: contentHash,
      localIngestRelativePath: rel,
      mediaIngestBatchId: batchId || undefined,
    },
  });

  if (text && text.length > 20) {
    await prisma.ownedMediaTranscript.create({
      data: {
        ownedMediaId: asset.id,
        transcriptText: text,
        source: TranscriptSource.IMPORT,
        reviewStatus: TranscriptReviewStatus.PENDING,
      },
    });
  }

  if (isOpenAIConfigured() && text.length > 80) {
    try {
      const tagLine = extra.length ? `Tags: ${extra.join(", ")}\n` : "";
      const chunkSource = `${tagLine}Source: ${options.sourceBundle} / ${rel}\n\n${text}`;
      const chunks = chunkTextForSearch(chunkSource, 1800);
      const chunkCount = chunks.length;
      const isBrain = extra.includes("campaign-brain");
      const basePath = isBrain
        ? `brain-doc:${asset.id}`
        : options.preset === "comms"
          ? `comms-doc:${asset.id}`
          : options.preset === "community-training"
            ? `community-training-doc:${asset.id}`
            : `briefing-doc:${asset.id}`;
      const titleForChunk = baseTitle;
      const embedLabel =
        options.preset === "comms"
          ? "Campaign communications"
          : options.preset === "community-training"
            ? "Community support training"
            : "Campaign briefing";
      const tagHint = extra.length ? `${extra.slice(0, 10).join(", ")}. ` : "";
      const batch = 12;
      for (let i = 0; i < chunks.length; i += batch) {
        const slice = chunks.slice(i, i + batch);
        const embed = await embedTexts(
          slice.map(
            (c) => `${embedLabel} [${options.sourceBundle}]: ${titleForChunk}\n${tagHint}\n\n${c}`
          )
        );
        for (let j = 0; j < slice.length; j += 1) {
          const chunkIndex = i + j;
          const content = slice[j]!;
          await prisma.searchChunk.upsert({
            where: { path_chunkIndex: { path: basePath, chunkIndex } },
            create: {
              path: basePath,
              title: titleForChunk,
              chunkIndex,
              content: `${titleForChunk}\n\n${content}`,
              embedding: JSON.stringify(embed[j]!),
            },
            update: {
              content: `${titleForChunk}\n\n${content}`,
              embedding: JSON.stringify(embed[j]!),
              title: titleForChunk,
            },
          });
        }
      }
      // eslint-disable-next-line no-console
      console.log(`[ingest] search: ${chunkCount} chunks for ${fileName}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(
        `[ingest] embedding failed (document still saved): ${fileName}`,
        e instanceof Error ? e.message : e
      );
    }
  } else if (text.length > 80) {
    // eslint-disable-next-line no-console
    console.warn("[ingest] OPENAI_API_KEY not set; skipping search embeddings.");
  }

  return { id: asset.id, title: baseTitle };
}
