import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { buildCountyAlbums, countyAlbumFolderRel } from "@/lib/campaign-media/county-albums";
import type { PhotoEvidenceStore, PhotoIngestDraftStore } from "@/lib/campaign-media/evidence-types";

export const COUNTY_ALBUM_INDEX_REL = "data/campaign-media/county-album-index.json";

function loadPhotosFromDisk(photoStore?: PhotoEvidenceStore): CampaignPhotoRecord[] {
  // Keep this module free of `server-only` so `tsx scripts/refresh-county-albums.ts` works.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const reg = require("@/content/media/campaign-photo-registry") as typeof import("@/content/media/campaign-photo-registry");

  let store = photoStore;
  if (!store) {
    const evidenceAbs = path.join(process.cwd(), "data/campaign-media/photo-evidence.json");
    store = existsSync(evidenceAbs)
      ? (JSON.parse(readFileSync(evidenceAbs, "utf8")) as PhotoEvidenceStore)
      : { version: 1, updatedAt: "", purpose: "", photos: {} };
  }

  const draftsAbs = path.join(process.cwd(), "data/campaign-media/photo-ingest-drafts.json");
  const drafts: PhotoIngestDraftStore = existsSync(draftsAbs)
    ? (JSON.parse(readFileSync(draftsAbs, "utf8")) as PhotoIngestDraftStore)
    : { version: 1, updatedAt: "", purpose: "", photos: [] };

  const byId = new Map<string, CampaignPhotoRecord>();
  for (const p of reg.CAMPAIGN_PHOTO_REGISTRY) byId.set(p.id, p);
  for (const d of drafts.photos ?? []) {
    if (!byId.has(d.id)) byId.set(d.id, d);
  }

  return Array.from(byId.values()).map((p) => applyPhotoEvidenceOverlay(p, store!.photos?.[p.id]));
}

/**
 * Refresh JSON index of county → event → photo ids (from confirmed labels).
 * Optionally materialize copies under public/media/county-albums/{county}/{event}/.
 * Pass `photos` from listCampaignPhotosLive after Save so the index is never stale.
 */
export function refreshCountyAlbumIndex(opts?: {
  materializeFolders?: boolean;
  photos?: CampaignPhotoRecord[];
  photoStore?: PhotoEvidenceStore;
}): {
  countyCount: number;
  photoCount: number;
  foldersWritten: number;
  missingSources: number;
} {
  const photos = opts?.photos ?? loadPhotosFromDisk(opts?.photoStore);
  const albums = buildCountyAlbums(photos);
  const index = {
    version: 1 as const,
    updatedAt: new Date().toISOString(),
    purpose:
      "County → event photo albums from confirmed Evidence Workbench / registry geography. Unknown counties omitted.",
    counties: albums.map((a) => ({
      countySlug: a.countySlug,
      countyDisplayName: a.countyDisplayName,
      photoCount: a.photoCount,
      eventCount: a.eventCount,
      coverPhotoId: a.cover.id,
      events: a.events.map((e) => ({
        eventSlug: e.eventSlug,
        eventName: e.eventName,
        city: e.city,
        photoIds: e.photos.map((p) => p.id),
        folderRel: countyAlbumFolderRel(a.countySlug, e.eventSlug),
      })),
    })),
  };

  const root = process.cwd();
  const indexAbs = path.join(root, COUNTY_ALBUM_INDEX_REL);
  mkdirSync(path.dirname(indexAbs), { recursive: true });
  writeFileSync(indexAbs, `${JSON.stringify(index, null, 2)}\n`, "utf8");

  let foldersWritten = 0;
  let missingSources = 0;
  if (opts?.materializeFolders) {
    for (const album of albums) {
      for (const event of album.events) {
        const destDir = path.join(root, countyAlbumFolderRel(album.countySlug, event.eventSlug));
        mkdirSync(destDir, { recursive: true });
        for (const photo of event.photos) {
          const fromAbs = path.join(root, "public", photo.src.replace(/^\//, ""));
          if (!existsSync(fromAbs)) {
            missingSources += 1;
            continue;
          }
          const destAbs = path.join(destDir, path.basename(fromAbs));
          copyFileSync(fromAbs, destAbs);
          foldersWritten += 1;
        }
        writeFileSync(
          path.join(destDir, "README.txt"),
          `${album.countyDisplayName} · ${event.eventName}\n` +
            `Photos: ${event.photos.length}\n` +
            `Public album: /campaign-photos/${album.countySlug}#${event.eventSlug}\n` +
            `Generated: ${index.updatedAt}\n`,
          "utf8",
        );
      }
    }
  }

  return {
    countyCount: albums.length,
    photoCount: albums.reduce((n, a) => n + a.photoCount, 0),
    foldersWritten,
    missingSources,
  };
}
