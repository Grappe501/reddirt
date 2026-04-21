/**
 * Voter file import — **stub** for the full pipeline. Intended flow (implement in a worker/CLI):
 *
 * 1. `VoterFileSnapshot` row: RECEIVED → PROCESSING, set `fileAsOfDate`, `previousSnapshotId` (last COMPLETE)
 * 2. Stream SOS rows; upsert `VoterRecord` by `voterFileKey`; update `lastSeenSnapshotId`, `registrationDate`
 * 3. Voters in county not in new file: set `inLatestCompletedFile=false`, `droppedAtSnapshotId`
 * 4. For each county: aggregate `CountyVoterMetrics` (new since baseline, new/dropped vs previous snapshot, net, goal, %)
 * 5. Optional: denormalize `CountyCampaignStats` from latest metrics for older readers
 * 6. `snapshot.status` → COMPLETE or FAILED
 *
 * **OpenAI** has no role in computing these numbers.
 */

import { VoterFileIngestStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function markVoterFileSnapshotStatus(
  snapshotId: string,
  status: VoterFileIngestStatus,
  errorMessage?: string | null
) {
  return prisma.voterFileSnapshot.update({
    where: { id: snapshotId },
    data: { status, errorMessage: errorMessage ?? null },
  });
}

/**
 * Placeholder: wire your file parser + diff here.
 */
export async function runVoterFileIngestForSnapshotId(_snapshotId: string): Promise<never> {
  throw new Error(
    "Voter file ingest is not implemented in this build — schema and rollups are ready. Use a background job to stream SOS rows and populate CountyVoterMetrics."
  );
}
