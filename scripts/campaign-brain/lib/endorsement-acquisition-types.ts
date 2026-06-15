/** Phase 15 — Endorsement Strategy & Acquisition types. */

export type EndorsementTier = 1 | 2 | 3 | 4 | 5;

export type EndorsementTierLabel =
  | "institutional"
  | "current_elected"
  | "former_elected"
  | "community_influencer"
  | "candidate_partnership";

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

export type EndorsementValueScores = {
  credibility: number;
  volunteerActivation: number;
  donorActivation: number;
  networkAccess: number;
  voterPersuasion: number;
};

export type EndorsementPipeline = {
  requested: boolean;
  meetingScheduled: boolean;
  presentationGiven: boolean;
  decisionDate: string | null;
  endorsed: boolean;
  declined: boolean;
  followUp: boolean;
};

/** Shared on every leader / coalition record. */
export type EndorsementTracking = {
  endorsementRequested: boolean;
  endorsementStatus: EndorsementStatus;
  endorsementActivationLevel: EndorsementActivationLevel;
};

export type EndorsementTarget = {
  id: string;
  name: string;
  organization: string;
  tier: EndorsementTier;
  tierLabel: EndorsementTierLabel;
  category: string;
  county: string;
  endorsementRequested: boolean;
  endorsementStatus: EndorsementStatus;
  endorsementActivationLevel: EndorsementActivationLevel;
  valueScores: EndorsementValueScores;
  pipeline: EndorsementPipeline;
  volunteerLeadsGenerated: number;
  donorLeadsGenerated: number;
  source: string;
};

export type EndorsementScorecard = {
  version: number;
  generatedAt: string;
  heroLine: string;
  requested: number;
  meetingsScheduled: number;
  presentationsGiven: number;
  endorsed: number;
  declined: number;
  pending: number;
  byTier: Record<string, number>;
  institutional: { labor: number; teacher: number; civilRights: number; total: number };
  currentOfficials: number;
  formerOfficials: number;
  communityLeaders: number;
  candidatePartnerships: number;
  volunteerLeadsGenerated: number;
  donorLeadsGenerated: number;
  activated: number;
};
