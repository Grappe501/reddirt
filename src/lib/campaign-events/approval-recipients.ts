/**
 * Default recipients for campaign event approval packages and future email automation.
 * Email sending is NOT enabled — display and draft prefills only.
 */

export const candidatePrimaryEmail = "kelly@kellygrappe.com" as const;
export const candidateCampaignEmail = "grappe4arkansas@gmail.com" as const;

/** Not configured yet — set when Steve provides. */
export const campaignManagerEmail: string | null = null;

/** Not configured yet — set when Steve provides. */
export const treasurerEmail: string | null = null;

/** Not configured yet — set when Steve provides. */
export const complianceEmail: string | null = null;

/** @deprecated Use `getApprovalEmailConfig().sendEnabled` server-side. Client UI receives `emailSendEnabled` on package payload. */
export const EMAIL_SEND_DISABLED_NOTICE = "Email sending not enabled yet." as const;

export function getCandidateApprovalRecipientList(): readonly [typeof candidatePrimaryEmail, typeof candidateCampaignEmail] {
  return [candidatePrimaryEmail, candidateCampaignEmail];
}

/** Comma-separated To line for approval-package email drafts. */
export function getCandidateApprovalToLine(): string {
  return getCandidateApprovalRecipientList().join(", ");
}

export function getApprovalRecipientsDisplay(): {
  candidate: { primary: string; campaign: string };
  campaignManager: string | null;
  treasurer: string | null;
  compliance: string | null;
} {
  return {
    candidate: { primary: candidatePrimaryEmail, campaign: candidateCampaignEmail },
    campaignManager: campaignManagerEmail,
    treasurer: treasurerEmail,
    compliance: complianceEmail,
  };
}

/** Flat list for package payload / placeholders. */
export function getApprovalPackageRecipientEmails(): string[] {
  const list: string[] = [...getCandidateApprovalRecipientList()];
  if (campaignManagerEmail) list.push(campaignManagerEmail);
  return list;
}
