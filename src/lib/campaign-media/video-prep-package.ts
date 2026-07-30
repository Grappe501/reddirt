/**
 * Evidence Video Prep — one orchestrator over Pass 6–8 video tooling.
 * Review packet only; encode/poster writes require explicit flags.
 */

import { probeVideoTooling } from "@/lib/campaign-media/ffmpeg-tooling";
import { findLocalVideoMaster } from "@/lib/campaign-media/local-video-masters";
import {
  encodeVideoExcerptPlan,
  extractLocalVideoPoster,
  listVideoClips,
  listVideoPosters,
  planVideoExcerpt,
} from "@/lib/campaign-media/media-derivatives";
import type {
  VideoClipRecord,
  VideoEncodeAspect,
  VideoExcerptPlan,
  VideoPosterRecord,
} from "@/lib/campaign-media/media-derivatives-types";
import {
  analyzeTranscriptIntelligence,
  type TranscriptIntelProposal,
} from "@/lib/campaign-media/transcript-intelligence";
import { loadSpeechEvidenceStore } from "@/lib/campaign-media/evidence-store";

export type VideoPrepPacket = {
  ok: boolean;
  message: string;
  speechId: string;
  youtubeVideoId: string;
  query: string;
  tooling: {
    ffmpegAvailable: boolean;
    ffprobeAvailable: boolean;
    source?: string;
    note: string;
  };
  master: {
    found: boolean;
    filename?: string;
    absPath?: string | null;
    publicSrc?: string | null;
    root?: string;
    note: string;
  };
  plan: VideoExcerptPlan | null;
  planError?: string;
  intel: TranscriptIntelProposal | null;
  intelError?: string;
  existingClips: VideoClipRecord[];
  existingPosters: VideoPosterRecord[];
  encodedThisRun: VideoClipRecord[];
  postersThisRun: VideoPosterRecord[];
  nextActions: string[];
};

export type PrepSpeechVideoPackageInput = {
  speechId: string;
  youtubeVideoId: string;
  query?: string;
  maxClips?: number;
  /** When true, encode top planned clips (max 3). Default false. */
  confirmEncode?: boolean;
  /** When true, extract a poster at first quote mid (or 1s). Default false. */
  confirmPoster?: boolean;
  aspect?: VideoEncodeAspect;
  /** Override master path (smokes / advanced). Must still resolve via encode helpers. */
  absPath?: string;
  localPublicSrc?: string;
};

export function listVideoDerivativesForSpeech(outId: string): {
  clips: VideoClipRecord[];
  posters: VideoPosterRecord[];
} {
  const id = String(outId ?? "").trim();
  return {
    clips: listVideoClips(id),
    posters: listVideoPosters(id),
  };
}

/**
 * Build a review packet: tooling + master + plan + transcript intel (+ optional encode/poster).
 */
export function prepSpeechVideoPackage(input: PrepSpeechVideoPackageInput): VideoPrepPacket {
  const speechId = String(input.speechId ?? "").trim();
  const youtubeVideoId = String(input.youtubeVideoId ?? "").trim();
  const query = String(input.query ?? "").trim();
  const maxClips = Math.min(Math.max(Number(input.maxClips) || 3, 1), 4);
  const aspect = input.aspect === "vertical_9x16" ? "vertical_9x16" : "source";

  const toolingRaw = probeVideoTooling();
  const tooling = {
    ffmpegAvailable: toolingRaw.ffmpegAvailable,
    ffprobeAvailable: toolingRaw.ffprobeAvailable,
    source: toolingRaw.source,
    note: toolingRaw.note,
  };

  const masterHit =
    input.absPath || input.localPublicSrc
      ? null
      : findLocalVideoMaster({ speechId, youtubeVideoId });

  const master = masterHit
    ? {
        found: true as const,
        filename: masterHit.filename,
        absPath: masterHit.absPath,
        publicSrc: masterHit.publicSrc,
        root: masterHit.root,
        note: `Master: ${masterHit.filename} (${masterHit.root})`,
      }
    : input.absPath || input.localPublicSrc
      ? {
          found: true as const,
          filename: input.absPath ? input.absPath.split(/[/\\]/).pop() : undefined,
          absPath: input.absPath ?? null,
          publicSrc: input.localPublicSrc ?? null,
          note: "Master override supplied for this prep run.",
        }
      : {
          found: false as const,
          absPath: null,
          publicSrc: null,
          note:
            "No local master matched this speech/YouTube id. Drop a file into public/media/campaign-video-masters/ or H:/SOSWebsite/.local/video-masters/ (name includes speech id or YouTube id).",
        };

  let plan: VideoExcerptPlan | null = null;
  let planError: string | undefined;
  if (youtubeVideoId) {
    const planned = planVideoExcerpt({
      youtubeVideoId,
      query: query || undefined,
      maxClips,
    });
    if (planned.ok) plan = planned.plan;
    else planError = planned.error;
  } else {
    planError = "youtubeVideoId required to plan excerpts from transcript.";
  }

  let intel: TranscriptIntelProposal | null = null;
  let intelError: string | undefined;
  if (youtubeVideoId) {
    const overlay = speechId ? loadSpeechEvidenceStore().speeches[speechId] ?? null : null;
    const analyzed = analyzeTranscriptIntelligence({
      youtubeVideoId,
      speechId: speechId || undefined,
      overlay,
    });
    if (analyzed.ok) intel = analyzed.proposal;
    else intelError = analyzed.error;
  }

  const existing = listVideoDerivativesForSpeech(speechId || youtubeVideoId || "unknown");
  const encodedThisRun: VideoClipRecord[] = [];
  const postersThisRun: VideoPosterRecord[] = [];
  const nextActions: string[] = [];

  if (!tooling.ffmpegAvailable) {
    nextActions.push("Install/ensure local ffmpeg (scripts/ensure-local-ffmpeg.cjs).");
  }
  if (!master.found) {
    nextActions.push("Drop a local video master matching this speech or YouTube id.");
  }
  if (planError) {
    nextActions.push("Pull/review the YouTube transcript workspace, then re-run Prep.");
  } else if (plan?.clips.length) {
    nextActions.push(`Review ${plan.clips.length} planned clip(s); encode with confirmEncode or Encode buttons.`);
  }
  if (intelError) {
    nextActions.push("Transcript intel unavailable — check workspace, then Analyze.");
  } else if (intel) {
    nextActions.push("Review transcript intel and Apply selected fields on the Videos tab.");
  }

  if (input.confirmEncode && plan?.clips.length && (master.found || input.absPath)) {
    const batch = encodeVideoExcerptPlan({
      planId: plan.id,
      clips: plan.clips,
      outId: speechId || youtubeVideoId,
      speechId: speechId || undefined,
      youtubeVideoId,
      absPath: input.absPath,
      localPublicSrc: input.localPublicSrc,
      clipIndexes: plan.clips.map((_, i) => i).slice(0, Math.min(3, maxClips)),
      aspect,
    });
    encodedThisRun.push(...batch.created);
    if (!batch.ok) nextActions.push(`Encode: ${batch.message}`);
    else nextActions.push(batch.message);
  } else if (input.confirmEncode && !plan?.clips.length) {
    nextActions.push("confirmEncode set but no plan clips — plan transcript excerpts first.");
  } else if (input.confirmEncode && !master.found && !input.absPath) {
    nextActions.push("confirmEncode set but no master — drop a master first.");
  }

  if (input.confirmPoster && (master.found || input.absPath)) {
    let atSeconds = 1;
    if (intel?.quotes?.[0]) {
      const q = intel.quotes[0];
      atSeconds = Math.max(0, (q.startSeconds + q.endSeconds) / 2);
    } else if (plan?.clips?.[0]) {
      atSeconds = Math.max(0, (plan.clips[0].startSeconds + plan.clips[0].endSeconds) / 2);
    }
    const poster = extractLocalVideoPoster({
      outId: speechId || youtubeVideoId,
      speechId: speechId || undefined,
      youtubeVideoId,
      absPath: input.absPath,
      localPublicSrc: input.localPublicSrc,
      atSeconds,
    });
    if (poster.ok) {
      postersThisRun.push(poster.record);
      nextActions.push(`Poster @ ${atSeconds.toFixed(1)}s → ${poster.publicSrc}`);
    } else {
      nextActions.push(`Poster failed: ${poster.error}`);
    }
  }

  const ok =
    tooling.ffmpegAvailable ||
    Boolean(plan) ||
    Boolean(intel) ||
    encodedThisRun.length > 0 ||
    postersThisRun.length > 0;

  const parts = [
    tooling.ffmpegAvailable ? "ffmpeg ready" : "ffmpeg missing",
    master.found ? "master found" : "no master",
    plan ? `plan ${plan.clips.length}` : planError ? "no plan" : "no plan",
    intel ? `intel ${intel.quotes.length}q` : intelError ? "no intel" : "no intel",
    encodedThisRun.length ? `encoded ${encodedThisRun.length}` : null,
    postersThisRun.length ? `poster ${postersThisRun.length}` : null,
  ].filter(Boolean);

  return {
    ok,
    message: `Video prep · ${parts.join(" · ")}`,
    speechId,
    youtubeVideoId,
    query,
    tooling,
    master,
    plan,
    planError,
    intel,
    intelError,
    existingClips: existing.clips,
    existingPosters: existing.posters,
    encodedThisRun,
    postersThisRun,
    nextActions: nextActions.slice(0, 8),
  };
}
