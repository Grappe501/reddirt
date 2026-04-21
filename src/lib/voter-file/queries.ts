import {
  VoterFileIngestStatus,
  type CountyVoterMetrics,
  type VoterFileSnapshot,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export type CountyVoterMetricsWithSnapshot = CountyVoterMetrics & {
  snapshot: VoterFileSnapshot;
};

/**
 * Latest completed voter-file rollup for a county (for county command pages, dashboards).
 */
export async function getLatestCountyVoterMetrics(
  countyId: string
): Promise<CountyVoterMetricsWithSnapshot | null> {
  const row = await prisma.countyVoterMetrics.findFirst({
    where: {
      countyId,
      snapshot: { status: VoterFileIngestStatus.COMPLETE },
    },
    orderBy: { asOfDate: "desc" },
    include: { snapshot: true },
  });
  return row;
}

export async function getLatestVoterFileSnapshot() {
  return prisma.voterFileSnapshot.findFirst({
    where: { status: VoterFileIngestStatus.COMPLETE },
    orderBy: { fileAsOfDate: "desc" },
  });
}

export type StatewideVoterRollup = {
  snapshot: VoterFileSnapshot;
  totalRegisteredCount: number;
  newRegistrationsSinceBaseline: number;
  newRegistrationsSincePreviousSnapshot: number;
  droppedSincePreviousSnapshot: number;
  netChangeSincePreviousSnapshot: number;
};

/** Sums the latest complete snapshot’s per-county metrics (all counties). */
export async function getStatewideVoterRollupFromLatestSnapshot(): Promise<StatewideVoterRollup | null> {
  const snap = await getLatestVoterFileSnapshot();
  if (!snap) return null;
  const agg = await prisma.countyVoterMetrics.aggregate({
    where: { voterFileSnapshotId: snap.id },
    _sum: {
      totalRegisteredCount: true,
      newRegistrationsSinceBaseline: true,
      newRegistrationsSincePreviousSnapshot: true,
      droppedSincePreviousSnapshot: true,
      netChangeSincePreviousSnapshot: true,
    },
  });
  return {
    snapshot: snap,
    totalRegisteredCount: agg._sum.totalRegisteredCount ?? 0,
    newRegistrationsSinceBaseline: agg._sum.newRegistrationsSinceBaseline ?? 0,
    newRegistrationsSincePreviousSnapshot: agg._sum.newRegistrationsSincePreviousSnapshot ?? 0,
    droppedSincePreviousSnapshot: agg._sum.droppedSincePreviousSnapshot ?? 0,
    netChangeSincePreviousSnapshot: agg._sum.netChangeSincePreviousSnapshot ?? 0,
  };
}
