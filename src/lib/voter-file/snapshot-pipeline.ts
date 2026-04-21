/**
 * Voter file warehouse — **orchestration skeleton** for SOS imports. Replace throws with
 * streaming parsers, batch upserts, and background workers in production.
 *
 * ## Ingest flow (intended)
 * 1. `createSnapshot` — `VoterFileSnapshot` (RECEIVED) + `fileReceivedAt`, `fileAsOfDate`, `sourceFileHash`, `previousSnapshotId` = last COMPLETE
 * 2. `ingestRawRows` — stream file, normalize columns; optional staging table
 * 3. `diffAgainstPrevious` — set of keys in prev vs new
 * 4. `writeVoterSnapshotChanges` — one `VoterSnapshotChange` per NEW / UPDATED / REMOVED / REACTIVATED
 * 5. `upsertVoterRecords` — update `VoterRecord` + `countySlug` from `County` lookup
 * 6. `recomputeCountyVoterMetrics` — for each county: totals, new since `getCampaignRegistrationBaselineUtc()`, deltas vs previous snapshot, goals, `progressPercent`
 * 7. `finalizeSnapshot` — status COMPLETE; optional mirror into `CountyCampaignStats`
 * 8. `runCampaignAssist` — *never* in this path for truth; no OpenAI in counting
 *
 * ## What’s deferred
 * - File parsers for actual SOS layout
 * - Batched Prisma $transaction for millions of rows
 * - S3 / blob storage of raw files
 * - `VoterRecord` backfill for historical snapshots
 */
import { VoterFileIngestStatus, VoterSnapshotChangeType, type Prisma } from "@prisma/client";
import { getCampaignRegistrationBaselineUtc } from "@/config/campaign-registration-baseline";
import { prisma } from "@/lib/db";
import { markVoterFileSnapshotStatus } from "./ingest-voter-snapshot";

export type SnapshotIngestContext = {
  snapshotId: string;
  previousSnapshotId: string | null;
  baseline: Date;
};

export function getBaselineForPipeline(): Date {
  return getCampaignRegistrationBaselineUtc();
}

export async function createSnapshotRecord(input: {
  fileAsOfDate: Date;
  sourceFilename: string;
  sourceFileHash: string;
  fileReceivedAt?: Date;
  previousSnapshotId?: string | null;
}): Promise<string> {
  const row = await prisma.voterFileSnapshot.create({
    data: {
      fileAsOfDate: input.fileAsOfDate,
      sourceFilename: input.sourceFilename,
      sourceFileHash: input.sourceFileHash,
      fileReceivedAt: input.fileReceivedAt ?? null,
      previousSnapshotId: input.previousSnapshotId ?? null,
      status: VoterFileIngestStatus.RECEIVED,
    },
  });
  return row.id;
}

/**
 * Recompute a single county’s `CountyVoterMetrics` for a completed diff — call after
 * `VoterSnapshotChange` rows exist or from aggregate SQL.
 */
export async function recomputeCountyMetricsStub(_args: {
  countyId: string;
  countySlug: string;
  voterFileSnapshotId: string;
}): Promise<never> {
  throw new Error("recomputeCountyMetricsStub — implement with aggregates + County.registration goal.");
}

export async function recordChangeStub(_row: {
  snapshotId: string;
  changeType: VoterSnapshotChangeType;
  voterFileKey: string;
  countyId: string;
  countySlug: string;
  summaryJson?: Prisma.InputJsonValue;
}): Promise<never> {
  throw new Error("recordChangeStub — implement batch insert of VoterSnapshotChange.");
}

export async function finalizeSnapshotOrFail(snapshotId: string, err?: Error) {
  if (err) {
    await markVoterFileSnapshotStatus(snapshotId, VoterFileIngestStatus.FAILED, err.message);
  } else {
    await markVoterFileSnapshotStatus(snapshotId, VoterFileIngestStatus.COMPLETE, null);
  }
}
