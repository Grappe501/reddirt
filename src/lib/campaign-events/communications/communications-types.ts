/** Campaign OS unified communications V1 (JSON-backed; bridges Prisma ECC when present). */

export type ContactRoleTag =
  | "volunteer"
  | "host"
  | "campaign_team"
  | "candidate"
  | "county_lead"
  | "donor_prospect"
  | "general";

export type ContactConsent = "explicit" | "implied_event" | "import_review" | "unknown";

export type CampaignContact = {
  id: string;
  email: string;
  displayName?: string;
  roleTags: ContactRoleTag[];
  countySlug?: string;
  eventRecordId?: string;
  source: string;
  consent: ContactConsent;
  suppressed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactList = {
  id: string;
  name: string;
  description: string;
  contactIds: string[];
  static: boolean;
  createdAt: string;
};

export type ContactSegment = {
  id: string;
  name: string;
  description: string;
  filter: { roleTag?: ContactRoleTag; countySlug?: string; source?: string };
  createdAt: string;
};

export type CommunicationTemplate = {
  id: string;
  name: string;
  audience: string;
  subject: string;
  previewText: string;
  body: string;
  variables: string[];
  requiredApprovals: string[];
  riskLevel: "low" | "medium" | "high";
  unsubscribeRequired: boolean;
  status: "draft" | "ready" | "archived";
  workflowType:
    | "approval_package"
    | "event_invitation"
    | "host_followup"
    | "volunteer"
    | "campaign_team"
    | "county_leader"
    | "donor_prospect"
    | "hot_wash"
    | "reimbursement"
    | "power_of_five"
    | "newsletter"
    | "other";
};

export type CommunicationSendRecord = {
  id: string;
  templateId?: string;
  listId?: string;
  segmentId?: string;
  status: "draft" | "preview" | "test_sent" | "blocked" | "sent";
  recipientCount: number;
  provider: "sendgrid" | "gmail" | "none";
  humanApproved: boolean;
  auditNote: string;
  createdAt: string;
};

export type SuppressionRecord = {
  email: string;
  reason: "unsubscribe" | "bounce" | "complaint" | "manual" | "import_hold";
  source: string;
  at: string;
};

export type CommunicationsStore = {
  version: 1;
  contacts: CampaignContact[];
  lists: ContactList[];
  segments: ContactSegment[];
  templates: CommunicationTemplate[];
  sends: CommunicationSendRecord[];
  suppressions: SuppressionRecord[];
};
