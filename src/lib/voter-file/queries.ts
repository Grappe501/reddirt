import { VoterFileIngestStatus, type CountyVoterMetrics, type VoterFileSnapshot } from "@prisma/client";
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
