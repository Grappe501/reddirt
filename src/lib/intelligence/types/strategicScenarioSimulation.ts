/** NSI-14 strategic forecasting + scenario simulation types — governed, explainable, no voter-level scoring. */

export const SCENARIO_GOVERNANCE_LABEL =
  "SCENARIO_MODEL · INTERNAL_ONLY · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED";

export type StrategicScenarioType =
  | "OPPONENT_RESPONSE"
  | "NARRATIVE_COLLISION"
  | "DEBATE"
  | "MEDIA_ESCALATION"
  | "COUNTY_REACTION"
  | "TURNOUT_REGISTRATION";

export type StrategicScenarioSignal =
  | "SCENARIO_LOW_RISK"
  | "SCENARIO_MODERATE_RISK"
  | "SCENARIO_HIGH_RISK"
  | "SCENARIO_OPPORTUNITY"
  | "SCENARIO_FRAGILE"
  | "SCENARIO_OVEREXPOSED"
  | "SCENARIO_UNDERDEVELOPED"
  | "SCENARIO_COLLISION"
  | "SCENARIO_MEDIA_AMPLIFICATION"
  | "SCENARIO_DEBATE_TRAP"
  | "SCENARIO_FIELD_CAPACITY_RISK";

export type StrategicScenarioConfidenceBand = "LOW" | "MODERATE" | "HIGH";

export type StrategicScenarioRegistryEntry = {
  scenarioId: string;
  scenarioType: StrategicScenarioType;
  title: string;
  description: string;
  linkedNarratives: string[];
  linkedCounties: string[];
  linkedBills: string[];
  linkedDoctrines: string[];
  linkedCitations: string[];
  linkedExports: string[];
  linkedMediaMarkets: string[];
  assumptions: string[];
  evidenceDependencies: string[];
  riskFactors: string[];
  opportunityFactors: string[];
  simulationStatus: "SEEDED" | "ACTIVE" | "ARCHIVED";
  confidenceBand: StrategicScenarioConfidenceBand;
  humanReviewRequired: true;
};

export type StrategicScenarioRegistry = {
  version: number;
  generatedAt: string;
  purpose: string;
  governanceDefaults: {
    publicationSafety: "NON_PUBLISHABLE";
    humanReviewRequired: true;
    scenarioModelLabel: typeof SCENARIO_GOVERNANCE_LABEL;
    autonomousMutation: false;
  };
  scenarios: StrategicScenarioRegistryEntry[];
};

export type StrategicScenarioSimulationResult = {
  scenarioId: string;
  scenarioType: StrategicScenarioType;
  title: string;
  primarySignal: StrategicScenarioSignal;
  signals: StrategicScenarioSignal[];
  reasons: string[];
  riskScore: number;
  opportunityScore: number;
  confidenceBand: StrategicScenarioConfidenceBand;
  evidenceBlockers: string[];
  doctrineWarnings: string[];
  whatToWatchNext: string[];
  whatNotToDo: string[];
  linkedNarratives: string[];
  linkedCounties: string[];
  linkedBills: string[];
  linkedCitations: string[];
  linkedMediaMarkets: string[];
  linkedDoctrines: string[];
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  scenarioModelLabel: typeof SCENARIO_GOVERNANCE_LABEL;
  recommendedHumanAction: string;
  escalationPath: string;
  evidenceBlockerAction: string;
  debatePrepAction: string;
  mediaMonitoringAction: string;
  countyBriefingAction: string;
};

export type StrategicScenarioSimulationSummary = {
  generatedAt: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  scenarioModelLabel: typeof SCENARIO_GOVERNANCE_LABEL;
  totalScenarios: number;
  byType: Record<StrategicScenarioType, number>;
  highestRisk: StrategicScenarioSimulationResult[];
  strongestOpportunity: StrategicScenarioSimulationResult[];
  debateTraps: StrategicScenarioSimulationResult[];
  mediaEscalationWarnings: StrategicScenarioSimulationResult[];
  countyReactionScenarios: StrategicScenarioSimulationResult[];
  turnoutRegistrationScenarios: StrategicScenarioSimulationResult[];
  narrativeCollisionWarnings: StrategicScenarioSimulationResult[];
  fieldCapacityRisks: StrategicScenarioSimulationResult[];
  evidenceDependencyBlockers: string[];
  doctrineAlignmentWarnings: string[];
  recommendedHumanReviewActions: string[];
  topScenarioWatchlist: StrategicScenarioSimulationResult[];
  registrationAssumptionNotes: string[];
  allResults: StrategicScenarioSimulationResult[];
};

export type ScenarioHumanActionHints = {
  recommendedHumanAction: string;
  escalationPath: string;
  evidenceBlockerAction: string;
  debatePrepAction: string;
  mediaMonitoringAction: string;
  countyBriefingAction: string;
};

export type CountyScenarioWatchSummary = {
  countyId: string;
  countyName: string;
  likelyOpponentFrames: string[];
  mediaEscalationRisks: string[];
  narrativeCollisionRisks: string[];
  turnoutRegistrationNotes: string[];
  fieldCapacityRisks: string[];
  evidenceBlockers: string[];
  whatToWatch: string[];
};

export type DebateScenarioPrepSummary = {
  likelyOpponentAttacks: string[];
  doctrineSafeResponseNotes: string[];
  debateTrapWarnings: string[];
  evidenceDependencies: string[];
  weakCitationWarnings: string[];
  countySensitiveNotes: string[];
  bridgeLineGuidance: string[];
  whatNotToSay: string[];
};
