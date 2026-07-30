/**
 * Evidence Photo Pro Edit — confirmed render:
 * focus-aware multi-aspect pack + look grade (+ optional sharpen).
 * Originals never overwritten.
 */

import { existsSync, mkdirSync, renameSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { loadPhotoEvidenceStore, loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import { coverCropRect, normalizeFocus } from "@/lib/campaign-media/focus-crop";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { MEDIA_DERIVATIVES_PUBLIC_REL } from "@/lib/campaign-media/media-derivatives";
import {
  getPhotoEditProject,
  pushPhotoAssembly,
  upsertPhotoEditProject,
} from "@/lib/campaign-media/photo-edit-store";
import type { PhotoAssemblyRecord, PhotoEditProject } from "@/lib/campaign-media/photo-edit-types";
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

function resolveSource(photoId: string): { ok: true; absPath: string; sourceSrc: string } | { ok: false; error: string } {
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
    return { ok: false, error: "Refusing to use a derivative as a Pro Edit source." };
  }
  return { ok: true, absPath: sourceAbs, sourceSrc };
}

async function renderSlot(input: {
  sourceAbs: string;
  project: PhotoEditProject;
  slot: PhotoExportSlot;
  outAbs: string;
  srcW: number;
  srcH: number;
}): Promise<{ ok: true; width: number; height: number; bytes: number; format: string } | { ok: false; error: string }> {
  const spec = photoSlotSpec(input.slot);
  const focus =
    input.project.useFocus
      ? normalizeFocus({ x: input.project.focusX, y: input.project.focusY })
      : null;

  try {
    const meta = await sharp(input.sourceAbs, { failOn: "none" }).rotate().metadata();
    const srcW = meta.width ?? input.srcW;
    const srcH = meta.height ?? input.srcH;
    let pipeline = sharp(input.sourceAbs, { failOn: "none" }).rotate();

    if (spec.aspect == null) {
      pipeline = pipeline.resize({
        width: spec.maxEdge,
        height: spec.maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      });
    } else {
      const outW =
        spec.aspect >= 1
          ? Math.min(spec.maxEdge, 1920)
          : Math.min(spec.maxEdge, 1080);
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

    pipeline = applyPhotoLook(pipeline, input.project.look);
    if (input.project.sharpen && input.project.look !== "punch" && input.project.look !== "soft") {
      pipeline = pipeline.sharpen({ sigma: 0.6 });
    }

    const tmpAbs = `${input.outAbs}.${process.pid}.tmp`;
    await pipeline.jpeg({ quality: spec.quality, mozjpeg: true }).toFile(tmpAbs);
    renameSync(tmpAbs, input.outAbs);

    const outMeta = await sharp(input.outAbs).metadata();
    const st = statSync(input.outAbs);
    return {
      ok: true,
      width: outMeta.width ?? 0,
      height: outMeta.height ?? 0,
      bytes: st.size,
      format: outMeta.format ?? "jpeg",
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Slot render failed." };
  }
}

export type PhotoProRenderResult = {
  ok: boolean;
  message: string;
  assemblies: PhotoAssemblyRecord[];
  warnings: string[];
  promoteSuggestion?: PhotoExportSlot | null;
};

/**
 * Confirm-render a photo edit project. Requires confirmRender at the action/AI layer.
 */
export async function renderPhotoEditProject(input: {
  projectId: string;
}): Promise<PhotoProRenderResult> {
  const project = getPhotoEditProject(input.projectId);
  if (!project) {
    return { ok: false, message: `Project not found: ${input.projectId}`, assemblies: [], warnings: [] };
  }
  if (!project.exportSlots.length) {
    return { ok: false, message: "Edit project has no export slots.", assemblies: [], warnings: [] };
  }

  const source = resolveSource(project.photoId);
  if (!source.ok) {
    return { ok: false, message: source.error, assemblies: [], warnings: [source.error] };
  }

  // Refresh focus from overlay if project requested focus but coords missing.
  if (project.useFocus && (project.focusX == null || project.focusY == null)) {
    const overlay = loadPhotoEvidenceStore().photos[project.photoId];
    if (typeof overlay?.focusX === "number" && typeof overlay?.focusY === "number") {
      project.focusX = overlay.focusX;
      project.focusY = overlay.focusY;
    }
  }

  const warnings: string[] = [];
  const stamp = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, project.photoId);
  const outDirAbs = abs(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });

  const meta = await sharp(source.absPath, { failOn: "none" }).rotate().metadata();
  const assemblies: PhotoAssemblyRecord[] = [];

  for (const slot of project.exportSlots) {
    const filename = `pro-${slot}-${project.look}-${stamp}.jpg`;
    const outAbs = path.join(outDirAbs, filename);
    const rendered = await renderSlot({
      sourceAbs: source.absPath,
      project,
      slot,
      outAbs,
      srcW: meta.width ?? 0,
      srcH: meta.height ?? 0,
    });
    if (!rendered.ok) {
      warnings.push(`${slot}: ${rendered.error}`);
      continue;
    }
    const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
    const publicSrc = `/media/campaign-derivatives/${project.photoId}/${filename}`;
    const record: PhotoAssemblyRecord = {
      id: `${project.photoId}--pro-${slot}--${stamp}`,
      projectId: project.id,
      photoId: project.photoId,
      slot,
      look: project.look,
      publicSrc,
      relativePath,
      width: rendered.width,
      height: rendered.height,
      bytes: rendered.bytes,
      format: rendered.format,
      focusX: project.useFocus ? project.focusX : undefined,
      focusY: project.useFocus ? project.focusY : undefined,
      createdAt: new Date().toISOString(),
      note: warnings.length ? warnings.slice(0, 2).join(" · ") : undefined,
    };
    pushPhotoAssembly(record);
    assemblies.push(record);
  }

  project.updatedAt = new Date().toISOString();
  upsertPhotoEditProject(project);

  return {
    ok: assemblies.length > 0,
    message: assemblies.length
      ? `Rendered ${assemblies.length} assembly(ies) for ${project.id}`
      : `Render failed — ${warnings[0] ?? "no assemblies written."}`,
    assemblies,
    warnings,
    promoteSuggestion: project.promoteSuggestion ?? null,
  };
}
