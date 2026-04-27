import { EventWorkflowState, type EventReadinessStatus } from "@prisma/client";

export type CommsSurfaceInput = {
  eventWorkflowState: EventWorkflowState;
  commsReadiness: EventReadinessStatus;
  startAt: Date;
  endAt: Date;
  lastReminderSentAt: Date | null;
  nextReminderDueAt: Date | null;
  lastAttendeeNoticeAt: Date | null;
  lastCancellationNoticeAt: Date | null;
  thankYouQueuedAt: Date | null;
  reminderPlanStatus: EventReadinessStatus;
  followupCommsStatus: EventReadinessStatus;
};

/**
 * Small labels for week grid and dense lists (Calendar HQ).
 */
export function buildEventCommsChips(
  e: CommsSurfaceInput
): { key: string; className: string; short: string }[] {
  const out: { key: string; className: string; short: string }[] = [];
  const now = Date.now();

  if (e.nextReminderDueAt && +e.nextReminderDueAt <= now + 48 * 3600 * 1000) {
    out.push({ key: "rmd", className: "bg-amber-200/80 text-amber-950", short: "RMD" });
  }
  if (e.commsReadiness === "AT_RISK" || e.reminderPlanStatus === "AT_RISK") {
    out.push({ key: "behind", className: "bg-rose-200/80 text-rose-950", short: "COM" });
  }
  if (e.eventWorkflowState === "CANCELED" && !e.lastCancellationNoticeAt) {
    out.push({ key: "canc", className: "bg-red-800/25 text-red-950", short: "CAN" });
  }
  if (e.endAt.getTime() < now && e.eventWorkflowState === "PUBLISHED" && e.thankYouQueuedAt == null) {
    out.push({ key: "thx", className: "bg-kelly-muted/20 text-kelly-slate", short: "THX" });
  }
  return out;
}
