/**
 * Photo Pro Edit plan ops — mutate look / slots / focus after propose.
 * Never invents geography; never silent-renders.
 */
import "server-only";

import { getPhotoEditProject, upsertPhotoEditProject } from "@/lib/campaign-media/photo-edit-store";
import type { PhotoEditProject, PhotoStudioBurnIn } from "@/lib/campaign-media/photo-edit-types";
import {
  PHOTO_EXPORT_SLOTS,
  PHOTO_LOOK_PRESETS,
  type PhotoExportSlot,
  type PhotoLookPreset,
} from "@/lib/campaign-media/photo-look-presets";
import { normalizeBurnIn } from "@/lib/campaign-media/photo-studio-burnin";

export type PhotoEditPlanUpdate =
  | {
      op: "set_meta";
      look?: PhotoLookPreset;
      sharpen?: boolean;
      useFocus?: boolean;
      focusX?: number;
      focusY?: number;
      exportSlots?: PhotoExportSlot[];
      promoteSuggestion?: PhotoExportSlot | null;
      burnIn?: PhotoStudioBurnIn | null;
    }
  | { op: "set_slots"; exportSlots: PhotoExportSlot[] }
  | { op: "toggle_slot"; slot: PhotoExportSlot; enabled?: boolean };

function isLook(v: unknown): v is PhotoLookPreset {
  return typeof v === "string" && (PHOTO_LOOK_PRESETS as readonly string[]).includes(v);
}

function isSlot(v: unknown): v is PhotoExportSlot {
  return typeof v === "string" && (PHOTO_EXPORT_SLOTS as readonly string[]).includes(v);
}

function clampFocus(n: number | undefined): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.min(1, Math.max(0, n));
}

export function updatePhotoEditProject(input: {
  projectId: string;
  updates: PhotoEditPlanUpdate[];
}):
  | { ok: true; project: PhotoEditProject; message: string; warnings: string[] }
  | { ok: false; error: string } {
  const project = getPhotoEditProject(input.projectId);
  if (!project) return { ok: false, error: `Project not found: ${input.projectId}` };
  if (!Array.isArray(input.updates) || !input.updates.length) {
    return { ok: false, error: "updates[] required." };
  }

  let look = project.look;
  let sharpen = project.sharpen;
  let useFocus = project.useFocus;
  let focusX = project.focusX;
  let focusY = project.focusY;
  let exportSlots = [...project.exportSlots];
  let promoteSuggestion = project.promoteSuggestion ?? null;
  let burnIn = project.burnIn;
  const warnings: string[] = [];

  for (const u of input.updates.slice(0, 40)) {
    if (u.op === "set_meta") {
      if (u.look !== undefined) {
        if (!isLook(u.look)) {
          warnings.push(`Ignored invalid look: ${String(u.look)}`);
        } else {
          look = u.look;
        }
      }
      if (typeof u.sharpen === "boolean") sharpen = u.sharpen;
      if (typeof u.useFocus === "boolean") useFocus = u.useFocus;
      if (u.focusX !== undefined) focusX = clampFocus(u.focusX);
      if (u.focusY !== undefined) focusY = clampFocus(u.focusY);
      if (u.exportSlots?.length) {
        exportSlots = u.exportSlots.filter(isSlot).slice(0, 12);
      }
      if (u.promoteSuggestion === null) promoteSuggestion = null;
      else if (u.promoteSuggestion !== undefined) {
        if (isSlot(u.promoteSuggestion)) promoteSuggestion = u.promoteSuggestion;
        else warnings.push(`Ignored invalid promoteSuggestion: ${String(u.promoteSuggestion)}`);
      }
      if (u.burnIn === null) burnIn = undefined;
      else if (u.burnIn !== undefined) burnIn = normalizeBurnIn(u.burnIn);
    } else if (u.op === "set_slots") {
      exportSlots = (u.exportSlots ?? []).filter(isSlot).slice(0, 12);
      if (!exportSlots.length) warnings.push("Slot list empty — add at least one before render.");
    } else if (u.op === "toggle_slot") {
      if (!isSlot(u.slot)) {
        warnings.push(`Ignored invalid slot: ${String(u.slot)}`);
        continue;
      }
      const enabled = u.enabled !== false;
      const has = exportSlots.includes(u.slot);
      if (enabled && !has) exportSlots.push(u.slot);
      if (!enabled && has) exportSlots = exportSlots.filter((s) => s !== u.slot);
    }
  }

  if (promoteSuggestion && !exportSlots.includes(promoteSuggestion)) {
    promoteSuggestion = exportSlots[0] ?? null;
  }
  if (burnIn?.primarySlot && isSlot(burnIn.primarySlot)) {
    if (!exportSlots.includes(burnIn.primarySlot)) {
      exportSlots = [burnIn.primarySlot, ...exportSlots].slice(0, 12);
    }
    if (!promoteSuggestion) promoteSuggestion = burnIn.primarySlot;
  }

  const next: PhotoEditProject = {
    ...project,
    look,
    sharpen,
    useFocus,
    focusX: useFocus ? focusX : undefined,
    focusY: useFocus ? focusY : undefined,
    exportSlots,
    promoteSuggestion,
    burnIn,
    updatedAt: new Date().toISOString(),
    notes: [
      project.notes,
      "Plan updated by operator (look/slots/focus/burn-in — no silent render).",
    ]
      .filter(Boolean)
      .join(" · "),
  };
  upsertPhotoEditProject(next);
  return {
    ok: true,
    project: next,
    message: `Photo edit plan updated · ${next.look} · ${next.exportSlots.length} slot(s).`,
    warnings,
  };
}
