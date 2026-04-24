/**
 * GOTV-1: contact-plan preview (counts-only buckets).
 * GOTV-2: contact-plan review — partitioned buckets + explainable rows (read-only).
 * No send, no assignment mutation, no queue persistence, no scores.
 */

import { prisma } from "@/lib/db";

import {
  buildGotvVoterScopeWhere,
  getGotvSummary,
  getGotvExplainablePriorityReasons,
  GOTV_RECENT_INTERACTION_DAYS,
  type GotvScopeParams,
  type GotvSummary,
  type GotvPriorityReasonCode,
} from "./gotv-read-model";

export const GOTV_CONTACT_PLAN_PREVIEW_PACKET = "GOTV-1-preview" as const;
export const GOTV_CONTACT_PLAN_REVIEW_PACKET = "GOTV-2" as const;

export type GotvContactPlanParams = GotvScopeParams;

export type GotvContactPlanBucket = {
  key: "relational_first" | "needs_touch" | "recently_contacted" | "missing_data";
  label: string;
  description: string;
  count: number;
};

export type GotvContactPlanPreview = {
  scopeSummary: GotvSummary;
  suggestedContactBuckets: GotvContactPlanBucket[];
  notes: string[];
};

export type GotvReviewBucketKey =
  | "relational_first"
  | "needs_first_touch"
  | "needs_follow_up"
  | "recently_contacted"
  | "missing_data";

export type GotvContactPlanReviewRow = {
  voterRecordId: string;
  voterFileKey: string;
  voterName: string;
  countyId: string;
  countySlug: string;
  precinct: string | null;
  city: string | null;
  relationalContactCount: number;
  interactionCount: number;
  lastInteractionAt: Date | null;
  priorityReason: GotvPriorityReasonCode[];
};

export type GotvContactPlanReviewBucket = {
  key: GotvReviewBucketKey;
  label: string;
  description: string;
  count: number;
  rows: GotvContactPlanReviewRow[];
};

export type GotvContactPlanReviewParams = GotvScopeParams & {
  /** Max voters to load before partitioning into buckets (capped). */
  limit?: number;
  /** Max rows per bucket in the returned tables (after partition). */
  maxRowsPerBucket?: number;
};

export type GotvContactPlanReview = {
  packet: typeof GOTV_CONTACT_PLAN_REVIEW_PACKET;
  scope: GotvScopeParams;
  summary: GotvSummary;
  buckets: GotvContactPlanReviewBucket[];
  notes: string[];
};

function recentCutoffFromSummary(summary: GotvSummary): Date {
  const d = new Date();
  d.setDate(d.getDate() - summary.recentInteractionDays);
  d.setHours(0, 0, 0, 0);
  return d;
}

function voterReviewRow(
  v: {
    id: string;
    voterFileKey: string;
    firstName: string | null;
    lastName: string | null;
    countyId: string;
    countySlug: string;
    precinct: string | null;
    city: string | null;
    phone10: string | null;
    _count: { relationalContacts: number; voterInteractions: number };
    voterInteractions: { interactionDate: Date }[];
  },
  hasGeographyFilter: boolean,
  recentCutoff: Date
): GotvContactPlanReviewRow {
  const relationalContactCount = v._count.relationalContacts;
  const interactionCount = v._count.voterInteractions;
  const lastInteractionAt = v.voterInteractions[0]?.interactionDate ?? null;
  const name = [v.firstName, v.lastName].filter(Boolean).join(" ").trim() || "—";
  return {
    voterRecordId: v.id,
    voterFileKey: v.voterFileKey,
    voterName: name,
    countyId: v.countyId,
    countySlug: v.countySlug,
    precinct: v.precinct,
    city: v.city,
    relationalContactCount,
    interactionCount,
    lastInteractionAt,
    priorityReason: getGotvExplainablePriorityReasons(
      {
        relationalContactCount,
        interactionCount,
        lastInteractionAt,
        hasGeographyFilter,
      },
      recentCutoff
    ),
  };
}

function assignReviewBucket(
  row: GotvContactPlanReviewRow,
  recentCutoff: Date,
  hasNamePhone: boolean
): GotvReviewBucketKey {
  const recent = row.lastInteractionAt != null && row.lastInteractionAt >= recentCutoff;
  if (row.interactionCount === 0 && !hasNamePhone) {
    return "missing_data";
  }
  if (recent) {
    return "recently_contacted";
  }
  if (row.relationalContactCount > 0) {
    return "relational_first";
  }
  if (row.interactionCount === 0) {
    return "needs_first_touch";
  }
  return "needs_follow_up";
}

function sortReviewRows(a: GotvContactPlanReviewRow, b: GotvContactPlanReviewRow, recentCutoff: Date): number {
  const aRecent = a.lastInteractionAt != null && a.lastInteractionAt >= recentCutoff;
  const bRecent = b.lastInteractionAt != null && b.lastInteractionAt >= recentCutoff;
  if (aRecent !== bRecent) return aRecent ? 1 : -1;
  if (a.relationalContactCount !== b.relationalContactCount) {
    return b.relationalContactCount - a.relationalContactCount;
  }
  const at = a.lastInteractionAt?.getTime() ?? 0;
  const bt = b.lastInteractionAt?.getTime() ?? 0;
  if (at !== bt) return at - bt;
  return a.voterFileKey.localeCompare(b.voterFileKey);
}

/**
 * Non-exclusive bucket counts for planning discussion (totals can overlap by design).
 * All numbers are explainable from `VoterRecord` + `VoterInteraction` + `RelationalContact` fields.
 */
export async function buildGotvContactPlanPreview(
  params: GotvContactPlanParams
): Promise<GotvContactPlanPreview> {
  const { where } = buildGotvVoterScopeWhere(params);
  const scopeSummary = await getGotvSummary(params);

  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - scopeSummary.recentInteractionDays);
  recentCutoff.setHours(0, 0, 0, 0);

  const [relationalFirst, needsTouch, recentlyContacted, missingData] = await Promise.all([
    prisma.voterRecord.count({
      where: { AND: [where, { relationalContacts: { some: {} } }] },
    }),
    prisma.voterRecord.count({
      where: {
        AND: [
          where,
          {
            NOT: {
              voterInteractions: { some: { interactionDate: { gte: recentCutoff } } },
            },
          },
        ],
      },
    }),
    prisma.voterRecord.count({
      where: {
        AND: [
          where,
          { voterInteractions: { some: { interactionDate: { gte: recentCutoff } } } },
        ],
      },
    }),
    prisma.voterRecord.count({
      where: {
        AND: [
          where,
          { voterInteractions: { none: {} } },
          {
            OR: [{ firstName: null }, { lastName: null }, { phone10: null }],
          },
        ],
      },
    }),
  ]);

  return {
    scopeSummary,
    suggestedContactBuckets: [
      {
        key: "relational_first",
        label: "Relational-first",
        description:
          "Voters with at least one linked relational contact row (organizer network path — not a vote claim).",
        count: relationalFirst,
      },
      {
        key: "needs_touch",
        label: "Needs touch",
        description: "No staff/volunteer interaction logged in the recent window (rolling; see summary).",
        count: needsTouch,
      },
      {
        key: "recently_contacted",
        label: "Recently contacted",
        description: "At least one interaction in the recent window.",
        count: recentlyContacted,
      },
      {
        key: "missing_data",
        label: "Missing data",
        description:
          "No interactions logged and incomplete voter file name/phone on the row (operational data gap, not a score).",
        count: missingData,
      },
    ],
    notes: [
      "Preview only: no queue creation, no assignments, no outbound sends in GOTV-1.",
      "Buckets are overlapping categories for discussion; not a partition of the universe.",
    ],
  };
}

/**
 * GOTV-2: mutually exclusive review buckets + capped row samples per bucket.
 * Counts reflect the full filtered universe; tables are a bounded sample after partition.
 */
export async function buildGotvContactPlanReview(
  params: GotvContactPlanReviewParams
): Promise<GotvContactPlanReview> {
  const { where, hasGeographyFilter } = buildGotvVoterScopeWhere(params);
  const summary = await getGotvSummary(params);
  const recentCutoff = recentCutoffFromSummary(summary);
  const fetchCap = Math.min(Math.max(params.limit ?? 400, 50), 2000);
  const maxRowsPerBucket = Math.min(Math.max(params.maxRowsPerBucket ?? 60, 10), 200);

  const [cRelationalFirst, cNeedsFirstTouch, cNeedsFollowUp, cRecent, cMissing] = await Promise.all([
    prisma.voterRecord.count({
      where: {
        AND: [
          where,
          { relationalContacts: { some: {} } },
          {
            NOT: {
              voterInteractions: { some: { interactionDate: { gte: recentCutoff } } },
            },
          },
          {
            NOT: {
              AND: [
                { voterInteractions: { none: {} } },
                { OR: [{ firstName: null }, { lastName: null }, { phone10: null }] },
              ],
            },
          },
        ],
      },
    }),
    prisma.voterRecord.count({
      where: {
        AND: [
          where,
          { relationalContacts: { none: {} } },
          { voterInteractions: { none: {} } },
          { firstName: { not: null } },
          { lastName: { not: null } },
          { phone10: { not: null } },
        ],
      },
    }),
    prisma.voterRecord.count({
      where: {
        AND: [
          where,
          { relationalContacts: { none: {} } },
          { voterInteractions: { some: {} } },
          {
            NOT: {
              voterInteractions: { some: { interactionDate: { gte: recentCutoff } } },
            },
          },
        ],
      },
    }),
    prisma.voterRecord.count({
      where: {
        AND: [where, { voterInteractions: { some: { interactionDate: { gte: recentCutoff } } } }],
      },
    }),
    prisma.voterRecord.count({
      where: {
        AND: [
          where,
          { voterInteractions: { none: {} } },
          { OR: [{ firstName: null }, { lastName: null }, { phone10: null }] },
        ],
      },
    }),
  ]);

  const voters = await prisma.voterRecord.findMany({
    where,
    orderBy: [{ countySlug: "asc" }, { voterFileKey: "asc" }],
    take: fetchCap,
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
    },
  });

  const grouped: Record<GotvReviewBucketKey, GotvContactPlanReviewRow[]> = {
    relational_first: [],
    needs_first_touch: [],
    needs_follow_up: [],
    recently_contacted: [],
    missing_data: [],
  };

  for (const v of voters) {
    const hasNamePhone = Boolean(v.firstName && v.lastName && v.phone10);
    const row = voterReviewRow(v, hasGeographyFilter, recentCutoff);
    const bucket = assignReviewBucket(row, recentCutoff, hasNamePhone);
    grouped[bucket].push(row);
  }

  const bucketOrder: GotvReviewBucketKey[] = [
    "missing_data",
    "recently_contacted",
    "relational_first",
    "needs_first_touch",
    "needs_follow_up",
  ];
  for (const k of bucketOrder) {
    grouped[k].sort((a, b) => sortReviewRows(a, b, recentCutoff));
    grouped[k] = grouped[k].slice(0, maxRowsPerBucket);
  }

  const buckets: GotvContactPlanReviewBucket[] = [
    {
      key: "relational_first",
      label: "Relational first (not recent)",
      description:
        "Linked relational contact, no interaction in the recent window, and not in the missing-data gap bucket.",
      count: cRelationalFirst,
      rows: grouped.relational_first,
    },
    {
      key: "needs_first_touch",
      label: "Needs first touch",
      description: "No relational link and no logged interactions; voter file row has name + phone.",
      count: cNeedsFirstTouch,
      rows: grouped.needs_first_touch,
    },
    {
      key: "needs_follow_up",
      label: "Needs follow-up",
      description: "Cold path (no relational link), prior interactions exist, none in the recent window.",
      count: cNeedsFollowUp,
      rows: grouped.needs_follow_up,
    },
    {
      key: "recently_contacted",
      label: "Recently contacted",
      description: "At least one interaction in the rolling recent window.",
      count: cRecent,
      rows: grouped.recently_contacted,
    },
    {
      key: "missing_data",
      label: "Missing data",
      description: "No interactions yet and incomplete name or phone on the voter file row (operational gap).",
      count: cMissing,
      rows: grouped.missing_data,
    },
  ];

  return {
    packet: GOTV_CONTACT_PLAN_REVIEW_PACKET,
    scope: {
      countyId: params.countyId,
      precinct: params.precinct,
      fieldUnitId: params.fieldUnitId,
    },
    summary,
    buckets,
    notes: [
      "Review-only: no messages sent, no volunteer assignment, no support scores or hidden ranking.",
      `Universe counts are full-scope; tables show up to ${maxRowsPerBucket} rows per bucket from the first ${fetchCap} voters loaded (sorted by county + voter key).`,
      `Recent window: ${GOTV_RECENT_INTERACTION_DAYS} days (rolling).`,
    ],
  };
}
