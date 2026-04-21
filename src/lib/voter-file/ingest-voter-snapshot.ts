/**
 * Voter file import — status helper + re-exports. **Run imports** via
 * `runVoterFileImportFromFile()` in `./run-voter-file-import` (CLI: `npm run voter-file:import`).
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
