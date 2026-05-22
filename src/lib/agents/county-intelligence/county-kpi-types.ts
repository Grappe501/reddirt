export type CountyKpiSource = "county-workbench-csv" | "county-workbench-json" | "planning-estimate" | "campaign-os" | "not-connected";

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
  registrationGoal: number | null;
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
  notes: string[];
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
