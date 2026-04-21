/**
 * Convention keys for `TeamRoleAssignment.roleKey` and task `assignedRole`.
 * Not a DB enum so we can add roles without migrations.
 */
export const CAMPAIGN_ROLE_KEYS = [
  "CAMPAIGN_MANAGER",
  "FIELD_DIRECTOR",
  "COMMS_DIRECTOR",
  "VOLUNTEER_COORDINATOR",
  "COUNTY_LEAD",
  "EVENT_LEAD",
  "DIGITAL_LEAD",
  "CANDIDATE_SUPPORT",
  "DATA_VOTER_OPS",
] as const;

export type CampaignRoleKey = (typeof CAMPAIGN_ROLE_KEYS)[number];

export function formatRoleLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
