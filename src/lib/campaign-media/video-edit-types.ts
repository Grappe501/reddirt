/**
 * Evidence Video Pro Edit — project + assembly types (client-safe).
 */

import type {
  VideoCaptionMode,
  VideoExportAspect,
  VideoLookPreset,
  VideoTransitionKind,
} from "@/lib/campaign-media/video-look-presets";

export const VIDEO_PRO_EDITS_REL = "data/campaign-media/video-pro-edits.json";

export type VideoEditClip = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  title?: string;
  quote?: string;
  sourcePlanId?: string;
  sourceClipIndex?: number;
};

export type VideoEditProject = {
  id: string;
  speechId: string;
  youtubeVideoId?: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  clips: VideoEditClip[];
  transition: VideoTransitionKind;
  look: VideoLookPreset;
  captionMode: VideoCaptionMode;
  exportAspects: VideoExportAspect[];
  loudnorm: boolean;
  notes?: string;
  directorRationale?: string;
};

export type VideoCaptionRecord = {
  id: string;
  projectId: string;
  outId: string;
  format: "srt" | "vtt";
  publicSrc: string;
  relativePath: string;
  createdAt: string;
  segmentCount: number;
  note?: string;
};

export type VideoAssemblyRecord = {
  id: string;
  projectId: string;
  outId: string;
  speechId?: string;
  aspect: VideoExportAspect;
  look: VideoLookPreset;
  transition: VideoTransitionKind;
  captionMode: VideoCaptionMode;
  publicSrc: string;
  relativePath: string;
  sourcePath: string;
  bytes?: number | null;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  captionPublicSrc?: string | null;
  createdAt: string;
  note?: string;
};

export type VideoProEditsStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  projects: VideoEditProject[];
  captions: VideoCaptionRecord[];
  assemblies: VideoAssemblyRecord[];
};

export type VideoEditDirectorPacket = {
  ok: boolean;
  message: string;
  project: VideoEditProject | null;
  warnings: string[];
  nextActions: string[];
};
