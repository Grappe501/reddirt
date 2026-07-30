/**
 * Turbo Ingest — major automation pass:
 *   Intake (optional) → identify proposals → website-fit rankings → operator apply
 * Never auto-publishes. Unknown stays Unknown unless heuristic/AI has soft proposal.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { suggestPhotoEvidenceWithAi } from "@/lib/campaign-media/evidence-ai-suggest";
import type { EvidenceAiSuggestion } from "@/lib/campaign-media/evidence-ai-types";
import { loadEvidenceAiMemory } from "@/lib/campaign-media/evidence-ai-memory";
import {
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
  savePhotoEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { intakeAllNewCampaignPhotos, getPhotoIntakeStatus } from "@/lib/campaign-media/photo-ingest";
import {
  getTurboProposal,
  listPendingTurboProposals,
  loadTurboIngestStore,
  saveTurboIngestStore,
  upsertTurboProposal,
} from "@/lib/campaign-media/turbo-ingest-store";
import type { TurboIdentifySource, TurboPhotoProposal } from "@/lib/campaign-media/turbo-ingest-types";
import { scorePhotoWebsiteFit } from "@/lib/campaign-media/website-fit-scorer";
import { buildWebsiteSurfaceInventory } from "@/lib/campaign-media/website-surface-catalog";

const MAX_TURBO_BATCH = 24;
const MAX_AI_IDENTIFY = 8;

function unknownSuggestion(rationale: string): EvidenceAiSuggestion {
  return {
    county: "Unknown",
    city: "Unknown",
    venue: "Unknown",
    eventDate: "Unknown",
    eventName: "Unknown",
    photographer: "Unknown",
    peopleVisible: [],
    whatThisProves: "",
    confidence: "low",
    warnings: ["Prefer Unknown until operator confirms."],
    rationale,
  };
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/** Heuristic identify from similar live photos + confirmed memory (no OpenAI). */
export function heuristicIdentifyPhoto(photo: CampaignPhotoRecord): EvidenceAiSuggestion {
  const live = listCampaignPhotosLive();
  const mem = loadEvidenceAiMemory().examples.filter((e) => e.assetKind === "photo");
  const tokens = new Set([
    ...tokenize(photo.id),
    ...tokenize(photo.basic.originalFilename),
    ...tokenize(photo.accessibility.caption),
  ]);

  type Hit = { score: number; county: string; city: string; venue?: string; eventName?: string; proves?: string };
  const hits: Hit[] = [];

  for (const p of live) {
    if (p.id === photo.id) continue;
    const county = p.campaign.county?.trim();
    if (!county || county === "Unknown") continue;
    const hay = tokenize(`${p.id} ${p.basic.originalFilename} ${p.campaign.eventName} ${p.campaign.city}`);
    let score = 0;
    for (const t of hay) if (tokens.has(t)) score += 1;
    if (score < 2) continue;
    hits.push({
      score,
      county,
      city: p.campaign.city !== "Unknown" ? p.campaign.city : "Unknown",
      venue: p.campaign.venue !== "Unknown" ? p.campaign.venue : undefined,
      eventName: p.campaign.eventName !== "Unknown" ? p.campaign.eventName : undefined,
      proves: undefined,
    });
  }

  for (const m of mem) {
    const hay = tokenize(`${m.assetId} ${m.eventName ?? ""} ${m.city} ${m.venue ?? ""}`);
    let score = 0;
    for (const t of hay) if (tokens.has(t)) score += 1.5;
    if (score < 2) continue;
    hits.push({
      score,
      county: m.county,
      city: m.city,
      venue: m.venue,
      eventName: m.eventName,
      proves: m.whatThisProves,
    });
  }

  hits.sort((a, b) => b.score - a.score);
  const top = hits[0];
  if (!top || top.score < 2) {
    return unknownSuggestion(
      "Heuristic identify found no strong filename/memory match — leave Unknown for operator.",
    );
  }

  const conf = top.score >= 4 ? "medium" : "low";
  return {
    county: top.county,
    city: top.city || "Unknown",
    venue: top.venue || "Unknown",
    eventDate: "Unknown",
    eventName: top.eventName || "Unknown",
    photographer: "Unknown",
    peopleVisible: [],
    whatThisProves: top.proves || "",
    confidence: conf,
    warnings: [
      "Heuristic soft prior only — confirm geography before Approve.",
      `Matched score ${top.score.toFixed(1)} against similar confirmed stills/memory.`,
    ],
    rationale: `Heuristic match to confirmed geography (${top.county}/${top.city}).`,
  };
}

function suggestionToOverlay(s: EvidenceAiSuggestion): PhotoEvidenceOverlay {
  return {
    county: s.county,
    city: s.city,
    venue: s.venue,
    eventDate: s.eventDate,
    eventName: s.eventName,
    photographer: s.photographer,
    peopleVisible: s.peopleVisible,
    whatThisProves: s.whatThisProves,
    updatedAt: new Date().toISOString(),
  };
}

async function identifyOne(
  photo: CampaignPhotoRecord,
  overlay: PhotoEvidenceOverlay | null,
  useAi: boolean,
): Promise<{ suggestion: EvidenceAiSuggestion; source: TurboIdentifySource }> {
  if (overlay?.county && overlay.county !== "Unknown" && overlay.city && overlay.city !== "Unknown") {
    return {
      source: "overlay",
      suggestion: {
        county: overlay.county,
        city: overlay.city,
        venue: overlay.venue || "Unknown",
        eventDate: overlay.eventDate || "Unknown",
        eventName: overlay.eventName || "Unknown",
        photographer: overlay.photographer || "Unknown",
        peopleVisible: overlay.peopleVisible ?? [],
        whatThisProves: overlay.whatThisProves || "",
        confidence: "high",
        warnings: ["Using existing overlay geography."],
        rationale: "Overlay already has confirmed-looking geography.",
      },
    };
  }

  if (useAi && isOpenAIConfigured()) {
    try {
      const res = await suggestPhotoEvidenceWithAi({ photo, overlay });
      if (res.ok) return { suggestion: res.suggestion, source: "ai" };
    } catch {
      /* fall through to heuristic */
    }
  }

  return { suggestion: heuristicIdentifyPhoto(photo), source: "heuristic" };
}

export type TurboIngestRunResult = {
  ok: boolean;
  message: string;
  intakeQueued: number;
  identified: number;
  withAi: number;
  withHeuristic: number;
  proposalIds: string[];
  inventorySummary: string;
};

/**
 * Run turbo pipeline for draft/unknown stills (or explicit ids).
 * Writes proposals only — does not Approve / homepage publish.
 */
export async function runTurboIngest(input?: {
  photoIds?: string[];
  intakeFirst?: boolean;
  useAi?: boolean;
  maxPhotos?: number;
  maxAi?: number;
}): Promise<TurboIngestRunResult> {
  let intakeQueued = 0;
  if (input?.intakeFirst) {
    const intake = intakeAllNewCampaignPhotos();
    intakeQueued = intake.queued;
  }

  const maxPhotos = Math.min(Math.max(input?.maxPhotos ?? 16, 1), MAX_TURBO_BATCH);
  const maxAi = Math.min(Math.max(input?.maxAi ?? MAX_AI_IDENTIFY, 0), MAX_AI_IDENTIFY);
  const useAi = input?.useAi !== false;

  const evidence = loadPhotoEvidenceStore();
  const drafts = loadPhotoIngestDrafts();
  const live = listCampaignPhotosLive(evidence);
  const byId = new Map(live.map((p) => [p.id, p]));

  let targets: CampaignPhotoRecord[] = [];
  if (input?.photoIds?.length) {
    for (const id of input.photoIds) {
      const p = byId.get(id);
      if (p) targets.push(p);
    }
  } else {
    const draftIds = new Set(drafts.photos.map((d) => d.id));
    targets = live.filter((p) => {
      const overlay = evidence.photos[p.id];
      const county = (overlay?.county ?? p.campaign.county ?? "Unknown").trim() || "Unknown";
      return draftIds.has(p.id) || county === "Unknown";
    });
  }

  targets = targets.slice(0, maxPhotos);
  const inventory = buildWebsiteSurfaceInventory(live);

  let withAi = 0;
  let withHeuristic = 0;
  const proposalIds: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    const photo = targets[i];
    const overlay = evidence.photos[photo.id] ?? null;
    const allowAi = useAi && withAi < maxAi;
    const { suggestion, source } = await identifyOne(photo, overlay, allowAi);
    if (source === "ai") withAi += 1;
    if (source === "heuristic") withHeuristic += 1;

    const proposedOverlay = suggestionToOverlay(suggestion);
    const fit = scorePhotoWebsiteFit({
      photo,
      proposedOverlay,
      inventory,
    });
    const best = fit.best;
    const recommendedFlags = best?.recommendedFlags ?? {};

    const now = new Date().toISOString();
    const prev = getTurboProposal(photo.id);
    const proposal: TurboPhotoProposal = {
      photoId: photo.id,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
      status: "pending",
      identifySource: source,
      identify: suggestion,
      fit: {
        rankings: fit.rankings.slice(0, 6),
        bestSurface: best?.surface ?? null,
        bestScore: best?.score ?? 0,
        inventoryNote: fit.inventoryNote,
      },
      recommendedFlags,
      notes: [
        ...(suggestion.warnings ?? []).slice(0, 4),
        ...(best?.blockers ?? []).slice(0, 3),
      ],
    };
    upsertTurboProposal(proposal);
    proposalIds.push(photo.id);
  }

  const store = loadTurboIngestStore();
  store.lastRunAt = new Date().toISOString();
  store.lastRunMessage = `Turbo: ${proposalIds.length} proposal(s) · AI ${withAi} · heuristic ${withHeuristic}` +
    (intakeQueued ? ` · intake +${intakeQueued}` : "");
  saveTurboIngestStore(store);

  const status = getPhotoIntakeStatus();
  return {
    ok: proposalIds.length > 0 || intakeQueued > 0,
    message: store.lastRunMessage,
    intakeQueued,
    identified: proposalIds.length,
    withAi,
    withHeuristic,
    proposalIds,
    inventorySummary: `${inventory.homepageGalleryLive} homepage · ${inventory.countyAlbumCount} albums · ${status.queueCount} in intake queue · ${listPendingTurboProposals().length} pending turbo`,
  };
}

/**
 * Apply identify fields and/or recommended fit flags to overlay (not batch publish).
 */
export function applyTurboProposal(input: {
  photoId: string;
  applyIdentify?: boolean;
  applyFitFlags?: boolean;
  markApplied?: boolean;
}): { ok: boolean; message: string } {
  const photoId = String(input.photoId ?? "").trim();
  if (!photoId) return { ok: false, message: "photoId required." };
  const proposal = getTurboProposal(photoId);
  if (!proposal) return { ok: false, message: `No turbo proposal for ${photoId}.` };

  const store = loadPhotoEvidenceStore();
  const prev = store.photos[photoId] ?? {};
  const next: PhotoEvidenceOverlay = { ...prev, updatedAt: new Date().toISOString() };

  if (input.applyIdentify && proposal.identify) {
    const s = proposal.identify;
    // Never force Unknown over existing confirmed overlay
    if (s.county && s.county !== "Unknown") next.county = s.county;
    else if (!prev.county) next.county = "Unknown";
    if (s.city && s.city !== "Unknown") next.city = s.city;
    else if (!prev.city) next.city = "Unknown";
    if (s.venue && s.venue !== "Unknown") next.venue = s.venue;
    if (s.eventDate && s.eventDate !== "Unknown") next.eventDate = s.eventDate;
    if (s.eventName && s.eventName !== "Unknown") next.eventName = s.eventName;
    if (s.photographer && s.photographer !== "Unknown") next.photographer = s.photographer;
    if (s.peopleVisible?.length) next.peopleVisible = s.peopleVisible;
    if (s.whatThisProves) next.whatThisProves = s.whatThisProves;
  }

  if (input.applyFitFlags) {
    const f = proposal.recommendedFlags;
    // Placement intent only — never silent Approve; never elevate FEATURE/HERO
    // (album eligibility still honors legacy FEATURE/HERO on registry stills).
    if (f.homepageCandidate !== undefined) next.homepageCandidate = f.homepageCandidate;
    if (f.featuredPhoto !== undefined) next.featuredPhoto = f.featuredPhoto;
    if (f.tierIntent !== undefined) next.tierIntent = f.tierIntent;
    if (f.heroLevel === "SUPPORTING" || f.heroLevel === "UNREVIEWED") {
      next.heroLevel = f.heroLevel;
    }
  }

  store.photos[photoId] = next;
  savePhotoEvidenceStore(store);

  if (input.markApplied !== false) {
    const t = loadTurboIngestStore();
    const hit = t.proposals.find((p) => p.photoId === photoId);
    if (hit) {
      hit.status = "applied";
      hit.updatedAt = new Date().toISOString();
      saveTurboIngestStore(t);
    }
  }

  const parts = [
    input.applyIdentify ? "identify" : null,
    input.applyFitFlags ? "fit flags" : null,
  ].filter(Boolean);
  return {
    ok: parts.length > 0,
    message: parts.length
      ? `Applied ${parts.join(" + ")} for ${photoId} (review Approve/homepage before publish).`
      : "Nothing selected to apply.",
  };
}

export function getTurboIngestDashboard(): {
  pending: number;
  lastRunAt?: string;
  lastRunMessage?: string;
  top: Array<{
    photoId: string;
    bestSurface: string | null;
    bestScore: number;
    identifySource: string;
    county: string;
  }>;
  inventory: ReturnType<typeof buildWebsiteSurfaceInventory>;
} {
  const pending = listPendingTurboProposals();
  const store = loadTurboIngestStore();
  const live = listCampaignPhotosLive();
  const inventory = buildWebsiteSurfaceInventory(live);
  return {
    pending: pending.length,
    lastRunAt: store.lastRunAt,
    lastRunMessage: store.lastRunMessage,
    top: pending.slice(0, 12).map((p) => ({
      photoId: p.photoId,
      bestSurface: p.fit.bestSurface,
      bestScore: p.fit.bestScore,
      identifySource: p.identifySource,
      county: p.identify?.county ?? "Unknown",
    })),
    inventory,
  };
}
