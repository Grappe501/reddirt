import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import {
  coverCropRect,
  mapVisionRecommendedKind,
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
  LocalVideoProbeResult,
  VideoClipRecord,
  VideoExcerptClip,
  VideoExcerptPlan,
  VideoPosterRecord,
} from "@/lib/campaign-media/media-derivatives-types";
import { loadWorkspaceRecord } from "@/lib/media/youtube-transcripts/workspace-store";
import { probeVideoTooling as probeFfmpegTooling, runFfmpeg, runFfprobeJson } from "@/lib/campaign-media/ffmpeg-tooling";
import {
  findLocalVideoMaster,
  resolveAllowedVideoPath,
} from "@/lib/campaign-media/local-video-masters";

export type {
  MediaDerivativesLedger,
  PhotoDerivativeBatchRun,
  PhotoDerivativeKind,
  PhotoDerivativeRecord,
  PhotoPixelInspect,
  LocalVideoProbeResult,
  VideoClipRecord,
  VideoExcerptClip,
  VideoExcerptPlan,
  VideoPosterRecord,
} from "@/lib/campaign-media/media-derivatives-types";

export { probeVideoTooling, resolveFfmpegBinaries } from "@/lib/campaign-media/ffmpeg-tooling";
export {
  findLocalVideoMaster,
  listLocalVideoMasters,
  resolveAllowedVideoPath,
} from "@/lib/campaign-media/local-video-masters";

export const MAX_ENCODE_CLIP_SECONDS = 120;
export const MAX_ENCODE_CLIPS_PER_RUN = 4;

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
    videoPosters: [],
    videoClips: [],
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
      videoPosters: Array.isArray(raw.videoPosters) ? raw.videoPosters : [],
      videoClips: Array.isArray(raw.videoClips) ? raw.videoClips : [],
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

type SharpDerivativeKind = Exclude<
  PhotoDerivativeKind,
  "inspect_only" | "enhance_ai" | "cutout_bg" | "inpaint_cleanup"
>;

type CreateInput = {
  photoId: string;
  kind: SharpDerivativeKind;
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
    case "grade_full":
      return { maxEdge: 1920, quality: 88, ext: "jpg" };
    case "auto_orient":
      return { maxEdge: 4000, quality: 90, ext: "jpg" };
    case "story_9x16":
      return { maxEdge: 1080, quality: 86, ext: "jpg" };
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
    case "grade_full":
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
    case "story_9x16": {
      const w = Math.min(maxEdge, 1080);
      return focusCover(w, Math.round((w * 16) / 9), 9 / 16, Boolean(focus));
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
 * Prefer Vision recommendedKind when provided (P2); keyword parser is fallback.
 */
export async function createDerivativeFromCropAdvice(input: {
  photoId: string;
  cropAdvice: string;
  focusX?: number;
  focusY?: number;
  note?: string;
  /** Vision / explicit kind — skips keyword regex when valid. */
  recommendedKind?: string;
}): Promise<
  | { ok: true; record: PhotoDerivativeRecord; mappedKind: string; reason: string }
  | { ok: false; error: string }
> {
  const advice = String(input.cropAdvice ?? "").trim();
  if (!advice && !input.recommendedKind) return { ok: false, error: "cropAdvice required." };
  const visionKind = input.recommendedKind
    ? mapVisionRecommendedKind(String(input.recommendedKind))
    : null;
  const mapped = visionKind
    ? { kind: visionKind, reason: `Vision recommendedKind: ${visionKind}` }
    : parseCropAdviceToKind(advice || String(input.recommendedKind ?? ""));
  const result = await createPhotoDerivative({
    photoId: input.photoId,
    kind: mapped.kind,
    focusX: input.focusX,
    focusY: input.focusY,
    note: input.note ?? `cropAdvice: ${(advice || mapped.kind).slice(0, 120)}`,
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

/** Register an already-written file into the derivative ledger (Pro Edit promote bridge). */
export function pushPhotoDerivativeRecord(record: PhotoDerivativeRecord): void {
  const ledger = loadMediaDerivativesLedger();
  ledger.photos = [record, ...ledger.photos.filter((r) => r.id !== record.id)].slice(0, 500);
  saveLedger(ledger);
}

export function listVideoPosters(outId?: string): VideoPosterRecord[] {
  const ledger = loadMediaDerivativesLedger();
  const rows = outId
    ? (ledger.videoPosters ?? []).filter((p) => p.outId === outId)
    : ledger.videoPosters ?? [];
  return rows.filter((r) => existsSync(abs(r.relativePath)));
}

function parseFfprobe(data: unknown): Omit<LocalVideoProbeResult, "ok" | "absPath" | "publicSrc" | "error" | "clipWindow"> {
  const root = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const format = root.format && typeof root.format === "object" ? (root.format as Record<string, unknown>) : {};
  const streams = Array.isArray(root.streams) ? root.streams : [];
  const v =
    streams.find((s) => s && typeof s === "object" && (s as { codec_type?: string }).codec_type === "video") ??
    null;
  const a =
    streams.find((s) => s && typeof s === "object" && (s as { codec_type?: string }).codec_type === "audio") ??
    null;
  const vs = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  const as = a && typeof a === "object" ? (a as Record<string, unknown>) : {};
  const durationRaw = format.duration ?? vs.duration;
  const durationSeconds =
    durationRaw != null && Number.isFinite(Number(durationRaw)) ? Number(durationRaw) : null;
  const width = vs.width != null && Number.isFinite(Number(vs.width)) ? Number(vs.width) : null;
  const height = vs.height != null && Number.isFinite(Number(vs.height)) ? Number(vs.height) : null;
  const sizeBytes =
    format.size != null && Number.isFinite(Number(format.size)) ? Number(format.size) : null;
  const bitRate =
    format.bit_rate != null && Number.isFinite(Number(format.bit_rate))
      ? Number(format.bit_rate)
      : null;
  return {
    durationSeconds,
    width,
    height,
    videoCodec: typeof vs.codec_name === "string" ? vs.codec_name : null,
    audioCodec: typeof as.codec_name === "string" ? as.codec_name : null,
    formatName: typeof format.format_name === "string" ? format.format_name : null,
    sizeBytes,
    bitRate,
  };
}

export function probeLocalVideo(input: {
  localPublicSrc?: string;
  absPath?: string;
  speechId?: string;
  youtubeVideoId?: string;
  startSeconds?: number;
  endSeconds?: number;
}): LocalVideoProbeResult {
  let resolved =
    input.localPublicSrc || input.absPath
      ? resolveAllowedVideoPath({
          localPublicSrc: input.localPublicSrc,
          absPath: input.absPath,
        })
      : null;

  if ((!resolved || !resolved.ok) && (input.speechId || input.youtubeVideoId)) {
    const hit = findLocalVideoMaster({
      speechId: input.speechId,
      youtubeVideoId: input.youtubeVideoId,
    });
    if (hit) {
      resolved = { ok: true, absPath: hit.absPath, publicSrc: hit.publicSrc };
    }
  }

  if (!resolved || !resolved.ok) {
    return {
      ok: false,
      absPath: null,
      publicSrc: null,
      durationSeconds: null,
      width: null,
      height: null,
      videoCodec: null,
      audioCodec: null,
      formatName: null,
      sizeBytes: null,
      bitRate: null,
      error:
        resolved && !resolved.ok
          ? resolved.error
          : "No local video master found. Drop an .mp4 under public/media/campaign-video-masters/ or .local/video-masters/.",
    };
  }

  const probed = runFfprobeJson(resolved.absPath);
  if (!probed.ok) {
    return {
      ok: false,
      absPath: resolved.absPath,
      publicSrc: resolved.publicSrc,
      durationSeconds: null,
      width: null,
      height: null,
      videoCodec: null,
      audioCodec: null,
      formatName: null,
      sizeBytes: null,
      bitRate: null,
      error: probed.error,
    };
  }

  const meta = parseFfprobe(probed.data);
  let clipWindow: LocalVideoProbeResult["clipWindow"] = null;
  if (typeof input.startSeconds === "number" || typeof input.endSeconds === "number") {
    const start = Math.max(0, Number(input.startSeconds) || 0);
    const end =
      typeof input.endSeconds === "number" && Number.isFinite(input.endSeconds)
        ? Math.max(start, input.endSeconds)
        : start + 8;
    const dur = meta.durationSeconds;
    const inBounds = dur == null ? true : start < dur && end <= dur + 0.05;
    clipWindow = { startSeconds: start, endSeconds: end, inBounds };
  }

  return {
    ok: true,
    absPath: resolved.absPath,
    publicSrc: resolved.publicSrc,
    ...meta,
    clipWindow,
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
  const tooling = probeFfmpegTooling();

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
      ffprobeAvailable: tooling.ffprobeAvailable,
      source: tooling.source,
      note: tooling.note,
    },
  };
  const ledger = loadMediaDerivativesLedger();
  ledger.videoPlans = [plan, ...ledger.videoPlans].slice(0, 100);
  saveLedger(ledger);
  return { ok: true, plan };
}

/**
 * Extract a still from a *local* video master. Requires ffmpeg under .local or PATH.
 * Does not touch YouTube downloads — masters must be dropped under allowed roots.
 */
export function extractLocalVideoPoster(input: {
  localPublicSrc?: string;
  absPath?: string;
  atSeconds?: number;
  outId: string;
  speechId?: string;
  youtubeVideoId?: string;
}):
  | { ok: true; publicSrc: string; relativePath: string; record: VideoPosterRecord }
  | { ok: false; error: string } {
  const tooling = probeFfmpegTooling();
  if (!tooling.ffmpegAvailable) {
    return { ok: false, error: tooling.note };
  }

  let resolved =
    input.localPublicSrc || input.absPath
      ? resolveAllowedVideoPath({
          localPublicSrc: input.localPublicSrc,
          absPath: input.absPath,
        })
      : null;

  if ((!resolved || !resolved.ok) && (input.speechId || input.youtubeVideoId || input.outId)) {
    const hit = findLocalVideoMaster({
      speechId: input.speechId ?? input.outId,
      youtubeVideoId: input.youtubeVideoId,
    });
    if (hit) resolved = { ok: true, absPath: hit.absPath, publicSrc: hit.publicSrc };
  }

  if (!resolved || !resolved.ok) {
    return {
      ok: false,
      error:
        resolved && !resolved.ok
          ? resolved.error
          : "Local video master not found for poster extract.",
    };
  }

  const at = Number.isFinite(input.atSeconds) ? Math.max(0, Number(input.atSeconds)) : 1;
  const outId = String(input.outId ?? "").trim() || "video";
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, "_video", outId);
  const outDirAbs = abs(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const filename = `poster-${Math.round(at)}s-${stamp}.jpg`;
  const outAbs = path.join(outDirAbs, filename);

  const run = runFfmpeg([
    "-y",
    "-ss",
    String(at),
    "-i",
    resolved.absPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    outAbs,
  ]);
  if (!run.ok) return { ok: false, error: run.error };
  if (!existsSync(outAbs)) return { ok: false, error: "ffmpeg did not write poster." };

  const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
  const publicSrc = `/media/campaign-derivatives/_video/${outId}/${filename}`;
  let width: number | null = null;
  let height: number | null = null;
  let bytes: number | null = null;
  try {
    bytes = statSync(outAbs).size;
  } catch {
    /* optional */
  }
  const frameMeta = posterFrameMeta(outAbs);
  width = frameMeta.width;
  height = frameMeta.height;

  const record: VideoPosterRecord = {
    id: `${outId}--poster--${stamp}`,
    outId,
    sourcePath: resolved.absPath,
    sourcePublicSrc: resolved.publicSrc,
    atSeconds: at,
    publicSrc,
    relativePath,
    width,
    height,
    bytes,
    createdAt: new Date().toISOString(),
    speechId: input.speechId,
    youtubeVideoId: input.youtubeVideoId,
  };
  const ledger = loadMediaDerivativesLedger();
  ledger.videoPosters = [record, ...(ledger.videoPosters ?? [])].slice(0, 200);
  saveLedger(ledger);
  return { ok: true, publicSrc, relativePath, record };
}

function posterFrameMeta(fileAbs: string): { width: number | null; height: number | null } {
  const probed = runFfprobeJson(fileAbs);
  if (!probed.ok) return { width: null, height: null };
  const meta = parseFfprobe(probed.data);
  return { width: meta.width, height: meta.height };
}

export function listVideoExcerptPlans(youtubeVideoId?: string): VideoExcerptPlan[] {
  const ledger = loadMediaDerivativesLedger();
  const id = String(youtubeVideoId ?? "").trim();
  if (!id) return ledger.videoPlans;
  return ledger.videoPlans.filter((p) => p.youtubeVideoId === id);
}

export function getVideoExcerptPlan(planId: string): VideoExcerptPlan | null {
  const id = String(planId ?? "").trim();
  if (!id) return null;
  return loadMediaDerivativesLedger().videoPlans.find((p) => p.id === id) ?? null;
}

export function listVideoClips(outId?: string): VideoClipRecord[] {
  const ledger = loadMediaDerivativesLedger();
  const rows = outId
    ? (ledger.videoClips ?? []).filter((c) => c.outId === outId || c.speechId === outId)
    : ledger.videoClips ?? [];
  return rows.filter((r) => existsSync(abs(r.relativePath)));
}

function resolveMasterForEncode(input: {
  localPublicSrc?: string;
  absPath?: string;
  speechId?: string;
  youtubeVideoId?: string;
  outId?: string;
}): { ok: true; absPath: string; publicSrc: string | null } | { ok: false; error: string } {
  let resolved =
    input.localPublicSrc || input.absPath
      ? resolveAllowedVideoPath({
          localPublicSrc: input.localPublicSrc,
          absPath: input.absPath,
        })
      : null;

  if ((!resolved || !resolved.ok) && (input.speechId || input.youtubeVideoId || input.outId)) {
    const hit = findLocalVideoMaster({
      speechId: input.speechId ?? input.outId,
      youtubeVideoId: input.youtubeVideoId,
    });
    if (hit) resolved = { ok: true, absPath: hit.absPath, publicSrc: hit.publicSrc };
  }

  if (!resolved || !resolved.ok) {
    return {
      ok: false,
      error:
        resolved && !resolved.ok
          ? resolved.error
          : "Local video master required to encode — drop an .mp4 under public/media/campaign-video-masters/ or .local/video-masters/.",
    };
  }
  return resolved;
}

/**
 * Encode one timed excerpt from a local master into campaign-derivatives/_video/{outId}/.
 * Does not modify the source master.
 */
export function encodeVideoExcerptClip(input: {
  startSeconds: number;
  endSeconds: number;
  outId: string;
  planId?: string;
  clipIndex?: number;
  title?: string;
  quote?: string;
  speechId?: string;
  youtubeVideoId?: string;
  localPublicSrc?: string;
  absPath?: string;
  /** Video Prep — optional 9:16 social reframe (scale+crop). */
  aspect?: import("@/lib/campaign-media/media-derivatives-types").VideoEncodeAspect;
}):
  | { ok: true; publicSrc: string; relativePath: string; record: VideoClipRecord }
  | { ok: false; error: string } {
  const tooling = probeFfmpegTooling();
  if (!tooling.ffmpegAvailable) return { ok: false, error: tooling.note };

  const outId = String(input.outId ?? "").trim();
  if (!outId) return { ok: false, error: "outId required." };

  const start = Math.max(0, Number(input.startSeconds) || 0);
  let end = Math.max(start, Number(input.endSeconds) || start);
  if (end - start < 0.4) {
    return { ok: false, error: "Clip window too short (need ≥ 0.4s)." };
  }
  if (end - start > MAX_ENCODE_CLIP_SECONDS) {
    end = start + MAX_ENCODE_CLIP_SECONDS;
  }

  const master = resolveMasterForEncode({
    localPublicSrc: input.localPublicSrc,
    absPath: input.absPath,
    speechId: input.speechId,
    youtubeVideoId: input.youtubeVideoId,
    outId,
  });
  if (!master.ok) return master;

  const probe = probeLocalVideo({
    absPath: master.absPath,
    startSeconds: start,
    endSeconds: end,
  });
  if (probe.ok && probe.clipWindow && !probe.clipWindow.inBounds) {
    return {
      ok: false,
      error: `Clip ${start}s–${end}s is outside master duration (${probe.durationSeconds?.toFixed(1) ?? "?"}s).`,
    };
  }

  const aspect = input.aspect === "vertical_9x16" ? "vertical_9x16" : "source";
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const clipIndex = Number.isFinite(input.clipIndex) ? Math.max(0, Number(input.clipIndex)) : 0;
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, "_video", outId);
  const outDirAbs = abs(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });
  const aspectTag = aspect === "vertical_9x16" ? "v916" : "src";
  const filename = `clip-${clipIndex}-${Math.round(start)}s-${Math.round(end)}s-${aspectTag}-${stamp}.mp4`;
  const outAbs = path.join(outDirAbs, filename);

  const ffmpegArgs = [
    "-y",
    "-ss",
    String(start),
    "-i",
    master.absPath,
    "-t",
    String(Math.max(0.4, end - start)),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
  ];
  if (aspect === "vertical_9x16") {
    ffmpegArgs.push(
      "-vf",
      "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
    );
  }
  ffmpegArgs.push(outAbs);

  const run = runFfmpeg(ffmpegArgs);
  if (!run.ok) return { ok: false, error: run.error };
  if (!existsSync(outAbs)) return { ok: false, error: "ffmpeg did not write clip." };

  const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
  const publicSrc = `/media/campaign-derivatives/_video/${outId}/${filename}`;
  let bytes: number | null = null;
  try {
    bytes = statSync(outAbs).size;
  } catch {
    /* optional */
  }
  const frame = posterFrameMeta(outAbs);
  const outProbe = runFfprobeJson(outAbs);
  const outMeta = outProbe.ok ? parseFfprobe(outProbe.data) : null;

  const record: VideoClipRecord = {
    id: `${outId}--clip-${clipIndex}--${aspectTag}--${stamp}`,
    outId,
    planId: input.planId,
    clipIndex,
    youtubeVideoId: input.youtubeVideoId,
    speechId: input.speechId ?? outId,
    startSeconds: start,
    endSeconds: end,
    title: input.title,
    quote: input.quote,
    publicSrc,
    relativePath,
    sourcePath: master.absPath,
    sourcePublicSrc: master.publicSrc,
    bytes,
    durationSeconds: outMeta?.durationSeconds ?? end - start,
    width: frame.width ?? outMeta?.width,
    height: frame.height ?? outMeta?.height,
    createdAt: new Date().toISOString(),
    aspect,
    note: aspect === "vertical_9x16" ? "9:16 social reframe (non-destructive)." : undefined,
  };
  const ledger = loadMediaDerivativesLedger();
  ledger.videoClips = [record, ...(ledger.videoClips ?? [])].slice(0, 200);
  saveLedger(ledger);
  return { ok: true, publicSrc, relativePath, record };
}

/**
 * Encode up to MAX_ENCODE_CLIPS_PER_RUN clips from a stored plan (or inline clips).
 */
export function encodeVideoExcerptPlan(input: {
  planId?: string;
  clips?: VideoExcerptClip[];
  outId: string;
  speechId?: string;
  youtubeVideoId?: string;
  localPublicSrc?: string;
  absPath?: string;
  clipIndexes?: number[];
  aspect?: import("@/lib/campaign-media/media-derivatives-types").VideoEncodeAspect;
}): {
  ok: boolean;
  created: VideoClipRecord[];
  errors: Array<{ clipIndex: number; error: string }>;
  message: string;
} {
  const outId = String(input.outId ?? "").trim();
  if (!outId) {
    return { ok: false, created: [], errors: [{ clipIndex: -1, error: "outId required." }], message: "outId required." };
  }

  const planId = String(input.planId ?? "").trim() || undefined;
  let clips = input.clips;
  let youtubeVideoId = input.youtubeVideoId;
  if ((!clips || !clips.length) && planId) {
    const plan = getVideoExcerptPlan(planId);
    if (!plan) {
      return {
        ok: false,
        created: [],
        errors: [{ clipIndex: -1, error: `Plan not found: ${planId}` }],
        message: `Plan not found: ${planId}`,
      };
    }
    clips = plan.clips;
    youtubeVideoId = youtubeVideoId ?? plan.youtubeVideoId;
  }
  if (!clips?.length) {
    return {
      ok: false,
      created: [],
      errors: [{ clipIndex: -1, error: "No clips to encode — run Plan video excerpts first." }],
      message: "No clips to encode — run Plan video excerpts first.",
    };
  }

  const indexes =
    input.clipIndexes?.length
      ? input.clipIndexes.filter((i) => i >= 0 && i < clips!.length)
      : clips.map((_, i) => i);
  const limited = indexes.slice(0, MAX_ENCODE_CLIPS_PER_RUN);
  const created: VideoClipRecord[] = [];
  const errors: Array<{ clipIndex: number; error: string }> = [];

  for (const clipIndex of limited) {
    const clip = clips[clipIndex];
    const result = encodeVideoExcerptClip({
      startSeconds: clip.startSeconds,
      endSeconds: clip.endSeconds,
      outId,
      planId,
      clipIndex,
      title: clip.title,
      quote: clip.quote,
      speechId: input.speechId ?? outId,
      youtubeVideoId,
      localPublicSrc: input.localPublicSrc,
      absPath: input.absPath,
      aspect: input.aspect,
    });
    if (result.ok) created.push(result.record);
    else errors.push({ clipIndex, error: result.error });
  }

  const ok = created.length > 0;
  return {
    ok,
    created,
    errors,
    message: ok
      ? `Encoded ${created.length}/${limited.length} clip(s)` +
        (errors.length ? ` (${errors.length} failed)` : "")
      : `Encode failed — ${errors[0]?.error ?? "nothing written."}`,
  };
}
