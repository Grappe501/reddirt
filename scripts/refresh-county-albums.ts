/**
 * Refresh county album index + materialize public/media/county-albums/{county}/{event}/
 * From RedDirt: node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/refresh-county-albums.ts
 */
import { refreshCountyAlbumIndex } from "../src/lib/campaign-media/refresh-county-albums";

const result = refreshCountyAlbumIndex({ materializeFolders: true });
console.log(
  `County albums: ${result.countyCount} counties, ${result.photoCount} photos, ${result.foldersWritten} files materialized.`,
);
