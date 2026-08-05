export type ConnectorValidation = {
  ok: boolean;
  source: string;
  keyPresent: boolean;
  warnings: string[];
  errors: string[];
};

export type DatasetDescriptor = {
  code: string;
  title: string;
  frequency: string;
  documentationUrl: string;
};

export type PublicStatisticsRequest = {
  dataset: string;
  variablesOrSeries: string[];
  geography: string;
  period: string;
  consumerMetricId?: string;
};

export type RawStatisticsResponse = {
  source: string;
  endpoint: string;
  safeParams: Record<string, string>;
  retrievedAt: string;
  status: number;
  mimeType: string;
  bodyText: string;
  checksum: string;
  retryCount: number;
  rawPath?: string;
};

export type NormalizedObservation = {
  seriesCode: string;
  seriesTitle: string;
  geographyId: string;
  geographyType: string;
  geographyName: string;
  period: string;
  value: number | null;
  textValue?: string | null;
  marginOfError?: number | null;
  unit: string;
  seasonalAdjustment?: string | null;
  estimateType: string;
  consumerMetricId?: string;
  definition: string;
  limitations: string[];
};

export type NormalizedStatisticsBatch = {
  source: string;
  dataset: string;
  observations: NormalizedObservation[];
  warnings: string[];
};

export type ConfidenceLevel =
  | "verified_primary"
  | "verified_with_corroboration"
  | "verified_with_limitations"
  | "provisional"
  | "conflicting_sources"
  | "stale"
  | "unsupported";

export type CompatibilityStatus =
  | "directly_comparable"
  | "conceptually_related"
  | "not_comparable"
  | "period_mismatch"
  | "geography_mismatch"
  | "definition_mismatch"
  | "requires_review";

export type CrossCheckOutcome =
  | "confirmed"
  | "within_expected_variance"
  | "material_difference"
  | "conflict"
  | "insufficient_data"
  | "not_applicable";

export type WarehouseObservation = NormalizedObservation & {
  observationId: string;
  sourceId: string;
  datasetId: string;
  releaseId: string;
  sourceQueryId: string;
  ingestionRunId: string;
  validationStatus: "accepted" | "rejected" | "pending";
  confidence: ConfidenceLevel;
  retrievedAt: string;
  revisedFromObservationId?: string | null;
};

export type SourceQueryRecord = {
  queryId: string;
  sourceId: string;
  datasetId: string;
  endpoint: string;
  safeParams: Record<string, string>;
  canonicalQuery: string;
  requestTimestamp: string;
  responseStatus: number;
  responseChecksum: string;
  rawResponseLocation: string | null;
  rowCount: number;
  retryCount: number;
  ingestionRunId: string;
};

export type IngestionRunRecord = {
  runId: string;
  connector: string;
  startedAt: string;
  completedAt: string | null;
  environment: string;
  status: "running" | "succeeded" | "failed" | "partial";
  requestedSeries: string[];
  requestedGeographies: string[];
  insertedObservations: number;
  updatedObservations: number;
  rejectedObservations: number;
  warnings: string[];
  errors: string[];
  softwareCommit: string | null;
  operator: string;
};

export type CrossCheckRecord = {
  crossCheckId: string;
  subjectMetric: string;
  primaryObservationId: string | null;
  corroboratingObservationId: string | null;
  comparisonMethod: string;
  definitionCompatibility: CompatibilityStatus;
  periodCompatibility: CompatibilityStatus;
  geographyCompatibility: CompatibilityStatus;
  variance: number | null;
  tolerance: number | null;
  status: CrossCheckOutcome;
  explanation: string;
  confidenceEffect: string;
  reviewedAt: string;
};

export type FileWarehouse = {
  version: string;
  sources: Record<string, unknown>[];
  datasets: Record<string, unknown>[];
  series: Record<string, unknown>[];
  geographies: Record<string, unknown>[];
  releases: Record<string, unknown>[];
  observations: WarehouseObservation[];
  sourceQueries: SourceQueryRecord[];
  ingestionRuns: IngestionRunRecord[];
  revisions: Record<string, unknown>[];
  metricMappings: Record<string, unknown>[];
  crossChecks: CrossCheckRecord[];
  exports: Record<string, unknown>[];
};
