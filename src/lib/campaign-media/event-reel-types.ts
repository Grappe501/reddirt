/**
 * Event reel proposals — stills slideshow (+ optional speech refs).
 * Client-safe types. Confirm render is separate and never auto-runs.
 */

export const EVENT_REELS_REL = "data/campaign-media/event-reels.json";

export type EventReelStill = {
  photoId: string;
  publicSrc: string;
  durationSec: number;
  county: string;
  city: string;
  score: number;
  title?: string;
};

export type EventReelAssembly = {
  id: string;
  projectId: string;
  aspect: "landscape_16x9" | "vertical_9x16";
  publicSrc: string;
  relativePath: string;
  createdAt: string;
  stillCount: number;
  note?: string;
};

export type EventReelProject = {
  id: string;
  calendarRowId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  date: string;
  summary: string;
  stills: EventReelStill[];
  speechIds: string[];
  stillDurationSec: number;
  exportAspects: Array<"landscape_16x9" | "vertical_9x16">;
  notes: string;
  status: "proposed" | "rendered";
  assemblies?: EventReelAssembly[];
};

export type EventReelsStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  projects: EventReelProject[];
};

export type EventReelProposeResult = {
  ok: boolean;
  message: string;
  project: EventReelProject | null;
  warnings: string[];
  nextActions: string[];
};
