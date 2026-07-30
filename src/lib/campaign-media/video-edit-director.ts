/**
 * AI / deterministic Edit Director — proposes an Edit Project (no silent render).
 */

import { findLocalVideoMaster } from "@/lib/campaign-media/local-video-masters";
import { getVideoExcerptPlan, listVideoExcerptPlans } from "@/lib/campaign-media/media-derivatives";
import { loadTranscriptIntelStore } from "@/lib/campaign-media/transcript-intelligence";
import { upsertVideoEditProject } from "@/lib/campaign-media/video-edit-store";
import type {
  VideoEditClip,
  VideoEditDirectorPacket,
  VideoEditProject,
} from "@/lib/campaign-media/video-edit-types";
import type {
  VideoCaptionMode,
  VideoExportAspect,
  VideoLookPreset,
  VideoTransitionKind,
} from "@/lib/campaign-media/video-look-presets";

function clipId(i: number): string {
  return `clip-${i + 1}`;
}

export function proposeVideoEditProject(input: {
  speechId: string;
  youtubeVideoId: string;
  planId?: string;
  maxClips?: number;
  transition?: VideoTransitionKind;
  look?: VideoLookPreset;
  captionMode?: VideoCaptionMode;
  exportAspects?: VideoExportAspect[];
  loudnorm?: boolean;
  persist?: boolean;
}): VideoEditDirectorPacket {
  const speechId = String(input.speechId ?? "").trim();
  const youtubeVideoId = String(input.youtubeVideoId ?? "").trim();
  const warnings: string[] = [];
  const nextActions: string[] = [];

  if (!speechId || !youtubeVideoId) {
    return {
      ok: false,
      message: "speechId and youtubeVideoId required.",
      project: null,
      warnings: ["Missing ids."],
      nextActions: ["Open a speech with a YouTube id."],
    };
  }

  const master = findLocalVideoMaster({ speechId, youtubeVideoId });
  if (!master) {
    warnings.push("No local master matched — drop a master before Confirm render.");
    nextActions.push("Drop master into campaign-video-masters/ or .local/video-masters/.");
  }

  const maxClips = Math.min(Math.max(Number(input.maxClips) || 3, 1), 6);
  const clips: VideoEditClip[] = [];

  const plan =
    (input.planId ? getVideoExcerptPlan(input.planId) : null) ??
    listVideoExcerptPlans(youtubeVideoId)[0] ??
    null;

  if (plan?.clips?.length) {
    plan.clips.slice(0, maxClips).forEach((c, i) => {
      clips.push({
        id: clipId(i),
        startSeconds: c.startSeconds,
        endSeconds: c.endSeconds,
        title: c.title,
        quote: c.quote,
        sourcePlanId: plan!.id,
        sourceClipIndex: i,
      });
    });
  } else {
    warnings.push("No excerpt plan — using transcript intel quotes if available.");
    const intel = loadTranscriptIntelStore().proposals.find(
      (p) => p.youtubeVideoId === youtubeVideoId || p.speechId === speechId,
    );
    if (intel?.quotes?.length) {
      intel.quotes.slice(0, maxClips).forEach((q, i) => {
        clips.push({
          id: clipId(i),
          startSeconds: q.startSeconds,
          endSeconds: Math.max(q.startSeconds + 0.4, q.endSeconds),
          title: q.text.slice(0, 72),
          quote: q.text,
        });
      });
    } else {
      warnings.push("No plan or intel quotes — cannot build a cut list yet.");
      nextActions.push("Run Prep package / Plan excerpts / Analyze transcript first.");
    }
  }

  if (clips.length < 1) {
    return {
      ok: false,
      message: "Edit Director: no clips to assemble.",
      project: null,
      warnings,
      nextActions,
    };
  }

  const captionMode: VideoCaptionMode = input.captionMode ?? "sidecar";
  const look: VideoLookPreset = input.look ?? "neutral";
  const transition: VideoTransitionKind =
    input.transition ?? (clips.length > 1 ? "crossfade" : "none");
  const exportAspects: VideoExportAspect[] = input.exportAspects?.length
    ? input.exportAspects
    : ["source", "vertical_9x16", "square_1x1"];

  const now = new Date().toISOString();
  const project: VideoEditProject = {
    id: `vedit-${speechId}-${Date.now().toString(36)}`,
    speechId,
    youtubeVideoId,
    createdAt: now,
    updatedAt: now,
    title: `Pro edit · ${speechId}`,
    clips,
    transition,
    look,
    captionMode,
    exportAspects,
    loudnorm: input.loudnorm !== false,
    directorRationale: plan
      ? `Built from excerpt plan ${plan.id} (${clips.length} clips).`
      : `Built from transcript intel quotes (${clips.length} clips).`,
    notes: "Review cut list, then Confirm render. Captions are verbatim from local transcript only.",
  };

  if (input.persist !== false) upsertVideoEditProject(project);

  nextActions.push("Review clip order/times on Videos → Pro Edit.");
  nextActions.push("Confirm render to concat + look + loudnorm + export pack.");
  if (captionMode !== "none") {
    nextActions.push("Captions require a local transcript workspace.");
  }

  return {
    ok: true,
    message: `Edit Director proposed ${clips.length} clip(s) · ${transition} · ${look} · ${exportAspects.join("+")}`,
    project,
    warnings,
    nextActions,
  };
}
