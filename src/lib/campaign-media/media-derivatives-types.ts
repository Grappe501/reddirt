/** Shared media derivative types (safe for client + server). */

export type PhotoDerivativeKind =
  | "inspect_only"
  | "web_max"
  | "thumb"
  | "hero_16x9"
  | "portrait_4x5"
  | "square_1x1"
  | "auto_orient"
  /** Pass 5 — cover crops that honor an explicit focus point (or attention if none). */
  | "focus_hero_16x9"
  | "focus_portrait_4x5"
  | "focus_square_1x1";

export type PhotoDerivativeRecord = {
  id: string;
  sourcePhotoId: string;
  sourceSrc: string;
  kind: Exclude<PhotoDerivativeKind, "inspect_only">;
  publicSrc: string;
  relativePath: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  createdAt: string;
  note?: string;
  /** Normalized focus used for this crop (0–1), when applicable. */
  focusX?: number;
  focusY?: number;
};

export type VideoExcerptClip = {
  startSeconds: number;
  endSeconds: number;
  title: string;
  quote: string;
  reason: string;
};

export type VideoExcerptPlan = {
  id: string;
  youtubeVideoId: string;
  createdAt: string;
  query: string;
  clips: VideoExcerptClip[];
  tooling: { ffmpegAvailable: boolean; note: string };
};

export type MediaDerivativesLedger = {
  version: 1;
  updatedAt: string;
  purpose: string;
  photos: PhotoDerivativeRecord[];
  videoPlans: VideoExcerptPlan[];
  /** Pass 3 — batch derivative job history (local). */
  batchRuns?: PhotoDerivativeBatchRun[];
};

export type PhotoDerivativeBatchRun = {
  id: string;
  createdAt: string;
  photoIds: string[];
  kinds: Array<Exclude<PhotoDerivativeKind, "inspect_only">>;
  createdCount: number;
  errorCount: number;
  note?: string;
};

export type PhotoPixelInspect = {
  found: boolean;
  photoId: string | null;
  src: string | null;
  absPath: string | null;
  bytes: number | null;
  format: string | null;
  width: number | null;
  height: number | null;
  orientation: number | null;
  space: string | null;
  hasAlpha: boolean | null;
  density: number | null;
  aspectRatio: number | null;
  isLandscape: boolean | null;
  isPortrait: boolean | null;
  reason?: string;
};
