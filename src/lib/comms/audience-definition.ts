import type { CommunicationChannel } from "@prisma/client";

/**
 * JSON stored on `CommunicationCampaign.audienceDefinitionJson` and `AudienceSegment.definitionJson`.
 */
export type AudienceDefinition = {
  /** County UUIDs; matches team role county, thread `countyId`, or volunteer signup county. */
  countyIds?: string[];
  /** `CommunicationTag.key` values — any thread with any tag (OR). */
  tagKeys?: string[];
  /** Limit to people signed up for this event. */
  eventIdForSignups?: string;
  /** `Commitment.type` match (e.g. phone_bank). */
  commitmentTypes?: string[];
  lastContactedAfter?: string;
  lastContactedBefore?: string;
  /** `VolunteerProfile.leadershipInterest` */
  requireLeadership?: boolean;
  requirePhone?: boolean;
  requireEmail?: boolean;
  /** If true, require address present for the chosen channel. */
  emailEligible?: boolean;
  smsEligible?: boolean;
  /** TeamRoleAssignment.roleKey (any match) */
  teamRoleKeys?: string[];
  /** Hard exclusion list of user ids (suppression list, cross-campaign) */
  excludeUserIds?: string[];
  /** If true, default exclusion rules use contact preferences (see resolver). */
  applyPreferenceSuppression?: boolean;
};

export function defaultAudienceDefinition(): AudienceDefinition {
  return { applyPreferenceSuppression: true };
}

/**
 * Picks per-recipient channel for MIXED: prefer email when eligible, else SMS.
 */
export function pickRecipientChannel(
  hasEmail: boolean,
  hasPhone: boolean,
  campaignChannel: "SMS" | "EMAIL" | "MIXED"
): CommunicationChannel | null {
  if (campaignChannel === "EMAIL") {
    return hasEmail ? "EMAIL" : null;
  }
  if (campaignChannel === "SMS") {
    return hasPhone ? "SMS" : null;
  }
  if (hasEmail) return "EMAIL";
  if (hasPhone) return "SMS";
  return null;
}
