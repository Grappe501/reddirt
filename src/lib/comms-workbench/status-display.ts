import type {
  CommunicationDraftStatus,
  CommunicationPlanStatus,
  CommunicationReviewDecision,
  CommunicationSendStatus,
  CommunicationVariantStatus,
  MediaOutreachStatus,
} from "@prisma/client";

/**
 * Visual severity for workbench status chips (not marketing analytics).
 * @see commsStatusBadgeClass
 */
export type CommsStatusTone = "neutral" | "info" | "amber" | "success" | "danger" | "muted";

const toneToClass: Record<CommsStatusTone, string> = {
  neutral:
    "rounded border border-deep-soil/15 bg-cream-canvas/90 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-deep-soil/90",
  info: "rounded border border-sky-200/80 bg-sky-50/90 px-1.5 py-0.5 text-[10px] font-semibold text-sky-950",
  amber:
    "rounded border border-amber-200/80 bg-amber-50/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950",
  success:
    "rounded border border-emerald-200/80 bg-emerald-50/90 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-950",
  danger: "rounded border border-rose-200/80 bg-rose-50/90 px-1.5 py-0.5 text-[10px] font-semibold text-rose-950",
  muted: "rounded border border-deep-soil/10 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-deep-soil/55",
};

export function commsStatusBadgeClass(tone: CommsStatusTone, extra = ""): string {
  return `${toneToClass[tone]}${extra ? ` ${extra}` : ""}`;
}

export type CommsStatusDisplay = {
  label: string;
  tone: CommsStatusTone;
  /** Short context for `title` / tooltips. */
  hint?: string;
};

const planTone: Record<CommunicationPlanStatus, CommsStatusTone> = {
  DRAFT: "muted",
  PLANNING: "neutral",
  READY_FOR_REVIEW: "amber",
  APPROVED: "info",
  SCHEDULED: "info",
  ACTIVE: "success",
  COMPLETED: "muted",
  CANCELED: "muted",
  ARCHIVED: "muted",
};

const planLabel: Record<CommunicationPlanStatus, string> = {
  DRAFT: "Draft",
  PLANNING: "Planning",
  READY_FOR_REVIEW: "Ready for review",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
  ARCHIVED: "Archived",
};

export function getPlanStatusDisplay(status: CommunicationPlanStatus): CommsStatusDisplay {
  return {
    label: planLabel[status],
    tone: planTone[status],
    hint: status === "APPROVED" ? "Plan approved; assets may still be in review or unsent." : undefined,
  };
}

const draftLabel: Record<CommunicationDraftStatus, string> = {
  DRAFT: "In progress",
  READY_FOR_REVIEW: "Ready for review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

const draftTone: Record<CommunicationDraftStatus, CommsStatusTone> = {
  DRAFT: "neutral",
  READY_FOR_REVIEW: "amber",
  APPROVED: "success",
  REJECTED: "danger",
  ARCHIVED: "muted",
};

export function getDraftStatusDisplay(status: CommunicationDraftStatus): CommsStatusDisplay {
  return {
    label: draftLabel[status],
    tone: draftTone[status],
    hint:
      status === "APPROVED"
        ? "Content approved. Still need a planned send and delivery for ‘sent’."
        : undefined,
  };
}

const variantLabel: Record<CommunicationVariantStatus, string> = {
  DRAFT: "In progress",
  READY: "Ready (legacy)",
  READY_FOR_REVIEW: "Ready for review",
  REJECTED: "Rejected",
  APPROVED: "Approved",
  ARCHIVED: "Archived",
};

const variantTone: Record<CommunicationVariantStatus, CommsStatusTone> = {
  DRAFT: "neutral",
  READY: "amber",
  READY_FOR_REVIEW: "amber",
  REJECTED: "danger",
  APPROVED: "success",
  ARCHIVED: "muted",
};

export function getVariantStatusDisplay(status: CommunicationVariantStatus): CommsStatusDisplay {
  return {
    label: variantLabel[status],
    tone: variantTone[status],
    hint:
      status === "APPROVED"
        ? "Variant approved. ‘Sent’ appears on the send after delivery."
        : undefined,
  };
}

const sendLabel: Record<CommunicationSendStatus, string> = {
  DRAFT: "Planned (draft)",
  QUEUED: "Queued for send",
  SCHEDULED: "Scheduled",
  SENDING: "Sending",
  SENT: "Sent",
  PARTIALLY_SENT: "Partially sent",
  FAILED: "Failed",
  CANCELED: "Canceled",
};

const sendTone: Record<CommunicationSendStatus, CommsStatusTone> = {
  DRAFT: "neutral",
  QUEUED: "info",
  SCHEDULED: "info",
  SENDING: "amber",
  SENT: "success",
  PARTIALLY_SENT: "amber",
  FAILED: "danger",
  CANCELED: "muted",
};

export function getSendStatusDisplay(status: CommunicationSendStatus): CommsStatusDisplay {
  return {
    label: sendLabel[status],
    tone: sendTone[status],
    hint:
      status === "DRAFT"
        ? "Not queued for delivery yet."
        : status === "QUEUED"
          ? "Handed to execution; may run when a worker is available or when you run it."
          : status === "SENT"
            ? "Provider accepted the send. Email/SMS may still reconcile via webhooks."
            : undefined,
  };
}

const reviewLabel: Record<CommunicationReviewDecision, string> = {
  APPROVED: "Review: approved",
  REJECTED: "Review: rejected",
  CHANGES_REQUESTED: "Review: changes requested",
};

const reviewTone: Record<CommunicationReviewDecision, CommsStatusTone> = {
  APPROVED: "success",
  REJECTED: "danger",
  CHANGES_REQUESTED: "amber",
};

const reviewHint: Record<CommunicationReviewDecision, string> = {
  APPROVED: "Copy approved for this cycle — you may plan sends from this asset when other gates pass.",
  REJECTED: "Not approved. Revise the copy and request review again, or start a new draft/variant if needed.",
  CHANGES_REQUESTED: "Not a final rejection — address the notes, then re-request review when ready.",
};

export function getReviewDecisionDisplay(d: CommunicationReviewDecision): CommsStatusDisplay {
  return { label: reviewLabel[d], tone: reviewTone[d], hint: reviewHint[d] };
}

const mediaLabel: Record<MediaOutreachStatus, string> = {
  NEW: "New",
  RESEARCHING: "Researching",
  READY: "Ready",
  CONTACTED: "Contacted",
  FOLLOW_UP_DUE: "Follow-up due",
  RESPONDED: "Responded",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

const mediaTone: Record<MediaOutreachStatus, CommsStatusTone> = {
  NEW: "neutral",
  RESEARCHING: "info",
  READY: "info",
  CONTACTED: "info",
  FOLLOW_UP_DUE: "amber",
  RESPONDED: "success",
  CLOSED: "muted",
  ARCHIVED: "muted",
};

export function getMediaOutreachStatusDisplay(status: MediaOutreachStatus): CommsStatusDisplay {
  return { label: mediaLabel[status], tone: mediaTone[status] };
}
