/** Multi-campaign SaaS types (Sprint 10) — human-gated, no PII in fixtures. */

export type CampaignArchetype =
  | "candidate_campaign"
  | "pac"
  | "county_party"
  | "advocacy_org"
  | "ballot_issue";

export type CampaignTenantRole = "owner" | "admin" | "campaign_manager" | "treasurer" | "operator" | "volunteer" | "viewer";

export type CampaignTenant = {
  id: string;
  slug: string;
  displayName: string;
  archetype: CampaignArchetype;
  electionType?: string | null;
  geography?: string | null;
  timelineStart?: string | null;
  timelineEnd?: string | null;
  staffSizeBand?: string | null;
  budgetLevel?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampaignMembership = {
  id: string;
  tenantId: string;
  userId: string;
  role: CampaignTenantRole;
  createdAt: string;
};

export type CampaignSettings = {
  tenantId: string;
  priorities: string[];
  fieldGoals: string[];
  communicationGoals: string[];
  complianceNeeds: string[];
  defaultReviewMonth?: string | null;
};

export type CampaignBranding = {
  tenantId: string;
  logoUrl?: string | null;
  primaryColor: string;
  accentColor: string;
  domainScaffold?: string | null;
};

export type CampaignFeatureFlags = {
  tenantId: string;
  reimbursementPortal: boolean;
  eventIntakePortal: boolean;
  volunteerPortal: boolean;
  coalitionPortal: boolean;
  hotWashIntelligence: boolean;
  financeIntelligenceV2: boolean;
  strategicIntelligence: boolean;
};

export type CampaignTenancyStore = {
  tenants: CampaignTenant[];
  memberships: CampaignMembership[];
  settings: CampaignSettings[];
  branding: CampaignBranding[];
  featureFlags: CampaignFeatureFlags[];
};

export type CampaignOnboardingDraft = {
  archetype: CampaignArchetype;
  displayName: string;
  electionType: string;
  geography: string;
  timelineStart: string;
  timelineEnd: string;
  staffSizeBand: string;
  budgetLevel: string;
  priorities: string[];
  fieldGoals: string[];
  communicationGoals: string[];
  complianceNeeds: string[];
  primaryColor: string;
};
