/**
 * Batch photo evidence overlays — field-level apply across many stills.
 * Never invents geography; only writes fields the operator (or gated tool) supplies.
 */

import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import {
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
  savePhotoEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import {
  parseHeroLevel,
  parsePublicationStatus,
  parseTierIntent,
} from "@/lib/campaign-media/evidence-validation";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { publicPublishBlockedByConsent } from "@/lib/campaign-media/photo-consent-hold";
import { refreshCountyAlbumIndex } from "@/lib/campaign-media/refresh-county-albums";

export const BATCH_PHOTO_FIELD_KEYS = [
  "county",
  "city",
  "venue",
  "eventDate",
  "eventName",
  "photographer",
  "peopleVisible",
  "whatThisProves",
  "approvedForPublic",
  "homepageCandidate",
  "featuredPhoto",
  "heroLevel",
  "tierIntent",
  "publicationStatus",
] as const;

export type BatchPhotoFieldKey = (typeof BATCH_PHOTO_FIELD_KEYS)[number];

export type BatchPhotoEvidencePatch = {
  county?: string;
  city?: string;
  venue?: string;
  eventDate?: string;
  eventName?: string;
  photographer?: string;
  peopleVisible?: string[];
  whatThisProves?: string;
  approvedForPublic?: boolean;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: PhotoEvidenceOverlay["heroLevel"];
  tierIntent?: PhotoEvidenceOverlay["tierIntent"];
  publicationStatus?: PhotoEvidenceOverlay["publicationStatus"];
};

export type BatchPhotoEvidenceResult = {
  ok: boolean;
  applied: number;
  skipped: number;
  errors: Array<{ photoId: string; error: string }>;
  appliedIds: string[];
  albumNote: string;
  message: string;
};

const MAX_BATCH = 80;

function resolveBasePhoto(photoId: string): CampaignPhotoRecord | null {
  return (
    CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId) ??
    loadPhotoIngestDrafts().photos.find((p) => p.id === photoId) ??
    null
  );
}

function normalizeApplyFields(fields: string[]): BatchPhotoFieldKey[] {
  const allowed = new Set<string>(BATCH_PHOTO_FIELD_KEYS);
  const out: BatchPhotoFieldKey[] = [];
  for (const raw of fields) {
    const key = String(raw).trim() as BatchPhotoFieldKey;
    if (!allowed.has(key)) continue;
    if (!out.includes(key)) out.push(key);
  }
  return out;
}

function mergeOverlay(
  existing: PhotoEvidenceOverlay | undefined,
  patch: BatchPhotoEvidencePatch,
  applyFields: BatchPhotoFieldKey[],
): PhotoEvidenceOverlay {
  const next: PhotoEvidenceOverlay = { ...(existing ?? {}) };
  for (const key of applyFields) {
    switch (key) {
      case "county":
        if (patch.county !== undefined) next.county = patch.county;
        break;
      case "city":
        if (patch.city !== undefined) next.city = patch.city;
        break;
      case "venue":
        if (patch.venue !== undefined) next.venue = patch.venue;
        break;
      case "eventDate":
        if (patch.eventDate !== undefined) next.eventDate = patch.eventDate;
        break;
      case "eventName":
        if (patch.eventName !== undefined) next.eventName = patch.eventName;
        break;
      case "photographer":
        if (patch.photographer !== undefined) next.photographer = patch.photographer;
        break;
      case "peopleVisible":
        if (patch.peopleVisible !== undefined) next.peopleVisible = patch.peopleVisible;
        break;
      case "whatThisProves":
        if (patch.whatThisProves !== undefined) next.whatThisProves = patch.whatThisProves;
        break;
      case "approvedForPublic":
        if (patch.approvedForPublic !== undefined) next.approvedForPublic = patch.approvedForPublic;
        break;
      case "homepageCandidate":
        if (patch.homepageCandidate !== undefined) next.homepageCandidate = patch.homepageCandidate;
        break;
      case "featuredPhoto":
        if (patch.featuredPhoto !== undefined) next.featuredPhoto = patch.featuredPhoto;
        break;
      case "heroLevel":
        if (patch.heroLevel !== undefined) next.heroLevel = patch.heroLevel;
        break;
      case "tierIntent":
        if (patch.tierIntent !== undefined) next.tierIntent = patch.tierIntent;
        break;
      case "publicationStatus":
        if (patch.publicationStatus !== undefined) next.publicationStatus = patch.publicationStatus;
        break;
      default: {
        const _never: never = key;
        void _never;
      }
    }
  }
  next.updatedAt = new Date().toISOString();
  return next;
}

/**
 * Apply selected fields from `patch` onto each photoId.
 * Consent hold: public/homepage/APPROVED|PUBLISHED require consentConfirmed when notes demand it.
 */
export function applyPhotoEvidenceBatch(input: {
  photoIds: string[];
  patch: BatchPhotoEvidencePatch;
  applyFields: string[];
  consentConfirmed?: boolean;
  refreshAlbums?: boolean;
  /** When true, feed confirmed geo into AI memory (server / workbench only). */
  rememberMemory?: boolean;
}): BatchPhotoEvidenceResult {
  const applyFields = normalizeApplyFields(input.applyFields);
  if (!applyFields.length) {
    return {
      ok: false,
      applied: 0,
      skipped: 0,
      errors: [],
      appliedIds: [],
      albumNote: "",
      message: "Select at least one field to apply.",
    };
  }

  const ids = [...new Set(input.photoIds.map((id) => String(id).trim()).filter(Boolean))].slice(
    0,
    MAX_BATCH,
  );
  if (!ids.length) {
    return {
      ok: false,
      applied: 0,
      skipped: 0,
      errors: [],
      appliedIds: [],
      albumNote: "",
      message: "No photo ids provided.",
    };
  }

  const store = loadPhotoEvidenceStore();
  const errors: Array<{ photoId: string; error: string }> = [];
  const appliedIds: string[] = [];
  let skipped = 0;

  for (const photoId of ids) {
    const base = resolveBasePhoto(photoId);
    if (!base) {
      skipped += 1;
      errors.push({ photoId, error: "Unknown photo id." });
      continue;
    }

    const next = mergeOverlay(store.photos[photoId], input.patch, applyFields);

    const consentBlock = publicPublishBlockedByConsent({
      photoId,
      notes: base.notes,
      approvedForPublic: Boolean(next.approvedForPublic),
      homepageCandidate: Boolean(next.homepageCandidate),
      publicationStatus: next.publicationStatus,
      consentConfirmed: Boolean(input.consentConfirmed),
    });
    if (consentBlock) {
      skipped += 1;
      errors.push({ photoId, error: consentBlock });
      continue;
    }

    store.photos[photoId] = next;
    appliedIds.push(photoId);

    if (
      input.rememberMemory &&
      next.county &&
      next.county !== "Unknown" &&
      next.city &&
      next.city !== "Unknown"
    ) {
      try {
        // Lazy import — evidence-ai-memory is server-only; keep batch usable from CLI smokes.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mem = require("@/lib/campaign-media/evidence-ai-memory") as typeof import("@/lib/campaign-media/evidence-ai-memory");
        mem.rememberConfirmedEvidenceExample({
          assetKind: "photo",
          assetId: photoId,
          county: next.county,
          city: next.city,
          venue: next.venue,
          eventName: next.eventName,
          peopleVisible: next.peopleVisible,
          whatThisProves: next.whatThisProves,
          captionOrTitle: base.accessibility.caption,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        /* memory optional outside Next server */
      }
    }
  }

  if (appliedIds.length) {
    savePhotoEvidenceStore(store);
  }

  let albumNote = "";
  if (appliedIds.length && input.refreshAlbums !== false) {
    try {
      const livePhotos = listCampaignPhotosLive(store);
      const result = refreshCountyAlbumIndex({
        materializeFolders: true,
        photos: livePhotos,
        photoStore: store,
      });
      albumNote =
        ` Albums: ${result.countyCount} counties / ${result.photoCount} photos` +
        (result.missingSources ? ` (${result.missingSources} missing source file(s))` : "") +
        ".";
    } catch {
      albumNote = " (album refresh skipped)";
    }
  }

  const ok = appliedIds.length > 0;
  return {
    ok,
    applied: appliedIds.length,
    skipped,
    errors,
    appliedIds,
    albumNote,
    message: ok
      ? `Batch applied ${applyFields.join(", ")} to ${appliedIds.length} photo(s)` +
        (skipped ? ` (${skipped} skipped)` : "") +
        `.${albumNote}`
      : `Batch failed — ${errors[0]?.error ?? "nothing applied."}`,
  };
}

/** Build a typed patch from loose form/AI values; invalid enums omitted. */
export function buildBatchPatchFromLoose(raw: Record<string, unknown>): BatchPhotoEvidencePatch {
  const patch: BatchPhotoEvidencePatch = {};
  const str = (k: string) => {
    const v = raw[k];
    return typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
  };
  if ("county" in raw) patch.county = str("county") || "Unknown";
  if ("city" in raw) patch.city = str("city") || "Unknown";
  if ("venue" in raw) patch.venue = str("venue") || "Unknown";
  if ("eventDate" in raw) patch.eventDate = str("eventDate") || "Unknown";
  if ("eventName" in raw) patch.eventName = str("eventName") || "Unknown";
  if ("photographer" in raw) patch.photographer = str("photographer") || "Unknown";
  if ("whatThisProves" in raw) patch.whatThisProves = str("whatThisProves");
  if ("peopleVisible" in raw) {
    const v = raw.peopleVisible;
    if (Array.isArray(v)) {
      patch.peopleVisible = v.map((p) => String(p).trim()).filter(Boolean);
    } else if (typeof v === "string") {
      patch.peopleVisible = v
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    }
  }
  if ("approvedForPublic" in raw) patch.approvedForPublic = Boolean(raw.approvedForPublic);
  if ("homepageCandidate" in raw) patch.homepageCandidate = Boolean(raw.homepageCandidate);
  if ("featuredPhoto" in raw) patch.featuredPhoto = Boolean(raw.featuredPhoto);
  if ("heroLevel" in raw) {
    const h = parseHeroLevel(str("heroLevel"));
    if (h) patch.heroLevel = h;
  }
  if ("tierIntent" in raw) patch.tierIntent = parseTierIntent(str("tierIntent"));
  if ("publicationStatus" in raw) {
    const p = parsePublicationStatus(str("publicationStatus"));
    if (p) patch.publicationStatus = p;
  }
  return patch;
}
