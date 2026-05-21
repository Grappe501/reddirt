/**
 * Review workflow metadata stored inside `CampaignEventLedgerRecord.factCard` JSON
 * (additive; no migration required).
 */
export type CampaignEventDecision =
  | "approved"
  | "denied"
  | "hold"
  | "request_confirmation"
  | "personal"
  | "duplicate";

export type RequestInfoStatus = "none" | "draft_ready" | "awaiting_send" | "sent_later";

export type EmailDraftType =
  | "confirm_event_details"
  | "ask_address_location"
  | "ask_host_contact"
  | "ask_speaking_slot"
  | "ask_table_materials"
  | "ask_volunteer_logistics"
  | "ask_attendance_audience";

export type CampaignEventEmailDraft = {
  type: EmailDraftType;
  to?: string;
  cc?: string;
  subject: string;
  body: string;
  relatedEventTitle: string;
  missingChecklist: string[];
  savedAt: string;
};

export type IntakeReviewStatus = "needs_review" | "approved" | "denied" | "hold" | "request_more_info";

export type CampaignEventReviewMeta = {
  decision?: CampaignEventDecision;
  decisionNote?: string;
  decisionMadeBy?: string;
  decisionMadeAt?: string;
  requestInfoStatus?: RequestInfoStatus;
  lastEmailDraft?: CampaignEventEmailDraft;
  lastReviewedAt?: string;
  lastRecalculatedAt?: string;
  /** Website intake lane (Sprint 2). */
  websiteIntake?: boolean;
  intakeReviewStatus?: IntakeReviewStatus;
};

export const AUTOMATION_NEEDS_FUTURE = [
  "confirmed_event_email_to_everyone_involved",
  "pre_event_prep_sequence",
  "volunteer_reminder",
  "candidate_briefing",
  "post_event_hot_wash_reminder",
  "reimbursement_follow_up",
  "host_thank_you_email",
] as const;

export function emptyReviewMeta(): CampaignEventReviewMeta {
  return { requestInfoStatus: "none" };
}

export function decisionLabel(decision?: CampaignEventDecision): string | null {
  if (!decision) return null;
  const labels: Record<CampaignEventDecision, string> = {
    approved: "Approved",
    denied: "Denied",
    hold: "Hold",
    request_confirmation: "Request info",
    personal: "Personal",
    duplicate: "Duplicate",
  };
  return labels[decision];
}
