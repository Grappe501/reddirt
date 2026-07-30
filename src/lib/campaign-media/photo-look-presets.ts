/**
 * Photo look presets — sharp-friendly grade chains (non-destructive; originals untouched).
 */

import type { Sharp } from "sharp";

export const PHOTO_LOOK_PRESETS = [
  "neutral",
  "warm",
  "cool",
  "contrast",
  "soft",
  "punch",
  "mono",
] as const;
export type PhotoLookPreset = (typeof PHOTO_LOOK_PRESETS)[number];

/** Named export slots for a Pro Edit pack (surpasses one-off derivative buttons). */
export const PHOTO_EXPORT_SLOTS = [
  "grade_full",
  "hero_16x9",
  "portrait_4x5",
  "square_1x1",
  "story_9x16",
  "web_max",
  "thumb",
] as const;
export type PhotoExportSlot = (typeof PHOTO_EXPORT_SLOTS)[number];

export type PhotoSlotSpec = {
  slot: PhotoExportSlot;
  /** Target aspect for cover crops; null = fit-inside (no crop). */
  aspect: number | null;
  maxEdge: number;
  quality: number;
  label: string;
};

export function photoSlotSpec(slot: PhotoExportSlot): PhotoSlotSpec {
  switch (slot) {
    case "grade_full":
      return { slot, aspect: null, maxEdge: 1920, quality: 88, label: "Full-frame grade" };
    case "hero_16x9":
      return { slot, aspect: 16 / 9, maxEdge: 1920, quality: 86, label: "Hero 16:9" };
    case "portrait_4x5":
      return { slot, aspect: 4 / 5, maxEdge: 1080, quality: 86, label: "Portrait 4:5" };
    case "square_1x1":
      return { slot, aspect: 1, maxEdge: 1200, quality: 86, label: "Square 1:1" };
    case "story_9x16":
      return { slot, aspect: 9 / 16, maxEdge: 1080, quality: 86, label: "Story 9:16" };
    case "web_max":
      return { slot, aspect: null, maxEdge: 1600, quality: 82, label: "Web max" };
    case "thumb":
      return { slot, aspect: null, maxEdge: 480, quality: 78, label: "Thumb" };
    default: {
      const _exhaustive: never = slot;
      return _exhaustive;
    }
  }
}

export const DEFAULT_PHOTO_EXPORT_SLOTS: PhotoExportSlot[] = [
  "grade_full",
  "hero_16x9",
  "portrait_4x5",
  "square_1x1",
  "story_9x16",
  "web_max",
  "thumb",
];

/**
 * Apply a named look onto an existing sharp pipeline (after crop/resize).
 * Uses modulate / linear / grayscale / mild sharpen — not a LUT marketplace.
 */
export function applyPhotoLook(
  pipeline: Sharp,
  look: PhotoLookPreset | string | undefined,
): Sharp {
  switch (look) {
    case "warm":
      return pipeline
        .modulate({ brightness: 1.02, saturation: 1.1 })
        .tint({ r: 255, g: 232, b: 208 });
    case "cool":
      return pipeline
        .modulate({ brightness: 1.0, saturation: 1.06 })
        .tint({ r: 208, g: 224, b: 255 });
    case "contrast":
      return pipeline.linear(1.18, -(128 * 0.18)).modulate({ saturation: 1.08 });
    case "soft":
      return pipeline.modulate({ brightness: 1.03, saturation: 0.92 }).blur(0.35);
    case "punch":
      return pipeline
        .modulate({ brightness: 1.03, saturation: 1.22 })
        .sharpen({ sigma: 0.8 })
        .linear(1.08, -(128 * 0.08));
    case "mono":
      return pipeline.grayscale().modulate({ brightness: 1.02 }).linear(1.1, -(128 * 0.1));
    case "neutral":
    default:
      return pipeline;
  }
}
