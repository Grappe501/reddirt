/**
 * Photo Pro Edit preview — cheap single-slot graded JPEG before full pack render.
 * Never promotes; never overwrites originals.
 */
import "server-only";

import { existsSync, mkdirSync, renameSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { loadPhotoEvidenceStore, loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import { coverCropRect, normalizeFocus } from "@/lib/campaign-media/focus-crop";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { MEDIA_DERIVATIVES_PUBLIC_REL } from "@/lib/campaign-media/media-derivatives";
import { getPhotoEditProject } from "@/lib/campaign-media/photo-edit-store";
import type { PhotoEditProject } from "@/lib/campaign-media/photo-edit-types";
import {
  applyPhotoLook,
  photoSlotSpec,
  type PhotoExportSlot,
} from "@/lib/campaign-media/photo-look-presets";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function decodePublicSrcToAbs(src: string): string | null {
  if (!src.startsWith("/")) return null;
  const rel = src.replace(/^\//, "");
  try {
    const decoded = decodeURIComponent(rel);
    const a = abs(path.join("public", decoded));
    if (existsSync(a)) return a;
  } catch {
    /* ignore */
  }
  const candidate = abs(path.join("public", rel));
  return existsSync(candidate) ? candidate : null;
}

function resolveSource(photoId: string): { ok: true; absPath: string } | { ok: false; error: string } {
  const live = listCampaignPhotosLive().find((p) => p.id === photoId);
  const registryBase =
    CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId) ??
    loadPhotoIngestDrafts().photos.find((p) => p.id === photoId) ??
    null;
  const sourceSrc = registryBase?.src ?? live?.src;
  if (!sourceSrc) return { ok: false, error: `Photo not found: ${photoId}` };
  const sourceAbs = decodePublicSrcToAbs(sourceSrc);
  if (!sourceAbs) return { ok: false, error: `Source file missing for ${sourceSrc}` };
  if (sourceAbs.includes(`${path.sep}campaign-derivatives${path.sep}`)) {
    return { ok: false, error: "Refusing to preview from a derivative source." };
  }
  return { ok: true, absPath: sourceAbs };
}

export type PhotoEditPreviewResult =
  | {
      ok: true;
      message: string;
      publicSrc: string;
      slot: PhotoExportSlot;
      look: string;
      width: number;
      height: number;
      previewNote: string;
    }
  | { ok: false; error: string };

/**
 * Render one graded preview slot for an edit project (default: promoteSuggestion or web_max).
 */
export async function previewPhotoEditPack(input: {
  projectId: string;
  slot?: PhotoExportSlot;
}): Promise<PhotoEditPreviewResult> {
  const project = getPhotoEditProject(input.projectId);
  if (!project) return { ok: false, error: `Project not found: ${input.projectId}` };

  const slot: PhotoExportSlot =
    input.slot && project.exportSlots.includes(input.slot)
      ? input.slot
      : project.promoteSuggestion && project.exportSlots.includes(project.promoteSuggestion)
        ? project.promoteSuggestion
        : project.exportSlots.includes("web_max")
          ? "web_max"
          : project.exportSlots[0] ?? "web_max";

  const source = resolveSource(project.photoId);
  if (!source.ok) return { ok: false, error: source.error };

  let focusX = project.focusX;
  let focusY = project.focusY;
  if (project.useFocus && (focusX == null || focusY == null)) {
    const overlay = loadPhotoEvidenceStore().photos[project.photoId];
    if (typeof overlay?.focusX === "number" && typeof overlay?.focusY === "number") {
      focusX = overlay.focusX;
      focusY = overlay.focusY;
    }
  }

  const working: PhotoEditProject = { ...project, focusX, focusY };
  const spec = photoSlotSpec(slot);
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, project.photoId);
  const outDirAbs = abs(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
  const filename = `preview-${slot}-${project.look}-${stamp}.jpg`;
  const outAbs = path.join(outDirAbs, filename);
  const tmpAbs = `${outAbs}.${process.pid}.tmp`;

  try {
    const meta = await sharp(source.absPath, { failOn: "none" }).rotate().metadata();
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;
    let pipeline = sharp(source.absPath, { failOn: "none" }).rotate();
    const focus = working.useFocus ? normalizeFocus({ x: working.focusX, y: working.focusY }) : null;

    if (spec.aspect == null) {
      pipeline = pipeline.resize({
        width: Math.min(spec.maxEdge, 1200),
        height: Math.min(spec.maxEdge, 1200),
        fit: "inside",
        withoutEnlargement: true,
      });
    } else {
      const outW =
        spec.aspect >= 1 ? Math.min(spec.maxEdge, 1280) : Math.min(spec.maxEdge, 720);
      const outH = Math.round(outW / spec.aspect);
      if (focus && srcW > 0 && srcH > 0) {
        const rect = coverCropRect({
          srcWidth: srcW,
          srcHeight: srcH,
          targetAspect: spec.aspect,
          focus,
        });
        pipeline = pipeline.extract(rect).resize({ width: outW, height: outH, fit: "fill" });
      } else {
        pipeline = pipeline.resize({
          width: outW,
          height: outH,
          fit: "cover",
          position: "attention",
        });
      }
    }

    pipeline = applyPhotoLook(pipeline, working.look);
    if (working.sharpen && working.look !== "punch" && working.look !== "soft") {
      pipeline = pipeline.sharpen({ sigma: 0.55 });
    }

    await pipeline.jpeg({ quality: Math.min(spec.quality, 82), mozjpeg: true }).toFile(tmpAbs);
    renameSync(tmpAbs, outAbs);
    const outMeta = await sharp(outAbs).metadata();
    const st = statSync(outAbs);
    const publicSrc = `/media/campaign-derivatives/${project.photoId}/${filename}`;
    return {
      ok: true,
      message: `Preview ${slot} · ${working.look} · ${outMeta.width}×${outMeta.height} (${st.size}b)`,
      publicSrc,
      slot,
      look: working.look,
      width: outMeta.width ?? 0,
      height: outMeta.height ?? 0,
      previewNote:
        "Preview only — not promoted. Confirm render for the full multi-aspect pack.",
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Preview render failed." };
  }
}
