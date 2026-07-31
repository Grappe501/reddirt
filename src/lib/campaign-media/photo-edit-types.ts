/**
 * Evidence Photo Pro Edit — project + assembly types (client-safe).
 */

import type { PhotoExportSlot, PhotoLookPreset } from "@/lib/campaign-media/photo-look-presets";

export const PHOTO_PRO_EDITS_REL = "data/campaign-media/photo-pro-edits.json";

/** V2.1 — Studio burn-in that Confirm / Finish must honor. */
export type PhotoStudioBurnIn = {
  /** When true and text non-empty, composite text onto assemblies. */
  burnText: boolean;
  text: string;
  textPosition: "top" | "bottom";
  /** When true and aiLayerPublicSrc set, composite AI derivative under text. */
  includeAiLayer: boolean;
  /** Public URL under /media/campaign-derivatives/… */
  aiLayerPublicSrc?: string;
  /** Primary artboard hint (promote suggestion soft-bias). */
  primarySlot?: PhotoExportSlot;
};

export type PhotoEditProject = {
  id: string;
  photoId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  look: PhotoLookPreset;
  exportSlots: PhotoExportSlot[];
  /** Honor saved / passed focus for cover crops. */
  useFocus: boolean;
  focusX?: number;
  focusY?: number;
  sharpen: boolean;
  /** Suggested promote slot after render (never auto-promotes). */
  promoteSuggestion?: PhotoExportSlot | null;
  directorRationale?: string;
  notes?: string;
  /** V2.1 studio composition burned into Confirm render. */
  burnIn?: PhotoStudioBurnIn;
};

export type PhotoAssemblyRecord = {
  id: string;
  projectId: string;
  photoId: string;
  slot: PhotoExportSlot;
  look: PhotoLookPreset;
  publicSrc: string;
  relativePath: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  focusX?: number;
  focusY?: number;
  createdAt: string;
  note?: string;
};

export type PhotoProEditsStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  projects: PhotoEditProject[];
  assemblies: PhotoAssemblyRecord[];
};

export type PhotoEditDirectorPacket = {
  ok: boolean;
  message: string;
  project: PhotoEditProject | null;
  warnings: string[];
  nextActions: string[];
};
