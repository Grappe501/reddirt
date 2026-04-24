/**
 * GOTV-1: contact-plan preview seam (GOTV-2 will add queues + assignment review).
 * No send, no assignment mutation, no queue creation.
 */

import { prisma } from "@/lib/db";

import {
  buildGotvVoterScopeWhere,
  getGotvSummary,
  type GotvScopeParams,
  type GotvSummary,
} from "./gotv-read-model";

export const GOTV_CONTACT_PLAN_PREVIEW_PACKET = "GOTV-1-preview" as const;

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
            OR: [
              { firstName: null },
              { lastName: null },
              { phone10: null },
            ],
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
