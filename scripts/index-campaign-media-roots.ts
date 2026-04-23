/**
 * One-off: index approved local folders into `OwnedMediaAsset` (sourceType LOCAL_INDEXED).
 *
 * Usage (server env with DATABASE_URL + CAMPAIGN_MEDIA_INDEX_ROOTS):
 *   npx tsx scripts/index-campaign-media-roots.ts
 *   npx tsx scripts/index-campaign-media-roots.ts --dry-run
 *
 * @see `src/lib/owned-media/index-local-roots.ts`
 */

import { indexLocalMediaRootsFromEnv } from "../src/lib/owned-media/index-local-roots";

const dry = process.argv.includes("--dry-run");

void (async () => {
  const r = await indexLocalMediaRootsFromEnv({ rootLabel: "cli", dryRun: dry });
  console.log(
    JSON.stringify(
      {
        created: r.created,
        skipped: r.skipped,
        duplicateCount: r.duplicateCount,
        skippedOtherCount: r.skippedOtherCount,
        importBatchId: r.importBatchId,
        errors: r.errors,
        samplePaths: r.indexedPaths.slice(0, 10),
      },
      null,
      2
    )
  );
  if (r.errors.length) process.exitCode = 1;
})();
