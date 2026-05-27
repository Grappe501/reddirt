export type SimulationStatus = "PRESENT" | "MISSING" | "LOW_CONFIDENCE";

export type ScenarioLabel = "SCENARIO" | "FORECAST" | "MODEL";

export type CountyScenarioRegistryFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    scenarioId: string;
    scenarioLabel: ScenarioLabel;
    assumptions: string[];
    sourceLayers: string[];
    confidenceScore: number;
    readinessImpact: number;
    status: SimulationStatus;
  }>;
};

export type StatewideScenarioMatrixFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    baselineReadiness: number;
    projectedReadiness: number;
    interventionImpact: number;
    scenarioLabel: ScenarioLabel;
    confidenceScore: number;
    status: SimulationStatus;
  }>;
};

export type PathwaySensitivityModelFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    sensitivityFactors: Array<{
      factor: string;
      influence: number;
      scenarioLabel: ScenarioLabel;
    }>;
    confidenceScore: number;
    status: SimulationStatus;
  }>;
};

export type RegistrationGrowthScenariosFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    baselineRegistrations: number;
    projectedRegistrations: number;
    growthPercent: number;
    scenarioLabel: ScenarioLabel;
    assumptions: string[];
    confidenceScore: number;
    status: SimulationStatus;
  }>;
};

export type ResourceImpactModelsFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    staffingAdjustment: number;
    volunteerAdjustment: number;
    projectedOperationalImpact: number;
    scenarioLabel: ScenarioLabel;
    confidenceScore: number;
    status: SimulationStatus;
  }>;
};

export type EventImpactScenariosFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    eventExpansionLevel: number;
    projectedEngagementLift: number;
    projectedReadinessLift: number;
    scenarioLabel: ScenarioLabel;
    confidenceScore: number;
    status: SimulationStatus;
  }>;
};

export type TurnoutSensitivityModelsFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    baselineTurnout: number;
    projectedTurnout: number;
    turnoutDelta: number;
    scenarioLabel: ScenarioLabel;
    assumptions: string[];
    confidenceScore: number;
    status: SimulationStatus;
  }>;
};

export type SimulationEngineReadinessFile = {
  version: number;
  generatedAt: string;
  countyCount: number;
  rows: Array<{
    countySlug: string;
    countyName: string;
    scenarioRegistry: SimulationStatus;
    statewideMatrix: SimulationStatus;
    pathwaySensitivity: SimulationStatus;
    registrationScenarios: SimulationStatus;
    resourceImpact: SimulationStatus;
    eventImpact: SimulationStatus;
    turnoutSensitivity: SimulationStatus;
    simulationConfidence: number;
    assumptionsPresent: boolean;
    nextSafeModelingActions: string[];
  }>;
};

export type SimulationBrief = {
  countySlug: string;
  countyName: string;
  scenarioCards: string[];
  pathwaySensitivity: Array<{ factor: string; influence: number; label: ScenarioLabel }>;
  registrationProjection: string;
  turnoutScenario: string;
  readinessTrajectory: string;
  interventionImpactEstimate: string;
  simulationAssumptions: string[];
  confidenceScore: number;
  scenarioRiskIndicators: string[];
  recommendedSafeOperatorActions: string[];
  sourceLayers: string[];
};

