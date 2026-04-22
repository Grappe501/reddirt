import {
  CampaignEventStatus,
  CampaignTaskStatus,
  EventApprovalState,
  EventWorkflowState,
  WorkflowRunStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { seedCalendarOpsForEvent } from "@/lib/calendar/queue-helpers";
import { ensureCompletedStageTasks, EVENT_TRIGGER_SOURCE, reapplyEventWorkflowsForEvent } from "@/lib/calendar/event-task-engine";
import { pushCampaignEventToGoogleSafe } from "@/lib/calendar/google-sync-engine";
import {
  createShellsForCanceledEvent,
  createShellsForCompletedEvent,
  createShellsForPublishedEvent,
} from "@/lib/comms/event-campaign-orchestration";

export const EVENT_STAGE_LABEL: Record<EventWorkflowState, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Needs review",
  APPROVED: "Approved",
  PUBLISHED: "Public",
  CANCELED: "Canceled",
  COMPLETED: "Completed",
};

/** Explicit allowed transitions: key → from, value → to */
export const LIFECYCLE_ACTION_TARGETS: Record<
  "submit" | "approve" | "sendBack" | "publish" | "cancel" | "complete",
  { from: EventWorkflowState[]; to: EventWorkflowState }
> = {
  submit: { from: [EventWorkflowState.DRAFT], to: EventWorkflowState.PENDING_APPROVAL },
  approve: { from: [EventWorkflowState.PENDING_APPROVAL], to: EventWorkflowState.APPROVED },
  sendBack: { from: [EventWorkflowState.PENDING_APPROVAL], to: EventWorkflowState.DRAFT },
  publish: { from: [EventWorkflowState.APPROVED], to: EventWorkflowState.PUBLISHED },
  cancel: { from: [EventWorkflowState.APPROVED, EventWorkflowState.PUBLISHED], to: EventWorkflowState.CANCELED },
  complete: { from: [EventWorkflowState.APPROVED, EventWorkflowState.PUBLISHED], to: EventWorkflowState.COMPLETED },
};

function assertTarget(current: EventWorkflowState, key: keyof typeof LIFECYCLE_ACTION_TARGETS) {
  const spec = LIFECYCLE_ACTION_TARGETS[key];
  if (!spec.from.includes(current)) {
    const names = spec.from.map((s) => EVENT_STAGE_LABEL[s]).join(", ");
    throw new Error(`Invalid stage: need ${names}, current is ${EVENT_STAGE_LABEL[current]}.`);
  }
  return spec.to;
}

export type TransitionWrite = {
  logNote: string | null;
  /** When present, attached to EventApproval (submit/approve paths). */
  approvalNote?: string | null;
  actorUserId: string | null;
};

function logData(
  eventId: string,
  from: EventWorkflowState,
  to: EventWorkflowState,
  note: string | null,
  actorUserId: string | null
): Prisma.EventStageChangeLogCreateInput {
  return {
    event: { connect: { id: eventId } },
    fromState: from,
    toState: to,
    note,
    ...(actorUserId ? { actor: { connect: { id: actorUserId } } } : {}),
  };
}

/**
 * DRAFT → needs review. Creates or refreshes a pending `EventApproval` row.
 */
export async function runSubmitForReview(
  eventId: string,
  w: Pick<TransitionWrite, "logNote" | "approvalNote" | "actorUserId">
) {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) throw new Error("Event not found.");
  const to = assertTarget(ev.eventWorkflowState, "submit");
  const now = new Date();
  const nextRound = (await prisma.eventApproval.aggregate({ where: { eventId }, _max: { round: true } }))._max.round ?? 0;
  await prisma.$transaction(async (tx) => {
    await tx.campaignEvent.update({
      where: { id: eventId },
      data: {
        eventWorkflowState: to,
        submittedForReviewAt: now,
      },
    });
    await tx.eventStageChangeLog.create({
      data: logData(eventId, ev.eventWorkflowState, to, w.logNote, w.actorUserId),
    });
    await tx.eventApproval.create({
      data: {
        eventId,
        round: nextRound + 1,
        state: EventApprovalState.PENDING,
        note: w.approvalNote?.trim() || w.logNote?.trim() || null,
        submittedByUserId: w.actorUserId,
      },
    });
  });
  await reapplyEventWorkflowsForEvent(eventId, { actorUserId: w.actorUserId });
  void pushCampaignEventToGoogleSafe(eventId, w.actorUserId);
}

export async function runApprove(eventId: string, w: TransitionWrite) {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) throw new Error("Event not found.");
  const to = assertTarget(ev.eventWorkflowState, "approve");
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const pending = await tx.eventApproval.findFirst({
      where: { eventId, state: EventApprovalState.PENDING },
      orderBy: { createdAt: "desc" },
    });
    await tx.campaignEvent.update({
      where: { id: eventId },
      data: {
        eventWorkflowState: to,
        approvedAt: now,
        approvedByUserId: w.actorUserId,
        status: ev.status === CampaignEventStatus.DRAFT ? CampaignEventStatus.SCHEDULED : ev.status,
      },
    });
    await tx.eventStageChangeLog.create({
      data: logData(eventId, ev.eventWorkflowState, to, w.logNote, w.actorUserId),
    });
    if (pending) {
      await tx.eventApproval.update({
        where: { id: pending.id },
        data: {
          state: EventApprovalState.APPROVED,
          approverUserId: w.actorUserId,
          decidedAt: now,
          note: w.approvalNote?.trim() ?? w.logNote?.trim() ?? pending.note,
        },
      });
    } else {
      await tx.eventApproval.create({
        data: {
          eventId,
          round: 1,
          state: EventApprovalState.APPROVED,
          note: w.approvalNote?.trim() || w.logNote?.trim() || null,
          approverUserId: w.actorUserId,
          decidedAt: now,
        },
      });
    }
  });
  await seedCalendarOpsForEvent(eventId, w.actorUserId);
  await reapplyEventWorkflowsForEvent(eventId, { actorUserId: w.actorUserId });
  void pushCampaignEventToGoogleSafe(eventId, w.actorUserId);
}

export async function runSendBackToDraft(eventId: string, w: TransitionWrite) {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) throw new Error("Event not found.");
  const to = assertTarget(ev.eventWorkflowState, "sendBack");
  await prisma.$transaction(async (tx) => {
    const pending = await tx.eventApproval.findFirst({
      where: { eventId, state: EventApprovalState.PENDING },
      orderBy: { createdAt: "desc" },
    });
    await tx.campaignEvent.update({
      where: { id: eventId },
      data: { eventWorkflowState: to, submittedForReviewAt: null },
    });
    await tx.eventStageChangeLog.create({
      data: logData(eventId, ev.eventWorkflowState, to, w.logNote, w.actorUserId),
    });
    if (pending) {
      await tx.eventApproval.update({
        where: { id: pending.id },
        data: {
          state: EventApprovalState.REJECTED,
          approverUserId: w.actorUserId,
          decidedAt: new Date(),
          note: w.logNote?.trim() ?? w.approvalNote?.trim() ?? pending.note,
        },
      });
    }
  });
  void pushCampaignEventToGoogleSafe(eventId, w.actorUserId);
}

export async function runPublish(eventId: string, w: Pick<TransitionWrite, "logNote" | "actorUserId">) {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) throw new Error("Event not found.");
  const to = assertTarget(ev.eventWorkflowState, "publish");
  await prisma.$transaction(async (tx) => {
    await tx.campaignEvent.update({
      where: { id: eventId },
      data: { eventWorkflowState: to, isPublicOnWebsite: true },
    });
    await tx.eventStageChangeLog.create({
      data: logData(eventId, ev.eventWorkflowState, to, w.logNote, w.actorUserId),
    });
  });
  await seedCalendarOpsForEvent(eventId, w.actorUserId);
  await reapplyEventWorkflowsForEvent(eventId, { actorUserId: w.actorUserId });
  void pushCampaignEventToGoogleSafe(eventId, w.actorUserId);
  void createShellsForPublishedEvent(eventId, w.actorUserId);
}

export async function runCancel(
  eventId: string,
  w: { logNote: string | null; cancellationReason: string; actorUserId: string | null }
) {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) throw new Error("Event not found.");
  const to = assertTarget(ev.eventWorkflowState, "cancel");
  const reason = w.cancellationReason.trim();
  if (!reason) throw new Error("Cancellation reason is required.");
  const combined = [w.logNote?.trim(), reason].filter(Boolean).join(" — ") || reason;
  await prisma.$transaction(async (tx) => {
    await tx.campaignEvent.update({
      where: { id: eventId },
      data: {
        eventWorkflowState: to,
        status: CampaignEventStatus.CANCELLED,
        isPublicOnWebsite: false,
        cancellationReason: reason,
      },
    });
    await tx.eventStageChangeLog.create({
      data: logData(eventId, ev.eventWorkflowState, to, combined, w.actorUserId),
    });
    await tx.campaignTask.updateMany({
      where: {
        eventId,
        status: { in: [CampaignTaskStatus.TODO, CampaignTaskStatus.IN_PROGRESS, CampaignTaskStatus.BLOCKED] },
      },
      data: { status: CampaignTaskStatus.CANCELLED },
    });
    await tx.workflowRun.updateMany({
      where: { triggerSourceType: EVENT_TRIGGER_SOURCE, triggerSourceId: eventId, status: WorkflowRunStatus.RUNNING },
      data: { status: WorkflowRunStatus.CANCELLED, completedAt: new Date() },
    });
  });
  void pushCampaignEventToGoogleSafe(eventId, w.actorUserId);
  void createShellsForCanceledEvent(eventId, w.actorUserId);
}

export async function runComplete(eventId: string, w: Pick<TransitionWrite, "logNote" | "actorUserId">) {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) throw new Error("Event not found.");
  const to = assertTarget(ev.eventWorkflowState, "complete");
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.campaignEvent.update({
      where: { id: eventId },
      data: {
        eventWorkflowState: to,
        status: CampaignEventStatus.COMPLETED,
        completedAt: now,
        isPublicOnWebsite: false,
      },
    });
    await tx.eventStageChangeLog.create({
      data: logData(eventId, ev.eventWorkflowState, to, w.logNote, w.actorUserId),
    });
  });
  await ensureCompletedStageTasks(eventId, { actorUserId: w.actorUserId });
  void pushCampaignEventToGoogleSafe(eventId, w.actorUserId);
  void createShellsForCompletedEvent(eventId, w.actorUserId);
}

/** Back-compat: setEventWorkflowStateAction — only logs when a valid single-hop transition. Prefer governed actions. */
export async function applyLegacyWorkflowSetIfValid(
  eventId: string,
  target: EventWorkflowState,
  actorUserId: string | null
): Promise<{ ok: true } | { ok: false; message: string }> {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) return { ok: false, message: "Event not found." };
  const from = ev.eventWorkflowState;
  if (from === target) return { ok: true };
  if (from === EventWorkflowState.DRAFT && target === EventWorkflowState.PUBLISHED) {
    return { ok: false, message: "Cannot go from Draft to Public. Submit for review first." };
  }
  // Map target to an action
  if (from === EventWorkflowState.DRAFT && target === EventWorkflowState.PENDING_APPROVAL) {
    await runSubmitForReview(eventId, { logNote: null, actorUserId });
    return { ok: true };
  }
  if (from === EventWorkflowState.PENDING_APPROVAL && target === EventWorkflowState.APPROVED) {
    await runApprove(eventId, { logNote: null, actorUserId });
    return { ok: true };
  }
  if (from === EventWorkflowState.PENDING_APPROVAL && target === EventWorkflowState.DRAFT) {
    await runSendBackToDraft(eventId, { logNote: "Returned to draft (legacy).", actorUserId });
    return { ok: true };
  }
  if (from === EventWorkflowState.APPROVED && target === EventWorkflowState.PUBLISHED) {
    await runPublish(eventId, { logNote: null, actorUserId });
    return { ok: true };
  }
  if (
    (from === EventWorkflowState.APPROVED || from === EventWorkflowState.PUBLISHED) &&
    target === EventWorkflowState.CANCELED
  ) {
    return {
      ok: false,
      message: "Use cancel with a reason from the event panel (governed cancel).",
    };
  }
  if (
    (from === EventWorkflowState.APPROVED || from === EventWorkflowState.PUBLISHED) &&
    target === EventWorkflowState.COMPLETED
  ) {
    await runComplete(eventId, { logNote: null, actorUserId });
    return { ok: true };
  }
  return {
    ok: false,
    message: "That transition is not available from the current stage. Use the stage action buttons.",
  };
}
