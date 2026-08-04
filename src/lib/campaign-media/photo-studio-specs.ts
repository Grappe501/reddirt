/**
 * Client-safe Photo Studio specs (no sharp).
 * Mirrors photoSlotSpec aspects for live canvas artboards.
 */

import type { PhotoExportSlot, PhotoLookPreset } from "@/lib/campaign-media/photo-look-presets";

export type StudioArtboard = {
  slot: PhotoExportSlot;
  label: string;
  /** width/height; null = free / fit-inside */
  aspect: number | null;
  /** Social slots show safe-margin guides */
  socialSafe: boolean;
};

export function studioArtboard(slot: PhotoExportSlot): StudioArtboard {
  switch (slot) {
    case "hero_16x9":
      return { slot, label: "16:9 Hero", aspect: 16 / 9, socialSafe: false };
    case "portrait_4x5":
      return { slot, label: "4:5 Portrait", aspect: 4 / 5, socialSafe: true };
    case "square_1x1":
      return { slot, label: "1:1 Square", aspect: 1, socialSafe: true };
    case "story_9x16":
      return { slot, label: "9:16 Story", aspect: 9 / 16, socialSafe: true };
    case "web_max":
      return { slot, label: "Web", aspect: null, socialSafe: false };
    case "thumb":
      return { slot, label: "Thumb", aspect: null, socialSafe: false };
    case "grade_full":
    default:
      return { slot, label: "Full", aspect: null, socialSafe: false };
  }
}

/** Approximate look grades with CSS filters (preview only — confirm render uses sharp). */
export function studioLookCssFilter(look: PhotoLookPreset | string): string {
  switch (look) {
    case "warm":
      return "saturate(1.12) brightness(1.03) sepia(0.18)";
    case "cool":
      return "saturate(1.08) brightness(1.01) hue-rotate(12deg)";
    case "contrast":
      return "contrast(1.22) saturate(1.1)";
    case "soft":
      return "brightness(1.04) saturate(0.9) blur(0.3px)";
    case "punch":
      return "saturate(1.28) brightness(1.04) contrast(1.12)";
    case "mono":
      return "grayscale(1) contrast(1.08)";
    case "film":
      return "saturate(0.85) contrast(1.1) sepia(0.22)";
    case "bright":
      return "brightness(1.12) saturate(1.05)";
    case "editorial":
      return "contrast(1.14) saturate(0.95) brightness(1.02)";
    case "neutral":
    default:
      return "none";
  }
}

export const STUDIO_BRAND_TEXT_PRESETS = [
  { id: "none", label: "No text", text: "" },
  { id: "kelly", label: "Kelly Grappe", text: "Kelly Grappe" },
  { id: "sos", label: "For Secretary of State", text: "For Secretary of State" },
  { id: "arkansas", label: "Across Arkansas", text: "Across Arkansas" },
] as const;
