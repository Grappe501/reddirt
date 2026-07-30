/**
 * AI / deterministic Photo Edit Director — proposes an Edit Project (no silent render).
 */

import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { inspectPhotoPixels, suggestCropPlan } from "@/lib/campaign-media/media-derivatives";
import { upsertPhotoEditProject } from "@/lib/campaign-media/photo-edit-store";
import type { PhotoEditDirectorPacket, PhotoEditProject } from "@/lib/campaign-media/photo-edit-types";
import {
  DEFAULT_PHOTO_EXPORT_SLOTS,
  type PhotoExportSlot,
  type PhotoLookPreset,
} from "@/lib/campaign-media/photo-look-presets";
import { getTurboProposal } from "@/lib/campaign-media/turbo-ingest-store";

function pickLook(input?: PhotoLookPreset): PhotoLookPreset {
  if (
    input === "warm" ||
    input === "cool" ||
    input === "contrast" ||
    input === "soft" ||
    input === "punch" ||
    input === "mono" ||
    input === "film" ||
    input === "bright" ||
    input === "editorial" ||
    input === "neutral"
  ) {
    return input;
  }
  return "warm";
}

function pickPromoteSuggestion(
  slots: PhotoExportSlot[],
  aspectClass: "landscape" | "portrait" | "square" | "unknown",
): PhotoExportSlot | null {
  if (aspectClass === "portrait" && slots.includes("portrait_4x5")) return "portrait_4x5";
  if (aspectClass === "portrait" && slots.includes("story_9x16")) return "story_9x16";
  if (slots.includes("hero_16x9")) return "hero_16x9";
  if (slots.includes("square_1x1")) return "square_1x1";
  if (slots.includes("grade_full")) return "grade_full";
  return slots[0] ?? null;
}

export async function proposePhotoEditProject(input: {
  photoId: string;
  look?: PhotoLookPreset;
  exportSlots?: PhotoExportSlot[];
  useFocus?: boolean;
  focusX?: number;
  focusY?: number;
  sharpen?: boolean;
  persist?: boolean;
}): Promise<PhotoEditDirectorPacket> {
  const photoId = String(input.photoId ?? "").trim();
  const warnings: string[] = [];
  const nextActions: string[] = [];

  if (!photoId) {
    return {
      ok: false,
      message: "photoId required.",
      project: null,
      warnings: ["Missing photoId."],
      nextActions: ["Open a still in Photos."],
    };
  }

  const live = listCampaignPhotosLive().find((p) => p.id === photoId);
  if (!live) {
    return {
      ok: false,
      message: `Photo not found: ${photoId}`,
      project: null,
      warnings: ["Still not in live registry/drafts."],
      nextActions: ["Intake the still, then retry."],
    };
  }

  const overlay = loadPhotoEvidenceStore().photos[photoId] ?? null;
  const focusX =
    typeof input.focusX === "number"
      ? input.focusX
      : typeof overlay?.focusX === "number"
        ? overlay.focusX
        : undefined;
  const focusY =
    typeof input.focusY === "number"
      ? input.focusY
      : typeof overlay?.focusY === "number"
        ? overlay.focusY
        : undefined;
  const hasFocus =
    typeof focusX === "number" &&
    typeof focusY === "number" &&
    Number.isFinite(focusX) &&
    Number.isFinite(focusY);
  const useFocus = input.useFocus !== false && hasFocus;
  if (!hasFocus) {
    warnings.push("No focus point — cover crops will use attention/center. Click the photo to set focus.");
    nextActions.push("Click the still to set focus, then Propose again for tighter packs.");
  }

  const inspect = await inspectPhotoPixels({ photoId });
  let aspectClass: "landscape" | "portrait" | "square" | "unknown" = "unknown";
  if (inspect.found) {
    if (inspect.isLandscape) aspectClass = "landscape";
    else if (inspect.isPortrait) aspectClass = "portrait";
    else if (inspect.width && inspect.height) aspectClass = "square";
  } else {
    warnings.push(inspect.reason ?? "Pixel inspect failed.");
  }

  const explicitSlots = Boolean(input.exportSlots?.length);
  let slots: PhotoExportSlot[] = explicitSlots
    ? [...(input.exportSlots as PhotoExportSlot[])]
    : [...DEFAULT_PHOTO_EXPORT_SLOTS];

  if (!explicitSlots) {
    const plan = await suggestCropPlan(photoId);
    if (plan.ok) {
      const kinds = new Set(plan.plan.recommended.map((r) => r.kind));
      if (!kinds.has("hero_16x9") && !kinds.has("focus_hero_16x9") && aspectClass === "portrait") {
        slots = slots.filter((s) => s !== "hero_16x9");
      }
    }
    // Always keep delivery slots on the default pack.
    for (const required of ["grade_full", "web_max", "thumb", "square_1x1", "story_9x16"] as const) {
      if (!slots.includes(required)) slots.push(required);
    }
  }

  const look = pickLook(input.look);
  const sharpen = input.sharpen === true;
  const promoteSuggestion = pickPromoteSuggestion(slots, aspectClass);

  let turboNote = "";
  try {
    const turbo = getTurboProposal(photoId);
    if (turbo?.fit?.bestSurface) {
      turboNote = ` Turbo fit top: ${turbo.fit.bestSurface} (${turbo.fit.bestScore}).`;
    } else if (turbo?.fit?.rankings?.[0]) {
      const top = turbo.fit.rankings[0];
      turboNote = ` Turbo fit top: ${top.surface} (${top.score}).`;
    }
  } catch {
    /* optional */
  }

  const now = new Date().toISOString();
  const project: PhotoEditProject = {
    id: `pedit-${photoId}-${Date.now().toString(36)}`,
    photoId,
    createdAt: now,
    updatedAt: now,
    title: `Pro edit · ${photoId}`,
    look,
    exportSlots: slots,
    useFocus,
    focusX: hasFocus ? focusX : undefined,
    focusY: hasFocus ? focusY : undefined,
    sharpen,
    promoteSuggestion,
    directorRationale: `Aspect ${aspectClass}; look ${look}; ${slots.length} slots; focus ${
      useFocus ? "on" : "off"
    }.${turboNote}`,
    notes: "Review slots/look, then Confirm render. Promote is separate — never auto-promotes.",
  };

  if (input.persist !== false) upsertPhotoEditProject(project);

  nextActions.push("Review look + export slots on Photos → Pro Edit.");
  nextActions.push("Confirm render to write the graded multi-aspect pack.");
  if (promoteSuggestion) {
    nextActions.push(`After render, consider Promote on ${promoteSuggestion} (explicit).`);
  }

  return {
    ok: true,
    message: `Photo Edit Director proposed ${slots.length} slot(s) · ${look}${
      useFocus ? " · focus-aware" : ""
    }`,
    project,
    warnings,
    nextActions,
  };
}
