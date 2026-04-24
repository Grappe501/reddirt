/**
 * GOTV-1: operational turnout priority read model from stored data only.
 * No support prediction, no persuasion scores, no automated outreach.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const GOTV1_PACKET = "GOTV-1" as const;

/** Days used for “recent interaction” (rolling window from `Date.now` at query time). */
export const GOTV_RECENT_INTERACTION_DAYS = 30;

export const GotvPriorityReason = {
  HAS_RELATIONAL_CONNECTION: "has_relational_connection",
  RECENT_INTERACTION: "recent_interaction",
  NO_RECENT_IN_TARGET_GEOGRAPHY: "no_recent_interaction_in_target_geography",
  MISSING_CONTACT_HISTORY: "missing_contact_history",
} as const;

export type GotvPriorityReasonCode = (typeof GotvPriorityReason)[keyof typeof GotvPriorityReason];

export type GotvScopeParams = {
  countyId?: string;
  precinct?: string;
  fieldUnitId?: string;
};

export type GotvPriorityUniverseParams = GotvScopeParams & {
  limit?: number;
  offset?: number;
};

export type GotvPriorityRow = {
  voterRecordId: string;
  voterFileKey: string;
  firstName: string | null;
  lastName: string | null;
  countyId: string;
  countySlug: string;
  precinct: string | null;
  city: string | null;
  relationalContactCount: number;
  lastInteractionAt: Date | null;
  interactionCount: number;
  hasRelationalConnection: boolean;
  priorityReason: GotvPriorityReasonCode[];
  /** Prisma `RelationalContact.id` when a single representative link exists (first by createdAt). */
  sampleRelationalContactId: string | null;
};

export type GotvSummaryParams = GotvScopeParams;

export type GotvSummary = {
  totalVotersInScope: number;
  votersWithRelationalConnection: number;
  votersWithRecentInteraction: number;
  votersWithoutRecentInteraction: number;
  totalInteractions: number;
  lastInteractionAt: Date | null;
  recentInteractionDays: number;
};

function getRecentCutoff(): Date {
  const d = new Date();
  d.setDate(d.getDate() - GOTV_RECENT_INTERACTION_DAYS);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function buildGotvVoterScopeWhere(
  params: GotvScopeParams
): { where: Prisma.VoterRecordWhereInput; hasGeographyFilter: boolean } {
  const and: Prisma.VoterRecordWhereInput[] = [{ inLatestCompletedFile: true }];

  if (params.countyId?.trim()) {
    and.push({ countyId: params.countyId.trim() });
  }
  if (params.precinct?.trim()) {
    and.push({ precinct: { equals: params.precinct.trim(), mode: "insensitive" } });
  }
  if (params.fieldUnitId?.trim()) {
    and.push({
      relationalContacts: { some: { fieldUnitId: params.fieldUnitId.trim() } },
    });
  }

  const hasGeographyFilter = Boolean(
    params.countyId?.trim() || params.precinct?.trim() || params.fieldUnitId?.trim()
  );

  return { where: { AND: and }, hasGeographyFilter };
}

/** Explainable codes only — exported for GOTV-2 review rows (no scoring). */
export function getGotvExplainablePriorityReasons(
  input: {
    relationalContactCount: number;
    interactionCount: number;
    lastInteractionAt: Date | null;
    hasGeographyFilter: boolean;
  },
  recentCutoff: Date
): GotvPriorityReasonCode[] {
  const reasons: GotvPriorityReasonCode[] = [];
  const hasRel = input.relationalContactCount > 0;
  const hasIx = input.interactionCount > 0;
  const isRecent =
    input.lastInteractionAt != null && input.lastInteractionAt >= recentCutoff;

  if (hasRel) {
    reasons.push(GotvPriorityReason.HAS_RELATIONAL_CONNECTION);
  }
  if (isRecent) {
    reasons.push(GotvPriorityReason.RECENT_INTERACTION);
  }
  if (input.hasGeographyFilter && !isRecent) {
    reasons.push(GotvPriorityReason.NO_RECENT_IN_TARGET_GEOGRAPHY);
  }
  if (!hasIx) {
    reasons.push(GotvPriorityReason.MISSING_CONTACT_HISTORY);
  }

  return reasons;
}

function sortPriorityRows(rows: GotvPriorityRow[], recentCutoff: Date): void {
  rows.sort((a, b) => {
    const aRecent = a.lastInteractionAt != null && a.lastInteractionAt >= recentCutoff;
    const bRecent = b.lastInteractionAt != null && b.lastInteractionAt >= recentCutoff;
    // Needs touch first: not recent before recent.
    if (aRecent !== bRecent) {
      return aRecent ? 1 : -1;
    }
    // Then relational before non-relational when both same recency.
    if (a.hasRelationalConnection !== b.hasRelationalConnection) {
      return a.hasRelationalConnection ? -1 : 1;
    }
    const at = a.lastInteractionAt?.getTime() ?? 0;
    const bt = b.lastInteractionAt?.getTime() ?? 0;
    if (at !== bt) {
      return at - bt;
    }
    return a.voterFileKey.localeCompare(b.voterFileKey);
  });
}

/**
 * Voters in scope with simple, explainable turnout-priority context (from relational + interaction logs + geography filters).
 */
export async function getGotvPriorityUniverse(
  params: GotvPriorityUniverseParams
): Promise<GotvPriorityRow[]> {
  const { where, hasGeographyFilter } = buildGotvVoterScopeWhere(params);
  const recentCutoff = getRecentCutoff();
  const limit = Math.min(Math.max(params.limit ?? 200, 1), 2000);
  const offset = Math.max(params.offset ?? 0, 0);

  const voters = await prisma.voterRecord.findMany({
    where,
    orderBy: [{ countySlug: "asc" }, { voterFileKey: "asc" }],
    take: limit,
    skip: offset,
    include: {
      _count: {
        select: {
          relationalContacts: true,
          voterInteractions: true,
        },
      },
      voterInteractions: {
        orderBy: { interactionDate: "desc" },
        take: 1,
        select: { interactionDate: true },
      },
      relationalContacts: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  const rows: GotvPriorityRow[] = voters.map((v) => {
    const relationalContactCount = v._count.relationalContacts;
    const interactionCount = v._count.voterInteractions;
    const lastInteractionAt = v.voterInteractions[0]?.interactionDate ?? null;
    const hasRelationalConnection = relationalContactCount > 0;
    const sampleRelationalContactId = v.relationalContacts[0]?.id ?? null;

    return {
      voterRecordId: v.id,
      voterFileKey: v.voterFileKey,
      firstName: v.firstName,
      lastName: v.lastName,
      countyId: v.countyId,
      countySlug: v.countySlug,
      precinct: v.precinct,
      city: v.city,
      relationalContactCount,
      lastInteractionAt,
      interactionCount,
      hasRelationalConnection,
      priorityReason: getGotvExplainablePriorityReasons(
        {
          relationalContactCount,
          interactionCount,
          lastInteractionAt,
          hasGeographyFilter,
        },
        recentCutoff
      ),
      sampleRelationalContactId,
    };
  });

  sortPriorityRows(rows, recentCutoff);
  return rows;
}

/**
 * Summary counts for the same scope as `getGotvPriorityUniverse` (no pagination).
 */
export async function getGotvSummary(params: GotvSummaryParams): Promise<GotvSummary> {
  const { where } = buildGotvVoterScopeWhere(params);
  const recentCutoff = getRecentCutoff();

  const withRecent: Prisma.VoterRecordWhereInput = {
    AND: [where, { voterInteractions: { some: { interactionDate: { gte: recentCutoff } } } }],
  };
  const withoutRecent: Prisma.VoterRecordWhereInput = {
    AND: [
      where,
      {
        NOT: {
          voterInteractions: { some: { interactionDate: { gte: recentCutoff } } },
        },
      },
    ],
  };
  const withRel: Prisma.VoterRecordWhereInput = {
    AND: [where, { relationalContacts: { some: {} } }],
  };

  const [totalVotersInScope, votersWithRelationalConnection, votersWithRecentInteraction, votersWithoutRecentInteraction, totalInteractions, lastIx] =
    await Promise.all([
      prisma.voterRecord.count({ where }),
      prisma.voterRecord.count({ where: withRel }),
      prisma.voterRecord.count({ where: withRecent }),
      prisma.voterRecord.count({ where: withoutRecent }),
      prisma.voterInteraction.count({ where: { voterRecord: where } }),
      prisma.voterInteraction.findFirst({
        where: { voterRecord: where },
        orderBy: { interactionDate: "desc" },
        select: { interactionDate: true },
      }),
    ]);

  return {
    totalVotersInScope,
    votersWithRelationalConnection,
    votersWithRecentInteraction,
    votersWithoutRecentInteraction,
    totalInteractions,
    lastInteractionAt: lastIx?.interactionDate ?? null,
    recentInteractionDays: GOTV_RECENT_INTERACTION_DAYS,
  };
}
