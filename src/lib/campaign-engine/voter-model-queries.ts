/**
 * VOTER-MODEL-1 read helpers: signals, current classification, narrow profile bundle.
 */

import type { VoterSignalKind } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function listVoterSignals(voterRecordId: string) {
  return prisma.voterSignal.findMany({
    where: { voterRecordId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCurrentVoterClassification(voterRecordId: string) {
  return prisma.voterModelClassification.findFirst({
    where: { voterRecordId, isCurrent: true },
    orderBy: { generatedAt: "desc" },
  });
}

export type VoterModelProfile = {
  voter: {
    id: string;
    voterFileKey: string;
    countySlug: string;
    firstName: string | null;
    lastName: string | null;
    precinct: string | null;
    inLatestCompletedFile: boolean;
  };
  currentClassification: Awaited<ReturnType<typeof getCurrentVoterClassification>>;
  signalCountByKind: Partial<Record<VoterSignalKind, number>>;
  latestInteractionDate: Date | null;
  latestVotePlan: {
    id: string;
    planStatus: string;
    updatedAt: Date;
  } | null;
};

export async function getVoterModelProfile(voterRecordId: string): Promise<VoterModelProfile | null> {
  const voter = await prisma.voterRecord.findUnique({
    where: { id: voterRecordId },
    select: {
      id: true,
      voterFileKey: true,
      countySlug: true,
      firstName: true,
      lastName: true,
      precinct: true,
      inLatestCompletedFile: true,
    },
  });
  if (!voter) return null;

  const [signals, currentClassification, lastInteraction, latestPlan] = await Promise.all([
    prisma.voterSignal.findMany({
      where: { voterRecordId },
      select: { signalKind: true },
    }),
    getCurrentVoterClassification(voterRecordId),
    prisma.voterInteraction.findFirst({
      where: { voterRecordId },
      orderBy: { interactionDate: "desc" },
      select: { interactionDate: true },
    }),
    prisma.voterVotePlan.findFirst({
      where: { voterRecordId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, planStatus: true, updatedAt: true },
    }),
  ]);

  const signalCountByKind: Partial<Record<VoterSignalKind, number>> = {};
  for (const s of signals) {
    signalCountByKind[s.signalKind] = (signalCountByKind[s.signalKind] ?? 0) + 1;
  }

  return {
    voter,
    currentClassification,
    signalCountByKind,
    latestInteractionDate: lastInteraction?.interactionDate ?? null,
    latestVotePlan: latestPlan,
  };
}
