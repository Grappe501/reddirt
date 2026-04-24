/**
 * ASSIGN-1 + UWR-1 + ASSIGN-2: Unified incoming work (read-only; no master table).
 * Server-only: imports Prisma. Do not use from client components.
 * @see docs/unified-open-work-foundation.md
 * @see docs/unified-incoming-work-read-model.md
 * @see docs/position-inbox-foundation.md
 * @see docs/seat-aware-assignment-foundation.md
 */

import {
  CampaignTaskPriority,
  CampaignTaskStatus,
  CommunicationThreadStatus,
  EmailWorkflowEscalationLevel,
  EmailWorkflowPriority,
  EmailWorkflowStatus,
  FestivalIngestReviewStatus,
  WorkflowIntakeStatus,
} from "@prisma/client";
import { prisma } from "../db";
import { OpenWorkSourceModel, type OpenWorkItemRef, type SeatInboxWorkAlignment } from "./assignment";
import { getInboxForPosition } from "./position-inbox";
import type { PositionId } from "./positions";
import { getSeatForPosition } from "./seating";

export { UWR1_PACKET } from "./assignment";
export type { OpenWorkItemRef } from "./assignment";

/** UWR-2: widen read model (festival ingest + actionable threads); still read-only, no schema. */
export const UWR2_PACKET = "UWR-2" as const;

/**
 * v1: fields required for CM / “for me” lists. Extends the ASSIGN-1 ref with
 * non-optional `href` + `workbenchRouteHint` for this packet’s consumers.
 */
export type UnifiedOpenWorkItem = OpenWorkItemRef & {
  href: string;
  workbenchRouteHint: string;
  summaryLine: string;
  /** Prefer machine time (email `occurredAt`) else `createdAt` (ISO) */
  occurredOrCreatedAt: string;
  /** UWR-1 internal: higher = earlier in list (risk × priority) */
  _uwr1SortKey: number;
};

export type UnifiedOpenWorkQueryOptions = {
  /** Max rows per source table (default 50) */
  limitPerSource?: number;
  /** Cap after merge (default 200) */
  maxTotal?: number;
};

const DEFAULT_LIMIT = 50;
const DEFAULT_MAX = 200;

const OPEN_EMAIL: EmailWorkflowStatus[] = [
  EmailWorkflowStatus.NEW,
  EmailWorkflowStatus.ENRICHED,
  EmailWorkflowStatus.IN_REVIEW,
  EmailWorkflowStatus.READY_TO_RESPOND,
  EmailWorkflowStatus.APPROVED,
  EmailWorkflowStatus.ESCALATED,
];

const OPEN_INTAKE: WorkflowIntakeStatus[] = [
  WorkflowIntakeStatus.PENDING,
  WorkflowIntakeStatus.IN_REVIEW,
  WorkflowIntakeStatus.AWAITING_INFO,
  WorkflowIntakeStatus.READY_FOR_CALENDAR,
];

const OPEN_TASK: CampaignTaskStatus[] = [
  CampaignTaskStatus.TODO,
  CampaignTaskStatus.IN_PROGRESS,
  CampaignTaskStatus.BLOCKED,
];

/** UWR-2: only statuses that clearly mean “staff must act” on the thread (not ACTIVE / CLOSED, etc.). */
const ACTIONABLE_THREAD_STATUSES: CommunicationThreadStatus[] = [
  CommunicationThreadStatus.NEEDS_REPLY,
  CommunicationThreadStatus.FOLLOW_UP,
];

const WB_EMAIL = "/admin/workbench/email-queue";
const WB_INTAKE = "/admin/workbench/comms/plans/new";
const WB_TASKS = "/admin/tasks";
const WB_FESTIVALS = "/admin/workbench/festivals";

function keyOf(r: OpenWorkItemRef): string {
  return `${r.source}:${r.id}`;
}

function emailHref(id: string): string {
  return `/admin/workbench/email-queue/${id}`;
}

function intakeHref(id: string): string {
  return `/admin/workbench/comms/plans/new?intakeId=${encodeURIComponent(id)}`;
}

function taskHref(id: string): string {
  return `/admin/workbench/comms/plans/new?taskId=${encodeURIComponent(id)}`;
}

function threadHref(id: string): string {
  return `/admin/workbench?thread=${encodeURIComponent(id)}`;
}

/** Pending festival ingests share one queue URL until a per-row detail route exists. */
function pendingFestivalQueueHref(): string {
  return `${WB_FESTIVALS}?filter=pending`;
}

function emailTitle(r: { title: string | null; queueReason: string | null; whatSummary: string | null }): string {
  return (r.title?.trim() || r.queueReason?.trim() || r.whatSummary?.trim() || "Email workflow item") ?? "Email workflow item";
}

function escalationLabel(
  status: EmailWorkflowStatus,
  level: EmailWorkflowEscalationLevel,
): string | null {
  if (status === EmailWorkflowStatus.ESCALATED) return "ESCALATED";
  if (level === EmailWorkflowEscalationLevel.NONE) return null;
  return `Escalation: ${level}`;
}

function emailPriorityScore(p: EmailWorkflowPriority): number {
  if (p === EmailWorkflowPriority.URGENT) return 4;
  if (p === EmailWorkflowPriority.HIGH) return 3;
  if (p === EmailWorkflowPriority.NORMAL) return 2;
  return 1;
}

function taskPriorityScore(p: CampaignTaskPriority): number {
  if (p === CampaignTaskPriority.URGENT) return 4;
  if (p === CampaignTaskPriority.HIGH) return 3;
  if (p === CampaignTaskPriority.MEDIUM) return 2;
  return 1;
}

function levelScore(level: EmailWorkflowEscalationLevel, status: EmailWorkflowStatus): number {
  if (status === EmailWorkflowStatus.ESCALATED) return 5;
  if (level === EmailWorkflowEscalationLevel.CRITICAL) return 4;
  if (level === EmailWorkflowEscalationLevel.HIGH) return 3;
  if (level === EmailWorkflowEscalationLevel.MEDIUM) return 2;
  if (level === EmailWorkflowEscalationLevel.LOW) return 1;
  return 0;
}

/** Higher = more urgent for sort (UWR-1: risk → priority → recency) */
function _uwr1SortKey(t: { occurred: Date; esc?: number; pri?: number }): number {
  const time = t.occurred.getTime();
  const risk = t.esc ?? 0;
  const pr = t.pri ?? 2;
  return risk * 1_000_000_000 + pr * 10_000_000 - time;
}

function toUnifiedFromEmail(r: {
  id: string;
  title: string | null;
  queueReason: string | null;
  whatSummary: string | null;
  status: EmailWorkflowStatus;
  priority: EmailWorkflowPriority;
  assignedToUserId: string | null;
  createdAt: Date;
  occurredAt: Date | null;
  countyId: string | null;
  escalationLevel: EmailWorkflowEscalationLevel;
}): UnifiedOpenWorkItem {
  const occurred = r.occurredAt ?? r.createdAt;
  const sl = emailTitle(r);
  const el = escalationLabel(r.status, r.escalationLevel);
  const es = levelScore(r.escalationLevel, r.status);
  const ps = emailPriorityScore(r.priority);
  return {
    source: OpenWorkSourceModel.EmailWorkflowItem,
    id: r.id,
    statusLabel: r.status,
    title: r.title,
    createdAt: r.createdAt.toISOString(),
    assignedUserId: r.assignedToUserId,
    positionId: null,
    priorityLabel: r.priority,
    countyId: r.countyId,
    href: emailHref(r.id),
    workbenchRouteHint: WB_EMAIL,
    rawStatus: r.status,
    escalationLabel: el,
    summaryLine: sl,
    occurredAt: r.occurredAt?.toISOString() ?? null,
    occurredOrCreatedAt: occurred.toISOString(),
    _uwr1SortKey: _uwr1SortKey({ occurred, esc: es, pri: ps }),
  };
}

function toUnifiedFromIntake(
  r: { id: string; title: string | null; status: WorkflowIntakeStatus; assignedUserId: string | null; createdAt: Date; countyId: string | null; source: string | null },
): UnifiedOpenWorkItem {
  const sl = (r.title?.trim() || r.source || "Workflow intake") ?? "Workflow intake";
  return {
    source: OpenWorkSourceModel.WorkflowIntake,
    id: r.id,
    statusLabel: r.status,
    title: r.title,
    createdAt: r.createdAt.toISOString(),
    assignedUserId: r.assignedUserId,
    positionId: null,
    countyId: r.countyId,
    href: intakeHref(r.id),
    workbenchRouteHint: WB_INTAKE,
    rawStatus: r.status,
    escalationLabel: null,
    summaryLine: sl,
    occurredAt: null,
    occurredOrCreatedAt: r.createdAt.toISOString(),
    _uwr1SortKey: _uwr1SortKey({ occurred: r.createdAt, esc: 0, pri: 2 }),
  };
}

function toUnifiedFromFestivalIngest(r: {
  id: string;
  name: string;
  startAt: Date;
  countyId: string | null;
  reviewStatus: FestivalIngestReviewStatus;
  createdAt: Date;
}): UnifiedOpenWorkItem {
  const occurred = r.startAt;
  return {
    source: OpenWorkSourceModel.ArkansasFestivalIngest,
    id: r.id,
    statusLabel: r.reviewStatus,
    title: r.name,
    createdAt: r.createdAt.toISOString(),
    assignedUserId: null,
    positionId: null,
    countyId: r.countyId,
    href: pendingFestivalQueueHref(),
    workbenchRouteHint: WB_FESTIVALS,
    rawStatus: r.reviewStatus,
    escalationLabel: null,
    summaryLine: `Community event ingest · ${r.name}`,
    occurredAt: r.startAt.toISOString(),
    occurredOrCreatedAt: occurred.toISOString(),
    _uwr1SortKey: _uwr1SortKey({ occurred, esc: 0, pri: 3 }),
  };
}

function toUnifiedFromThread(r: {
  id: string;
  threadStatus: CommunicationThreadStatus;
  primaryEmail: string | null;
  primaryPhone: string | null;
  assignedUserId: string | null;
  createdAt: Date;
  lastMessageAt: Date | null;
  countyId: string | null;
  unreadCount: number;
  priorityScore: number;
}): UnifiedOpenWorkItem {
  const occurred = r.lastMessageAt ?? r.createdAt;
  const label =
    (r.primaryPhone?.trim() || r.primaryEmail?.trim() || "Communication thread") ?? "Communication thread";
  const unreadEsc = r.unreadCount > 0 ? 2 : 0;
  const priBoost = Math.min(3, 1 + Math.floor(Math.min(r.priorityScore, 99) / 33));
  return {
    source: OpenWorkSourceModel.CommunicationThread,
    id: r.id,
    statusLabel: r.threadStatus,
    title: label,
    createdAt: r.createdAt.toISOString(),
    assignedUserId: r.assignedUserId,
    positionId: null,
    countyId: r.countyId,
    href: threadHref(r.id),
    workbenchRouteHint: "/admin/workbench",
    rawStatus: r.threadStatus,
    escalationLabel: r.unreadCount > 0 ? `${r.unreadCount} unread` : null,
    summaryLine: `${label} · ${r.threadStatus}`,
    occurredAt: r.lastMessageAt?.toISOString() ?? null,
    occurredOrCreatedAt: occurred.toISOString(),
    _uwr1SortKey: _uwr1SortKey({ occurred, esc: unreadEsc, pri: priBoost }),
  };
}

function toUnifiedFromTask(
  r: {
    id: string;
    title: string;
    status: CampaignTaskStatus;
    priority: CampaignTaskPriority;
    assignedUserId: string | null;
    createdAt: Date;
    dueAt: Date | null;
    countyId: string | null;
  },
): UnifiedOpenWorkItem {
  const now = new Date();
  const occurred = r.dueAt ?? r.createdAt;
  const overdue = r.dueAt != null && r.dueAt < now;
  const ps = taskPriorityScore(r.priority);
  const esc = overdue && r.status !== CampaignTaskStatus.DONE ? 1 : 0;
  return {
    source: OpenWorkSourceModel.CampaignTask,
    id: r.id,
    statusLabel: r.status,
    title: r.title,
    createdAt: r.createdAt.toISOString(),
    assignedUserId: r.assignedUserId,
    positionId: null,
    priorityLabel: r.priority,
    countyId: r.countyId,
    href: taskHref(r.id),
    workbenchRouteHint: WB_TASKS,
    rawStatus: r.status,
    escalationLabel: r.priority === CampaignTaskPriority.URGENT ? "Urgent task" : null,
    summaryLine: r.title,
    occurredAt: r.dueAt?.toISOString() ?? null,
    occurredOrCreatedAt: occurred.toISOString(),
    _uwr1SortKey: _uwr1SortKey({ occurred, esc, pri: ps }),
  };
}

function sortUnified(items: UnifiedOpenWorkItem[]): UnifiedOpenWorkItem[] {
  return [...items].sort((a, b) => b._uwr1SortKey - a._uwr1SortKey);
}

function dedupeMaxSort(items: UnifiedOpenWorkItem[]): UnifiedOpenWorkItem[] {
  const m = new Map<string, UnifiedOpenWorkItem>();
  for (const it of items) {
    const k = keyOf(it);
    const ex = m.get(k);
    if (!ex || it._uwr1SortKey > ex._uwr1SortKey) m.set(k, it);
  }
  return sortUnified([...m.values()]);
}

function cap(items: UnifiedOpenWorkItem[], max: number): UnifiedOpenWorkItem[] {
  return items.slice(0, max);
}

const emailSelect = {
  id: true,
  title: true,
  queueReason: true,
  whatSummary: true,
  status: true,
  priority: true,
  assignedToUserId: true,
  createdAt: true,
  occurredAt: true,
  countyId: true,
  escalationLevel: true,
} as const;

const intakeSelect = {
  id: true,
  title: true,
  status: true,
  assignedUserId: true,
  createdAt: true,
  countyId: true,
  source: true,
} as const;

const taskSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  assignedUserId: true,
  createdAt: true,
  dueAt: true,
  countyId: true,
} as const;

const threadSelect = {
  id: true,
  threadStatus: true,
  primaryEmail: true,
  primaryPhone: true,
  assignedUserId: true,
  createdAt: true,
  lastMessageAt: true,
  countyId: true,
  unreadCount: true,
  priorityScore: true,
} as const;

const festivalOpenSelect = {
  id: true,
  name: true,
  startAt: true,
  countyId: true,
  reviewStatus: true,
  createdAt: true,
} as const;

async function listPendingFestivalOpenWorkItems(limit: number): Promise<UnifiedOpenWorkItem[]> {
  const rows = await prisma.arkansasFestivalIngest.findMany({
    where: { reviewStatus: FestivalIngestReviewStatus.PENDING_REVIEW },
    orderBy: { startAt: "asc" },
    take: limit,
    select: festivalOpenSelect,
  });
  return rows.map((r) => toUnifiedFromFestivalIngest(r));
}

export async function getOpenWorkForUser(
  userId: string,
  options?: UnifiedOpenWorkQueryOptions,
): Promise<UnifiedOpenWorkItem[]> {
  const lim = options?.limitPerSource ?? DEFAULT_LIMIT;
  const max = options?.maxTotal ?? DEFAULT_MAX;
  const [emails, intakes, tasks, threads] = await Promise.all([
    prisma.emailWorkflowItem.findMany({
      where: { assignedToUserId: userId, status: { in: OPEN_EMAIL } },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      take: lim,
      select: emailSelect,
    }),
    prisma.workflowIntake.findMany({
      where: { assignedUserId: userId, status: { in: OPEN_INTAKE } },
      orderBy: { createdAt: "desc" },
      take: lim,
      select: intakeSelect,
    }),
    prisma.campaignTask.findMany({
      where: { assignedUserId: userId, status: { in: OPEN_TASK } },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: lim,
      select: taskSelect,
    }),
    prisma.communicationThread.findMany({
      where: {
        assignedUserId: userId,
        threadStatus: { in: ACTIONABLE_THREAD_STATUSES },
      },
      orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
      take: lim,
      select: threadSelect,
    }),
  ]);
  const merged: UnifiedOpenWorkItem[] = [
    ...emails.map((r) => toUnifiedFromEmail(r)),
    ...intakes.map((r) => toUnifiedFromIntake(r)),
    ...tasks.map((r) => toUnifiedFromTask(r)),
    ...threads.map((r) => toUnifiedFromThread(r)),
  ];
  return cap(sortUnified(merged), max);
}

export async function getUnassignedOpenWork(options?: UnifiedOpenWorkQueryOptions): Promise<UnifiedOpenWorkItem[]> {
  const lim = options?.limitPerSource ?? DEFAULT_LIMIT;
  const max = options?.maxTotal ?? DEFAULT_MAX;
  const [emails, intakes, tasks, threads] = await Promise.all([
    prisma.emailWorkflowItem.findMany({
      where: { assignedToUserId: null, status: { in: OPEN_EMAIL } },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      take: lim,
      select: emailSelect,
    }),
    prisma.workflowIntake.findMany({
      where: { assignedUserId: null, status: { in: OPEN_INTAKE } },
      orderBy: { createdAt: "desc" },
      take: lim,
      select: intakeSelect,
    }),
    prisma.campaignTask.findMany({
      where: { assignedUserId: null, status: { in: OPEN_TASK } },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: lim,
      select: taskSelect,
    }),
    prisma.communicationThread.findMany({
      where: {
        assignedUserId: null,
        threadStatus: { in: ACTIONABLE_THREAD_STATUSES },
      },
      orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
      take: lim,
      select: threadSelect,
    }),
  ]);
  const merged: UnifiedOpenWorkItem[] = [
    ...emails.map((r) => toUnifiedFromEmail(r)),
    ...intakes.map((r) => toUnifiedFromIntake(r)),
    ...tasks.map((r) => toUnifiedFromTask(r)),
    ...threads.map((r) => toUnifiedFromThread(r)),
  ];
  return cap(sortUnified(merged), max);
}

/**
 * Email rows that are *risk-flagged* or status-escalated, still in an open triage state.
 * May overlap with unassigned; caller should dedupe.
 */
export async function getEscalatedOpenWork(options?: UnifiedOpenWorkQueryOptions): Promise<UnifiedOpenWorkItem[]> {
  const lim = options?.limitPerSource ?? DEFAULT_LIMIT;
  const max = options?.maxTotal ?? DEFAULT_MAX;
  const items = await prisma.emailWorkflowItem.findMany({
    where: {
      status: { in: OPEN_EMAIL },
      OR: [
        { status: EmailWorkflowStatus.ESCALATED },
        { escalationLevel: { not: EmailWorkflowEscalationLevel.NONE } },
      ],
    },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    take: lim,
    select: emailSelect,
  });
  return cap(items.map((r) => toUnifiedFromEmail(r)), max);
}

/**
 * Unassigned + escalated (email) merged and deduped. Intended “CM triage” slice — not *all* open work
 * in the system (use `getOpenWorkForUser` with each assignee, or per-source list pages, for that).
 */
export async function getOpenWorkForCampaignManager(
  options?: UnifiedOpenWorkQueryOptions,
): Promise<UnifiedOpenWorkItem[]> {
  const lim = options?.limitPerSource ?? DEFAULT_LIMIT;
  const [un, esc, festivals] = await Promise.all([
    getUnassignedOpenWork(options),
    getEscalatedOpenWork(options),
    listPendingFestivalOpenWorkItems(lim),
  ]);
  return cap(dedupeMaxSort([...un, ...esc, ...festivals]), options?.maxTotal ?? DEFAULT_MAX);
}

/**
 * Position-scoped inbox (WB-CORE-1) — same implementation as `getInboxForPosition` in `position-inbox.ts`.
 */
export const getOpenWorkForPosition = getInboxForPosition;

// --- ASSIGN-2: seat-shaped read seams (no mutation; occupant = `PositionSeat` user only) ---

/**
 * “Open work for this **seat**” in the UWR-1 sense: same as the **structural** position inbox
 * (`getInboxForPosition`). Does **not** filter rows by seat occupant — domain rows are user-assigned.
 */
export async function getOpenWorkForSeat(
  positionId: PositionId,
  options?: UnifiedOpenWorkQueryOptions,
): Promise<UnifiedOpenWorkItem[]> {
  return getInboxForPosition(positionId, options);
}

/**
 * All open work **assigned to the user** in `PositionSeat` for this `positionId`, if any; else `[]`.
 * This is the global “**for occupant**” list (per-user merge), not the position heuristics slice.
 */
export async function getOpenWorkForSeatOccupant(
  positionId: PositionId,
  options?: UnifiedOpenWorkQueryOptions,
): Promise<UnifiedOpenWorkItem[]> {
  const seat = await getSeatForPosition(positionId);
  const uid = seat.displayUser?.id;
  if (!uid) {
    return [];
  }
  return getOpenWorkForUser(uid, options);
}

/**
 * Compares **structural** position-inbox rows (heuristic slice) to **current seat occupant** assignee fields
 * for mismatch signal only — **no** auto-fix, **not** a permission.
 */
export async function getSeatInboxWorkAlignment(
  positionId: PositionId,
  options?: UnifiedOpenWorkQueryOptions,
): Promise<SeatInboxWorkAlignment> {
  const [inbox, seat] = await Promise.all([
    getInboxForPosition(positionId, options),
    getSeatForPosition(positionId),
  ]);
  const occupantId = seat.displayUser?.id ?? null;
  let sliceAssignedToOccupant = 0;
  let sliceAssignedToOtherUser = 0;
  let sliceUnassigned = 0;
  for (const it of inbox) {
    if (it.assignedUserId == null) {
      sliceUnassigned += 1;
    } else if (occupantId != null && it.assignedUserId === occupantId) {
      sliceAssignedToOccupant += 1;
    } else {
      sliceAssignedToOtherUser += 1;
    }
  }
  let allAssignedInSliceMatchOccupant: boolean | null = null;
  if (occupantId) {
    const withAssignee = inbox.filter((i) => i.assignedUserId != null);
    if (withAssignee.length > 0) {
      allAssignedInSliceMatchOccupant = withAssignee.every((i) => i.assignedUserId === occupantId);
    }
  }
  const occupantOpenWorkGlobalCount = occupantId
    ? (await getOpenWorkForUser(occupantId, options)).length
    : 0;
  return {
    positionId,
    occupantUserId: occupantId,
    positionInboxTotal: inbox.length,
    sliceAssignedToOccupant,
    sliceAssignedToOtherUser,
    sliceUnassigned,
    allAssignedInSliceMatchOccupant,
    occupantOpenWorkGlobalCount,
  };
}

export { getSeatAssignmentContext } from "./seating";
export type { SeatAssignmentContext, SeatInboxWorkAlignment } from "./assignment";

// --- Counts (ASSIGN-1 + UWR-2): repo-grounded per-source totals for health / snapshot. ---

export type OpenWorkCountBySource = {
  emailWorkflowItem: number;
  workflowIntake: number;
  campaignTask: number;
  communicationThread: number;
  /** UWR-2: `FestivalIngestReviewStatus.PENDING_REVIEW` only. */
  arkansasFestivalIngest: number;
};

/**
 * Read-only snapshot for dashboards / health; threads use NEEDS_REPLY + FOLLOW_UP only (UWR-2).
 */
export async function getOpenWorkCountsBySource(): Promise<OpenWorkCountBySource> {
  const [emailWorkflowItem, workflowIntake, campaignTask, communicationThread, arkansasFestivalIngest] =
    await Promise.all([
      prisma.emailWorkflowItem.count({ where: { status: { in: OPEN_EMAIL } } }),
      prisma.workflowIntake.count({ where: { status: { in: OPEN_INTAKE } } }),
      prisma.campaignTask.count({ where: { status: { in: OPEN_TASK } } }),
      prisma.communicationThread.count({
        where: { threadStatus: { in: ACTIONABLE_THREAD_STATUSES } },
      }),
      prisma.arkansasFestivalIngest.count({
        where: { reviewStatus: FestivalIngestReviewStatus.PENDING_REVIEW },
      }),
    ]);
  return {
    emailWorkflowItem,
    workflowIntake,
    campaignTask,
    communicationThread,
    arkansasFestivalIngest,
  };
}
