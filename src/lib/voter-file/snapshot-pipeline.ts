/**
 * Voter file warehouse — `createSnapshotRecord` is used by `runVoterFileImportFromBuffer` (CLI
 * and server paths). `finalizeSnapshotOrFail` is a convenience for scripts that use this module only.
 */
import { VoterFileIngestStatus } from "@prisma/client";
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

export { recomputeAllCountyVoterMetricsForSnapshot } from "./recompute-county-voter-metrics";

export async function finalizeSnapshotOrFail(snapshotId: string, err?: Error) {
  if (err) {
    await markVoterFileSnapshotStatus(snapshotId, VoterFileIngestStatus.FAILED, err.message);
  } else {
    await markVoterFileSnapshotStatus(snapshotId, VoterFileIngestStatus.COMPLETE, null);
  }
}
