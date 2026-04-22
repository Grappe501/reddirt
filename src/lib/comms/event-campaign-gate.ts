import type { CampaignEvent, CommunicationCampaignType } from "@prisma/client";
import { EventWorkflowState } from "@prisma/client";

/**
 * Outbound comms for calendar-linked campaigns must match event workflow stage and campaign intent.
 */
export function canSendForEventCampaign(
  event: Pick<CampaignEvent, "id" | "eventWorkflowState" | "status">,
  t: CommunicationCampaignType
): { ok: true } | { ok: false; reason: string } {
  if (t === "EVENT_CANCELLATION" || t === "EVENT_THANK_YOU" || t === "RSVP_FOLLOWUP" || t === "EVENT_REMINDER") {
    if (event.status === "CANCELLED" && t === "EVENT_REMINDER") {
      return { ok: false, reason: "Event is cancelled — use EVENT_CANCELLATION (or a thank-you) instead of reminders." };
    }
  }
  if (t === "EVENT_CANCELLATION") {
    if (event.status !== "CANCELLED" && event.eventWorkflowState !== EventWorkflowState.CANCELED) {
      return { ok: false, reason: "EVENT_CANCELLATION only when the event is cancelled in workflow/ops status." };
    }
  }
  if (t === "EVENT_THANK_YOU" || t === "RSVP_FOLLOWUP" || t === "FOLLOW_UP") {
    if (event.eventWorkflowState === EventWorkflowState.DRAFT) {
      return { ok: false, reason: "This send requires the event to move past DRAFT (e.g. APPROVED or PUBLISHED)." };
    }
  }
  if (t === "EVENT_REMINDER" || t === "RSVP_FOLLOWUP") {
    if (event.eventWorkflowState === EventWorkflowState.CANCELED) {
      return { ok: false, reason: "Event is canceled — do not run reminders or RSVP follow-ups for this event." };
    }
  }
  return { ok: true };
}
