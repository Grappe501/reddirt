import type { HotWashIntelligenceData } from "./hot-wash-intelligence-types";
import type { HotWashNotes } from "../hot-wash-notes";

export function emptyHotWashIntelligence(): HotWashIntelligenceData {
  const empty = "";
  return {
    outcome: {
      attendanceEstimate: empty,
      audienceQuality: empty,
      persuasionQuality: empty,
      volunteerQuality: empty,
      donorQuality: empty,
      mediaOutcome: empty,
      energyScore: empty,
      candidatePerformance: empty,
      organizerPerformance: empty,
      strategicValue: empty,
    },
    lessons: {
      whatWorked: empty,
      whatFailed: empty,
      surprises: empty,
      timingIssues: empty,
      venueIssues: empty,
      messagingReactions: empty,
      volunteerObservations: empty,
      futureRecommendations: empty,
    },
    messaging: {
      strongestReactions: empty,
      applauseLines: empty,
      strongestIssues: empty,
      concernsRaised: empty,
      oppositionThemes: empty,
      localIssuePatterns: empty,
      emotionalTone: empty,
    },
    relationships: {
      newLeadersMet: empty,
      influentialAttendees: empty,
      volunteerProspects: empty,
      donorProspects: empty,
      coalitionOpportunities: empty,
      hostileAttendees: empty,
      followUpNeeds: empty,
    },
    countySignals: {
      enthusiasm: empty,
      turnoutPotential: empty,
      persuasionPotential: empty,
      organizationalStrength: empty,
      volunteerDepth: empty,
      issueEnvironment: empty,
      oppositionVisibility: empty,
    },
    followUp: {
      thankYouNeeded: empty,
      donorFollowUp: empty,
      volunteerOnboarding: empty,
      pressFollowUp: empty,
      hostFollowUp: empty,
      countyOrganizerTasks: empty,
      futureEventRecommendation: empty,
    },
    executiveSummary: "",
    topFindings: [],
    sectionCompleted: {},
  };
}

/** Merge legacy `_hotWash` notes into lessons without overwriting newer intel. */
export function migrateLegacyHotWashNotes(intel: HotWashIntelligenceData, legacy: HotWashNotes): HotWashIntelligenceData {
  const next = { ...intel, lessons: { ...intel.lessons } };
  if (!next.lessons.whatWorked && legacy.whatWorked) next.lessons.whatWorked = legacy.whatWorked;
  if (!next.lessons.whatFailed && legacy.whatDidNot) next.lessons.whatFailed = legacy.whatDidNot;
  if (!next.outcome.attendanceEstimate && legacy.crowdSize) next.outcome.attendanceEstimate = legacy.crowdSize;
  if (!next.relationships.followUpNeeds && legacy.followUpNeeds) next.relationships.followUpNeeds = legacy.followUpNeeds;
  if (!next.messaging.applauseLines && legacy.quotes) next.messaging.applauseLines = legacy.quotes;
  if (!next.lessons.futureRecommendations && legacy.countyLearnings) {
    next.lessons.futureRecommendations = legacy.countyLearnings;
  }
  const happened = legacy.whatHappened?.trim();
  if (happened && !next.executiveSummary) {
    next.executiveSummary = happened.slice(0, 500);
  }
  return next;
}
