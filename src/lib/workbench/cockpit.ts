import "server-only";

import { getEmailLaunchRoomSnapshot } from "@/lib/email-command-center/launch-room";
import { getCalendarOperatorReadiness } from "@/lib/calendar/calendar-operator-readiness";
import { getEmailWorkflowQueueSummary } from "@/lib/email-workflow/queries";
import { getCachedCalendarRequestPipelineCounts } from "@/lib/workbench/operator-readiness-cache";

export type CockpitCommandAction = {
  rank: number;
  label: string;
  href: string;
  why: string;
};

export type CockpitSnapshot = {
  email: Awaited<ReturnType<typeof getEmailLaunchRoomSnapshot>>;
  calendar: Awaited<ReturnType<typeof getCalendarOperatorReadiness>>;
  calendarPipeline: Awaited<ReturnType<typeof getCachedCalendarRequestPipelineCounts>>;
  /** Full ECC read-model is not loaded on Cockpit — use Email Command Center / Readiness for canonical queue aggregates. */
  eccLoaded: boolean;
  queueNeedsAttention: number;
  commsNewThreadsApprox: number;
  commandStack: CockpitCommandAction[];
};

function buildCommandStack(input: {
  email: Awaited<ReturnType<typeof getEmailLaunchRoomSnapshot>>;
  cal: Awaited<ReturnType<typeof getCalendarOperatorReadiness>>;
  pipe: Awaited<ReturnType<typeof getCachedCalendarRequestPipelineCounts>>;
  queueAttention: number;
  emailAwaitingExecutions: number;
}): CockpitCommandAction[] {
  const out: CockpitCommandAction[] = [];
  const seenHref = new Set<string>();
  let rank = 1;
  const push = (label: string, href: string, why: string) => {
    if (out.length >= 5 || seenHref.has(href)) return;
    seenHref.add(href);
    out.push({ rank: rank++, label, href, why });
  };

  if (input.pipe.newCount > 0) {
    push(
      "Review calendar event requests",
      "/admin/workbench/calendar/requests",
      `${input.pipe.newCount} new event-like intake(s) pending (bounded scan).`,
    );
  }
  if (input.email.audienceActiveCount === 0 && input.email.audienceDraftCount > 0) {
    push("Activate a draft audience", "/admin/workbench/email-command-center/audiences", "Send path needs at least one ACTIVE audience.");
  }
  if (input.email.audienceActiveCount > 0 && input.email.sendExecution.needPreflightCount > 0) {
    push("Clear Send Execution preflight", "/admin/workbench/email-command-center/send-execution#ops", "Executions waiting on preflight or failed preflight.");
  }
  if (input.emailAwaitingExecutions > 0) {
    push(
      "Continue Send Execution",
      "/admin/workbench/email-command-center/send-execution#ops",
      `${input.emailAwaitingExecutions} execution(s) in draft / test / final path.`,
    );
  }
  if (input.cal.intakeFollowUpCount > 0) {
    push("Calendar follow-ups", "/admin/workbench/calendar/requests", `${input.cal.intakeFollowUpCount} request(s) marked awaiting info.`);
  }
  push(input.email.nextStep.label, input.email.nextStep.href, input.email.nextStep.reason);
  push("Open Email Launch Room", "/admin/workbench/email-command-center/launch-room", "One-page checklist for broadcast readiness.");
  push("Calendar HQ", "/admin/workbench/calendar", "Internal events, approvals, and Google preview (read/list).");
  if (input.queueAttention > 0) {
    push("Email queue attention", "/admin/workbench/email-queue", `${input.queueAttention} item(s) flagged needs attention.`);
  }
  return out;
}

export async function getCockpitSnapshot(): Promise<CockpitSnapshot> {
  const [email, calendar, calendarPipeline, queueSummary] = await Promise.all([
    getEmailLaunchRoomSnapshot(),
    getCalendarOperatorReadiness(),
    getCachedCalendarRequestPipelineCounts(),
    getEmailWorkflowQueueSummary().catch(() => ({
      total: 0,
      newCount: 0,
      enrichedCount: 0,
      inReviewCount: 0,
      readyCount: 0,
      approvedCount: 0,
      escalatedCount: 0,
      unassignedCount: 0,
      needsAttentionCount: 0,
    })),
  ]);

  const emailAwaitingExecutions =
    email.sendExecution.needPreflightCount +
    email.sendExecution.readyForTestCount +
    email.sendExecution.testSentCount +
    email.sendExecution.readyForFinalApprovalCount +
    email.sendExecution.finalApprovedCount;

  return {
    email,
    calendar,
    calendarPipeline,
    eccLoaded: false,
    queueNeedsAttention: queueSummary.needsAttentionCount,
    commsNewThreadsApprox: queueSummary.newCount,
    commandStack: buildCommandStack({
      email,
      cal: calendar,
      pipe: calendarPipeline,
      queueAttention: queueSummary.needsAttentionCount,
      emailAwaitingExecutions,
    }),
  };
}
