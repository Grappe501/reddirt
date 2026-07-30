/**
 * Evidence Photo Pro Edit — project + assembly types (client-safe).
 */

import type { PhotoExportSlot, PhotoLookPreset } from "@/lib/campaign-media/photo-look-presets";

export const PHOTO_PRO_EDITS_REL = "data/campaign-media/photo-pro-edits.json";

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
