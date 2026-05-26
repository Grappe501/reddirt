export type ResourceStatus = "PRESENT" | "MISSING" | "NEEDS_REVIEW";

export type ForecastConfidence = "LOW" | "MEDIUM" | "HIGH";

export type ForecastSignal = {
  label: string;
  forecastType: "FORECAST" | "SCENARIO";
  confidence: ForecastConfidence;
  score: number;
  sourceLayers: string[];
  note: string;
};

export type CountyResourceAllocationRow = {
  countySlug: string;
  countyName: string;
  fips: string;
  volunteerCapacity: number;
  leadershipAvailability: number;
  eventCoverage: number;
  travelBurden: number;
  staffingGaps: number;
  organizationalHealth: number;
  operationalFragility: number;
  dataConfidence: number;
  registrationMomentum: number;
  civicEngagement: number;
  eventDensity: number;
  fieldDeploymentNeed: number;
  candidateVisitDemand: number;
  visibilityGaps: number;
  materialReadiness: number;
  regionalDependencies: number;
  countySupportBurden: number;
  statewideOperationalImportance: number;
  sourceLayers: string[];
};

export type ResourceAllocationModelFile = {
  version: number;
  generatedAt: string;
  rows: CountyResourceAllocationRow[];
};

export type CandidateTimeAllocationFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    suggestedHoursPerMonth: number;
    reason: string;
    sourceLayers: string[];
  }>;
};

export type FieldCoverageReadinessFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    coverageStatus: ResourceStatus;
    fieldCoverageScore: number;
    staffingGapScore: number;
    sourceLayers: string[];
  }>;
};

export type CountyResourcePressureFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    pressureScore: number;
    pressureBand: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    sourceLayers: string[];
  }>;
};

export type EventROIModelFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    eventROI: number;
    roiBand: "LOW" | "MEDIUM" | "HIGH";
    sourceLayers: string[];
  }>;
};

export type TravelPriorityMapFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    travelPriorityScore: number;
    travelBand: "LOW" | "MEDIUM" | "HIGH";
    sourceLayers: string[];
  }>;
};

export type ResourceAllocationReadinessFile = {
  version: number;
  generatedAt: string;
  countyCount: number;
  rows: Array<{
    countySlug: string;
    countyName: string;
    resourceModel: ResourceStatus;
    candidateTimeModel: ResourceStatus;
    fieldCoverageModel: ResourceStatus;
    pressureModel: ResourceStatus;
    eventROIModel: ResourceStatus;
    travelPriorityModel: ResourceStatus;
    forecastCoverage: ResourceStatus;
    dataConfidence: number;
    nextSafeDataActions: string[];
  }>;
};

export type CountyResourceAllocationBrief = {
  countySlug: string;
  countyName: string;
  operationalHealth: number;
  resourcePressure: number;
  volunteerCapacity: number;
  travelBurden: number;
  countyMomentum: ForecastSignal;
  burnoutRisk: ForecastSignal;
  interventionUrgency: ForecastSignal;
  eventROISummary: string;
  staffingGaps: number;
  operationalConfidenceScore: number;
  recommendedSafeOperatorActions: string[];
  sourceLayers: string[];
};

