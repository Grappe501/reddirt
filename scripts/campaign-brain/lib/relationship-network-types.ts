/** Phase 14 — Political Relationship & Influence Network types. */

export type LeaderCategory =
  | "current_elected"
  | "former_elected"
  | "democratic_leadership"
  | "civic"
  | "labor"
  | "faith"
  | "community_influencer"
  | "business"
  | "education";

export type LeaderAskFlags = {
  contacted: boolean;
  meetingRequested: boolean;
  meetingCompleted: boolean;
  supportRequested: boolean;
  networkRequested: boolean;
  financialSupportRequested: boolean;
  introducedOthers: boolean;
  volunteerLeadsProvided: boolean;
};

export type EndorsementStatus =
  | "not_requested"
  | "requested"
  | "meeting_scheduled"
  | "presentation_given"
  | "decision_pending"
  | "endorsed"
  | "declined"
  | "follow_up";

export type EndorsementActivationLevel =
  | "none"
  | "announced"
  | "volunteer_recruitment"
  | "donor_outreach"
  | "event_hosted"
  | "media_placed"
  | "full_activation";

export type EndorsementLeaderFields = {
  endorsementRequested: boolean;
  endorsementStatus: EndorsementStatus;
  endorsementActivationLevel: EndorsementActivationLevel;
};

export type IntroductionOutcomes = {
  adviceReceived: boolean;
  introductionsMade: number;
  volunteerLeadersIdentified: number;
  eventOpportunities: number;
  financialSupportDiscussed: boolean;
  networkAccessProvided: boolean;
  followUpScheduled: boolean;
};

export type CurrentElectedOfficial = {
  id: string;
  name: string;
  office: string;
  county: string;
  district?: string;
  cluster?: string;
  category: LeaderCategory;
  contactStatus: "not_contacted" | "contacted" | "engaged";
  supportStatus: "unknown" | "supportive" | "neutral" | "opposed" | "declined";
  introductionStatus: "none" | "requested" | "in_progress" | "completed";
  followUpNeeded: boolean;
  asks: LeaderAskFlags;
  endorsement: EndorsementLeaderFields;
  outcomes?: Partial<IntroductionOutcomes>;
  notes?: string;
};

export type FormerElectedOfficial = {
  id: string;
  name: string;
  formerOffice: string;
  county: string;
  district?: string;
  cluster?: string;
  relationships?: string;
  asks: LeaderAskFlags;
  endorsement: EndorsementLeaderFields;
  outcomes: IntroductionOutcomes;
  notes?: string;
};

export type CandidatePartner = {
  id: string;
  name: string;
  office: string;
  district?: string;
  county: string;
  category: "congressional" | "stateSenate" | "stateHouse" | "mayor" | "schoolBoard" | "countyOfficial" | "other";
  status: "prospect" | "active" | "inactive";
  sharedEvents: number;
  sharedCanvasses: number;
  sharedPhoneBanks: number;
  sharedVolunteers: number;
  sharedFundraising: number;
  sharedCountyLeadership: boolean;
  sharedMobilizeEvents: number;
  contactName?: string;
  notes?: string;
};

export type CountyInfluenceRow = {
  county: string;
  slug: string;
  cluster: string;
  knownLeaders: number;
  missingLeaderCategories: LeaderCategory[];
  relationshipStrength: "none" | "building" | "established";
  meetingsRequested: number;
  meetingsCompleted: number;
  priorityIntroductions: string[];
  countyInfluenceScore: number;
  currentOfficialsEngaged: number;
  formerOfficialsEngaged: number;
  volunteerLeadersIdentified: number;
  faithLeadersIdentified: number;
  businessLeadersIdentified: number;
};

export type RelationshipNetworkSummary = {
  version: number;
  generatedAt: string;
  heroLine: string;
  currentOfficialsEngaged: number;
  currentOfficialsTotal: number;
  formerOfficialsEngaged: number;
  formerOfficialsTotal: number;
  candidatePartnershipsActive: number;
  volunteerLeadersIdentified: number;
  countiesWithInfluence: number;
  countiesTotal: number;
  meetingsRequested: number;
  meetingsScheduled: number;
  meetingsCompleted: number;
  introductionsGenerated: number;
  statewideRelationshipScore: number;
};
