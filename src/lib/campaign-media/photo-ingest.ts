/**
 * Evidence Workbench photo intake — one path:
 *   drop under public/media/campaign-photos/ (flat or nested)
 *     → intakeAllNewCampaignPhotos() flattens + queues drafts
 *     → Photos tab labels / approves
 *
 * Never deletes nested originals. Never overwrites existing flat files.
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { emptyCampaignPhotoCampaignMetadata, UNKNOWN } from "@/content/media/campaign-photo-types";
import {
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
  savePhotoIngestDrafts,
} from "@/lib/campaign-media/evidence-store";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const PHOTOS_DIR_REL = "public/media/campaign-photos";

function photosDirAbs(): string {
  return path.join(process.cwd(), PHOTOS_DIR_REL);
}

export function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `ingest-${Date.now()}`
  );
}

export type DiskPhotoCandidate = {
  filename: string;
  /** Relative path under campaign-photos (may include subfolders). */
  relativePath: string;
  src: string;
  id: string;
  alreadyInRegistry: boolean;
  alreadyInDrafts: boolean;
  nested: boolean;
};

export type PhotoIntakeResult = {
  ok: boolean;
  scanned: number;
  flattened: number;
  queued: number;
  skippedRegistry: number;
  skippedDrafts: number;
  skippedErrors: number;
  ids: string[];
  message: string;
};

export type PhotoIntakeStatus = {
  scannedOnDisk: number;
  newOnDisk: number;
  nestedNew: number;
  flatNew: number;
  queueCount: number;
  queueUnknownCounty: number;
  registryCount: number;
  liveUnknownCounty: number;
  nextStep: "drop" | "intake" | "label" | "approve" | "clear";
  nextStepLabel: string;
};

/** Phase 3 — what Bring into system will do before any copy/queue (preview only). */
export type ArrivalIntakePreviewPlan =
  | "queue"
  | "copy_then_queue"
  | "reuse_flat_then_queue"
  | "skip_registry"
  | "skip_drafts"
  | "skip_basename_collision";

export type ArrivalIntakePreviewRow = {
  relativePath: string;
  nested: boolean;
  flatTarget: string;
  plan: ArrivalIntakePreviewPlan;
  warning: string | null;
};

export type ArrivalIntakePreview = {
  willQueue: number;
  willCopyNested: number;
  willSkip: number;
  warnCount: number;
  rows: ArrivalIntakePreviewRow[];
};

function walkRelativeImages(dirAbs: string, prefix = ""): string[] {
  if (!existsSync(dirAbs)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dirAbs)) {
    const abs = path.join(dirAbs, name);
    const st = statSync(abs);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (st.isDirectory()) {
      out.push(...walkRelativeImages(abs, rel));
      continue;
    }
    const ext = path.extname(name).toLowerCase();
    if (IMAGE_EXT.has(ext)) out.push(rel.split(path.sep).join("/"));
  }
  return out;
}

function scaffoldDraft(opts: {
  id: string;
  src: string;
  originalFilename: string;
  note?: string;
}): CampaignPhotoRecord {
  const now = new Date().toISOString();
  const ext = path.extname(opts.originalFilename).slice(1).toUpperCase() || "Unknown";
  return {
    id: opts.id,
    src: opts.src,
    heroLevel: "UNREVIEWED",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: opts.originalFilename,
      orientation: "Unknown",
      fileType: ext,
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      ...emptyCampaignPhotoCampaignMetadata(),
      approvedForPublic: false,
    },
    accessibility: {
      altText: "Campaign trail photograph — geography pending confirmation.",
      caption: `Intake queue: ${opts.originalFilename}`,
    },
    notes:
      opts.note ??
      "Intake queue from Evidence Workbench — confirm geography before public approval.",
    createdAt: now,
    updatedAt: now,
  };
}

/** Scan public/media/campaign-photos (recursive) for files not yet in registry or drafts. */
export function listDiskPhotoIngestCandidates(): DiskPhotoCandidate[] {
  const dir = photosDirAbs();
  if (!existsSync(dir)) return [];
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
  const drafts = loadPhotoIngestDrafts();
  const draftIds = new Set(drafts.photos.map((p) => p.id));
  const draftSrc = new Set(drafts.photos.map((p) => p.src));

  const out: DiskPhotoCandidate[] = [];
  for (const relativePath of walkRelativeImages(dir)) {
    const filename = path.basename(relativePath);
    const nested = relativePath.includes("/");
    const src = `/media/campaign-photos/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
    const id = slugFromFilename(filename);
    const flatSrc = `/media/campaign-photos/${filename}`;
    out.push({
      filename,
      relativePath,
      src,
      id,
      alreadyInRegistry:
        registryIds.has(id) || registrySrc.has(src) || registrySrc.has(flatSrc),
      alreadyInDrafts: draftIds.has(id) || draftSrc.has(src) || draftSrc.has(flatSrc),
      nested,
    });
  }
  return out.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

/**
 * Phase 3 preview — nested→flat plan + dedupe warnings. Never writes.
 * Prefer Unknown: collisions are skipped, not renamed with -2/-3.
 */
export function buildArrivalIntakePreview(
  candidates: DiskPhotoCandidate[] = listDiskPhotoIngestCandidates(),
): ArrivalIntakePreview {
  const root = photosDirAbs();
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
  const drafts = loadPhotoIngestDrafts();
  const draftIds = new Set(drafts.photos.map((p) => p.id));
  const draftSrc = new Set(drafts.photos.map((p) => p.src));

  const fresh = candidates.filter((c) => !c.alreadyInRegistry && !c.alreadyInDrafts);
  const basenameOwners = new Map<string, string[]>();
  for (const c of fresh) {
    const key = c.filename.toLowerCase();
    const list = basenameOwners.get(key) ?? [];
    list.push(c.relativePath);
    basenameOwners.set(key, list);
  }

  const claimedFlat = new Set<string>();
  const rows: ArrivalIntakePreviewRow[] = [];

  for (const c of fresh) {
    const ext = path.extname(c.filename).toLowerCase();
    const flatTarget = c.nested ? `${c.id}${ext}` : c.filename;
    const preferredSrc = `/media/campaign-photos/${flatTarget}`;
    const flatAbs = path.join(root, flatTarget);
    const owners = basenameOwners.get(c.filename.toLowerCase()) ?? [c.relativePath];
    const multiBasename = owners.length > 1;

    if (registryIds.has(c.id) || registrySrc.has(preferredSrc) || registrySrc.has(c.src)) {
      rows.push({
        relativePath: c.relativePath,
        nested: c.nested,
        flatTarget,
        plan: "skip_registry",
        warning: "Basename already in registry — will skip (no -2/-3 rename).",
      });
      continue;
    }
    if (draftIds.has(c.id) || draftSrc.has(preferredSrc) || draftSrc.has(c.src)) {
      rows.push({
        relativePath: c.relativePath,
        nested: c.nested,
        flatTarget,
        plan: "skip_drafts",
        warning: "Basename already in intake queue — will skip.",
      });
      continue;
    }
    if (multiBasename && owners[0] !== c.relativePath) {
      rows.push({
        relativePath: c.relativePath,
        nested: c.nested,
        flatTarget,
        plan: "skip_basename_collision",
        warning: `Same basename as ${owners[0]} — only one flat target; this path skipped.`,
      });
      continue;
    }
    if (claimedFlat.has(flatTarget.toLowerCase())) {
      rows.push({
        relativePath: c.relativePath,
        nested: c.nested,
        flatTarget,
        plan: "skip_basename_collision",
        warning: `Flat target ${flatTarget} already claimed in this dump — skipped.`,
      });
      continue;
    }

    claimedFlat.add(flatTarget.toLowerCase());

    if (c.nested) {
      if (existsSync(flatAbs)) {
        rows.push({
          relativePath: c.relativePath,
          nested: true,
          flatTarget,
          plan: "reuse_flat_then_queue",
          warning: `Flat ${flatTarget} already on disk — will reuse (nested original kept).`,
        });
      } else {
        rows.push({
          relativePath: c.relativePath,
          nested: true,
          flatTarget,
          plan: "copy_then_queue",
          warning: null,
        });
      }
    } else {
      rows.push({
        relativePath: c.relativePath,
        nested: false,
        flatTarget,
        plan: "queue",
        warning: null,
      });
    }
  }

  const willQueue = rows.filter((r) =>
    r.plan === "queue" || r.plan === "copy_then_queue" || r.plan === "reuse_flat_then_queue",
  ).length;
  const willCopyNested = rows.filter((r) => r.plan === "copy_then_queue").length;
  const willSkip = rows.filter((r) =>
    r.plan === "skip_registry" || r.plan === "skip_drafts" || r.plan === "skip_basename_collision",
  ).length;
  const warnCount = rows.filter((r) => Boolean(r.warning)).length;

  return { willQueue, willCopyNested, willSkip, warnCount, rows };
}

/**
 * Copy one nested image into the flat campaign-photos root (never deletes source).
 * Reuses preferred slug filename when present; skips inventing -2/-3 when basename already queued/registered.
 */
export function flattenOneNestedPhoto(relativePath: string): {
  ok: true;
  flatFilename: string;
  copied: boolean;
} | { ok: false; error: string } {
  const rel = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel || rel.includes("..") || !rel.includes("/")) {
    return { ok: false, error: "Expected a nested relative path under campaign-photos." };
  }
  const root = photosDirAbs();
  const srcAbs = path.join(root, ...rel.split("/"));
  if (!existsSync(srcAbs)) return { ok: false, error: `Missing file: ${rel}` };

  const originalFilename = path.basename(rel);
  const ext = path.extname(originalFilename).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return { ok: false, error: "Not an image." };

  const baseId = slugFromFilename(originalFilename);
  const preferred = `${baseId}${ext}`;
  const preferredSrc = `/media/campaign-photos/${preferred}`;
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
  const drafts = loadPhotoIngestDrafts();
  if (
    registryIds.has(baseId) ||
    registrySrc.has(preferredSrc) ||
    drafts.photos.some((p) => p.id === baseId || p.src === preferredSrc)
  ) {
    // Already known — point at preferred flat path if present, else error for operator.
    const destAbs = path.join(root, preferred);
    if (existsSync(destAbs)) return { ok: true, flatFilename: preferred, copied: false };
    return {
      ok: false,
      error: "Basename already in registry/queue — nested copy not needed.",
    };
  }

  const destAbs = path.join(root, preferred);
  let copied = false;
  if (!existsSync(destAbs)) {
    mkdirSync(root, { recursive: true });
    copyFileSync(srcAbs, destAbs);
    copied = true;
  }
  return { ok: true, flatFilename: preferred, copied };
}

function queueFlatFile(flatFilename: string): {
  ok: true;
  photo: CampaignPhotoRecord;
  already?: "registry" | "drafts";
} | { ok: false; error: string } {
  const name = path.basename(flatFilename);
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return { ok: false, error: "Invalid flat filename." };
  }
  const root = photosDirAbs();
  const abs = path.join(root, name);
  if (!existsSync(abs)) return { ok: false, error: `Flat file missing: ${name}` };

  const src = `/media/campaign-photos/${name}`;
  const id = slugFromFilename(name);
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
  if (registryIds.has(id) || registrySrc.has(src)) {
    return { ok: false, error: "Already in campaign-photo-registry." };
  }

  const store = loadPhotoIngestDrafts();
  if (store.photos.some((p) => p.id === id || p.src === src)) {
    return { ok: false, error: "Already in intake queue (drafts)." };
  }

  const photo = scaffoldDraft({ id, src, originalFilename: name });
  store.photos.push(photo);
  savePhotoIngestDrafts(store);
  return { ok: true, photo };
}

/**
 * Phase 4 — write image bytes into campaign-photos and queue a draft.
 * Never Approves. Never invents -2/-3 when basename already known.
 */
export function intakeImageBytesToDraft(opts: {
  filename: string;
  bytes: Buffer;
  note?: string;
}): { ok: true; photo: CampaignPhotoRecord; flatFilename: string } | { ok: false; error: string } {
  const safe = path.basename(String(opts.filename ?? "").trim());
  if (!safe || safe === "." || safe === "..") return { ok: false, error: "Invalid filename." };
  const ext = path.extname(safe).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return { ok: false, error: "Not an allowed image type." };
  if (!opts.bytes?.length) return { ok: false, error: "Empty image bytes." };

  const id = slugFromFilename(safe);
  const preferred = `${id}${ext}`;
  const root = photosDirAbs();
  mkdirSync(root, { recursive: true });
  const destAbs = path.join(root, preferred);
  const preferredSrc = `/media/campaign-photos/${preferred}`;

  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
  const drafts = loadPhotoIngestDrafts();
  if (
    registryIds.has(id) ||
    registrySrc.has(preferredSrc) ||
    drafts.photos.some((p) => p.id === id || p.src === preferredSrc)
  ) {
    return {
      ok: false,
      error: "Basename already in registry or intake queue — refuse duplicate import.",
    };
  }

  if (!existsSync(destAbs)) {
    writeFileSync(destAbs, opts.bytes);
  }
  const queued = queueFlatFile(preferred);
  if (!queued.ok) return queued;
  if (opts.note) {
    queued.photo.notes = opts.note;
    const store = loadPhotoIngestDrafts();
    const idx = store.photos.findIndex((p) => p.id === queued.photo.id);
    if (idx >= 0) {
      store.photos[idx] = { ...store.photos[idx], notes: opts.note, updatedAt: new Date().toISOString() };
      savePhotoIngestDrafts(store);
    }
  }
  return { ok: true, photo: queued.photo, flatFilename: preferred };
}

/**
 * Intake one disk path: flatten if nested, then queue into drafts.
 * Prefer intakeAllNewCampaignPhotos for dumps.
 */
export function intakeOneCampaignPhoto(filenameOrRel: string): {
  ok: true;
  photo: CampaignPhotoRecord;
  flattened: boolean;
} | { ok: false; error: string } {
  const rel = filenameOrRel.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel || rel.includes("..")) return { ok: false, error: "Invalid path." };

  let flatName = path.basename(rel);
  let flattened = false;

  if (rel.includes("/")) {
    const flat = flattenOneNestedPhoto(rel);
    if (!flat.ok) return flat;
    flatName = flat.flatFilename;
    flattened = flat.copied;
  }

  const queued = queueFlatFile(flatName);
  if (!queued.ok) return queued;
  return { ok: true, photo: queued.photo, flattened };
}

/**
 * One-button intake: flatten every nested new image, queue every new flat file into drafts.
 * Nested originals are copied, never deleted.
 */
export function intakeAllNewCampaignPhotos(): PhotoIntakeResult {
  const root = photosDirAbs();
  if (!existsSync(root)) {
    return {
      ok: true,
      scanned: 0,
      flattened: 0,
      queued: 0,
      skippedRegistry: 0,
      skippedDrafts: 0,
      skippedErrors: 0,
      ids: [],
      message: "campaign-photos folder missing — create it and drop stills there.",
    };
  }

  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
  const drafts = loadPhotoIngestDrafts();
  const draftIds = new Set(drafts.photos.map((p) => p.id));
  const draftSrc = new Set(drafts.photos.map((p) => p.src));

  let flattened = 0;
  let skippedRegistry = 0;
  let skippedDrafts = 0;
  let skippedErrors = 0;
  const ids: string[] = [];
  const allRel = walkRelativeImages(root);

  // Pass 1 — flatten nested into preferred flat names (copy only; reuse if already flat).
  // Never invent -2/-3 when the basename slug is already in registry/drafts.
  const flatTargets: string[] = [];
  for (const relativePath of allRel.sort()) {
    const nested = relativePath.includes("/");
    const originalFilename = path.basename(relativePath);
    const ext = path.extname(originalFilename).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;

    const baseId = slugFromFilename(originalFilename);
    const preferred = `${baseId}${ext}`;
    const preferredSrc = `/media/campaign-photos/${preferred}`;

    if (!nested) {
      flatTargets.push(originalFilename);
      continue;
    }

    // Nested dump whose basename already lives in registry/drafts → skip (no duplicate flat).
    if (
      registryIds.has(baseId) ||
      draftIds.has(baseId) ||
      registrySrc.has(preferredSrc) ||
      draftSrc.has(preferredSrc)
    ) {
      if (registryIds.has(baseId) || registrySrc.has(preferredSrc)) skippedRegistry += 1;
      else skippedDrafts += 1;
      continue;
    }

    const destAbs = path.join(root, preferred);
    const srcAbs = path.join(root, ...relativePath.split("/"));
    try {
      if (!existsSync(destAbs)) {
        copyFileSync(srcAbs, destAbs);
        flattened += 1;
      }
      flatTargets.push(preferred);
    } catch {
      skippedErrors += 1;
    }
  }

  // Pass 2 — queue unique flat files not already in registry/drafts.
  const seenFlat = new Set<string>();
  for (const flatName of flatTargets) {
    const key = flatName.toLowerCase();
    if (seenFlat.has(key)) continue;
    seenFlat.add(key);

    const src = `/media/campaign-photos/${flatName}`;
    const id = slugFromFilename(flatName);
    if (registryIds.has(id) || registrySrc.has(src)) {
      skippedRegistry += 1;
      continue;
    }
    if (draftIds.has(id) || draftSrc.has(src)) {
      skippedDrafts += 1;
      continue;
    }
    if (!existsSync(path.join(root, flatName))) {
      skippedErrors += 1;
      continue;
    }

    const photo = scaffoldDraft({
      id,
      src,
      originalFilename: flatName,
      note: "Intake queue from Evidence Workbench (flatten + draft). Confirm geography before public approval.",
    });
    drafts.photos.push(photo);
    draftIds.add(id);
    draftSrc.add(src);
    ids.push(id);
  }

  if (ids.length) savePhotoIngestDrafts(drafts);

  const queued = ids.length;
  const ok = skippedErrors === 0 || queued > 0;
  const parts = [
    queued ? `Queued ${queued} still(s) for labeling` : "No new stills to queue",
    flattened ? `flattened ${flattened} nested copy(ies)` : null,
    skippedDrafts ? `${skippedDrafts} already queued` : null,
    skippedRegistry ? `${skippedRegistry} already in registry` : null,
    skippedErrors ? `${skippedErrors} error(s)` : null,
  ].filter(Boolean);

  return {
    ok,
    scanned: allRel.length,
    flattened,
    queued,
    skippedRegistry,
    skippedDrafts,
    skippedErrors,
    ids,
    message: `${parts.join(" · ")}. Next: Photos tab → Draft / Unknown county → Save → Approve.`,
  };
}

/** Operator pipeline status for the Ingest tab. */
export function getPhotoIntakeStatus(): PhotoIntakeStatus {
  const candidates = listDiskPhotoIngestCandidates();
  const fresh = candidates.filter((c) => !c.alreadyInRegistry && !c.alreadyInDrafts);
  const nestedNew = fresh.filter((c) => c.nested).length;
  const flatNew = fresh.filter((c) => !c.nested).length;
  const drafts = loadPhotoIngestDrafts();
  const evidence = loadPhotoEvidenceStore();

  let queueUnknownCounty = 0;
  for (const d of drafts.photos) {
    const overlay = evidence.photos[d.id];
    const county = (overlay?.county ?? d.campaign.county ?? "Unknown").trim() || "Unknown";
    if (county === "Unknown") queueUnknownCounty += 1;
  }

  const registryCount = CAMPAIGN_PHOTO_REGISTRY.length;
  let liveUnknownCounty = queueUnknownCounty;
  for (const p of CAMPAIGN_PHOTO_REGISTRY) {
    const overlay = evidence.photos[p.id];
    const county = (overlay?.county ?? p.campaign.county ?? "Unknown").trim() || "Unknown";
    if (county === "Unknown") liveUnknownCounty += 1;
  }

  let nextStep: PhotoIntakeStatus["nextStep"] = "clear";
  let nextStepLabel =
    "Queue clear — finish remaining Unknown on Identify, then Approve on County.";
  if (fresh.length > 0) {
    nextStep = "intake";
    nextStepLabel = `Intake ${fresh.length} new file(s) on disk (nested OK — one click). Rescan first if you dropped outside the browser.`;
  } else if (queueUnknownCounty > 0) {
    nextStep = "label";
    nextStepLabel = `Identify ${queueUnknownCounty} queued still(s) missing county — Save → Route.`;
  } else if (drafts.photos.length > 0) {
    nextStep = "approve";
    nextStepLabel = "Geography set — Approve on County desk when ready for albums.";
  } else if (candidates.length === 0) {
    nextStep = "drop";
    nextStepLabel =
      "Drop stills into public/media/campaign-photos/ (folders OK), Rescan if needed, then Intake.";
  }

  return {
    scannedOnDisk: candidates.length,
    newOnDisk: fresh.length,
    nestedNew,
    flatNew,
    queueCount: drafts.photos.length,
    queueUnknownCounty,
    registryCount,
    liveUnknownCounty,
    nextStep,
    nextStepLabel,
  };
}

/** @deprecated Prefer intakeOneCampaignPhoto — kept for action aliases. */
export function promoteDiskPhotoToDraft(filenameOrRel: string): {
  ok: true;
  photo: CampaignPhotoRecord;
} | { ok: false; error: string } {
  const res = intakeOneCampaignPhoto(filenameOrRel);
  if (!res.ok) return res;
  return { ok: true, photo: res.photo };
}

/** @deprecated Prefer intakeAllNewCampaignPhotos. Flat-only legacy path. */
export function promoteAllNewDiskPhotosToDrafts(): {
  promoted: number;
  skipped: number;
  ids: string[];
} {
  const result = intakeAllNewCampaignPhotos();
  return {
    promoted: result.queued,
    skipped: result.skippedRegistry + result.skippedDrafts + result.skippedErrors,
    ids: result.ids,
  };
}
