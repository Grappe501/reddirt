import { CommunicationActionType, EventWorkflowState } from "@prisma/client";

export type EventCommsDraftKind =
  | "reminder_sms"
  | "reminder_email"
  | "cancellation"
  | "thank_you"
  | "volunteer_followup";

const CAL_TYPE_SET: Set<CommunicationActionType> = new Set([
  CommunicationActionType.CAL_REMINDER_DUE,
  CommunicationActionType.CAL_EVENT_CHANGED,
  CommunicationActionType.CAL_CANCELLATION_NOTICE,
  CommunicationActionType.CAL_RSVP_FOLLOWUP,
  CommunicationActionType.CAL_THANK_YOU_FOLLOWUP,
  CommunicationActionType.CAL_COUNTY_LEAD_MISSING,
  CommunicationActionType.CAL_MEDIA_CAPTURE_MISSING,
  CommunicationActionType.CAL_COMMS_PREP_MISSING,
  CommunicationActionType.CAL_STAFFING_GAP,
]);

export { CAL_TYPE_SET as calendarActionTypeSet };

export type EventCommsModeLabel = "none" | "internal_only" | "outward" | "cancellation" | "postevent";

/**
 * For UI copy — not auth (see assert* for enforcement).
 */
export function commsModeForStage(state: EventWorkflowState): EventCommsModeLabel {
  switch (state) {
    case EventWorkflowState.DRAFT:
    case EventWorkflowState.PENDING_APPROVAL:
    case EventWorkflowState.APPROVED:
      return "internal_only";
    case EventWorkflowState.PUBLISHED:
      return "outward";
    case EventWorkflowState.CANCELED:
      return "cancellation";
    case EventWorkflowState.COMPLETED:
      return "postevent";
    default:
      return "none";
  }
}

/**
 * Voter- / attendee-facing copy — requires live Public stage.
 */
export function canOutwardEventInvite(state: EventWorkflowState): boolean {
  return state === EventWorkflowState.PUBLISHED;
}

export function canPostEventThankYou(state: EventWorkflowState): boolean {
  return state === EventWorkflowState.COMPLETED || state === EventWorkflowState.PUBLISHED;
}

/**
 * Enforce Slice 3 rules for AI draft generation.
 */
export function assertEventCommsDraftAllowed(
  state: EventWorkflowState,
  kind: EventCommsDraftKind
): { mode: "internal" | "outward" } {
  if (kind === "cancellation") {
    if (state === EventWorkflowState.CANCELED) return { mode: "outward" };
    if (state === EventWorkflowState.PUBLISHED || state === EventWorkflowState.APPROVED) return { mode: "internal" };
    throw new Error("Cancellation copy is for canceled events, or internal templates while Approved/Public.");
  }
  if (kind === "thank_you") {
    if (state === EventWorkflowState.DRAFT || state === EventWorkflowState.PENDING_APPROVAL) {
      throw new Error("Thank-you is not available in Draft or Needs review.");
    }
    if (!canPostEventThankYou(state) && state !== EventWorkflowState.APPROVED) {
      throw new Error("Thank-you drafts are for Public (after event) or Completed.");
    }
    if (state === EventWorkflowState.COMPLETED) return { mode: "outward" };
    if (state === EventWorkflowState.PUBLISHED) return { mode: "outward" };
    if (state === EventWorkflowState.APPROVED) return { mode: "internal" };
  }
  if (kind === "volunteer_followup") {
    if (state === EventWorkflowState.DRAFT || state === EventWorkflowState.PENDING_APPROVAL) {
      throw new Error("Volunteer follow-up is not available in Draft or Needs review.");
    }
    if (state === EventWorkflowState.CANCELED) {
      throw new Error("Not applicable for canceled events.");
    }
    if (state === EventWorkflowState.COMPLETED) return { mode: "outward" };
    if (state === EventWorkflowState.PUBLISHED) return { mode: "outward" };
    if (state === EventWorkflowState.APPROVED) return { mode: "internal" };
  }
  if (kind === "reminder_sms" || kind === "reminder_email") {
    if (state === EventWorkflowState.DRAFT || state === EventWorkflowState.PENDING_APPROVAL) {
      throw new Error("Outward event reminders are blocked in Draft or Needs review.");
    }
    if (state === EventWorkflowState.CANCELED || state === EventWorkflowState.COMPLETED) {
      throw new Error("Reminders are not used for Canceled/Completed in this flow.");
    }
    if (canOutwardEventInvite(state)) return { mode: "outward" };
    if (state === EventWorkflowState.APPROVED) return { mode: "internal" };
  }
  return { mode: "internal" };
}

/**
 * For manual queue nudges from the event panel.
 */
export function assertCalendarQueueItemAllowedForStage(state: EventWorkflowState, t: CommunicationActionType) {
  if (!CAL_TYPE_SET.has(t)) {
    throw new Error("Not a calendar queue type.");
  }
  if (state === EventWorkflowState.DRAFT) {
    if (t === CommunicationActionType.CAL_CANCELLATION_NOTICE) throw new Error("Not canceled — cancellation queue item blocked.");
  }
  if (state === EventWorkflowState.PENDING_APPROVAL) {
    if (
      t === CommunicationActionType.CAL_REMINDER_DUE ||
      t === CommunicationActionType.CAL_RSVP_FOLLOWUP ||
      t === CommunicationActionType.CAL_THANK_YOU_FOLLOWUP
    ) {
      throw new Error("Outward send queues are not available at Needs review.");
    }
  }
  if (state === EventWorkflowState.CANCELED) {
    if (t === CommunicationActionType.CAL_RSVP_FOLLOWUP || t === CommunicationActionType.CAL_REMINDER_DUE) {
      throw new Error("RSVP / reminder not applicable for canceled event.");
    }
  }
}
