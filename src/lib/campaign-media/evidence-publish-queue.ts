/**
 * Evidence Publish Queue — live Unknown → Save → Approve backlog selectors.
 * Never invents geography; never auto-approves.
 */

import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { isAlbumEligible } from "@/lib/campaign-media/county-albums";
import {
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
} from "@/lib/campaign-media/evidence-store";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { photoRequiresConsentHold } from "@/lib/campaign-media/photo-consent-hold";
import { getPhotoIntakeStatus } from "@/lib/campaign-media/photo-ingest";
import { listPendingTurboProposals } from "@/lib/campaign-media/turbo-ingest-store";

export const EVIDENCE_DENSITY_SNAPSHOT_REL = "data/campaign-media/evidence-density-snapshot.json";

export type PublishQueueBucketId =
  | "unknownCounty"
  | "draftIngest"
  | "needsApproval"
  | "turboPending"
  | "consentHold"
  | "approvedPublic";

export type PublishQueueItem = {
  id: string;
  county: string;
  city: string;
  eventName: string;
  approvedForPublic: boolean;
  publicationStatus: string;
  isDraft: boolean;
  requiresConsentHold: boolean;
  hasOverlay: boolean;
  turboPending: boolean;
};

export type EvidencePublishQueue = {
  generatedAt: string;
  totals: {
    livePhotos: number;
    unknownCounty: number;
    draftIngest: number;
    needsApproval: number;
    turboPending: number;
    consentHold: number;
    approvedPublic: number;
    overlaysSaved: number;
    intakeNewOnDisk: number;
    intakeQueue: number;
  };
  /** Confirmed counties from approved/public stills only. */
  confirmedCounties: string[];
  buckets: Record<PublishQueueBucketId, PublishQueueItem[]>;
  pathSteps: string[];
  nextActions: string[];
};

const BUCKET_CAP = 40;

function isUnknownCounty(county: string | undefined | null): boolean {
  const c = String(county ?? "").trim();
  return !c || c === "Unknown";
}

function toItem(
  photo: CampaignPhotoRecord,
  opts: { isDraft: boolean; hasOverlay: boolean; turboPending: boolean },
): PublishQueueItem {
  return {
    id: photo.id,
    county: photo.campaign.county || "Unknown",
    city: photo.campaign.city || "Unknown",
    eventName: photo.campaign.eventName || "Unknown",
    approvedForPublic: Boolean(photo.campaign.approvedForPublic),
    publicationStatus: photo.publicationStatus,
    isDraft: opts.isDraft,
    requiresConsentHold: photoRequiresConsentHold(photo.id, photo.notes),
    hasOverlay: opts.hasOverlay,
    turboPending: opts.turboPending,
  };
}

export function buildEvidencePublishQueue(): EvidencePublishQueue {
  const store = loadPhotoEvidenceStore();
  const drafts = loadPhotoIngestDrafts();
  const live = listCampaignPhotosLive(store);
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const draftIds = new Set(drafts.photos.map((p) => p.id));
  const pendingTurbo = new Set(listPendingTurboProposals().map((p) => p.photoId));
  const intake = getPhotoIntakeStatus();

  const unknownCounty: PublishQueueItem[] = [];
  const draftIngest: PublishQueueItem[] = [];
  const needsApproval: PublishQueueItem[] = [];
  const turboPending: PublishQueueItem[] = [];
  const consentHold: PublishQueueItem[] = [];
  const approvedPublic: PublishQueueItem[] = [];
  const confirmed = new Set<string>();

  for (const photo of live) {
    const county = photo.campaign.county;
    const unknown = isUnknownCounty(county);
    const onAlbums = isAlbumEligible(photo);
    const isDraft = draftIds.has(photo.id) && !registryIds.has(photo.id);
    const hasOverlay = Boolean(store.photos[photo.id]);
    const turbo = pendingTurbo.has(photo.id);
    const item = toItem(photo, { isDraft, hasOverlay, turboPending: turbo });

    if (unknown) unknownCounty.push(item);
    if (isDraft) draftIngest.push(item);
    if (!unknown && !onAlbums) needsApproval.push(item);
    if (turbo) turboPending.push(item);
    if (item.requiresConsentHold) {
      consentHold.push(item);
    }
    if (onAlbums) {
      approvedPublic.push(item);
      confirmed.add(String(county).trim());
    }
  }

  // Drafts not yet in live merge (shouldn't happen often) — still surface ids.
  for (const d of drafts.photos) {
    if (live.some((p) => p.id === d.id)) continue;
    draftIngest.push(
      toItem(d, {
        isDraft: true,
        hasOverlay: Boolean(store.photos[d.id]),
        turboPending: pendingTurbo.has(d.id),
      }),
    );
  }

  const totals = {
    livePhotos: live.length,
    unknownCounty: unknownCounty.length,
    draftIngest: draftIngest.length,
    needsApproval: needsApproval.length,
    turboPending: turboPending.length,
    consentHold: consentHold.length,
    approvedPublic: approvedPublic.length,
    overlaysSaved: Object.keys(store.photos).length,
    intakeNewOnDisk: intake.newOnDisk,
    intakeQueue: intake.queueCount,
  };

  const nextActions: string[] = [];
  if (totals.intakeNewOnDisk > 0) {
    nextActions.push(`Intake ${totals.intakeNewOnDisk} new file(s) on disk.`);
  }
  if (totals.unknownCounty > 0) {
    nextActions.push(
      `Turbo Identify on Unknown backlog (${totals.unknownCounty}), then Apply → Save county.`,
    );
  }
  if (totals.turboPending > 0) {
    nextActions.push(`Review ${totals.turboPending} turbo proposal(s) on Photos → Apply identify.`);
  }
  if (totals.needsApproval > 0) {
    nextActions.push(
      `Batch Approve ${totals.needsApproval} geo-confirmed still(s) (consent gates still apply).`,
    );
  }
  if (totals.overlaysSaved > 0) {
    nextActions.push("Commit data/campaign-media/ when ready to ship overlays to production.");
  }
  if (!nextActions.length) {
    nextActions.push("Queue clear of Unknown/needs-approval — maintain density on new intake.");
  }

  const cap = <T,>(arr: T[]) => arr.slice(0, BUCKET_CAP);

  return {
    generatedAt: new Date().toISOString(),
    totals,
    confirmedCounties: [...confirmed].sort((a, b) => a.localeCompare(b)),
    buckets: {
      unknownCounty: cap(unknownCounty),
      draftIngest: cap(draftIngest),
      needsApproval: cap(needsApproval),
      turboPending: cap(turboPending),
      consentHold: cap(consentHold),
      approvedPublic: cap(approvedPublic),
    },
    pathSteps: [
      "Drop / Intake new stills",
      "Turbo Identify + Fit (proposals only)",
      "Photos → Apply identify → Save",
      "Batch Approve (Unknown skipped)",
      "Commit data/campaign-media/ to ship",
    ],
    nextActions,
  };
}

/** Photo ids for Turbo on the Unknown + draft backlog (capped). */
export function publishQueueTurboTargetIds(max = 24): string[] {
  const q = buildEvidencePublishQueue();
  const ids = [
    ...q.buckets.unknownCounty.map((i) => i.id),
    ...q.buckets.draftIngest.map((i) => i.id),
  ];
  return [...new Set(ids)].slice(0, Math.min(Math.max(max, 1), 24));
}
