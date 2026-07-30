/**
 * Speech / video readiness matrix for Evidence Workbench (audit #4).
 */

import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { applySpeechEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { loadSpeechEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { findLocalVideoMaster } from "@/lib/campaign-media/local-video-masters";
import { listVideoClips } from "@/lib/campaign-media/media-derivatives";
import { listVideoAssemblies } from "@/lib/campaign-media/video-edit-store";

export type SpeechReadinessRow = {
  id: string;
  title: string;
  format: string;
  hasOverlay: boolean;
  hasConfirmedCounty: boolean;
  counties: string[];
  publicationStatus: string;
  approvedForPublic: boolean;
  homepageCandidate: boolean;
  transcriptStatus: string;
  hasTranscriptText: boolean;
  hasIntel: boolean;
  hasMaster: boolean;
  clipCount: number;
  assemblyCount: number;
  kellySpeaksEligible: boolean;
  readinessScore: number;
  nextAction: string;
};

function hasConfirmedCounty(counties: string[]): boolean {
  return counties.some((c) => c && c !== "Unknown");
}

export function buildSpeechReadinessRow(base: CampaignMediaRecord): SpeechReadinessRow {
  const store = loadSpeechEvidenceStore();
  const overlay = store.speeches[base.id];
  const merged = applySpeechEvidenceOverlay(base, overlay);
  const counties = (merged.counties ?? []).map((c) => c.trim()).filter(Boolean);
  const confirmed = hasConfirmedCounty(counties);
  const hasOverlay = Boolean(overlay);
  const approvedForPublic = merged.approvedForPublic !== false && Boolean(overlay?.approvedForPublic);
  const homepageCandidate = Boolean(merged.homepageEligible);
  const hasIntel = Boolean(
    overlay?.transcriptIntelAt ||
      (overlay?.keyQuotes && overlay.keyQuotes.length) ||
      (overlay?.doNotClaim && overlay.doNotClaim.length) ||
      (overlay?.transcriptChapters && overlay.transcriptChapters.length),
  );
  const master = findLocalVideoMaster({
    speechId: base.id,
    youtubeVideoId: base.youtubeVideoId,
  });
  const clipCount = listVideoClips(base.id).length;
  const assemblyCount = listVideoAssemblies(base.id).length;
  const hasTranscriptText = Boolean(merged.transcript.plainText?.trim());
  const kellySpeaksEligible =
    merged.publicationStatus === "PUBLISHED" && merged.approvedForPublic !== false;

  let readinessScore = 0;
  if (hasOverlay) readinessScore += 15;
  if (confirmed) readinessScore += 20;
  if (overlay?.whatThisProves?.trim()) readinessScore += 10;
  if (hasTranscriptText) readinessScore += 10;
  if (hasIntel) readinessScore += 10;
  if (master) readinessScore += 10;
  if (clipCount > 0) readinessScore += 10;
  if (assemblyCount > 0) readinessScore += 5;
  if (kellySpeaksEligible) readinessScore += 10;

  let nextAction = "Save speech overlay (county + proof).";
  if (!confirmed) nextAction = "Confirm at least one real county (Unknown stays Unknown).";
  else if (!hasOverlay) nextAction = "Save overlay so confirmations persist.";
  else if (!overlay?.whatThisProves?.trim()) nextAction = "Add whatThisProves (Journey verb).";
  else if (merged.publicationStatus === "DRAFT" || merged.publicationStatus === "IN_REVIEW") {
    nextAction = "Approve, then Publish when ready for /kelly-speaks.";
  } else if (merged.publicationStatus === "APPROVED") {
    nextAction = "Publish (publicationStatus=PUBLISHED) for kelly-speaks.";
  } else if (merged.approvedForPublic === false) {
    nextAction = "On hold — clear hold when ready for public.";
  } else if (!hasTranscriptText) {
    nextAction = "Attach / publish transcript when available.";
  } else if (!master && clipCount === 0) {
    nextAction = "Optional: drop local master for Prep / Pro Edit.";
  } else {
    nextAction = "Ship speech-evidence.json when ready for production.";
  }

  return {
    id: base.id,
    title: base.title,
    format: base.format,
    hasOverlay,
    hasConfirmedCounty: confirmed,
    counties,
    publicationStatus: merged.publicationStatus,
    approvedForPublic: Boolean(overlay?.approvedForPublic),
    homepageCandidate,
    transcriptStatus: merged.transcript.status,
    hasTranscriptText,
    hasIntel,
    hasMaster: Boolean(master),
    clipCount,
    assemblyCount,
    kellySpeaksEligible,
    readinessScore,
    nextAction,
  };
}

export function buildSpeechReadinessMatrix(input?: { speechIds?: string[] }): {
  generatedAt: string;
  rows: SpeechReadinessRow[];
  totals: {
    speeches: number;
    noCounty: number;
    needsPublish: number;
    published: number;
    overlaysSaved: number;
    prepReady: number;
  };
} {
  const filter = input?.speechIds?.length
    ? new Set(input.speechIds.map((id) => String(id).trim()).filter(Boolean))
    : null;
  const bases = CAMPAIGN_MEDIA_REGISTRY.filter((m) => (filter ? filter.has(m.id) : true));
  const rows = bases.map(buildSpeechReadinessRow).sort((a, b) => b.readinessScore - a.readinessScore);
  const totals = {
    speeches: rows.length,
    noCounty: rows.filter((r) => !r.hasConfirmedCounty).length,
    needsPublish: rows.filter(
      (r) =>
        r.hasConfirmedCounty &&
        r.publicationStatus !== "PUBLISHED" &&
        r.approvedForPublic !== false,
    ).length,
    published: rows.filter((r) => r.kellySpeaksEligible).length,
    overlaysSaved: rows.filter((r) => r.hasOverlay).length,
    prepReady: rows.filter((r) => r.hasMaster || r.clipCount > 0 || r.assemblyCount > 0).length,
  };
  return { generatedAt: new Date().toISOString(), rows, totals };
}
