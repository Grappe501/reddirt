/** Sprint 7 — post-event intelligence review (stored as factCard._hotWashIntelligence). */

export type HotWashOutcomeSummary = {
  attendanceEstimate: string;
  audienceQuality: string;
  persuasionQuality: string;
  volunteerQuality: string;
  donorQuality: string;
  mediaOutcome: string;
  energyScore: string;
  candidatePerformance: string;
  organizerPerformance: string;
  strategicValue: string;
};

export type HotWashLessons = {
  whatWorked: string;
  whatFailed: string;
  surprises: string;
  timingIssues: string;
  venueIssues: string;
  messagingReactions: string;
  volunteerObservations: string;
  futureRecommendations: string;
};

export type HotWashMessagingIntel = {
  strongestReactions: string;
  applauseLines: string;
  strongestIssues: string;
  concernsRaised: string;
  oppositionThemes: string;
  localIssuePatterns: string;
  emotionalTone: string;
};

export type HotWashRelationshipIntel = {
  newLeadersMet: string;
  influentialAttendees: string;
  volunteerProspects: string;
  donorProspects: string;
  coalitionOpportunities: string;
  hostileAttendees: string;
  followUpNeeds: string;
};

export type HotWashCountySignals = {
  enthusiasm: string;
  turnoutPotential: string;
  persuasionPotential: string;
  organizationalStrength: string;
  volunteerDepth: string;
  issueEnvironment: string;
  oppositionVisibility: string;
};

export type HotWashFollowUp = {
  thankYouNeeded: string;
  donorFollowUp: string;
  volunteerOnboarding: string;
  pressFollowUp: string;
  hostFollowUp: string;
  countyOrganizerTasks: string;
  futureEventRecommendation: string;
};

export type HotWashIntelligenceSectionId =
  | "outcome"
  | "lessons"
  | "messaging"
  | "relationships"
  | "county_signals"
  | "follow_up";

export type HotWashIntelligenceData = {
  outcome: HotWashOutcomeSummary;
  lessons: HotWashLessons;
  messaging: HotWashMessagingIntel;
  relationships: HotWashRelationshipIntel;
  countySignals: HotWashCountySignals;
  followUp: HotWashFollowUp;
  /** Deterministic AI summary — human review before treating as truth */
  executiveSummary: string;
  topFindings: string[];
  sectionCompleted: Partial<Record<HotWashIntelligenceSectionId, boolean>>;
  completedAt?: string;
  updatedAt?: string;
};
