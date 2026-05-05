import type { EmailWorkflowStatus } from "@prisma/client";

export const EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM = false;

export const EMAIL_WORKFLOW_STATUS_LABELS: Record<EmailWorkflowStatus, string> = {
  NEW: "New",
  ENRICHED: "Enriched",
  IN_REVIEW: "In review",
  READY_TO_RESPOND: "Ready to respond",
  APPROVED: "Approved",
  ESCALATED: "Escalated",
  SPAM: "Spam",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export const EMAIL_WORKFLOW_STATUS_MEANINGS: Record<EmailWorkflowStatus, string> = {
  NEW: "Fresh queue item; needs operator triage.",
  ENRICHED: "Interpretation has added context; still requires human review.",
  IN_REVIEW: "An operator is actively reviewing details and next response path.",
  READY_TO_RESPOND: "Queue review complete; ready for response drafting/review.",
  APPROVED: "Approved for downstream response workflow, not provider execution.",
  ESCALATED: "Requires elevated human attention before response planning.",
  SPAM: "Flagged as spam/suppressed candidate; keep out of normal flow.",
  CLOSED: "Handled in queue context; retain for audit trail.",
  ARCHIVED: "Archived from active queue while keeping historical record.",
};

export const EMAIL_WORKFLOW_NEEDS_ATTENTION_STATUSES: EmailWorkflowStatus[] = [
  "NEW",
  "ENRICHED",
  "IN_REVIEW",
  "ESCALATED",
];

const EMAIL_WORKFLOW_MANUAL_TRANSITIONS: Record<EmailWorkflowStatus, EmailWorkflowStatus[]> = {
  NEW: ["IN_REVIEW", "READY_TO_RESPOND", "ESCALATED", "SPAM", "ARCHIVED"],
  ENRICHED: ["IN_REVIEW", "READY_TO_RESPOND", "ESCALATED", "SPAM", "ARCHIVED"],
  IN_REVIEW: ["NEW", "READY_TO_RESPOND", "APPROVED", "ESCALATED", "SPAM"],
  READY_TO_RESPOND: ["IN_REVIEW", "APPROVED", "ESCALATED", "NEW"],
  APPROVED: ["READY_TO_RESPOND", "IN_REVIEW", "CLOSED", "ESCALATED"],
  ESCALATED: ["IN_REVIEW", "READY_TO_RESPOND", "APPROVED", "NEW"],
  SPAM: ["IN_REVIEW", "ARCHIVED", "NEW"],
  CLOSED: ["IN_REVIEW", "ARCHIVED"],
  ARCHIVED: ["IN_REVIEW", "NEW"],
};

export const EMAIL_WORKFLOW_OPERATOR_TRANSITION_PRESETS: Record<string, EmailWorkflowStatus> = {
  markReviewed: "IN_REVIEW",
  markReadyToRespond: "READY_TO_RESPOND",
  markApprovedForResponseReview: "APPROVED",
  returnToQueue: "NEW",
};

export function getEmailWorkflowAllowedManualTransitions(status: EmailWorkflowStatus): EmailWorkflowStatus[] {
  return EMAIL_WORKFLOW_MANUAL_TRANSITIONS[status] ?? [];
}

export function canTransitionEmailWorkflowStatus(
  fromStatus: EmailWorkflowStatus,
  toStatus: EmailWorkflowStatus
): boolean {
  return getEmailWorkflowAllowedManualTransitions(fromStatus).includes(toStatus);
}

export function getEmailWorkflowNextStep(status: EmailWorkflowStatus): string {
  switch (status) {
    case "NEW":
      return "Review context, assign ownership, and move to In review.";
    case "ENRICHED":
      return "Validate interpretation output and mark In review.";
    case "IN_REVIEW":
      return "Decide ready/escalate/spam, then set an explicit queue state.";
    case "READY_TO_RESPOND":
      return "Route to the approved response drafting workflow outside this queue.";
    case "APPROVED":
      return "Use the separately approved comms/send path; do not execute from this item.";
    case "ESCALATED":
      return "Assign the right owner and capture follow-up in queue metadata.";
    case "SPAM":
      return "Confirm suppression handling, then archive or reopen if needed.";
    case "CLOSED":
      return "Keep for audit; reopen only when new context arrives.";
    case "ARCHIVED":
      return "Leave archived unless operations requires re-triage.";
    default:
      return "Review and route through the queue.";
  }
}
