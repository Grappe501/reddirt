import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { mapEmailWorkflowItemDetail, mapEmailWorkflowListItem } from "./mappers";
import type { EmailWorkflowItemDetail, EmailWorkflowListItem } from "./dto";
import type { EmailWorkflowListFilters } from "./types";
import { EMAIL_WORKFLOW_NEEDS_ATTENTION_STATUSES } from "./governance";

const userSelect = { id: true, name: true, email: true } as const;

const listInclude = {
  assignedToUser: { select: userSelect },
  createdBy: { select: userSelect },
  plan: { select: { id: true, title: true } },
  thread: { select: { id: true, primaryEmail: true, primaryPhone: true } },
} satisfies Prisma.EmailWorkflowItemInclude;

const detailInclude = {
  ...listInclude,
  reviewedBy: { select: userSelect },
  user: { select: userSelect },
  send: { select: { id: true, status: true, channel: true } },
  workflowIntake: { select: { id: true, title: true, status: true } },
  campaignTask: { select: { id: true, title: true, status: true } },
  conversationOpportunity: { select: { id: true, title: true, status: true } },
  socialContentItem: { select: { id: true, title: true } },
  comsPlanAudienceSegment: { select: { id: true, name: true } },
  communicationMessage: { select: { id: true, createdAt: true, direction: true } },
} satisfies Prisma.EmailWorkflowItemInclude;

function buildWhere(f: EmailWorkflowListFilters = {}): Prisma.EmailWorkflowItemWhereInput {
  const w: Prisma.EmailWorkflowItemWhereInput = {};
  if (f.status) {
    w.status = Array.isArray(f.status) ? { in: f.status } : f.status;
  }
  if (f.priority) w.priority = f.priority;
  if (f.sourceType) w.sourceType = f.sourceType;
  if (f.assignedToUserId !== undefined) {
    w.assignedToUserId = f.assignedToUserId === null ? null : f.assignedToUserId;
  }
  if (f.assignedState === "assigned") {
    w.assignedToUserId = { not: null };
  }
  if (f.assignedState === "unassigned") {
    w.assignedToUserId = null;
  }
  if (f.escalationLevel) w.escalationLevel = f.escalationLevel;
  if (f.spamDisposition) w.spamDisposition = f.spamDisposition;
  return w;
}

/**
 * Paged list for operator queue views (E-1: read; no business automation).
 */
export async function listEmailWorkflowItems(
  opts: { take?: number; skip?: number; filters?: EmailWorkflowListFilters } = {}
): Promise<EmailWorkflowListItem[]> {
  const take = Math.min(opts.take ?? 100, 500);
  const skip = opts.skip ?? 0;
  const rows = await prisma.emailWorkflowItem.findMany({
    where: buildWhere(opts.filters),
    take,
    skip,
    orderBy: { createdAt: "desc" },
    include: listInclude,
  });
  return rows.map((r) => mapEmailWorkflowListItem(r as Parameters<typeof mapEmailWorkflowListItem>[0]));
}

/**
 * One queue item with linked record summaries (no message body text in E-1 DTO by default).
 */
export async function getEmailWorkflowItemDetail(id: string): Promise<EmailWorkflowItemDetail | null> {
  const r = await prisma.emailWorkflowItem.findUnique({
    where: { id },
    include: detailInclude,
  });
  if (!r) return null;
  return mapEmailWorkflowItemDetail(r as Parameters<typeof mapEmailWorkflowItemDetail>[0]);
}

export type EmailWorkflowQueueSummary = {
  total: number;
  newCount: number;
  enrichedCount: number;
  inReviewCount: number;
  readyCount: number;
  approvedCount: number;
  escalatedCount: number;
  unassignedCount: number;
  needsAttentionCount: number;
};

export async function getEmailWorkflowQueueSummary(
  filters?: EmailWorkflowListFilters
): Promise<EmailWorkflowQueueSummary> {
  const where = buildWhere(filters);
  const [
    total,
    newCount,
    enrichedCount,
    inReviewCount,
    readyCount,
    approvedCount,
    escalatedCount,
    unassignedCount,
    needsAttentionCount,
  ] = await Promise.all([
    prisma.emailWorkflowItem.count({ where }),
    prisma.emailWorkflowItem.count({ where: { ...where, status: "NEW" } }),
    prisma.emailWorkflowItem.count({ where: { ...where, status: "ENRICHED" } }),
    prisma.emailWorkflowItem.count({ where: { ...where, status: "IN_REVIEW" } }),
    prisma.emailWorkflowItem.count({ where: { ...where, status: "READY_TO_RESPOND" } }),
    prisma.emailWorkflowItem.count({ where: { ...where, status: "APPROVED" } }),
    prisma.emailWorkflowItem.count({ where: { ...where, status: "ESCALATED" } }),
    prisma.emailWorkflowItem.count({ where: { ...where, assignedToUserId: null } }),
    prisma.emailWorkflowItem.count({
      where: {
        ...where,
        status: { in: EMAIL_WORKFLOW_NEEDS_ATTENTION_STATUSES },
      },
    }),
  ]);

  return {
    total,
    newCount,
    enrichedCount,
    inReviewCount,
    readyCount,
    approvedCount,
    escalatedCount,
    unassignedCount,
    needsAttentionCount,
  };
}

/**
 * Duplicate guard for manual Gmail metadata → `EmailWorkflowItem` (EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4).
 * Matches `metadataJson.gmailReviewSource.gmailMessageId` when present (Postgres JSON path).
 */
export async function findEmailWorkflowItemIdByGmailReviewMessageId(
  gmailMessageId: string
): Promise<string | null> {
  const id = gmailMessageId.trim();
  if (!id) return null;
  const row = await prisma.emailWorkflowItem.findFirst({
    where: {
      metadataJson: {
        path: ["gmailReviewSource", "gmailMessageId"],
        equals: id,
      },
    },
    select: { id: true },
  });
  return row?.id ?? null;
}

/** Count of queue rows with persisted `metadataJson.emailAiAnalysis` (JSON key present). */
export async function countEmailWorkflowItemsWithEmailAiAnalysis(): Promise<number> {
  try {
    const rows = await prisma.$queryRaw<[{ c: bigint }]>`
      SELECT COUNT(*)::bigint AS c
      FROM "EmailWorkflowItem"
      WHERE ("metadataJson"->'emailAiAnalysis') IS NOT NULL
    `;
    const n = rows[0]?.c ?? BigInt(0);
    return Number(n);
  } catch {
    return 0;
  }
}
