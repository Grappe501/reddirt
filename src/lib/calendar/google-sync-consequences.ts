import { EventReadinessStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { reapplyEventWorkflowsForEvent } from "@/lib/calendar/event-task-engine";

/**
 * After Google (or any external) changes event timing, nudge comms + regenerate template-based due dates.
 */
export async function applyEventTimingConsequences(
  eventId: string,
  opts: { actorUserId: string | null; reason: "inbound_sync" | "staff_edit" }
) {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) return;

  const comms = (ev.commsStateJson as Record<string, unknown> | null) ?? {};
  const nextComms: Record<string, unknown> = {
    ...comms,
    lastTimingChangeAt: new Date().toISOString(),
    lastTimingChangeReason: opts.reason,
  };

  await prisma.campaignEvent.update({
    where: { id: eventId },
    data: {
      commsStateJson: nextComms as Prisma.InputJsonValue,
      reminderPlanStatus:
        ev.reminderPlanStatus === "READY" ? EventReadinessStatus.AT_RISK : ev.reminderPlanStatus,
    },
  });

  await reapplyEventWorkflowsForEvent(eventId, { actorUserId: opts.actorUserId });
}
