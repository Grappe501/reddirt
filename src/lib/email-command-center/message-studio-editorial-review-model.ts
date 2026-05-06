/**
 * EMAIL-EDITORIAL-REVIEW-DESK-1.0 — definitions + readiness scoring (client-side only).
 * Not legal compliance; operators must still use counsel and Send Execution Governance.
 */

export type MessageStudioEditorialReviewStatus =
  | "editorial_draft"
  | "editorial_needs_edits"
  | "editorial_ready_comms"
  | "editorial_ready_principal"
  | "editorial_ready_send_governance";

export type MessageStudioEditorialReviewOwner =
  | "operator"
  | "comms_lead"
  | "candidate_principal"
  | "legal_compliance"
  | "finance_fundraising"
  | "field_organizing";

/** Per-item disposition for claim/source checks (no automated fact-checking in this packet) */
export type EditorialClaimSourceStatus = "clear" | "needs_source" | "remove" | "needs_approval";

/** Voice / audience fit row */
export type EditorialVoiceAudienceStatus = "clear" | "needs_attention" | "n_a";

export type EditorialReadinessTier = "missing_basics" | "needs_review" | "review_ready" | "send_governance_ready";

export const EDITORIAL_REVIEW_STATUS_OPTIONS: { value: MessageStudioEditorialReviewStatus; label: string }[] = [
  { value: "editorial_draft", label: "Draft" },
  { value: "editorial_needs_edits", label: "Needs edits" },
  { value: "editorial_ready_comms", label: "Ready for comms review" },
  { value: "editorial_ready_principal", label: "Ready for principal review" },
  { value: "editorial_ready_send_governance", label: "Ready for send-governance review" },
];

export const EDITORIAL_REVIEW_OWNER_OPTIONS: { value: MessageStudioEditorialReviewOwner; label: string }[] = [
  { value: "operator", label: "Operator" },
  { value: "comms_lead", label: "Comms lead" },
  { value: "candidate_principal", label: "Candidate / principal" },
  { value: "legal_compliance", label: "Legal / compliance" },
  { value: "finance_fundraising", label: "Finance / fundraising (donor message)" },
  { value: "field_organizing", label: "Field / organizing (volunteer message)" },
];

export const CLAIM_SOURCE_ITEMS: {
  id: string;
  question: string;
  guidance: string;
}[] = [
  {
    id: "factual_claims",
    question: "Does the draft make factual claims?",
    guidance: "If yes, each claim needs a cited source or removal before externalization.",
  },
  {
    id: "claims_sourced",
    question: "Are factual claims sourced?",
    guidance: "Use `needs source` until a doc link or approved research note exists.",
  },
  {
    id: "opponent_or_person_attack",
    question: "Any opponent / person attack?",
    guidance: "Contrast lines require counsel + sourcing per campaign firewall docs.",
  },
  {
    id: "election_admin_or_legal",
    question: "Any election administration or legal claim?",
    guidance: "Verify against official sources; use `needs approval` for legal review.",
  },
  {
    id: "fundraising_claim",
    question: "Any fundraising claim?",
    guidance: "Matching funds, tax, or urgency claims need finance + counsel.",
  },
  {
    id: "promise_needs_approval",
    question: "Any promise that needs approval?",
    guidance: "Visits, outcomes, or enforcement — flag for principal/comms.",
  },
  {
    id: "county_local_reference",
    question: "Any county / local reference that should be verified?",
    guidance: "No fabricated county stats; use `needs source` until verified.",
  },
  {
    id: "numbers_statistics",
    question: "Any numbers / statistics?",
    guidance: "Every number needs a footnote or removal for paid/high-reach.",
  },
  {
    id: "deadline_datetime",
    question: "Any deadline / date / time?",
    guidance: "Confirm with calendar/ops; wrong dates erode trust.",
  },
];

export const VOICE_AUDIENCE_ITEMS: {
  id: string;
  question: string;
  guidance: string;
}[] = [
  {
    id: "matches_campaign_voice",
    question: "Matches campaign voice",
    guidance: "Compare to Campaign Voice tone + issue frames selected for this draft.",
  },
  {
    id: "tone_fits_audience",
    question: "Tone fits selected audience",
    guidance: "Audience frame + audience note should align; adjust if insider-heavy.",
  },
  {
    id: "cta_clear",
    question: "CTA is clear",
    guidance: "One primary ask; secondary asks labeled optional.",
  },
  {
    id: "local_relevance_clear",
    question: "Local relevance is clear",
    guidance: "County hooks only when accurate; otherwise use `n/a`.",
  },
  {
    id: "length_appropriate",
    question: "Message length appropriate",
    guidance: "Match channel norms; trim if mobile-first.",
  },
  {
    id: "subject_matches_body",
    question: "Subject line matches body",
    guidance: "Avoid clickbait drift from body promise.",
  },
  {
    id: "preheader_supports_subject",
    question: "Preheader supports subject",
    guidance: "Preheader should complement, not contradict.",
  },
  {
    id: "no_insider_jargon",
    question: "No jargon / overly insider language",
    guidance: "Plainspoken Arkansas accessibility where appropriate.",
  },
  {
    id: "not_too_aggressive",
    question: "Not too aggressive",
    guidance: "Urgent but not panicked; respect reader stress.",
  },
  {
    id: "not_too_vague",
    question: "Not too vague",
    guidance: "Concrete ask + concrete context.",
  },
];

export const COMPLIANCE_REMINDER_ITEMS: {
  id: string;
  label: string;
  guidance: string;
}[] = [
  {
    id: "broadcast_unsub",
    label: "Broadcast requires unsubscribe / suppression handling",
    guidance: "Future SendGrid sends need list hygiene before execution.",
  },
  {
    id: "import_consent",
    label: "Imported contacts require source / consent review",
    guidance: "Import provenance ≠ marketing consent.",
  },
  {
    id: "donor_finance",
    label: "Donor / fundraising message requires finance review",
    guidance: "Use finance owner when draft type implies donors.",
  },
  {
    id: "press_principal",
    label: "Press response requires comms / principal review",
    guidance: "Rapid response routing — no solo sends.",
  },
  {
    id: "volunteer_no_overpromise",
    label: "Volunteer asks should avoid overpromising",
    guidance: "Verify shifts/events before hard commitments.",
  },
  {
    id: "queue_not_send",
    label: "Queue approval is not send approval",
    guidance: "Workflow state only until execution packets exist.",
  },
  {
    id: "send_execution_required",
    label: "Send Execution Governance is required before future send",
    guidance: "Open send-execution route to verify gates — still no send from Message Studio.",
  },
];

export const CLAIM_SOURCE_IDS = CLAIM_SOURCE_ITEMS.map((x) => x.id);
export const VOICE_AUDIENCE_IDS = VOICE_AUDIENCE_ITEMS.map((x) => x.id);
export const COMPLIANCE_IDS = COMPLIANCE_REMINDER_ITEMS.map((x) => x.id);

export type EditorialDraftShape = {
  subject: string;
  body: string;
  primaryCta: string;
  audienceNote: string;
  approvalOwner: string;
  governanceAcknowledged: boolean;
  draftType: string;
  editorialReviewStatus: MessageStudioEditorialReviewStatus;
  editorialClaimSourceChecklist: Record<string, EditorialClaimSourceStatus>;
  editorialVoiceAudienceChecklist: Record<string, EditorialVoiceAudienceStatus>;
  editorialComplianceChecklist: Record<string, boolean>;
};

export function defaultEditorialClaimSourceChecklist(): Record<string, EditorialClaimSourceStatus> {
  return Object.fromEntries(CLAIM_SOURCE_IDS.map((id) => [id, "clear" as const]));
}

export function defaultEditorialVoiceAudienceChecklist(): Record<string, EditorialVoiceAudienceStatus> {
  return Object.fromEntries(VOICE_AUDIENCE_IDS.map((id) => [id, "clear" as const]));
}

export function defaultEditorialComplianceChecklist(): Record<string, boolean> {
  return Object.fromEntries(COMPLIANCE_IDS.map((id) => [id, false]));
}

export function computeEditorialReadinessTier(d: EditorialDraftShape): EditorialReadinessTier {
  const hasSubject = d.subject.trim().length >= 3;
  const hasBody = d.body.trim().length >= 40;
  const hasCta = d.primaryCta.trim().length >= 2;
  const hasAudience = d.audienceNote.trim().length >= 10;
  const hasApprovalOwner = d.approvalOwner.trim().length >= 1;

  if (!hasSubject || !hasBody || !hasCta || !hasAudience) {
    return "missing_basics";
  }

  const claimOk = CLAIM_SOURCE_IDS.every((id) => (d.editorialClaimSourceChecklist[id] ?? "clear") === "clear");
  const voiceOk = VOICE_AUDIENCE_IDS.every((id) => {
    const s = d.editorialVoiceAudienceChecklist[id] ?? "clear";
    return s === "clear" || s === "n_a";
  });
  const complianceOk = COMPLIANCE_IDS.every((id) => d.editorialComplianceChecklist[id] === true);

  if (!d.governanceAcknowledged || !hasApprovalOwner) return "needs_review";
  if (d.editorialReviewStatus === "editorial_needs_edits") return "needs_review";
  if (!claimOk || !voiceOk) return "needs_review";

  if (complianceOk && d.editorialReviewStatus === "editorial_ready_send_governance") {
    return "send_governance_ready";
  }

  return "review_ready";
}

export function computeEditorialBlockers(d: EditorialDraftShape): string[] {
  const tier = computeEditorialReadinessTier(d);
  if (tier === "send_governance_ready") {
    return ["Handoff: verify rails in Send Execution Governance — still not a compliance or send authorization."];
  }

  const blockers: string[] = [];
  if (d.subject.trim().length < 3) blockers.push("Subject missing or too short");
  if (d.body.trim().length < 40) blockers.push("Body missing or too short");
  if (d.primaryCta.trim().length < 2) blockers.push("Primary CTA missing");
  if (d.audienceNote.trim().length < 10) blockers.push("Audience / context note thin");
  if (!d.approvalOwner.trim()) blockers.push("Approval owner not set");
  if (!d.governanceAcknowledged) blockers.push("Local draft governance not acknowledged");
  if (d.editorialReviewStatus === "editorial_needs_edits") blockers.push("Editorial status: needs edits");
  CLAIM_SOURCE_IDS.forEach((id) => {
    const s = d.editorialClaimSourceChecklist[id] ?? "clear";
    if (s !== "clear") blockers.push(`Claim/source “${id}”: ${s.replace(/_/g, " ")}`);
  });
  VOICE_AUDIENCE_IDS.forEach((id) => {
    const s = d.editorialVoiceAudienceChecklist[id] ?? "clear";
    if (s === "needs_attention") blockers.push(`Voice/audience “${id}”: needs attention`);
  });
  COMPLIANCE_IDS.forEach((id) => {
    if (!d.editorialComplianceChecklist[id]) blockers.push(`Compliance reminder: ${id}`);
  });
  if (d.editorialReviewStatus !== "editorial_ready_send_governance") {
    blockers.push("Editorial status not yet at send-governance review");
  }
  if (blockers.length === 0) blockers.push("Continue checklist review before send governance.");
  return blockers;
}

export function inferFutureSendRail(draftType: string): string {
  const t = draftType.toLowerCase();
  if (/donor|fundraising|finance/i.test(t)) return "SendGrid broadcast (future) — finance path";
  if (/press|media/i.test(t)) return "Gmail 1:1 or comms-approved channel (future)";
  if (/volunteer|field|event/i.test(t)) return "Either rail (future) — verify in Send Execution Governance";
  if (/newsletter|broadcast|county update/i.test(t)) return "SendGrid broadcast (future)";
  return "TBD — confirm in Send Execution Governance when execution exists";
}
