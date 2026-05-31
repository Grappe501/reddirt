#!/usr/bin/env tsx
/** Ingest Kim Hammer opposition archive from existing local datasets. */
import { ingestAllKimHammerArchiveSources } from "../src/lib/opposition/oppositionArchiveIngest";
import { loadOppositionArchiveRollup } from "../src/lib/opposition/oppositionBriefConfidence";

const result = ingestAllKimHammerArchiveSources();
const rollup = loadOppositionArchiveRollup();

console.log("Kim Hammer opposition archive ingest complete:");
console.log(JSON.stringify(result, null, 2));
console.log("\nArchive rollup:");
console.log(
  JSON.stringify(
    {
      sourceCount: rollup.sourceCount,
      archiveItemCount: rollup.archiveItemCount,
      directClipCount: rollup.directClipCount,
      authoredWritingCount: rollup.authoredWritingCount,
      retrievalTasksTotal: rollup.retrievalTasksTotal,
      retrievalTasksComplete: rollup.retrievalTasksComplete,
      oppositionBriefConfidenceEstimate: rollup.oppositionBriefConfidenceEstimate,
    },
    null,
    2,
  ),
);
