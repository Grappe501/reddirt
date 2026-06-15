/**
 * Feedback loop types — event outcomes, captured opportunity, learning.
 */

export type EventOutcomeRecord = {
  eventId: string;
  title: string;
  county: string;
  eventDate?: string;
  /** Predicted score at time of recommendation */
  predictedScore: number;
  attended: boolean;
  estimatedAttendance?: number;
  newContacts?: number;
  volunteerSignups?: number;
  registrationFormsCompleted?: number;
  faithLeadersEngaged?: number;
  clerkRelationshipAdvanced?: boolean;
  /** Dollar amount raised at or attributed to this event */
  donationsGenerated?: number;
  /** Count of earned media hits, or URLs in notes */
  earnedMediaMentions?: number;
  earnedMediaGenerated?: boolean;
  notes?: string;
  recordedAt?: string;
  recordedBy?: string;
};

export type LaneCapture = {
  captured: number;
  goal: number;
  potential?: number;
};

export type CountyCapture = {
  capturedVci: number;
  byLane: {
    lane2: number;
    lane3: number;
    lane4: number;
  };
  notes?: string;
};

export type CapturedProgressFile = {
  version: number;
  lastUpdated?: string;
  note: string;
  statewide: {
    byLane: {
      lane1: LaneCapture;
      lane2: LaneCapture;
      lane3: LaneCapture;
      lane4: LaneCapture;
    };
  };
  byCounty: Record<string, CountyCapture>;
  byCluster: Record<string, { capturedVci: number; notes?: string }>;
};

/** Compute 0–100 actual outcome score from field metrics. */
export function actualOutcomeScore(o: EventOutcomeRecord): number {
  if (!o.attended) return 0;
  let score = 20;
  score += Math.min(20, (o.newContacts ?? 0) * 2);
  score += Math.min(25, (o.volunteerSignups ?? 0) * 5);
  score += Math.min(25, (o.registrationFormsCompleted ?? 0) * 8);
  score += Math.min(15, (o.faithLeadersEngaged ?? 0) * 10);
  if (o.clerkRelationshipAdvanced) score += 15;
  if (o.earnedMediaGenerated) score += 12;
  return Math.min(100, Math.round(score));
}

export function outcomeDelta(predicted: number, actual: number): number {
  return actual - predicted;
}

export function completionPct(captured: number, potential: number): number {
  if (potential <= 0) return 0;
  return Math.round((captured / potential) * 1000) / 10;
}
