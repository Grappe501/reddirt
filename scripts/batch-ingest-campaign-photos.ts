/**
 * Batch-ingest campaign stills from public/media/campaign-photos (+ nested folders).
 * - Copies nested images into the flat campaign-photos folder with stable slugs
 * - Promotes new files into data/campaign-media/photo-ingest-drafts.json
 *
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/batch-ingest-campaign-photos.ts
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { CAMPAIGN_PHOTO_REGISTRY } from "../src/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "../src/content/media/campaign-photo-types";
import { emptyCampaignPhotoCampaignMetadata, UNKNOWN } from "../src/content/media/campaign-photo-types";
import type { PhotoIngestDraftStore } from "../src/lib/campaign-media/evidence-types";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ROOT = path.join(process.cwd(), "public", "media", "campaign-photos");
const DRAFTS_REL = "data/campaign-media/photo-ingest-drafts.json";

function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `ingest-${Date.now()}`
  );
}

function walkImages(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) {
      walkImages(abs, acc);
      continue;
    }
    const ext = path.extname(name).toLowerCase();
    if (IMAGE_EXT.has(ext)) acc.push(abs);
  }
  return acc;
}

function uniqueDestName(preferred: string, used: Set<string>): string {
  if (!used.has(preferred.toLowerCase())) {
    used.add(preferred.toLowerCase());
    return preferred;
  }
  const ext = path.extname(preferred);
  const stem = preferred.slice(0, -ext.length);
  let i = 2;
  while (used.has(`${stem}-${i}${ext}`.toLowerCase())) i += 1;
  const next = `${stem}-${i}${ext}`;
  used.add(next.toLowerCase());
  return next;
}

function emptyDrafts(): PhotoIngestDraftStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Local ingest drafts — stills promoted from public/media before they land in campaign-photo-registry.ts.",
    photos: [],
  };
}

function loadDrafts(): PhotoIngestDraftStore {
  const abs = path.join(process.cwd(), DRAFTS_REL);
  if (!existsSync(abs)) return emptyDrafts();
  return JSON.parse(readFileSync(abs, "utf8")) as PhotoIngestDraftStore;
}

function saveDrafts(store: PhotoIngestDraftStore): void {
  const abs = path.join(process.cwd(), DRAFTS_REL);
  mkdirSync(path.dirname(abs), { recursive: true });
  const tmp = `${abs}.${process.pid}.tmp`;
  const payload = { ...store, version: 1 as const, updatedAt: new Date().toISOString() };
  writeFileSync(tmp, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  renameSync(tmp, abs);
}

function scaffoldDraft(opts: {
  id: string;
  src: string;
  originalFilename: string;
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
      caption: `Ingest draft: ${opts.originalFilename}`,
    },
    notes:
      "Batch ingest from public/media/campaign-photos (incl. Website pics and speeches). Confirm geography before public approval.",
    createdAt: now,
    updatedAt: now,
  };
}

const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
const drafts = loadDrafts();
const draftIds = new Set(drafts.photos.map((p) => p.id));
const draftSrc = new Set(drafts.photos.map((p) => p.src));

const usedNames = new Set(
  readdirSync(ROOT)
    .filter((n) => {
      try {
        return statSync(path.join(ROOT, n)).isFile();
      } catch {
        return false;
      }
    })
    .map((n) => n.toLowerCase()),
);

const allAbs = walkImages(ROOT);
let copied = 0;
let promoted = 0;
let skippedRegistry = 0;
let skippedDrafts = 0;
const promotedIds: string[] = [];

for (const abs of allAbs.sort()) {
  const relFromRoot = path.relative(ROOT, abs);
  const isNested = relFromRoot.includes(path.sep);
  const originalFilename = path.basename(abs);
  const ext = path.extname(originalFilename).toLowerCase();

  let flatName = originalFilename;

  if (isNested) {
    const slug = slugFromFilename(originalFilename);
    flatName = uniqueDestName(`${slug}${ext}`, usedNames);
    const destAbs = path.join(ROOT, flatName);
    if (!existsSync(destAbs)) {
      mkdirSync(ROOT, { recursive: true });
      copyFileSync(abs, destAbs);
      copied += 1;
    }
  } else {
    usedNames.add(flatName.toLowerCase());
  }

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

  const photo = scaffoldDraft({ id, src, originalFilename: flatName });
  drafts.photos.push(photo);
  draftIds.add(id);
  draftSrc.add(src);
  promoted += 1;
  promotedIds.push(id);
}

saveDrafts(drafts);

console.log(
  JSON.stringify(
    {
      scanned: allAbs.length,
      copiedToFlat: copied,
      promotedToDrafts: promoted,
      skippedAlreadyInRegistry: skippedRegistry,
      skippedAlreadyInDrafts: skippedDrafts,
      draftTotal: drafts.photos.length,
      promotedIds,
    },
    null,
    2,
  ),
);
