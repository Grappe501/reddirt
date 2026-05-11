import "server-only";

import { prisma } from "@/lib/db";

export type PowerOfFiveRollup = {
  contactsTracked: number;
  touchesCompleted: number;
  registrationsCompleted: number;
  volunteersReferred: number;
};

/** Pull Reach-style relational stats from `RelationalContact` + interactions (best-effort; zeros when empty). */
export async function rollupPowerOfFiveForUserIds(userIds: string[]): Promise<PowerOfFiveRollup> {
  if (userIds.length === 0) {
    return {
      contactsTracked: 0,
      touchesCompleted: 0,
      registrationsCompleted: 0,
      volunteersReferred: 0,
    };
  }

  const contactsTracked = await prisma.relationalContact.count({
    where: { ownerUserId: { in: userIds }, isCoreFive: true },
  });

  const touchesCompleted = await prisma.relationalContact.count({
    where: { ownerUserId: { in: userIds }, lastContactedAt: { not: null } },
  });

  const registrationsCompleted = await prisma.voterInteraction.count({
    where: {
      relatedVolunteerUserId: { in: userIds },
      registrationChecked: true,
    },
  });

  const commitments = await prisma.commitment.findMany({
    where: { type: "volunteer", userId: { in: userIds } },
    select: { metadata: true },
  });
  const volunteersReferred = commitments.filter((c) => {
    const m = c.metadata;
    return (
      m !== null &&
      typeof m === "object" &&
      !Array.isArray(m) &&
      (m as Record<string, unknown>).referredFromVolunteerOpsTeam === true
    );
  }).length;

  return {
    contactsTracked,
    touchesCompleted,
    registrationsCompleted,
    volunteersReferred,
  };
}
