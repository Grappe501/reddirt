/**
 * Copy-ready email bodies for Power of 5 downstream placement (campaign-approved wording only;
 * volunteers fill bracketed fields locally — never commit real PII).
 */

export type DownstreamLeadEmailParams = {
  teamLeadName: string;
  downstreamTeamName: string;
  personName: string;
  location: string;
  interestLine: string;
  connectionSource: string;
  senderName: string;
};

export const DOWNSTREAM_LEAD_EMAIL_SUBJECT = "Possible local volunteer fit for your team";

export function buildDownstreamTeamLeadEmail(params: DownstreamLeadEmailParams): string {
  return `Hi ${params.teamLeadName},

We have someone who may be a good fit for ${params.downstreamTeamName}.

Name: ${params.personName}
Location: ${params.location}
Possible interest: ${params.interestLine}
Connection source: ${params.connectionSource}

Before we send them your invite link or QR code, can you confirm whether your team has room and whether this looks like a good fit?

If yes, please send the best invite link or QR code for them to use.

Thank you,
${params.senderName}`;
}

export type NewPersonPlacementEmailParams = {
  firstName: string;
  downstreamTeamName: string;
  inviteLinkOrQrNote: string;
  senderName: string;
};

export const NEW_PERSON_EMAIL_SUBJECT = "Here’s the best next step to get connected";

export function buildNewPersonPlacementEmail(params: NewPersonPlacementEmailParams): string {
  return `Hi ${params.firstName},

Thank you for being willing to help.

Based on where you are and what you’re interested in, the best next step is to connect with ${params.downstreamTeamName}.

You can use this link or QR code to get started:
${params.inviteLinkOrQrNote}

This will help the team know where you fit best and what kind of help you’re interested in.

Thank you,
${params.senderName}`;
}

/** First token of display name for email greeting. */
export function firstNameFromDisplay(name: string): string {
  const t = name.trim().split(/\s+/)[0];
  return t || "there";
}
