import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildCountyAlbums, countyAlbumFolderRel } from "@/lib/campaign-media/county-albums";

export const COUNTY_ALBUM_INDEX_REL = "data/campaign-media/county-album-index.json";

/**
 * Refresh JSON index of county → event → photo ids (from confirmed labels).
 * Optionally materialize copies under public/media/county-albums/{county}/{event}/.
 * Safe for admin actions and local scripts (no next/headers).
 */
export function refreshCountyAlbumIndex(opts?: { materializeFolders?: boolean }): {
  countyCount: number;
  photoCount: number;
  foldersWritten: number;
} {
  const albums = buildCountyAlbums();
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
  if (opts?.materializeFolders) {
    for (const album of albums) {
      for (const event of album.events) {
        const destDir = path.join(root, countyAlbumFolderRel(album.countySlug, event.eventSlug));
        mkdirSync(destDir, { recursive: true });
        for (const photo of event.photos) {
          const fromAbs = path.join(root, "public", photo.src.replace(/^\//, ""));
          if (!existsSync(fromAbs)) continue;
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
  };
}
