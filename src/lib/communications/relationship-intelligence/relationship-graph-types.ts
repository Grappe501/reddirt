/** Relationship intelligence graph — metadata + campaign interactions only. */

export type RelationshipKind =
  | "volunteer"
  | "host"
  | "county_leader"
  | "donor_supporter"
  | "campaign_team"
  | "general";

export type TrustLevel = "new" | "warming" | "trusted" | "champion";
export type InfluenceLevel = "low" | "medium" | "high";
export type Responsiveness = "unknown" | "slow" | "steady" | "high";

export type RelationshipNode = {
  id: string;
  contactId: string;
  email: string;
  displayName: string;
  kinds: RelationshipKind[];
  countySlug?: string;
  trustLevel: TrustLevel;
  influenceLevel: InfluenceLevel;
  responsiveness: Responsiveness;
  engagementScore: number;
  strengthScore: number;
  burnoutRisk: "low" | "medium" | "high";
  followUpNeeded: boolean;
  lastTouchAt?: string;
  eventParticipationCount: number;
  sendCount: number;
  suppressed: boolean;
  notes: string[];
};

export type RelationshipEdge = {
  fromId: string;
  toId: string;
  label: string;
  strength: number;
};

export type RelationshipGraph = {
  generatedAt: string;
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
  summary: {
    totalContacts: number;
    volunteers: number;
    hosts: number;
    countyLeaders: number;
    highBurnoutRisk: number;
    followUpOverdue: number;
    inactiveSupporters: number;
  };
};

export type RelationshipHealthBrief = {
  headline: string;
  topPriorities: string[];
  relationshipWarnings: string[];
  engagementHighlights: string[];
};
