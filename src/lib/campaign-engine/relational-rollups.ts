/**
 * REL-3: read-only rollups for volunteer relational home (user-scoped).
 */

import { RelationalMatchStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export type UserRelationalSummary = {
  totalContacts: number;
  coreFiveCount: number;
  matchedCount: number;
  last7DayTouches: number;
};

export async function getUserRelationalSummary(userId: string): Promise<UserRelationalSummary> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  since.setHours(0, 0, 0, 0);

  const [totalContacts, coreFiveCount, matchedCount, last7DayTouches] = await Promise.all([
    prisma.relationalContact.count({ where: { ownerUserId: userId } }),
    prisma.relationalContact.count({ where: { ownerUserId: userId, isCoreFive: true } }),
    prisma.relationalContact.count({
      where: { ownerUserId: userId, matchStatus: RelationalMatchStatus.MATCHED },
    }),
    prisma.voterInteraction.count({
      where: {
        relationalContact: { ownerUserId: userId },
        interactionDate: { gte: since },
      },
    }),
  ]);

  return {
    totalContacts,
    coreFiveCount,
    matchedCount,
    last7DayTouches,
  };
}
