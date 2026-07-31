/**
 * P2 — OpenAI Images assist on campaign-derivatives only.
 * Enhance / background cutout / inpaint cleanup. Never overwrite campaign-photos originals.
 * Prefer Unknown: no geography in prompts; confirm-gated at action layer.
 */
import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { toFile } from "openai";
import sharp from "sharp";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import {
  MEDIA_DERIVATIVES_PUBLIC_REL,
  pushPhotoDerivativeRecord,
} from "@/lib/campaign-media/media-derivatives";
import type { PhotoDerivativeKind, PhotoDerivativeRecord } from "@/lib/campaign-media/media-derivatives-types";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";

export type AiAssistKind = "enhance_ai" | "cutout_bg" | "inpaint_cleanup";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function imageModel(): string {
  return getOpenAIConfigFromEnv().imageModel || "gpt-image-1";
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

function resolveOriginalSource(photoId: string): {
  ok: true;
  absPath: string;
  sourceSrc: string;
} | { ok: false; error: string } {
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
    return { ok: false, error: "Refusing to use a derivative as AI assist master source." };
  }
  if (sourceAbs.includes(`${path.sep}campaign-shipped${path.sep}`)) {
    return { ok: false, error: "Refusing shipped override as AI master — use original campaign-photos." };
  }
  return { ok: true, absPath: sourceAbs, sourceSrc };
}

async function sourceAsPngFile(sourceAbs: string, label: string) {
  const png = await sharp(sourceAbs, { failOn: "none" })
    .rotate()
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  return toFile(png, `${label}.png`, { type: "image/png" });
}

function defaultPrompt(kind: AiAssistKind, operatorPrompt?: string): string {
  const extra = String(operatorPrompt ?? "").trim().slice(0, 400);
  if (kind === "enhance_ai") {
    return [
      "Photographically enhance this campaign documentary photo: gentle denoise, clarity, natural color.",
      "Do not add, remove, or invent people, places, text, logos, or backgrounds.",
      "Do not change identity of subjects. Keep documentary truth.",
      extra,
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (kind === "cutout_bg") {
    return [
      "Remove the background completely. Return the main subject on a transparent background.",
      "Do not invent new people or objects. Keep subject edges clean.",
      extra,
    ]
      .filter(Boolean)
      .join(" ");
  }
  return [
    "Inpaint/cleanup only: remove distracting wires, dust spots, or minor sensor dirt.",
    "Do not invent geography, buildings, or people. Do not change faces or clothing meaning.",
    "Keep documentary integrity.",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

async function runImagesEdit(input: {
  sourceAbs: string;
  prompt: string;
  maskAbs?: string;
  label: string;
}): Promise<{ ok: true; bytes: Buffer; format: "png" | "jpeg" } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OpenAI not configured — set OPENAI_API_KEY." };
  }
  try {
    const client = getOpenAIClient();
    const image = await sourceAsPngFile(input.sourceAbs, input.label);
    const mask =
      input.maskAbs && existsSync(input.maskAbs)
        ? await toFile(readFileSync(input.maskAbs), "mask.png", { type: "image/png" })
        : undefined;

    const result = await client.images.edit({
      model: imageModel(),
      image,
      prompt: input.prompt,
      ...(mask ? { mask } : {}),
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      const url = result.data?.[0]?.url;
      if (url) {
        const res = await fetch(url);
        if (!res.ok) return { ok: false, error: `Image download failed (${res.status}).` };
        const arr = Buffer.from(await res.arrayBuffer());
        return { ok: true, bytes: arr, format: "png" };
      }
      return { ok: false, error: "Images API returned no image data." };
    }
    return { ok: true, bytes: Buffer.from(b64, "base64"), format: "png" };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}

async function writeDerivativeRecord(input: {
  photoId: string;
  sourceSrc: string;
  kind: AiAssistKind;
  bytes: Buffer;
  note: string;
  ext: "png" | "jpg";
}): Promise<{ ok: true; record: PhotoDerivativeRecord } | { ok: false; error: string }> {
  const outDirRel = path.join(MEDIA_DERIVATIVES_PUBLIC_REL, input.photoId);
  const outDirAbs = abs(outDirRel);
  mkdirSync(outDirAbs, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
  const filename = `${input.kind}-${stamp}.${input.ext}`;
  const outAbs = path.join(outDirAbs, filename);
  const tmpAbs = `${outAbs}.${process.pid}.tmp`;

  try {
    let outBuf = input.bytes;
    if (input.ext === "jpg") {
      outBuf = await sharp(input.bytes, { failOn: "none" }).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    } else {
      outBuf = await sharp(input.bytes, { failOn: "none" }).png().toBuffer();
    }
    writeFileSync(tmpAbs, outBuf);
    renameSync(tmpAbs, outAbs);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed writing AI derivative." };
  }

  const meta = await sharp(outAbs, { failOn: "none" }).metadata();
  const st = statSync(outAbs);
  const relativePath = path.join(outDirRel, filename).split(path.sep).join("/");
  const publicSrc = `/media/campaign-derivatives/${input.photoId}/${filename}`;
  const record: PhotoDerivativeRecord = {
    id: `${input.photoId}--${input.kind}--${stamp}`,
    sourcePhotoId: input.photoId,
    sourceSrc: input.sourceSrc,
    kind: input.kind as Exclude<PhotoDerivativeKind, "inspect_only">,
    publicSrc,
    relativePath,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    bytes: st.size,
    format: meta.format ?? input.ext,
    createdAt: new Date().toISOString(),
    note: input.note,
  };
  pushPhotoDerivativeRecord(record);
  return { ok: true, record };
}

export async function enhancePhotoDerivative(input: {
  photoId: string;
  confirmEnhance: boolean;
  prompt?: string;
}): Promise<{ ok: boolean; message: string; record?: PhotoDerivativeRecord }> {
  if (!input.confirmEnhance) {
    return { ok: false, message: "confirmEnhance:true required — refuse silent AI enhance." };
  }
  const photoId = String(input.photoId ?? "").trim();
  const source = resolveOriginalSource(photoId);
  if (!source.ok) return { ok: false, message: source.error };

  const prompt = defaultPrompt("enhance_ai", input.prompt);
  const edited = await runImagesEdit({
    sourceAbs: source.absPath,
    prompt,
    label: `${photoId}-enhance`,
  });
  if (!edited.ok) return { ok: false, message: edited.error };

  const written = await writeDerivativeRecord({
    photoId,
    sourceSrc: source.sourceSrc,
    kind: "enhance_ai",
    bytes: edited.bytes,
    ext: "jpg",
    note: `P2 gpt-image enhance · model ${imageModel()} · ${prompt.slice(0, 160)}`,
  });
  if (!written.ok) return { ok: false, message: written.error };
  return {
    ok: true,
    message: `Enhanced derivative ready · ${written.record.publicSrc} (original untouched).`,
    record: written.record,
  };
}

export async function cutoutPhotoBackground(input: {
  photoId: string;
  confirmCutout: boolean;
  prompt?: string;
}): Promise<{ ok: boolean; message: string; record?: PhotoDerivativeRecord }> {
  if (!input.confirmCutout) {
    return { ok: false, message: "confirmCutout:true required — refuse silent background remove." };
  }
  const photoId = String(input.photoId ?? "").trim();
  const source = resolveOriginalSource(photoId);
  if (!source.ok) return { ok: false, message: source.error };

  const prompt = defaultPrompt("cutout_bg", input.prompt);
  const edited = await runImagesEdit({
    sourceAbs: source.absPath,
    prompt,
    label: `${photoId}-cutout`,
  });
  if (!edited.ok) return { ok: false, message: edited.error };

  const written = await writeDerivativeRecord({
    photoId,
    sourceSrc: source.sourceSrc,
    kind: "cutout_bg",
    bytes: edited.bytes,
    ext: "png",
    note: `P2 background cutout · model ${imageModel()} · ${prompt.slice(0, 160)}`,
  });
  if (!written.ok) return { ok: false, message: written.error };
  return {
    ok: true,
    message: `Cutout derivative ready · ${written.record.publicSrc} (original untouched).`,
    record: written.record,
  };
}

export async function inpaintPhotoCleanup(input: {
  photoId: string;
  confirmInpaint: boolean;
  auditNote: string;
  maskBytes?: Buffer;
  prompt?: string;
}): Promise<{ ok: boolean; message: string; record?: PhotoDerivativeRecord }> {
  if (!input.confirmInpaint) {
    return { ok: false, message: "confirmInpaint:true required — refuse silent inpaint." };
  }
  const audit = String(input.auditNote ?? "").trim();
  if (audit.length < 8) {
    return {
      ok: false,
      message: "auditNote required (what was cleaned) — Prefer Unknown / documentary integrity.",
    };
  }
  const photoId = String(input.photoId ?? "").trim();
  const source = resolveOriginalSource(photoId);
  if (!source.ok) return { ok: false, message: source.error };

  let maskAbs: string | undefined;
  if (input.maskBytes?.length) {
    const tmpDir = abs(path.join(MEDIA_DERIVATIVES_PUBLIC_REL, photoId, "_masks"));
    mkdirSync(tmpDir, { recursive: true });
    maskAbs = path.join(tmpDir, `mask-${Date.now()}.png`);
    writeFileSync(maskAbs, input.maskBytes);
  } else {
    return {
      ok: false,
      message: "mask PNG required for inpaint (white = edit region). Original stays untouched.",
    };
  }

  const prompt = defaultPrompt("inpaint_cleanup", input.prompt);
  const edited = await runImagesEdit({
    sourceAbs: source.absPath,
    prompt,
    maskAbs,
    label: `${photoId}-inpaint`,
  });
  if (!edited.ok) return { ok: false, message: edited.error };

  const written = await writeDerivativeRecord({
    photoId,
    sourceSrc: source.sourceSrc,
    kind: "inpaint_cleanup",
    bytes: edited.bytes,
    ext: "jpg",
    note: `P2 inpaint cleanup · audit: ${audit.slice(0, 200)} · model ${imageModel()}`,
  });
  if (!written.ok) return { ok: false, message: written.error };
  return {
    ok: true,
    message: `Inpaint derivative ready · ${written.record.publicSrc} · audit recorded (original untouched).`,
    record: written.record,
  };
}
