/**
 * Propose Video Pro Edit projects from transcript intel quotes — 16:9 + 9:16.
 * Persist projects only. Never encodes / never silent Confirm render.
 */
import "server-only";

import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { getLatestTranscriptIntel } from "@/lib/campaign-media/transcript-intelligence";
import { proposeVideoEditProject } from "@/lib/campaign-media/video-edit-director";
import { upsertVideoEditProject } from "@/lib/campaign-media/video-edit-store";
import type { VideoEditDirectorPacket } from "@/lib/campaign-media/video-edit-types";

export type SpeechQuoteEditProposeResult = {
  ok: boolean;
  message: string;
  packet: VideoEditDirectorPacket | null;
  quoteCount: number;
};

/**
 * Build one Pro Edit project from intel quotes with homepage 16:9 + social 9:16 aspects.
 */
export function proposeSpeechCutsFromIntel(input: {
  speechId: string;
  youtubeVideoId?: string;
  maxClips?: number;
  quoteIndexes?: number[];
}): SpeechQuoteEditProposeResult {
  const speechId = String(input.speechId ?? "").trim();
  if (!speechId) {
    return { ok: false, message: "speechId required.", packet: null, quoteCount: 0 };
  }

  const media = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === speechId);
  const youtubeVideoId =
    String(input.youtubeVideoId ?? "").trim() || media?.youtubeVideoId || "";
  if (!youtubeVideoId) {
    return {
      ok: false,
      message: `No YouTube id for ${speechId}.`,
      packet: null,
      quoteCount: 0,
    };
  }

  const intel = getLatestTranscriptIntel(youtubeVideoId);
  const quotes = intel?.quotes ?? [];
  if (!quotes.length) {
    return {
      ok: false,
      message: "No transcript intel quotes — Analyze transcript / Prep package first.",
      packet: null,
      quoteCount: 0,
    };
  }

  // Director already falls back to intel quotes when no plan; we force social+homepage aspects.
  const packet = proposeVideoEditProject({
    speechId,
    youtubeVideoId,
    maxClips: input.maxClips ?? Math.min(quotes.length, 4),
    exportAspects: ["landscape_16x9", "vertical_9x16"],
    captionMode: "sidecar",
    transition: "crossfade",
    look: "neutral",
    persist: true,
  });

  if (!packet.ok || !packet.project) {
    return {
      ok: false,
      message: packet.message,
      packet,
      quoteCount: quotes.length,
    };
  }

  packet.project.title = `Quote cuts · ${speechId} · 16:9+9:16`;
  packet.project.notes =
    "Tier 2 quote→Pro Edit proposal. Review cut list, then Confirm render. Never auto-encodes.";
  packet.project.updatedAt = new Date().toISOString();
  upsertVideoEditProject(packet.project);
  packet.nextActions = [
    "Review cut list on Videos → Pro Edit.",
    "Confirm render for landscape_16x9 + vertical_9x16 pack.",
    "Propose homepage speech placement when ready (confirmCurate).",
  ];

  return {
    ok: true,
    message: `Proposed Pro Edit from ${packet.project.clips.length} quote clip(s) · landscape_16x9 + vertical_9x16 (Confirm render still required).`,
    packet,
    quoteCount: quotes.length,
  };
}
