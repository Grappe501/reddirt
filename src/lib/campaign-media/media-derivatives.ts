import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import {
  coverCropRect,
  normalizeFocus,
  parseCropAdviceToKind,
  type FocusPoint,
} from "@/lib/campaign-media/focus-crop";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import type {
  MediaDerivativesLedger,
  PhotoDerivativeBatchRun,
  PhotoDerivativeKind,
  PhotoDerivativeRecord,
  PhotoPixelInspect,
  VideoExcerptClip,
  VideoExcerptPlan,
} from "@/lib/campaign-media/media-derivatives-types";
import { loadWorkspaceRecord } from "@/lib/media/youtube-transcripts/workspace-store";

export type {
  MediaDerivativesLedger,
  PhotoDerivativeBatchRun,
  PhotoDerivativeKind,
  PhotoDerivativeRecord,
  PhotoPixelInspect,
  VideoExcerptClip,
  VideoExcerptPlan,
} from "@/lib/campaign-media/media-derivatives-types";

/**
 * Local media ops (sharp / optional ffmpeg). Prefer calling only from server actions / CLI.
 * No `server-only` so smoke scripts can import; clients must use media-derivatives-types only.
 */

export const MEDIA_DERIVATIVES_LEDGER_REL = "data/campaign-media/media-derivatives.json";
export const MEDIA_DERIVATIVES_PUBLIC_REL = "public/media/campaign-derivatives";

export const BATCH_DERIVATIVE_KINDS = [
  "web_max",
  "thumb",
  "hero_16x9",
  "portrait_4x5",
  "square_1x1",
  "auto_orient",
  "focus_hero_16x9",
  "focus_portrait_4x5",
  "focus_square_1x1",
] as const;

export type BatchDerivativeKind = (typeof BATCH_DERIVATIVE_KINDS)[number];

function repoRoot(): string {
  return process.cwd();
}

function abs(rel: string): string {
  return path.join(repoRoot(), rel);
}

function emptyLedger(): MediaDerivativesLedger {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Non-destructive photo/video derivatives and edit plans. Originals under campaign-photos are never overwritten.",
    photos: [],
    videoPlans: [],
    batchRuns: [],
  };
}

export function loadMediaDerivativesLedger(): MediaDerivativesLedger {
  const p = abs(MEDIA_DERIVATIVES_LEDGER_REL);
  if (!existsSync(p)) return emptyLedger();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<MediaDerivativesLedger>;
    return {
      ...emptyLedger(),
      ...raw,
      version: 1,
      photos: Array.isArray(raw.photos) ? raw.photos : [],
      videoPlans: Array.isArray(raw.videoPlans) ? raw.videoPlans : [],
      batchRuns: Array.isArray(raw.batchRuns) ? raw.batchRuns : [],
    };
  } catch {
    return emptyLedger();
  }
}

function saveLedger(ledger: MediaDerivativesLedger): void {
  const target = abs(MEDIA_DERIVATIVES_LEDGER_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  const next: MediaDerivativesLedger = {
    ...ledger,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  const tmp = `${target}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  renameSync(tmp, target);
}

function livePhotoById(photoId: string) {
  return listCampaignPhotosLive().find((p) => p.id === photoId) ?? null;
}

function resolvePublicImageAbs(src: string): string | null {
  if (!src.startsWith("/")) return null;
  const candidate = abs(path.join("public", src.replace(/^\//, "")));
  if (!existsSync(candidate)) return null;
  return candidate;
}

function decodePublicSrcToAbs(src: string): string | null {
  if (!src.startsWith("/")) return null;
  // Prefer decoded path for nested encoded URLs.
  const rel = src.replace(/^\//, "");
  try {
    const decoded = decodeURIComponent(rel);
    const a = abs(path.join("public", decoded));
    if (existsSync(a)) return a;
  } catch {
    /* ignore */
  }
  return resolvePublicImageAbs(src);
}

export async function inspectPhotoPixels(input: {
  photoId?: string;
  src?: string;
}): Promise<PhotoPixelInspect> {
  const photo = input.photoId ? livePhotoById(input.photoId) : null;
  const src = photo?.src ?? input.src ?? null;
  if (!src) {
    return {
      found: false,
      photoId: input.photoId ?? null,
      src: null,
      absPath: null,
      bytes: null,
      format: null,
      width: null,
      height: null,
      orientation: null,
      space: null,
      hasAlpha: null,
      density: null,
      aspectRatio: null,
      isLandscape: null,
      isPortrait: null,
      reason: "No photoId or src.",
    };
  }
  const fileAbs = decodePublicSrcToAbs(src);
  if (!fileAbs) {
    return {
      found: false,
      photoId: photo?.id ?? input.photoId ?? null,
      src,
      absPath: null,
      bytes: null,
      format: null,
      width: null,
      height: null,
      orientation: null,
      space: null,
      hasAlpha: null,
      density: null,
      aspectRatio: null,
      isLandscape: null,
      isPortrait: null,
      reason: "File missing on disk.",
    };
  }
  const st = statSync(fileAbs);
  const meta = await sharp(fileAbs).metadata();
  const width = meta.width ?? null;
  const height = meta.height ?? null;
  const aspect = width && height ? width / height : null;
  return {
    found: true,
    photoId: photo?.id ?? input.photoId ?? null,
    src,
    absPath: path.relative(repoRoot(), fileAbs).split(path.sep).join("/"),
    bytes: st.size,
    format: meta.format ?? null,
    width,
    height,
    orientation: meta.orientation ?? null,
    space: meta.space ?? null,
    hasAlpha: meta.hasAlpha ?? null,
    density: meta.density ?? null,
    aspectRatio: aspect,
    isLandscape: aspect != null ? aspect > 1.05 : null,
    isPortrait: aspect != null ? aspect < 0.95 : null,
  };
}

export type CropPlanSuggestion = {
  photoId: string;
  src: string;
  width: number;
  height: number;
  recommended: Array<{
    kind: Exclude<PhotoDerivativeKind, "inspect_only">;
    why: string;
    targetAspect?: string;
  }>;
};

export async function suggestCropPlan(photoId: string): Promise<
  | { ok: true; plan: CropPlanSuggestion }
  | { ok: false; error: string }
> {
  const inspect = await inspectPhotoPixels({ photoId });
  if (!inspect.found || !inspect.width || !inspect.height || !inspect.src) {
    return { ok: false, error: inspect.reason ?? "Cannot inspect photo." };
  }
  const recommended: CropPlanSuggestion["recommended"] = [
    { kind: "web_max", why: "Fast web delivery without overwriting the original." },
    { kind: "thumb", why: "Album grid / workbench thumbnail." },
  ];
  if (inspect.isLandscape) {
    recommended.push({
      kind: "hero_16x9",
      why: "Landscape source suits homepage / journey hero crops.",
      targetAspect: "16:9",
    });
    recommended.push({
      kind: "focus_hero_16x9",
      why: "Set a focus point, then crop 16:9 around the subject.",
      targetAspect: "16:9",
    });
    recommended.push({
      kind: "square_1x1",
      why: "Center square for social / avatar-style placements.",
      targetAspect: "1:1",
    });
  } else if (inspect.isPortrait) {
    recommended.push({
      kind: "portrait_4x5",
      why: "Portrait source suits Stories / vertical social crops.",
      targetAspect: "4:5",
    });
    recommended.push({
      kind: "focus_portrait_4x5",
      why: "Set a focus point, then crop 4:5 around the subject.",
      targetAspect: "4:5",
    });
    recommended.push({
      kind: "square_1x1",
      why: "Center square from portrait for grids.",
      targetAspect: "1:1",
    });
  } else {
    recommended.push({
      kind: "square_1x1",
      why: "Near-square source — keep 1:1 for consistency.",
      targetAspect: "1:1",
    });
    recommended.push({
      kind: "focus_square_1x1",
      why: "Set a focus point for a tighter square crop.",
      targetAspect: "1:1",
    });
  }
  if (inspect.orientation && inspect.orientation > 1) {
    recommended.unshift({
      kind: "auto_orient",
      why: `EXIF orientation=${inspect.orientation} — write an oriented copy for editors that ignore EXIF.`,
    });
  }
  return {
    ok: true,
    plan: {
      photoId,
      src: inspect.src,
      width: inspect.width,
      height: inspect.height,
      recommended,
    },
  };
}

type CreateInput = {
  photoId: string;
  kind: Exclude<PhotoDerivativeKind, "inspect_only">;
  /** Longest edge for web_max / thumb (default 1600 / 480). */
  maxEdge?: number;
  quality?: number;
  note?: string;
  /** Normalized focus (0–1). Used by focus_* kinds and optional override for cover kinds. */
  focusX?: number;
  focusY?: number;
};

function kindDefaults(kind: CreateInput["kind"]): { maxEdge: number; quality: number; ext: "jpg" | "webp" } {
  switch (kind) {
    case "thumb":
      return { maxEdge: 480, quality: 78, ext: "jpg" };
    case "web_max":
      return { maxEdge: 1600, quality: 82, ext: "jpg" };
    case "auto_orient":
      return { maxEdge: 4000, quality: 90, ext: "jpg" };
    case "focus_hero_16x9":
    case "focus_portrait_4x5":
    case "focus_square_1x1":
      return { maxEdge: 1600, quality: 85, ext: "jpg" };
    default:
      return { maxEdge: 1600, quality: 85, ext: "jpg" };
  }
}

async function applyKind(
  pipeline: sharp.Sharp,
  kind: CreateInput["kind"],
  maxEdge: number,
  focus: FocusPoint | null,
  meta: { width?: number; height?: number },
): Promise<sharp.Sharp> {
  const oriented = pipeline.rotate(); // honor EXIF
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;

  const focusCover = async (
    outW: number,
    outH: number,
    aspect: number,
    preferFocus: boolean,
  ): Promise<sharp.Sharp> => {
    if (preferFocus && focus && srcW > 0 && srcH > 0) {
      const rect = coverCropRect({
        srcWidth: srcW,
        srcHeight: srcH,
        targetAspect: aspect,
        focus,
      });
      return oriented.extract(rect).resize({ width: outW, height: outH, fit: "fill" });
    }
    return oriented.resize({
      width: outW,
      height: outH,
      fit: "cover",
      position: "attention",
    });
  };

  switch (kind) {
    case "auto_orient":
      return oriented.resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      });
    case "web_max":
    case "thumb":
      return oriented.resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      });
    case "hero_16x9": {
      const w = Math.min(maxEdge, 1920);
      return focusCover(w, Math.round((w * 9) / 16), 16 / 9, Boolean(focus));
    }
    case "focus_hero_16x9": {
      const w = Math.min(maxEdge, 1920);
      return focusCover(w, Math.round((w * 9) / 16), 16 / 9, true);
    }
    case "portrait_4x5": {
      const w = Math.min(maxEdge, 1080);
      return focusCover(w, Math.round((w * 5) / 4), 4 / 5, Boolean(focus));
    }
    case "focus_portrait_4x5": {
      const w = Math.min(maxEdge, 1080);
      return focusCover(w, Math.round((w * 5) / 4), 4 / 5, true);
    }
    case "square_1x1": {
      const edge = Math.min(maxEdge, 1200);
      return focusCover(edge, edge, 1, Boolean(focus));
    }
    case "focus_square_1x1": {
      const edge = Math.min(maxEdge, 1200);
      return focusCover(edge, edge, 1, true);
    }
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export async function createPhotoDerivative(
  input: CreateInput,
): Promise<{ ok: true; record: PhotoDerivativeRecord } | { ok: false; error: string }> {
  const photo = livePhotoById(input.photoId);
  if (!photo) return { ok: false, error: `Photo not found: ${input.photoId}` };

  const registryBase =
    CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === input.photoId) ??
    loadPhotoIngestDrafts().photos.find((p) => p.id === input.photoId) ??
    null;
  const registrySrc = registryBase?.src ?? photo.src;
  const sourceAbs = decodePublicSrcToAbs(registrySrc);
  if (!sourceAbs) return { ok: false, error: `Source file missing for ${registrySrc}` };

  if (sourceAbs.includes(`${path.sep}campaign-derivatives${path.sep}`)) {
    return { ok: false, error: "Refusing to use a derivative as a new source." };
  }

  const focus = normalizeFocus({ x: input.focusX, y: input.focusY });
  const requiresFocus = input.kind.startsWith("focus_");
  if (requiresFocus && !focus) {
    return {
      ok: false,
      error: "Focus point required for focus_* crops — click the photo or pass focusX/focusY.",
    };
  }

  const defaults = kindDefaults(input.kind);
  const maxEdge = input.maxEdge && input.maxEdge > 64 ? Math.min(Math.floor(input.maxEdge), 4000) : defaults.maxEdge;
  const quality = input.quality && input.quality > 40 ? Math.min(Math.floor(input.quality), 95) : defaults.quality;

  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, input.photoId);
  const outDirAbs = abs(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
  const focusTag = focus ? `-f${Math.round(focus.x * 100)}x${Math.round(focus.y * 100)}` : "";
  const filename = `${input.kind}${focusTag}-${stamp}.${defaults.ext}`;
  const outAbs = path.join(outDirAbs, filename);
  const tmpAbs = `${outAbs}.${process.pid}.tmp`;

  try {
    const meta = await sharp(sourceAbs, { failOn: "none" }).rotate().metadata();
    let pipeline = sharp(sourceAbs, { failOn: "none" });
    pipeline = await applyKind(pipeline, input.kind, maxEdge, focus, {
      width: meta.width,
      height: meta.height,
    });
    await pipeline.jpeg({ quality, mozjpeg: true }).toFile(tmpAbs);
    renameSync(tmpAbs, outAbs);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Derivative write failed." };
  }

  const outMeta = await sharp(outAbs).metadata();
  const st = statSync(outAbs);
  const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
  const publicSrc = `/media/campaign-derivatives/${input.photoId}/${filename}`;
  const record: PhotoDerivativeRecord = {
    id: `${input.photoId}--${input.kind}--${stamp}`,
    sourcePhotoId: input.photoId,
    sourceSrc: registrySrc,
    kind: input.kind,
    publicSrc,
    relativePath,
    width: outMeta.width ?? 0,
    height: outMeta.height ?? 0,
    bytes: st.size,
    format: outMeta.format ?? defaults.ext,
    createdAt: new Date().toISOString(),
    note: input.note,
    focusX: focus?.x,
    focusY: focus?.y,
  };

  const ledger = loadMediaDerivativesLedger();
  ledger.photos = [record, ...ledger.photos.filter((r) => r.id !== record.id)].slice(0, 500);
  saveLedger(ledger);
  return { ok: true, record };
}

/**
 * Create a focus crop from AI/operator cropAdvice text + optional focus point.
 */
export async function createDerivativeFromCropAdvice(input: {
  photoId: string;
  cropAdvice: string;
  focusX?: number;
  focusY?: number;
  note?: string;
}): Promise<
  | { ok: true; record: PhotoDerivativeRecord; mappedKind: string; reason: string }
  | { ok: false; error: string }
> {
  const advice = String(input.cropAdvice ?? "").trim();
  if (!advice) return { ok: false, error: "cropAdvice required." };
  const mapped = parseCropAdviceToKind(advice);
  const result = await createPhotoDerivative({
    photoId: input.photoId,
    kind: mapped.kind,
    focusX: input.focusX,
    focusY: input.focusY,
    note: input.note ?? `cropAdvice: ${advice.slice(0, 120)}`,
  });
  if (!result.ok) return result;
  return { ok: true, record: result.record, mappedKind: mapped.kind, reason: mapped.reason };
}

export type BatchCreatePhotoDerivativesResult = {
  ok: boolean;
  batchRunId: string;
  created: PhotoDerivativeRecord[];
  errors: Array<{ photoId: string; kind: string; error: string }>;
  createdCount: number;
  errorCount: number;
  totalOps: number;
  completedOps: number;
  message: string;
};

/**
 * Create non-destructive derivatives for many photos × kinds.
 * Caps: 40 photos, 4 kinds (160 ops max). Originals never overwritten.
 */
export async function batchCreatePhotoDerivatives(input: {
  photoIds: string[];
  kinds: string[];
  maxEdge?: number;
  quality?: number;
  note?: string;
  /** Optional progress callback (photo index / total photos). */
  onProgress?: (progress: {
    photoIndex: number;
    photoTotal: number;
    photoId: string;
    kind: string;
    completedOps: number;
    totalOps: number;
  }) => void;
}): Promise<BatchCreatePhotoDerivativesResult> {
  const allowed = new Set<string>(BATCH_DERIVATIVE_KINDS);
  const kinds = [...new Set(input.kinds.map((k) => String(k).trim()).filter((k) => allowed.has(k)))]
    .slice(0, 4) as BatchDerivativeKind[];
  const photoIds = [...new Set(input.photoIds.map((id) => String(id).trim()).filter(Boolean))].slice(
    0,
    40,
  );

  const batchRunId = `batch-deriv-${Date.now()}`;
  if (!kinds.length || !photoIds.length) {
    return {
      ok: false,
      batchRunId,
      created: [],
      errors: [],
      createdCount: 0,
      errorCount: 0,
      totalOps: 0,
      completedOps: 0,
      message: "Select at least one photo and one derivative kind.",
    };
  }

  const totalOps = photoIds.length * kinds.length;
  const created: PhotoDerivativeRecord[] = [];
  const errors: Array<{ photoId: string; kind: string; error: string }> = [];
  let completedOps = 0;

  for (let i = 0; i < photoIds.length; i++) {
    const photoId = photoIds[i]!;
    for (const kind of kinds) {
      input.onProgress?.({
        photoIndex: i + 1,
        photoTotal: photoIds.length,
        photoId,
        kind,
        completedOps,
        totalOps,
      });
      const result = await createPhotoDerivative({
        photoId,
        kind,
        maxEdge: input.maxEdge,
        quality: input.quality,
        note: input.note ?? `batch:${batchRunId}`,
      });
      completedOps += 1;
      if (result.ok) created.push(result.record);
      else errors.push({ photoId, kind, error: result.error });
    }
  }

  const run: PhotoDerivativeBatchRun = {
    id: batchRunId,
    createdAt: new Date().toISOString(),
    photoIds,
    kinds,
    createdCount: created.length,
    errorCount: errors.length,
    note: input.note,
  };
  const ledger = loadMediaDerivativesLedger();
  ledger.batchRuns = [run, ...(ledger.batchRuns ?? [])].slice(0, 50);
  saveLedger(ledger);

  const ok = created.length > 0;
  return {
    ok,
    batchRunId,
    created,
    errors,
    createdCount: created.length,
    errorCount: errors.length,
    totalOps,
    completedOps,
    message: ok
      ? `Batch derivatives: created ${created.length}/${totalOps}` +
        (errors.length ? ` (${errors.length} failed)` : "") +
        ` · run ${batchRunId}`
      : `Batch derivatives failed — ${errors[0]?.error ?? "nothing created."}`,
  };
}

export function listPhotoDerivatives(photoId?: string): PhotoDerivativeRecord[] {
  const ledger = loadMediaDerivativesLedger();
  const rows = photoId ? ledger.photos.filter((p) => p.sourcePhotoId === photoId) : ledger.photos;
  return rows.filter((r) => existsSync(abs(r.relativePath)));
}

export function probeVideoTooling(): {
  ffmpegAvailable: boolean;
  ffprobeAvailable: boolean;
  ffmpegPath: string | null;
  ffprobePath: string | null;
  note: string;
} {
  const find = (bin: string): string | null => {
    try {
      const out = execFileSync(process.platform === "win32" ? "where.exe" : "which", [bin], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      })
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)[0];
      return out || null;
    } catch {
      return null;
    }
  };
  const ffmpegPath = find("ffmpeg");
  const ffprobePath = find("ffprobe");
  return {
    ffmpegAvailable: Boolean(ffmpegPath),
    ffprobeAvailable: Boolean(ffprobePath),
    ffmpegPath,
    ffprobePath,
    note: ffmpegPath
      ? "ffmpeg is available for local frame extraction when a local video file exists."
      : "ffmpeg not on PATH. Photo derivatives work now; video encode/poster extract needs ffmpeg installed locally.",
  };
}

export function planVideoExcerpt(input: {
  youtubeVideoId: string;
  query?: string;
  maxClips?: number;
}): { ok: true; plan: VideoExcerptPlan } | { ok: false; error: string } {
  const youtubeVideoId = String(input.youtubeVideoId ?? "").trim();
  if (!youtubeVideoId) return { ok: false, error: "youtubeVideoId required." };
  const ws = loadWorkspaceRecord(youtubeVideoId);
  if (!ws || !Array.isArray(ws.segments) || ws.segments.length === 0) {
    return {
      ok: false,
      error: "No local transcript workspace segments for this YouTube id — pull/review transcript first.",
    };
  }
  const query = String(input.query ?? "").trim().toLowerCase();
  const maxClips = Math.min(Math.max(Number(input.maxClips) || 3, 1), 8);
  const tooling = probeVideoTooling();

  type Cand = { start: number; end: number; text: string; score: number };
  const cands: Cand[] = [];
  for (const seg of ws.segments) {
    const text = String(seg.text ?? "").trim();
    if (!text) continue;
    const start = typeof seg.startSeconds === "number" ? seg.startSeconds : 0;
    const end =
      typeof seg.endSeconds === "number" && seg.endSeconds > start
        ? seg.endSeconds
        : start + Math.max(4, Math.min(18, text.split(/\s+/).length * 0.4));
    let score = text.length > 40 ? 1 : 0.4;
    if (query) {
      if (!text.toLowerCase().includes(query)) continue;
      score += 2;
    }
    // Prefer mid-length quotable lines
    if (text.length > 60 && text.length < 220) score += 0.5;
    cands.push({ start, end, text, score });
  }
  cands.sort((a, b) => b.score - a.score || a.start - b.start);

  const clips: VideoExcerptClip[] = [];
  const usedStarts = new Set<number>();
  for (const c of cands) {
    if (clips.length >= maxClips) break;
    const bucket = Math.floor(c.start / 8);
    if (usedStarts.has(bucket)) continue;
    usedStarts.add(bucket);
    const padStart = Math.max(0, c.start - 1.5);
    const padEnd = c.end + 2;
    clips.push({
      startSeconds: Math.round(padStart * 10) / 10,
      endSeconds: Math.round(padEnd * 10) / 10,
      title: c.text.slice(0, 72).replace(/\s+/g, " "),
      quote: c.text.slice(0, 280),
      reason: query
        ? `Matched query "${query}" in local transcript.`
        : "Strong local transcript segment for a short social/cut candidate.",
    });
  }

  if (!clips.length) {
    return { ok: false, error: query ? `No transcript hits for query: ${query}` : "No usable transcript segments." };
  }

  const plan: VideoExcerptPlan = {
    id: `vplan-${youtubeVideoId}-${Date.now()}`,
    youtubeVideoId,
    createdAt: new Date().toISOString(),
    query,
    clips,
    tooling: {
      ffmpegAvailable: tooling.ffmpegAvailable,
      note: tooling.note,
    },
  };
  const ledger = loadMediaDerivativesLedger();
  ledger.videoPlans = [plan, ...ledger.videoPlans].slice(0, 100);
  saveLedger(ledger);
  return { ok: true, plan };
}

/**
 * Extract a still from a *local* video file (not YouTube URL). Requires ffmpeg.
 * Speeches are mostly YouTube — use planVideoExcerpt until local masters exist.
 */
export function extractLocalVideoPoster(input: {
  localPublicSrc: string;
  atSeconds?: number;
  outId: string;
}): { ok: true; publicSrc: string; relativePath: string } | { ok: false; error: string } {
  const tooling = probeVideoTooling();
  if (!tooling.ffmpegAvailable || !tooling.ffmpegPath) {
    return { ok: false, error: tooling.note };
  }
  const srcAbs = decodePublicSrcToAbs(input.localPublicSrc);
  if (!srcAbs) return { ok: false, error: "Local video file not found under public/." };
  const at = Number.isFinite(input.atSeconds) ? Math.max(0, Number(input.atSeconds)) : 1;
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, "_video", input.outId);
  const outDirAbs = abs(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });
  const filename = `poster-${Math.round(at)}s.jpg`;
  const outAbs = path.join(outDirAbs, filename);
  try {
    execFileSync(
      tooling.ffmpegPath,
      ["-y", "-ss", String(at), "-i", srcAbs, "-frames:v", "1", "-q:v", "2", outAbs],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "ffmpeg poster extract failed." };
  }
  if (!existsSync(outAbs)) return { ok: false, error: "ffmpeg did not write poster." };
  const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
  const publicSrc = `/media/campaign-derivatives/_video/${input.outId}/${filename}`;
  return { ok: true, publicSrc, relativePath };
}
