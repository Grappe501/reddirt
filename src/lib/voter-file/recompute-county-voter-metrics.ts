import { VoterSnapshotChangeType } from "@prisma/client";
import { getCampaignRegistrationBaselineUtc } from "@/config/campaign-registration-baseline";
import { prisma } from "@/lib/db";

/**
 * Recompute and upsert `CountyVoterMetrics` for every `County` row for
 * `voterFileSnapshotId` (import may still be in PROCESSING; mark COMPLETE after this).
 * Also mirrors primary registration fields into `CountyCampaignStats`.
 */
export async function recomputeAllCountyVoterMetricsForSnapshot(voterFileSnapshotId: string): Promise<void> {
  const snap = await prisma.voterFileSnapshot.findFirst({ where: { id: voterFileSnapshotId } });
  if (!snap) {
    throw new Error(`recompute: snapshot ${voterFileSnapshotId} not found`);
  }
  const isFirstInChain = !snap.previousSnapshotId;

  const baseline = getCampaignRegistrationBaselineUtc();
  const counties = await prisma.county.findMany({
    include: { campaignStats: { select: { registrationGoal: true } } },
  });
  const now = new Date();

  for (const c of counties) {
    const g = c.campaignStats?.registrationGoal ?? null;
    const [total, newSinceBaseline, newInRaw, droppedRaw] = await Promise.all([
      prisma.voterRecord.count({
        where: { countyId: c.id, lastSeenSnapshotId: voterFileSnapshotId, inLatestCompletedFile: true },
      }),
      prisma.voterRecord.count({
        where: {
          countyId: c.id,
          lastSeenSnapshotId: voterFileSnapshotId,
          inLatestCompletedFile: true,
          registrationDate: { gte: baseline },
        },
      }),
      prisma.voterSnapshotChange.count({
        where: {
          countyId: c.id,
          voterFileSnapshotId,
          changeType: { in: [VoterSnapshotChangeType.NEW, VoterSnapshotChangeType.REACTIVATED] },
        },
      }),
      prisma.voterSnapshotChange.count({
        where: { countyId: c.id, voterFileSnapshotId, changeType: VoterSnapshotChangeType.REMOVED },
      }),
    ]);

    // First completed snapshot: no “previous” file to compare; keep audit rows but surface 0/0/0 in rollups.
    const newIn = isFirstInChain ? 0 : newInRaw;
    const dropped = isFirstInChain ? 0 : droppedRaw;
    const net = newIn - dropped;
    const progressPercent = g && g > 0 ? Math.min(100, (newSinceBaseline / g) * 100) : null;

    await prisma.countyVoterMetrics.upsert({
      where: { countyId_voterFileSnapshotId: { countyId: c.id, voterFileSnapshotId } },
      create: {
        countyId: c.id,
        countySlug: c.slug,
        voterFileSnapshotId,
        asOfDate: snap.fileAsOfDate,
        registrationBaselineDate: baseline,
        totalRegisteredCount: total,
        newRegistrationsSinceBaseline: newSinceBaseline,
        newRegistrationsSincePreviousSnapshot: newIn,
        droppedSincePreviousSnapshot: dropped,
        netChangeSincePreviousSnapshot: net,
        countyGoal: g,
        progressPercent,
        computedAt: now,
      },
      update: {
        asOfDate: snap.fileAsOfDate,
        registrationBaselineDate: baseline,
        totalRegisteredCount: total,
        newRegistrationsSinceBaseline: newSinceBaseline,
        newRegistrationsSincePreviousSnapshot: newIn,
        droppedSincePreviousSnapshot: dropped,
        netChangeSincePreviousSnapshot: net,
        countyGoal: g,
        progressPercent,
        computedAt: now,
      },
    });

    await prisma.countyCampaignStats.upsert({
      where: { countyId: c.id },
      create: {
        countyId: c.id,
        newRegistrationsSinceBaseline: newSinceBaseline,
        registrationBaselineDate: baseline,
        dataPipelineSource: "sos_voter_file",
        pipelineLastSyncAt: now,
        pipelineError: null,
      },
      update: {
        newRegistrationsSinceBaseline: newSinceBaseline,
        registrationBaselineDate: baseline,
        dataPipelineSource: "sos_voter_file",
        pipelineLastSyncAt: now,
        pipelineError: null,
      },
    });
  }
}
