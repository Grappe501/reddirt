export const CC_EXPORT_CONTRACT_VERSION = "1.0" as const;

export type CcExportManifestV1 = {
  contract_version: typeof CC_EXPORT_CONTRACT_VERSION;
  export_id: string;
  generated_at: string;
  consumer: "constitutional_capitalism";
  generator_repository: "RedDirt";
  generator_commit: string | null;
  source_agencies: string[];
  dataset_versions: string[];
  series_count: number;
  observation_count: number;
  geography_count: number;
  minimum_reference_period: string | null;
  maximum_reference_period: string | null;
  validation_status: "pending" | "passed" | "failed";
  cross_check_status: "pending" | "passed" | "failed" | "partial";
  contains_private_data: false;
  checksum: string;
};

export type CcBaselineMetricV1 = {
  consumer_metric_id: string;
  title: string;
  value: number | null;
  unit: string;
  reference_period: string;
  geography_id: string;
  geography_name: string;
  source_agency: string;
  dataset: string;
  series_code: string;
  definition: string;
  limitations: string[];
  margin_of_error: number | null;
  confidence: string;
  cross_check_status: string;
  official_source_url: string;
  reddirt_observation_id: string;
  reddirt_export_id: string;
  reddirt_source_query_id: string;
  reddirt_ingestion_run_id: string;
};
