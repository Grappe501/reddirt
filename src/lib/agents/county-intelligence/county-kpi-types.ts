export type CountyKpiSource =
  | "county-workbench-csv"
  | "county-workbench-json"
  | "planning-estimate"
  | "campaign-os"
  | "canonical-db"
  | "not-connected";

export type CanonicalRegistrationGoalStatus =
  | "live"
  | "not_set"
  | "not_connected"
  | "db_unavailable"
  | "unverified_sync_context";

export type CountyDeploymentReadiness =
  | "DEPLOYMENT_READY"
  | "INTERNAL_PLANNING_ONLY"
  | "SHELL_ONLY"
  | "BLOCKED";

export type CountyWorkbenchCountyRef = {
  countySlug: string;
  countyName: string;
  regionSlug: string;
  workbenchDepth: "full" | "shell";
  hasCountyProfile: boolean;
  dataQualityScore: number;
  sourceCoverageScore: number;
  completionPercent: number;
};

export type CountyNormalizedKpi = {
  countySlug: string;
  countyName: string;
  regionSlug: string;
  /** @deprecated Use canonicalRegistrationGoal — kept null unless canonical DB value present. */
  registrationGoal: number | null;
  /** Canonical campaign registration target from CountyCampaignStats.registrationGoal (read-only). */
  canonicalRegistrationGoal: number | null;
  canonicalRegistrationGoalStatus: CanonicalRegistrationGoalStatus;
  canonicalRegistrationGoalSource: "CountyCampaignStats" | null;
  /** 2022 Gov vote-share planning proxy — NOT a registration goal. */
  planningVoteTargetProxy: number | null;
  planningVoteTargetSource: "arkansasStateAlignedTargets2022" | null;
  registrationCurrent: number | null;
  registrationProgress: number | null;
  voterContactGoal: number | null;
  voterContactCurrent: number | null;
  powerOfFiveGoal: number | null;
  powerOfFiveCurrent: number | null;
  volunteerGoal: number | null;
  volunteerCurrent: number | null;
  eventGoal: number | null;
  eventCurrent: number | null;
  donationGoal: number | null;
  donationCurrent: number | null;
  countyReadinessScore: number;
  fieldStrengthScore: number;
  persuasionOpportunityScore: number;
  turnoutRiskScore: number;
  topWeaknesses: string[];
  topOpportunities: string[];
  recommendedActions: string[];
  sourceLinks: { label: string; href: string }[];
  goalSource: CountyKpiSource;
  deploymentReadiness: CountyDeploymentReadiness;
  notes: string[];
};

export type CountyReadinessClassification = {
  countySlug: string;
  countyName: string;
  deploymentReadiness: CountyDeploymentReadiness;
  dashboardStatus: string;
  briefStatus: string;
  dataQuality: string;
  goalSourceStatus: string;
  eventCalendarReadiness: string;
  fieldPlanReadiness: string;
  aiRecommendationReadiness: string;
  biggestBlocker: string;
  humanVerifyBeforeDeploy: string[];
};

export type CountyIntelligenceSummary = {
  county: CountyNormalizedKpi;
  whyHere: string[];
  eventGoals: string[];
  outreachFocus: string[];
  followUpActions: string[];
  kellyTalkingPoints: string[];
  recruitTargets: string[];
};

export type StatewideCountyIntelligence = {
  generatedAt: string;
  bridgeAvailable: boolean;
  statewideRegistrationGoal: number;
  statewidePowerOfFiveGoal: number;
  counties: CountyNormalizedKpi[];
  weakCounties: CountyNormalizedKpi[];
  opportunityCounties: CountyNormalizedKpi[];
  topAttention: CountyNormalizedKpi[];
  heatList: { countySlug: string; countyName: string; priorityScore: number; reason: string }[];
  recommendedStateActions: string[];
};

export type CountyActionPlan = {
  countySlug: string;
  countyName: string;
  priority: "critical" | "high" | "medium" | "low";
  actions: string[];
  eventRecommendations: string[];
  powerOfFiveRecommendations: string[];
  volunteerRecommendations: string[];
  fieldManagerNotes: string[];
};

export type PowerOfFiveCountySummary = {
  countySlug: string;
  countyName: string;
  goal: number | null;
  current: number | null;
  gap: number | null;
  progressPercent: number | null;
  priority: "high" | "medium" | "low";
  recommendations: string[];
  source: CountyKpiSource;
};

export type CountyActionPackageType =
  | "county_recovery"
  | "county_growth"
  | "event_preparation"
  | "power_of_five_push"
  | "volunteer_recruitment"
  | "candidate_visit"
  | "post_event_followup";

export type CountyActionPackage = {
  id: string;
  type: CountyActionPackageType;
  countySlug: string;
  countyName: string;
  countySummary: string;
  topGoals: string[];
  topGaps: string[];
  powerOfFiveTarget: string;
  registrationTarget: string;
  volunteerNeed: string;
  eventRecommendation: string;
  communicationsRecommendation: string;
  fieldTaskList: string[];
  internTaskList: string[];
  candidateTalkingPoints: string[];
  followUpPlan: string[];
  routesToOpen: { label: string; href: string }[];
  priority: CountyActionPlan["priority"];
  generatedAt: string;
};

export type FieldManagerDailyCountyPlan = {
  date: string;
  topWeakCounties: { slug: string; name: string; reason: string }[];
  dailyFieldTasks: string[];
  powerOfFiveFocus: string[];
  volunteerGaps: string[];
  eventRecommendations: string[];
  routes: { label: string; href: string }[];
};

export type EventCountyPlanningGuidance = {
  countyName: string;
  whyCountyMatters: string[];
  eventPurpose: string[];
  powerOfFiveAsk: string[];
  volunteerRecruitmentAsk: string[];
  suggestedFollowUp: string[];
  candidateTalkingPoints: string[];
  candidateListeningPoints: string[];
  routes: { label: string; href: string }[];
};
