/**
 * POLICY-1: Governed source of truth for campaign defaults (tone, disclaimers, reimbursement, thresholds).
 * Types and defaults only — no persistence in this packet. Later: versioned `CampaignPolicy` in DB, audit, AI context.
 * @see docs/campaign-policy-foundation.md
 */

import { ComplianceDomain, type ComplianceDomainId } from "./compliance";

export const POLICY1_PACKET = "POLICY-1" as const;

/** V1 default scope string — not a legal finding; org may narrow or expand with counsel. */
export const ReimbursementScope = {
  CANDIDATE_EXPENSES_ONLY: "candidate_expenses_only",
} as const;
export type ReimbursementScopeId =
  (typeof ReimbursementScope)[keyof typeof ReimbursementScope];

/**
 * High-level policy buckets (documentation + future routing / tags).
 * Overlaps `ComplianceDomain` where expense/compliance meet — policy is the *defaults* layer.
 */
export const CampaignPolicyCategory = {
  MESSAGING_VOICE: "messaging_voice",
  DISCLAIMERS: "disclaimers",
  EXPENSE_REIMBURSEMENT: "expense_reimbursement",
  APPROVALS: "approvals",
  CHANNEL_COMMS: "channel_comms",
  COMPLIANCE_ESCALATION: "compliance_escalation",
  SPEND_BUDGET: "spend_budget",
  FUNDRAISING_GOALS: "fundraising_goals",
} as const;
export type CampaignPolicyCategoryId =
  (typeof CampaignPolicyCategory)[keyof typeof CampaignPolicyCategory];

/** Default mapping from policy category to compliance domain (narrative / future tagging). */
export const defaultPolicyCategoryComplianceDomain: Partial<
  Record<CampaignPolicyCategoryId, ComplianceDomainId>
> = {
  [CampaignPolicyCategory.DISCLAIMERS]: ComplianceDomain.COMMUNICATIONS_DISCLAIMER,
  [CampaignPolicyCategory.EXPENSE_REIMBURSEMENT]: ComplianceDomain.REIMBURSEMENT_EXPENSE,
  [CampaignPolicyCategory.SPEND_BUDGET]: ComplianceDomain.CAMPAIGN_FINANCE_REPORTING,
  [CampaignPolicyCategory.COMPLIANCE_ESCALATION]: ComplianceDomain.ETHICS_CONFLICT,
};

/**
 * Initial campaign policy defaults (v1) — user-authored for this org; changeable in later packets.
 * Not legal advice; does not replace filings or official interpretations.
 */
export const CAMPAIGN_POLICY_V1 = {
  packet: POLICY1_PACKET,
  versionLabel: "v1-2026-04-23",
  messaging: {
    tone: "calm" as const,
    philosophy: "bottom-up" as const,
    /** Short organizing line for voice alignment / RAG. */
    organizingLine: "We are here to help people organize where they are.",
  },
  disclaimers: {
    /** Shown on public + admin footers; must stay consistent with `CampaignPaidForBar` usage. */
    pageFooterPaidForLine: "Paid for by Kelly Grappe for Secretary of State",
  },
  expense: {
    /** USD per mile — policy default, not a statutory rate claim. */
    mileageReimbursementUsdPerMile: 0.725,
    reimbursementScope: ReimbursementScope.CANDIDATE_EXPENSES_ONLY,
  },
} as const;

export type CampaignPolicyV1 = typeof CAMPAIGN_POLICY_V1;
