export const CAMPAIGN_ROLES = [
  "OWNER",
  "ADMIN",
  "CAMPAIGN_MANAGER",
  "EVENT_MANAGER",
  "COMMUNICATIONS",
  "ORGANIZER",
  "VOLUNTEER_COORDINATOR",
  "VOLUNTEER",
  "VIEWER",
  // Existing canonical CampaignTenantRole compatibility roles.
  "TREASURER",
  "OPERATOR",
] as const;

export type CampaignRole = (typeof CAMPAIGN_ROLES)[number];

export const MEMBERSHIP_STATUSES = ["INVITED", "ACTIVE", "SUSPENDED", "DISABLED"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export type CurrentActor = {
  userId: string;
  authUserId: string;
  email: string;
  displayName: string | null;
  campaignKey: string;
  membershipId: string;
  role: CampaignRole;
  status: MembershipStatus;
  permissions: readonly string[];
};

export class EventPmAuthError extends Error {
  readonly status: 401 | 403 | 503;
  readonly code: string;

  constructor(status: 401 | 403 | 503, code: string, message: string) {
    super(message);
    this.name = "EventPmAuthError";
    this.status = status;
    this.code = code;
  }
}
