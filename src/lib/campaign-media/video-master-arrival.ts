/**
 * Evidence Arrival — video master attachments + unmatched holds (Phase 1).
 * Prefer Unknown. Never auto-Approve. Filename auto-match still works; operator can override.
 */

import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { writeJsonAtomic } from "@/lib/campaign-media/evidence-store";
import {
  VIDEO_MASTER_ATTACHMENTS_REL,
  type VideoMasterAttachmentsStore,
} from "@/lib/campaign-media/evidence-types";
import {
  listLocalVideoMasters,
  type LocalVideoMasterHit,
} from "@/lib/campaign-media/local-video-masters";

export type VideoMasterMatchStatus = "auto" | "attached" | "unmatched" | "held";

/** Phase 4 — how confident the auto/attached match is. */
export type VideoMasterMatchConfidence =
  | "youtube-id"
  | "speech-id"
  | "attached"
  | "fuzzy"
  | null;

export type VideoMasterArrivalRow = {
  key: string;
  filename: string;
  root: LocalVideoMasterHit["root"];
  bytes: number;
  publicSrc: string | null;
  matchStatus: VideoMasterMatchStatus;
  matchConfidence: VideoMasterMatchConfidence;
  matchedSpeechId: string | null;
  matchedSpeechTitle: string | null;
  /** Soft auto-match suggestions when unmatched (filename substring). YT-id hits sorted first. */
  suggestions: Array<{ id: string; title: string; reason?: string }>;
};

export type VideoMasterArrivalSummary = {
  total: number;
  matched: number;
  unmatched: number;
  held: number;
  rows: VideoMasterArrivalRow[];
};

export function masterAttachmentKey(
  root: LocalVideoMasterHit["root"],
  filename: string,
): string {
  return `${root}::${filename}`;
}

export function emptyVideoMasterAttachmentsStore(): VideoMasterAttachmentsStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Evidence Arrival — operator video master → speech attachments and unmatched holds. Prefer Unknown.",
    attachments: {},
    unmatchedHolds: {},
  };
}

function storeAbs(): string {
  return path.join(process.cwd(), VIDEO_MASTER_ATTACHMENTS_REL);
}

export function loadVideoMasterAttachmentsStore(): VideoMasterAttachmentsStore {
  const p = storeAbs();
  if (!existsSync(p)) return emptyVideoMasterAttachmentsStore();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as VideoMasterAttachmentsStore;
    if (!raw || typeof raw !== "object") return emptyVideoMasterAttachmentsStore();
    return {
      ...emptyVideoMasterAttachmentsStore(),
      ...raw,
      version: 1,
      attachments:
        raw.attachments && typeof raw.attachments === "object" ? raw.attachments : {},
      unmatchedHolds:
        raw.unmatchedHolds && typeof raw.unmatchedHolds === "object" ? raw.unmatchedHolds : {},
    };
  } catch {
    return emptyVideoMasterAttachmentsStore();
  }
}

export function saveVideoMasterAttachmentsStore(store: VideoMasterAttachmentsStore): void {
  writeJsonAtomic(VIDEO_MASTER_ATTACHMENTS_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

function speechTitle(id: string): string | null {
  const row = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === id);
  return row?.shortTitle ?? row?.title ?? null;
}

/** Filename / idHint matches — prefer exact YouTube id, then speech id, then fuzzy. */
function autoMatchSpeech(
  hit: LocalVideoMasterHit,
): { id: string; title: string; confidence: Exclude<VideoMasterMatchConfidence, "attached" | null> } | null {
  const hay = hit.idHint.toLowerCase();
  const file = hit.filename.toLowerCase();

  for (const m of CAMPAIGN_MEDIA_REGISTRY) {
    const yt = m.youtubeVideoId.toLowerCase();
    if (yt.length >= 8 && (hay === yt || hay.includes(yt) || file.includes(yt))) {
      return { id: m.id, title: m.shortTitle ?? m.title, confidence: "youtube-id" };
    }
  }
  for (const m of CAMPAIGN_MEDIA_REGISTRY) {
    const id = m.id.toLowerCase();
    if (hay === id || file.includes(id) || (id.length >= 8 && hay.includes(id))) {
      return { id: m.id, title: m.shortTitle ?? m.title, confidence: "speech-id" };
    }
  }
  for (const m of CAMPAIGN_MEDIA_REGISTRY) {
    const id = m.id.toLowerCase();
    const yt = m.youtubeVideoId.toLowerCase();
    if (id.includes(hay) || yt.includes(hay)) {
      return { id: m.id, title: m.shortTitle ?? m.title, confidence: "fuzzy" };
    }
  }
  return null;
}

function softSuggestions(
  hit: LocalVideoMasterHit,
  limit = 4,
): Array<{ id: string; title: string; reason?: string }> {
  const hay = hit.idHint.toLowerCase();
  const file = hit.filename.toLowerCase();
  const scored: Array<{ id: string; title: string; score: number; reason: string }> = [];

  for (const m of CAMPAIGN_MEDIA_REGISTRY) {
    const yt = m.youtubeVideoId.toLowerCase();
    const id = m.id.toLowerCase();
    let score = 0;
    let reason = "fuzzy";
    if (yt.length >= 8 && (hay.includes(yt) || file.includes(yt))) {
      score = 10_000 + yt.length;
      reason = "youtube-id";
    } else if (hay.includes(id) || file.includes(id)) {
      score = 5_000 + id.length;
      reason = "speech-id";
    } else {
      const tokens = hay.replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((t) => t.length >= 4);
      const blob = `${m.id} ${m.title} ${m.youtubeVideoId}`.toLowerCase();
      for (const t of tokens) {
        if (blob.includes(t)) score += t.length;
      }
    }
    if (score > 0) {
      scored.push({ id: m.id, title: m.shortTitle ?? m.title, score, reason });
    }
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ id, title, reason }) => ({ id, title, reason }));
}

export function listVideoMasterArrival(): VideoMasterArrivalSummary {
  const store = loadVideoMasterAttachmentsStore();
  const masters = listLocalVideoMasters();
  const rows: VideoMasterArrivalRow[] = [];

  for (const hit of masters) {
    const key = masterAttachmentKey(hit.root, hit.filename);
    const attached = store.attachments[key];
    const held = store.unmatchedHolds[key];

    if (attached?.speechId) {
      rows.push({
        key,
        filename: hit.filename,
        root: hit.root,
        bytes: hit.bytes,
        publicSrc: hit.publicSrc,
        matchStatus: "attached",
        matchConfidence: "attached",
        matchedSpeechId: attached.speechId,
        matchedSpeechTitle: speechTitle(attached.speechId),
        suggestions: [],
      });
      continue;
    }

    if (held) {
      rows.push({
        key,
        filename: hit.filename,
        root: hit.root,
        bytes: hit.bytes,
        publicSrc: hit.publicSrc,
        matchStatus: "held",
        matchConfidence: null,
        matchedSpeechId: null,
        matchedSpeechTitle: null,
        suggestions: softSuggestions(hit),
      });
      continue;
    }

    const auto = autoMatchSpeech(hit);
    if (auto) {
      rows.push({
        key,
        filename: hit.filename,
        root: hit.root,
        bytes: hit.bytes,
        publicSrc: hit.publicSrc,
        matchStatus: "auto",
        matchConfidence: auto.confidence,
        matchedSpeechId: auto.id,
        matchedSpeechTitle: auto.title,
        suggestions: [],
      });
      continue;
    }

    rows.push({
      key,
      filename: hit.filename,
      root: hit.root,
      bytes: hit.bytes,
      publicSrc: hit.publicSrc,
      matchStatus: "unmatched",
      matchConfidence: null,
      matchedSpeechId: null,
      matchedSpeechTitle: null,
      suggestions: softSuggestions(hit),
    });
  }

  rows.sort((a, b) => {
    const order = { unmatched: 0, held: 1, auto: 2, attached: 3 };
    return order[a.matchStatus] - order[b.matchStatus] || a.filename.localeCompare(b.filename);
  });

  const unmatched = rows.filter((r) => r.matchStatus === "unmatched").length;
  const held = rows.filter((r) => r.matchStatus === "held").length;
  const matched = rows.filter((r) => r.matchStatus === "auto" || r.matchStatus === "attached").length;

  return { total: rows.length, matched, unmatched, held, rows };
}

export function attachVideoMasterToSpeech(input: {
  root: LocalVideoMasterHit["root"];
  filename: string;
  speechId: string;
}): { ok: boolean; message: string } {
  const speechId = String(input.speechId ?? "").trim();
  if (!speechId) return { ok: false, message: "Pick a speech to attach." };
  if (!CAMPAIGN_MEDIA_REGISTRY.some((m) => m.id === speechId)) {
    return { ok: false, message: `Unknown speech id: ${speechId}` };
  }
  const masters = listLocalVideoMasters();
  const hit = masters.find((m) => m.root === input.root && m.filename === input.filename);
  if (!hit) return { ok: false, message: "Master file not found on disk." };

  const key = masterAttachmentKey(hit.root, hit.filename);
  const store = loadVideoMasterAttachmentsStore();
  store.attachments[key] = { speechId, attachedAt: new Date().toISOString() };
  delete store.unmatchedHolds[key];
  saveVideoMasterAttachmentsStore(store);
  return {
    ok: true,
    message: `Attached ${hit.filename} → ${speechTitle(speechId) ?? speechId}. Usable in Prep / Pro Edit.`,
  };
}

export function markVideoMasterUnmatched(input: {
  root: LocalVideoMasterHit["root"];
  filename: string;
  note?: string;
}): { ok: boolean; message: string } {
  const masters = listLocalVideoMasters();
  const hit = masters.find((m) => m.root === input.root && m.filename === input.filename);
  if (!hit) return { ok: false, message: "Master file not found on disk." };
  const key = masterAttachmentKey(hit.root, hit.filename);
  const store = loadVideoMasterAttachmentsStore();
  delete store.attachments[key];
  store.unmatchedHolds[key] = {
    heldAt: new Date().toISOString(),
    note: input.note?.trim() || undefined,
  };
  saveVideoMasterAttachmentsStore(store);
  return {
    ok: true,
    message: `Marked ${hit.filename} unmatched (held). Prefer Unknown — attach later when speech is clear.`,
  };
}

export function clearVideoMasterHold(input: {
  root: LocalVideoMasterHit["root"];
  filename: string;
}): { ok: boolean; message: string } {
  const key = masterAttachmentKey(input.root, input.filename);
  const store = loadVideoMasterAttachmentsStore();
  if (!store.unmatchedHolds[key] && !store.attachments[key]) {
    return { ok: false, message: "Nothing to clear for that master." };
  }
  delete store.unmatchedHolds[key];
  delete store.attachments[key];
  saveVideoMasterAttachmentsStore(store);
  return { ok: true, message: `Cleared operator override for ${input.filename}.` };
}

export function listSpeechOptionsForArrival(): Array<{ id: string; title: string; youtubeVideoId: string }> {
  return CAMPAIGN_MEDIA_REGISTRY.map((m) => ({
    id: m.id,
    title: m.shortTitle ?? m.title,
    youtubeVideoId: m.youtubeVideoId,
  }));
}

/** Resolve attached master file for a speech (operator override). */
export function findAttachedMasterForSpeech(speechId: string): LocalVideoMasterHit | null {
  const id = String(speechId ?? "").trim();
  if (!id) return null;
  const store = loadVideoMasterAttachmentsStore();
  const all = listLocalVideoMasters();
  for (const [key, att] of Object.entries(store.attachments)) {
    if (att.speechId !== id) continue;
    const hit = all.find((m) => masterAttachmentKey(m.root, m.filename) === key);
    if (hit) return hit;
  }
  return null;
}
