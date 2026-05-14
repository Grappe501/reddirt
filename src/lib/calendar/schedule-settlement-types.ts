/** Kelly “schedule settlement mode” — types for dashboard + AI + staged actions. */

export type ScheduleSettlementRecommendation = {
  recommendedPlanId: string;
  recommendation: "approve" | "approve_with_changes" | "hold" | "split_with_local" | "needs_staff_work";
  headline: string;
  why: string[];
  risks: string[];
  changesNeeded: string[];
  sendLocalSuggestions: Array<{
    eventId: string;
    reason: string;
  }>;
  staffCallsNeeded: Array<{
    county?: string;
    eventId?: string;
    task: string;
  }>;
  pressOpportunities: Array<{
    eventId: string;
    recommendation: "yes" | "maybe" | "staff_decide";
    reason: string;
  }>;
};

export type SettlementSnapshot = {
  confirmedThisWeek: number;
  tentativeThisWeek: number;
  travelBlocksThisWeek: number;
  overnightsThisWeek: number;
  conflictsThisWeek: number;
  workExceptionsThisWeek: number;
  googleSyncedApprox: number;
  googleNeedsAttentionApprox: number;
  /** Items in settlement approval queue (next 14 days, capped). */
  pendingDecisionsApprox: number;
};

export type DecisionTonightItem = {
  id: string;
  label: string;
  hint?: string;
  kind: "route" | "week" | "weekend" | "event" | "county" | "staff" | "fair";
  /** Optional calendar item id, weekend plan id, or county name */
  targetId?: string;
};

export type RouteComparisonOption = {
  id: string;
  label: string;
  counties: string[];
  eventTitles: string[];
  driveMinutes: number | null;
  driveMiles: number | null;
  overnights: string[];
  conflicts: number;
  riskLabel: string;
  aiRecommendation: string;
};

export type RouteComparisonThree = {
  optionA: RouteComparisonOption;
  optionB: RouteComparisonOption;
  optionC: RouteComparisonOption;
};

export type DaySegmentPreview = {
  segment: "morning" | "lunch" | "afternoon" | "evening" | "travel" | "overnight";
  bufferMinutes: number;
  notes: string;
};

export type ScheduleSettlementStagedEntry = {
  id: string;
  createdAt: string;
  action: string;
  planId?: string;
  calendarItemId?: string;
  notes?: string;
};

export type ScheduleSettlementStagedFile = {
  version: 1;
  entries: ScheduleSettlementStagedEntry[];
};
