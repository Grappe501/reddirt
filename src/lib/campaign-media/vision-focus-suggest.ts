/**
 * P2 — Vision focus box + crop advice (replaces keyword-only framing for suggest).
 * Prefer Unknown. Never invents geography. Propose-only unless applyFocus confirmed.
 */
import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import { clamp01, mapVisionRecommendedKind } from "@/lib/campaign-media/focus-crop";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";

export type VisionFocusBox = {
  /** Normalized 0–1 left */
  x: number;
  /** Normalized 0–1 top */
  y: number;
  /** Normalized 0–1 width */
  w: number;
  /** Normalized 0–1 height */
  h: number;
};

export type VisionFocusSuggestion = {
  focusX: number;
  focusY: number;
  focusBox: VisionFocusBox | null;
  cropAdvice: string;
  recommendedKind: "focus_hero_16x9" | "focus_portrait_4x5" | "focus_square_1x1";
  confidence: "high" | "medium" | "low";
  warnings: string[];
  rationale: string;
};

function readPublicImageAsDataUrl(src: string): string | null {
  if (!src.startsWith("/")) return null;
  const rel = src.replace(/^\//, "");
  let absPath = path.join(process.cwd(), "public", rel);
  if (!existsSync(absPath)) {
    try {
      absPath = path.join(process.cwd(), "public", decodeURIComponent(rel));
    } catch {
      return null;
    }
  }
  if (!existsSync(absPath)) return null;
  if (absPath.includes(`${path.sep}campaign-derivatives${path.sep}`)) {
    // Prefer originals for Vision framing — still allow if only override exists.
  }
  const buf = readFileSync(absPath);
  if (buf.length > 3_500_000) return null;
  const ext = path.extname(absPath).toLowerCase();
  const mimeType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
          ? "image/gif"
          : "image/jpeg";
  return `data:${mimeType};base64,${buf.toString("base64")}`;
}

function resolvePhotoSrc(photoId: string): string | null {
  const live = listCampaignPhotosLive().find((p) => p.id === photoId);
  const registry =
    CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId) ??
    loadPhotoIngestDrafts().photos.find((p) => p.id === photoId) ??
    null;
  // Prefer original registry/draft src for Vision (not shipped override).
  return registry?.src ?? live?.src ?? null;
}

function parseBox(raw: unknown): VisionFocusBox | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const x = Number(o.x);
  const y = Number(o.y);
  const w = Number(o.w ?? o.width);
  const h = Number(o.h ?? o.height);
  if (![x, y, w, h].every((n) => Number.isFinite(n))) return null;
  const box = {
    x: clamp01(x),
    y: clamp01(y),
    w: Math.min(1, Math.max(0.05, w)),
    h: Math.min(1, Math.max(0.05, h)),
  };
  if (box.x + box.w > 1) box.w = 1 - box.x;
  if (box.y + box.h > 1) box.h = 1 - box.y;
  return box;
}

function centerFromBox(box: VisionFocusBox): { x: number; y: number } {
  return {
    x: clamp01(box.x + box.w / 2),
    y: clamp01(box.y + box.h / 2),
  };
}

/**
 * Suggest focus point + crop advice via Vision. Does not write derivatives or overlays.
 */
export async function suggestFocusAndCropWithVision(input: {
  photoId: string;
}): Promise<
  | { ok: true; suggestion: VisionFocusSuggestion; message: string }
  | { ok: false; error: string }
> {
  const photoId = String(input.photoId ?? "").trim();
  if (!photoId) return { ok: false, error: "photoId required." };
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OpenAI not configured — set OPENAI_API_KEY." };
  }

  const src = resolvePhotoSrc(photoId);
  if (!src) return { ok: false, error: `Photo not found: ${photoId}` };
  const imageDataUrl = readPublicImageAsDataUrl(src);
  if (!imageDataUrl) {
    return {
      ok: false,
      error: "Could not load image for Vision (missing or >3.5MB).",
    };
  }

  const { model } = getOpenAIConfigFromEnv();
  const client = getOpenAIClient();
  const system = `You are a photo framing assistant for a campaign evidence desk.
Return ONE JSON object only (no markdown) with:
  focusX (0-1), focusY (0-1),
  focusBox { x, y, w, h } normalized 0-1 subject box or null,
  cropAdvice (short framing sentence),
  recommendedKind one of: focus_hero_16x9 | focus_portrait_4x5 | focus_square_1x1,
  confidence high|medium|low,
  warnings[] (strings),
  rationale (one sentence).
Hard rules:
- Never invent county, city, venue, people names, or dates.
- Prefer Unknown — do not guess geography.
- focusX/focusY = subject attention point for cover crops.
- cropAdvice is framing only (hero/portrait/square), not captioning.`;

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Suggest focus + crop framing for campaign still id=${photoId}. Image only — no geography.`,
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) return { ok: false, error: "Vision returned empty framing suggestion." };

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const warnings = Array.isArray(parsed.warnings)
      ? parsed.warnings.map((w) => String(w)).slice(0, 8)
      : [];
    // Strip accidental geography-ish keys if model drifts
    for (const banned of ["county", "city", "venue", "eventDate", "peopleVisible"]) {
      if (parsed[banned] != null) {
        warnings.push(`Ignored model field: ${banned} (Prefer Unknown).`);
      }
    }

    const focusBox = parseBox(parsed.focusBox);
    let focusX =
      typeof parsed.focusX === "number" && Number.isFinite(parsed.focusX)
        ? clamp01(parsed.focusX)
        : null;
    let focusY =
      typeof parsed.focusY === "number" && Number.isFinite(parsed.focusY)
        ? clamp01(parsed.focusY)
        : null;
    if ((focusX == null || focusY == null) && focusBox) {
      const c = centerFromBox(focusBox);
      focusX = c.x;
      focusY = c.y;
    }
    if (focusX == null || focusY == null) {
      focusX = 0.5;
      focusY = 0.5;
      warnings.push("Vision focus missing — defaulted to center.");
    }

    const cropAdvice = String(parsed.cropAdvice ?? "").trim() || "Keep subject centered; prefer hero framing.";
    const kind =
      mapVisionRecommendedKind(String(parsed.recommendedKind ?? "")) ??
      mapVisionRecommendedKind(cropAdvice) ??
      "focus_hero_16x9";
    const confidenceRaw = String(parsed.confidence ?? "medium").toLowerCase();
    const confidence =
      confidenceRaw === "high" || confidenceRaw === "low" ? confidenceRaw : "medium";

    const suggestion: VisionFocusSuggestion = {
      focusX,
      focusY,
      focusBox,
      cropAdvice: cropAdvice.slice(0, 280),
      recommendedKind: kind,
      confidence,
      warnings,
      rationale: String(parsed.rationale ?? "Vision framing suggestion.").slice(0, 240),
    };

    return {
      ok: true,
      suggestion,
      message: `Vision focus ${suggestion.focusX.toFixed(2)},${suggestion.focusY.toFixed(2)} · ${suggestion.recommendedKind} · ${suggestion.confidence}`,
    };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}
