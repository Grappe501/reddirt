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
  | "focus_square_1x1"
  /** Pro Edit pack slots registered for promote bridge. */
  | "grade_full"
  | "story_9x16";

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
  tooling: {
    ffmpegAvailable: boolean;
    note: string;
    source?: string;
    ffprobeAvailable?: boolean;
  };
};

export type VideoPosterRecord = {
  id: string;
  outId: string;
  sourcePath: string;
  sourcePublicSrc?: string | null;
  atSeconds: number;
  publicSrc: string;
  relativePath: string;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  createdAt: string;
  speechId?: string;
  youtubeVideoId?: string;
  note?: string;
};

/** Pass 7 — encoded timed excerpt under campaign-derivatives. */
export type VideoClipRecord = {
  id: string;
  outId: string;
  planId?: string;
  clipIndex: number;
  youtubeVideoId?: string;
  speechId?: string;
  startSeconds: number;
  endSeconds: number;
  title?: string;
  quote?: string;
  publicSrc: string;
  relativePath: string;
  sourcePath: string;
  sourcePublicSrc?: string | null;
  bytes?: number | null;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  createdAt: string;
  note?: string;
  /** Video Prep — source or vertical_9x16 social reframe. */
  aspect?: "source" | "vertical_9x16";
};

export type VideoEncodeAspect = "source" | "vertical_9x16";

export type LocalVideoProbeResult = {
  ok: boolean;
  absPath: string | null;
  publicSrc: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  videoCodec: string | null;
  audioCodec: string | null;
  formatName: string | null;
  sizeBytes: number | null;
  bitRate: number | null;
  clipWindow?: { startSeconds: number; endSeconds: number; inBounds: boolean } | null;
  error?: string;
};

export type MediaDerivativesLedger = {
  version: 1;
  updatedAt: string;
  purpose: string;
  photos: PhotoDerivativeRecord[];
  videoPlans: VideoExcerptPlan[];
  /** Pass 3 — batch derivative job history (local). */
  batchRuns?: PhotoDerivativeBatchRun[];
  /** Pass 6 — poster frames extracted from local video masters. */
  videoPosters?: VideoPosterRecord[];
  /** Pass 7 — encoded timed excerpts from plans / manual windows. */
  videoClips?: VideoClipRecord[];
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
