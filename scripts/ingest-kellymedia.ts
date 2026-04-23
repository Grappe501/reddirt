/**
 * Ingest Kellymedia folder: full EXIF + reverse-geocode → Prisma OwnedMediaAsset,
 * county/date metadata mirrors, one image per county+day “setting”, video + 12s B-roll clips,
 * public copies for the site, and generated content modules for “Hear Kelly”.
 *
 * Requires: DATABASE_URL, optional ffmpeg/ffprobe on PATH for video probes + B-roll.
 *
 * Usage (from RedDirt/):
 *   npm run ingest:kellymedia
 *   npx tsx scripts/ingest-kellymedia.ts --dir "H:/SOSWebsite/campaign information for ingestion/Kellymedia"
 *   npx tsx scripts/ingest-kellymedia.ts --dry-run
 *   npx tsx scripts/ingest-kellymedia.ts --vision-b-roll   # OpenAI vision to rank segments (uses OPENAI_API_KEY)
 */
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MediaIngestBatchStatus,
  OwnedMediaKind,
  OwnedMediaReviewStatus,
  OwnedMediaRole,
  OwnedMediaSourceType,
  OwnedMediaStorageBackend,
} from "@prisma/client";
import sharp from "sharp";
import { prisma } from "../src/lib/db";
import { extractOwnedMediaMetadata } from "../src/lib/owned-media/metadata/extract-owned-media-metadata";
import { saveOwnedMediaFile } from "../src/lib/owned-media/storage";
import { storageKeyToAbsoluteFilePath } from "../src/lib/owned-media/paths";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { isImageExt, isVideoExt, mimeForCampaignFileName } from "./ingest-campaign-files-core";
import { embedTexts } from "../src/lib/openai/embeddings";
import { isOpenAIConfigured } from "../src/lib/openai/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
loadRedDirtEnv(repoRoot);

const DEFAULT_DIR = path.resolve(
  repoRoot,
  "..",
  "campaign information for ingestion",
  "Kellymedia",
);

const SKIP_DIR = new Set(["node_modules", ".git", "__MACOSX", ".next"]);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function asJsonObject(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

function ymd(d: Date | null): string {
  if (!d || Number.isNaN(d.getTime())) return "undated";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function sanitizeFileBase(name: string): string {
  const base = path.basename(name, path.extname(name));
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "media"
  );
}

function commandOk(cmd: string): boolean {
  try {
    if (process.platform === "win32") {
      execFileSync("where.exe", [cmd], { stdio: "pipe" });
    } else {
      execFileSync("which", [cmd], { stdio: "pipe" });
    }
    return true;
  } catch {
    return false;
  }
}

function ffprobeDurationSeconds(filePath: string): number | null {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", filePath],
      { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    const j = JSON.parse(out) as { format?: { duration?: string } };
    const d = j.format?.duration != null ? Number(j.format.duration) : NaN;
    return Number.isFinite(d) && d > 0 ? d : null;
  } catch {
    return null;
  }
}

function ffprobeJson(filePath: string): Record<string, unknown> | null {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", filePath],
      { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    return JSON.parse(out) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function ffmpegExtractClip(input: string, startSec: number, outPath: string): void {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-ss",
      String(Math.max(0, startSec)),
      "-i",
      input,
      "-t",
      "12",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outPath,
    ],
    { stdio: "pipe" },
  );
}

function ffmpegFramePng(input: string, atSec: number, outPng: string): void {
  execFileSync(
    "ffmpeg",
    ["-y", "-ss", String(atSec), "-i", input, "-frames:v", "1", "-q:v", "2", outPng],
    { stdio: "pipe" },
  );
}

function suggestBrollStarts(durationSec: number, count: number): number[] {
  if (durationSec < 18) return [Math.max(0, durationSec * 0.1)];
  const margin = Math.min(8, durationSec * 0.08);
  const usable = durationSec - 12 - margin * 2;
  if (usable <= 0) return [margin];
  const n = Math.min(count, 3);
  if (n === 1) return [margin + usable / 2];
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(margin + (usable * (i + 1)) / (n + 1));
  }
  return out;
}

async function walkMediaFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;
      out.push(...(await walkMediaFiles(full)));
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (isImageExt(ext) || isVideoExt(ext)) out.push(full);
    }
  }
  return out;
}

async function writeArchiveMeta(args: {
  countySlug: string;
  dateFolder: string;
  baseName: string;
  payload: Record<string, unknown>;
}) {
  const root = path.join(repoRoot, "data", "kellymedia-archive", args.countySlug, args.dateFolder);
  await mkdir(root, { recursive: true });
  const fp = path.join(root, `${sanitizeFileBase(args.baseName)}.meta.json`);
  await writeFile(fp, JSON.stringify(args.payload, null, 2), "utf8");
}

async function copyImageToPublicWeb(absSource: string, destAbs: string, sourceExt: string): Promise<void> {
  await mkdir(path.dirname(destAbs), { recursive: true });
  const ext = sourceExt.toLowerCase();
  if (ext === ".heic" || ext === ".heif") {
    const buf = await readFile(absSource);
    const jpeg = await sharp(buf).rotate().jpeg({ quality: 88 }).toBuffer();
    const jpgDest = destAbs.replace(/\.[^.]+$/, ".jpg");
    await writeFile(jpgDest, jpeg);
    return;
  }
  await copyFile(absSource, destAbs);
}

async function indexSearchChunk(assetId: string, title: string, body: string): Promise<void> {
  if (!isOpenAIConfigured()) return;
  try {
    const [embedding] = await embedTexts([`${title}\n\n${body}`]);
    const basePath = `kellymedia:${assetId}`;
    await prisma.searchChunk.upsert({
      where: { path_chunkIndex: { path: basePath, chunkIndex: 0 } },
      create: {
        path: basePath,
        title: `Kellymedia: ${title}`,
        chunkIndex: 0,
        content: `${title}\n\n${body}`,
        embedding: JSON.stringify(embedding),
      },
      update: {
        title: `Kellymedia: ${title}`,
        content: `${title}\n\n${body}`,
        embedding: JSON.stringify(embedding),
      },
    });
  } catch {
    /* optional */
  }
}

async function main() {
  const dirPath = path.resolve(arg("--dir") ?? DEFAULT_DIR);
  const dry = hasFlag("--dry-run");
  const useVision = hasFlag("--vision-b-roll");

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const hasFfmpeg = commandOk("ffmpeg") && commandOk("ffprobe");
  if (!hasFfmpeg) {
    console.warn("[kellymedia] ffmpeg/ffprobe not found on PATH — video duration and B-roll extraction will be skipped.");
  }

  const all = await walkMediaFiles(dirPath);
  if (all.length === 0) {
    console.log(`[kellymedia] No images/videos under ${dirPath} (create the folder and add files).`);
    process.exit(0);
  }

  const imagePaths = all.filter((p) => isImageExt(path.extname(p).toLowerCase()));
  const videoPaths = all.filter((p) => isVideoExt(path.extname(p).toLowerCase()));

  type ImgScore = {
    abs: string;
    rel: string;
    key: string;
    pixels: number;
    capturedAt: Date | null;
    countySlug: string | null;
  };

  console.log(`[kellymedia] Scanning ${imagePaths.length} images for county+day dedupe…`);
  const scored: ImgScore[] = [];
  for (const abs of imagePaths) {
    const rel = path.relative(dirPath, abs);
    const buf = await readFile(abs);
    const st = await stat(abs);
    const fileName = path.basename(abs);
    const mime = mimeForCampaignFileName(fileName);
    const ex = await extractOwnedMediaMetadata({
      buffer: buf,
      fileName,
      mime,
      kind: OwnedMediaKind.IMAGE,
      fileStat: st,
    });
    const dateStr = ymd(ex.capturedAt);
    const cslug = ex.countySlug ?? "unknown-county";
    const key = `${cslug}|${dateStr}`;
    const pixels = ex.width && ex.height ? ex.width * ex.height : 0;
    scored.push({ abs, rel, key, pixels, capturedAt: ex.capturedAt, countySlug: ex.countySlug });
  }

  const bestByKey = new Map<string, ImgScore>();
  for (const row of scored) {
    const prev = bestByKey.get(row.key);
    if (!prev || row.pixels > prev.pixels) bestByKey.set(row.key, row);
  }
  const winningAbs = new Set([...bestByKey.values()].map((x) => x.abs));
  let skippedImg = 0;
  for (const row of scored) {
    if (!winningAbs.has(row.abs)) skippedImg += 1;
  }
  console.log(`[kellymedia] Images: ${winningAbs.size} settings kept, ${skippedImg} skipped (not best in county+day).`);

  const batch = dry
    ? null
    : await prisma.mediaIngestBatch.create({
        data: {
          sourceType: "FOLDER",
          sourceLabel: "Kellymedia",
          ingestPath: dirPath,
          status: MediaIngestBatchStatus.STARTED,
        },
      });

  const webPicks: { id: string; src: string; alt: string; countyLabel: string | null; recordedAt: string | null }[] =
    [];
  const speakClips: { id: string; title: string; src: string; countyLabel: string | null; recordedAt: string | null }[] =
    [];

  const metaBase = {
    kellymediaIngest: true,
    ingestSourceDir: dirPath,
    ingestedAt: new Date().toISOString(),
  };

  for (const abs of [...winningAbs]) {
    const rel = path.relative(dirPath, abs);
    const fileName = path.basename(abs);
    const buf = await readFile(abs);
    const st = await stat(abs);
    const contentHash = createHash("sha256").update(buf).digest("hex");
    const dupe = await prisma.ownedMediaAsset.findFirst({ where: { ingestContentSha256: contentHash } });
    if (dupe) {
      console.log(`[kellymedia] skip duplicate hash: ${rel}`);
      continue;
    }

    const mime = mimeForCampaignFileName(fileName);
    const extracted = await extractOwnedMediaMetadata({
      buffer: buf,
      fileName,
      mime,
      kind: OwnedMediaKind.IMAGE,
      fileStat: st,
    });
    const cslug = extracted.countySlug ?? "unknown-county";
    const dateFolder = ymd(extracted.capturedAt);

    if (dry) {
      console.log(`[dry-run] image ${rel} → ${cslug}/${dateFolder}`);
      continue;
    }

    const id = randomUUID();
    const file = new File([new Uint8Array(buf)], fileName, { type: mime });
    const saved = await saveOwnedMediaFile({ assetId: id, file });

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
        role: OwnedMediaRole.PHOTO,
        title: sanitizeFileBase(fileName).replace(/-/g, " ") || "Kellymedia photo",
        description: "Kellymedia ingest — field photo (one per county+day setting).",
        sourceType: OwnedMediaSourceType.IMPORT,
        reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
        isPublic: false,
        issueTags: ["kellymedia", "kellymedia-web-candidate", ...extracted.issueTagsFromFilename],
        metadataJson: { ...metaBase, ...asJsonObject(extracted.metadataJson) } as object,
        geoSource: extracted.geoSource,
        geoConfidence: extracted.geoConfidence,
        needsGeoReview: extracted.needsGeoReview,
        gpsLat: extracted.gpsLat,
        gpsLng: extracted.gpsLng,
        capturedAt: extracted.capturedAt,
        eventDate: extracted.capturedAt,
        width: extracted.width,
        height: extracted.height,
        countySlug: extracted.countySlug,
        countyFips: extracted.countyFips,
        city: extracted.city,
        ingestContentSha256: contentHash,
        localIngestRelativePath: rel.split(path.sep).join("/"),
        mediaIngestBatchId: batch?.id,
        speakerName: "Kelly Grappe",
      },
    });

    await writeArchiveMeta({
      countySlug: cslug,
      dateFolder,
      baseName: fileName,
      payload: {
        assetId: asset.id,
        storageKey: saved.storageKey,
        relativeSource: rel,
        extracted,
        dataRootFile: storageKeyToAbsoluteFilePath(saved.storageKey),
      },
    });

    const extLower = path.extname(fileName).toLowerCase();
    const pubExt =
      extLower === ".png"
        ? ".png"
        : extLower === ".webp"
          ? ".webp"
          : extLower === ".gif"
            ? ".gif"
            : extLower === ".heic" || extLower === ".heif"
              ? ".jpg"
              : ".jpg";
    const pubRel = path.posix.join(
      "media",
      "kellymedia",
      cslug,
      dateFolder,
      `${asset.id.slice(0, 8)}-${sanitizeFileBase(fileName)}${pubExt}`,
    );
    const pubAbs = path.join(repoRoot, "public", ...pubRel.split("/"));
    try {
      await copyImageToPublicWeb(storageKeyToAbsoluteFilePath(saved.storageKey), pubAbs, extLower);
    } catch (e) {
      console.warn(`[kellymedia] public copy failed ${rel}`, e);
    }

    webPicks.push({
      id: asset.id,
      src: `/${pubRel.replace(/\\/g, "/")}`.replace(/\/+/g, "/"),
      alt: `Kelly Grappe — ${extracted.city ?? cslug.replace(/-/g, " ")} (${dateFolder})`,
      countyLabel: extracted.countySlug,
      recordedAt: extracted.capturedAt?.toISOString() ?? null,
    });

    await indexSearchChunk(
      asset.id,
      asset.title,
      `${asset.description}\nCounty: ${cslug}\nDate: ${dateFolder}\nPath: ${rel}`,
    );
    console.log(`[kellymedia] image OK ${rel} → asset ${asset.id}`);
  }

  for (const abs of videoPaths) {
    const rel = path.relative(dirPath, abs);
    const fileName = path.basename(abs);
    const buf = await readFile(abs);
    const st = await stat(abs);
    const contentHash = createHash("sha256").update(buf).digest("hex");
    const dupe = await prisma.ownedMediaAsset.findFirst({ where: { ingestContentSha256: contentHash } });
    if (dupe) {
      console.log(`[kellymedia] skip duplicate video hash: ${rel}`);
      continue;
    }

    const mime = mimeForCampaignFileName(fileName);
    const extracted = await extractOwnedMediaMetadata({
      buffer: buf,
      fileName,
      mime,
      kind: OwnedMediaKind.VIDEO,
      fileStat: st,
    });
    const probe = hasFfmpeg ? ffprobeJson(abs) : null;
    const durationSec = hasFfmpeg ? ffprobeDurationSeconds(abs) : null;
    const cslug = extracted.countySlug ?? "unknown-county";
    const dateFolder = ymd(extracted.capturedAt);

    if (dry) {
      console.log(`[dry-run] video ${rel} → ${cslug}/${dateFolder} dur=${durationSec}`);
      continue;
    }

    const id = randomUUID();
    const file = new File([new Uint8Array(buf)], fileName, { type: mime });
    const saved = await saveOwnedMediaFile({ assetId: id, file });

    const parent = await prisma.ownedMediaAsset.create({
      data: {
        id,
        storageKey: saved.storageKey,
        storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
        publicUrl: null,
        fileName: saved.fileName,
        fileSizeBytes: saved.fileSizeBytes,
        mimeType: saved.mimeType,
        kind: OwnedMediaKind.VIDEO,
        role: OwnedMediaRole.SPEECH,
        title: sanitizeFileBase(fileName).replace(/-/g, " ") || "Kellymedia video",
        description: "Kellymedia ingest — full speech / event video.",
        sourceType: OwnedMediaSourceType.IMPORT,
        reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
        isPublic: false,
        issueTags: ["kellymedia", "kelly-speak-full", ...extracted.issueTagsFromFilename],
        metadataJson: {
          ...metaBase,
          ...asJsonObject(extracted.metadataJson),
          ffprobe: probe,
        } as object,
        geoSource: extracted.geoSource,
        geoConfidence: extracted.geoConfidence,
        needsGeoReview: extracted.needsGeoReview,
        gpsLat: extracted.gpsLat,
        gpsLng: extracted.gpsLng,
        capturedAt: extracted.capturedAt,
        eventDate: extracted.capturedAt,
        durationSeconds: durationSec != null ? Math.round(durationSec) : null,
        countySlug: extracted.countySlug,
        countyFips: extracted.countyFips,
        city: extracted.city,
        ingestContentSha256: contentHash,
        localIngestRelativePath: rel.split(path.sep).join("/"),
        mediaIngestBatchId: batch?.id,
        speakerName: "Kelly Grappe",
      },
    });

    await writeArchiveMeta({
      countySlug: cslug,
      dateFolder,
      baseName: fileName,
      payload: {
        assetId: parent.id,
        storageKey: saved.storageKey,
        ffprobe: probe,
        durationSeconds: durationSec,
        relativeSource: rel,
      },
    });

    const absStored = storageKeyToAbsoluteFilePath(saved.storageKey);
    const fullPubDir = path.join(repoRoot, "public", "media", "kelly-speak", "full");
    await mkdir(fullPubDir, { recursive: true });
    const fullPubName = `${parent.id.slice(0, 8)}-${sanitizeFileBase(fileName)}${path.extname(fileName).toLowerCase() || ".mp4"}`;
    const fullPubAbs = path.join(fullPubDir, fullPubName);
    try {
      await copyFile(absStored, fullPubAbs);
      speakClips.push({
        id: parent.id,
        title: `${parent.title} (full)`,
        src: `/media/kelly-speak/full/${fullPubName}`,
        countyLabel: extracted.countySlug,
        recordedAt: extracted.capturedAt?.toISOString() ?? null,
      });
    } catch (e) {
      console.warn(`[kellymedia] full video public copy failed`, e);
    }

    if (hasFfmpeg && durationSec && durationSec > 6) {
      let starts = suggestBrollStarts(durationSec, 3);
      if (useVision && isOpenAIConfigured()) {
        starts = await rankBrollWithVision(absStored, durationSec, starts);
      }
      const clipDir = path.join(repoRoot, "public", "media", "kelly-speak", "clips");
      await mkdir(clipDir, { recursive: true });
      let clipIdx = 0;
      for (const start of starts.slice(0, 3)) {
        clipIdx += 1;
        const clipFile = `${parent.id.slice(0, 8)}-broll-${clipIdx}.mp4`;
        const clipAbs = path.join(clipDir, clipFile);
        try {
          ffmpegExtractClip(absStored, start, clipAbs);
        } catch (e) {
          console.warn(`[kellymedia] ffmpeg clip ${clipIdx} failed`, e);
          continue;
        }
        const clipBuf = await readFile(clipAbs);
        const clipHash = createHash("sha256").update(clipBuf).digest("hex");
        const clipDupe = await prisma.ownedMediaAsset.findFirst({ where: { ingestContentSha256: clipHash } });
        if (clipDupe) continue;

        const clipId = randomUUID();
        const clipFileObj = new File([new Uint8Array(clipBuf)], clipFile, { type: "video/mp4" });
        const clipSaved = await saveOwnedMediaFile({ assetId: clipId, file: clipFileObj });

        await prisma.ownedMediaAsset.create({
          data: {
            id: clipId,
            storageKey: clipSaved.storageKey,
            storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
            fileName: clipSaved.fileName,
            fileSizeBytes: clipSaved.fileSizeBytes,
            mimeType: clipSaved.mimeType,
            kind: OwnedMediaKind.VIDEO,
            role: OwnedMediaRole.B_ROLL,
            title: `${parent.title} — B-roll ${clipIdx}`,
            description: `12s B-roll from Kellymedia parent ${parent.id} @ ${start.toFixed(1)}s`,
            sourceType: OwnedMediaSourceType.IMPORT,
            reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
            isPublic: false,
            issueTags: ["kellymedia", "kelly-speak-b-roll"],
            metadataJson: {
              ...metaBase,
              parentAssetId: parent.id,
              brollIndex: clipIdx,
              startSec: start,
              durationSec: 12,
            } as object,
            durationSeconds: 12,
            countySlug: extracted.countySlug,
            capturedAt: extracted.capturedAt,
            eventDate: extracted.capturedAt,
            ingestContentSha256: clipHash,
            mediaIngestBatchId: batch?.id,
            speakerName: "Kelly Grappe",
            enrichmentMetadata: useVision ? { visionRanked: true } : undefined,
          },
        });

        speakClips.push({
          id: clipId,
          title: `${parent.title} — clip ${clipIdx}`,
          src: `/media/kelly-speak/clips/${clipFile}`,
          countyLabel: extracted.countySlug,
          recordedAt: extracted.capturedAt?.toISOString() ?? null,
        });
      }
    }

    await indexSearchChunk(
      parent.id,
      parent.title,
      `${parent.description}\nCounty: ${cslug}\nDate: ${dateFolder}\nDuration: ${durationSec}\nPath: ${rel}`,
    );
    console.log(`[kellymedia] video OK ${rel} → asset ${parent.id}`);
  }

  if (batch && !dry) {
    await prisma.mediaIngestBatch.update({
      where: { id: batch.id },
      data: {
        status: MediaIngestBatchStatus.COMPLETE,
        finishedAt: new Date(),
        importedCount: webPicks.length + videoPaths.length,
        notes: `Kellymedia: ${webPicks.length} images, videos processed from ${dirPath}`,
      },
    });
  }

  const clipsTs = path.join(repoRoot, "src", "content", "media", "kelly-speak-clips.generated.ts");
  const picksTs = path.join(repoRoot, "src", "content", "media", "kellymedia-web-picks.generated.ts");

  const emitClips = `/**
 * Auto-generated by \`npm run ingest:kellymedia\` — B-roll and speech clips for “Hear Kelly”.
 * Do not edit by hand.
 */
export type KellySpeakClip = {
  id: string;
  title: string;
  /** Public URL under /public */
  src: string;
  countyLabel?: string | null;
  recordedAt?: string | null;
};

export const kellySpeakIngestClips: KellySpeakClip[] = ${JSON.stringify(speakClips, null, 2)};
`;

  const emitPicks = `/**
 * Auto-generated by \`npm run ingest:kellymedia\` — one image per county+day setting.
 */
export type KellymediaWebPick = {
  id: string;
  src: string;
  alt: string;
  countyLabel?: string | null;
  recordedAt?: string | null;
};

export const kellymediaWebPicks: KellymediaWebPick[] = ${JSON.stringify(webPicks, null, 2)};
`;

  if (!dry) {
    await writeFile(clipsTs, emitClips, "utf8");
    await writeFile(picksTs, emitPicks, "utf8");
  }

  console.log(
    `[kellymedia] Done. Web picks: ${webPicks.length}, speak clips entries: ${speakClips.length}. ` +
      (dry ? "(dry-run — no DB writes)" : `Archive: data/kellymedia-archive/ · Regenerated ${path.basename(clipsTs)}, ${path.basename(picksTs)}`),
  );
}

/** Optional: use OpenAI to re-rank segment starts (rough motion/Kelly heuristic). */
async function rankBrollWithVision(
  videoPath: string,
  durationSec: number,
  candidates: number[],
): Promise<number[]> {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return candidates;
  const client = new OpenAI({ apiKey });
  const tmpDir = path.join(repoRoot, "data", "tmp-kellymedia-frames");
  await mkdir(tmpDir, { recursive: true });

  const scores: { start: number; score: number }[] = [];
  for (const start of candidates) {
    const png = path.join(tmpDir, `frame-${start.toFixed(1)}.png`);
    try {
      ffmpegFramePng(videoPath, start + 0.25, png);
      const b64 = (await readFile(png)).toString("base64");
      const res = await client.chat.completions.create({
        model: process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini",
        max_tokens: 80,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'This is a frame from a campaign video. Rate 0-10 how suitable it is for a 12s B-roll clip: Kelly Grappe clearly visible, engaging posture, not blurry. Reply with JSON only: {"score":number,"reason":string}',
              },
              { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
            ],
          },
        ],
      });
      const raw = res.choices[0]?.message?.content ?? "{}";
      const m = raw.match(/\{[\s\S]*\}/);
      let score = 5;
      try {
        const j = JSON.parse(m?.[0] ?? "{}") as { score?: number };
        if (typeof j.score === "number" && Number.isFinite(j.score)) score = j.score;
      } catch {
        /* ignore */
      }
      scores.push({ start, score });
    } catch {
      scores.push({ start, score: 5 });
    }
  }
  scores.sort((a, b) => b.score - a.score);
  const picked = scores.slice(0, 3).map((s) => s.start);
  if (picked.length >= 2) return picked;
  return suggestBrollStarts(durationSec, 3);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
