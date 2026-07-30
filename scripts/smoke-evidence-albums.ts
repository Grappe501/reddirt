/**
 * CLI smoke for album eligibility + disk merge (no server-only).
 * From RedDirt: node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/smoke-evidence-albums.ts
 */
import { applyPhotoEvidenceOverlay } from "../src/lib/campaign-media/apply-evidence-overlay";
import { buildCountyAlbums, isAlbumEligible } from "../src/lib/campaign-media/county-albums";
import { refreshCountyAlbumIndex } from "../src/lib/campaign-media/refresh-county-albums";
import { CAMPAIGN_PHOTO_REGISTRY } from "../src/content/media/campaign-photo-registry";
import photoStore from "../data/campaign-media/photo-evidence.json";
import type { PhotoEvidenceStore } from "../src/lib/campaign-media/evidence-types";

const store = photoStore as PhotoEvidenceStore;
const live = CAMPAIGN_PHOTO_REGISTRY.map((p) => applyPhotoEvidenceOverlay(p, store.photos?.[p.id]));
const eligible = live.filter(isAlbumEligible);
const albums = buildCountyAlbums(live);
const denied = Object.entries(store.photos ?? {}).filter(([, o]) => o.approvedForPublic === false);

const refresh = refreshCountyAlbumIndex({ materializeFolders: false, photos: live, photoStore: store });

console.log(
  JSON.stringify(
    {
      registry: CAMPAIGN_PHOTO_REGISTRY.length,
      eligible: eligible.length,
      albums: albums.length,
      deniedOverlays: denied.length,
      refresh,
      sampleAlbums: albums.slice(0, 5).map((a) => ({ slug: a.countySlug, photos: a.photoCount })),
    },
    null,
    2,
  ),
);

if (albums.length < 1) {
  console.error("Expected at least one county album from launch stills.");
  process.exit(1);
}
if (denied.some(([id]) => albums.some((a) => a.events.some((e) => e.photos.some((p) => p.id === id))))) {
  console.error("Denied overlay still appeared in albums.");
  process.exit(1);
}
