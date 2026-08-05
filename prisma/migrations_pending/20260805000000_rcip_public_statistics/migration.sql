-- RCIP Phase 1 — additive public_statistics schema
-- DO NOT apply to hosted production without operator confirmation + diagnose.
-- Rollback: DROP SCHEMA public_statistics CASCADE; (only if no approved consumers depend on it)

CREATE SCHEMA IF NOT EXISTS public_statistics;

CREATE TABLE IF NOT EXISTS public_statistics.sources (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  agency_name TEXT NOT NULL,
  agency_abbreviation TEXT NOT NULL,
  official_homepage TEXT,
  api_documentation_url TEXT,
  methodology_url TEXT,
  jurisdiction TEXT,
  source_classification TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_statistics.datasets (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES public_statistics.sources(id),
  agency_dataset_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  geographic_levels TEXT[] DEFAULT ARRAY[]::TEXT[],
  population_universe TEXT,
  seasonal_adjustment_support BOOLEAN,
  revision_behavior TEXT,
  official_documentation_url TEXT,
  first_available_period TEXT,
  latest_known_period TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_statistics.series (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL REFERENCES public_statistics.datasets(id),
  agency_series_code TEXT NOT NULL,
  title TEXT NOT NULL,
  technical_definition TEXT,
  public_definition TEXT,
  unit TEXT,
  frequency TEXT,
  seasonal_adjustment_status TEXT,
  estimate_type TEXT,
  margin_of_error_support BOOLEAN,
  geographic_requirement TEXT,
  numerator_definition TEXT,
  denominator_definition TEXT,
  calculation_method TEXT,
  source_priority INT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_statistics.geographies (
  id TEXT PRIMARY KEY,
  geography_type TEXT NOT NULL,
  name TEXT NOT NULL,
  state_code TEXT,
  county_code TEXT,
  fips TEXT,
  census_geoid TEXT,
  parent_geography_id TEXT,
  valid_from DATE,
  valid_to DATE,
  geometry_ref TEXT,
  source_system_mappings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_statistics.releases (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL REFERENCES public_statistics.datasets(id),
  release_date DATE,
  reference_period TEXT,
  publication_status TEXT,
  preliminary_final_revised TEXT,
  source_url TEXT,
  retrieval_timestamp TIMESTAMPTZ,
  checksum TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public_statistics.source_queries (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES public_statistics.sources(id),
  dataset_id TEXT,
  endpoint TEXT NOT NULL,
  safe_query_parameters JSONB NOT NULL,
  secret_free_canonical_query TEXT NOT NULL,
  request_timestamp TIMESTAMPTZ NOT NULL,
  response_status INT,
  response_checksum TEXT,
  raw_response_location TEXT,
  row_count INT,
  retry_count INT,
  ingestion_run_id TEXT
);

CREATE TABLE IF NOT EXISTS public_statistics.ingestion_runs (
  id TEXT PRIMARY KEY,
  connector TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  environment_classification TEXT,
  status TEXT NOT NULL,
  requested_series JSONB,
  requested_geographies JSONB,
  inserted_observations INT DEFAULT 0,
  updated_observations INT DEFAULT 0,
  rejected_observations INT DEFAULT 0,
  warnings JSONB,
  errors JSONB,
  software_commit TEXT,
  operator_or_schedule TEXT
);

CREATE TABLE IF NOT EXISTS public_statistics.observations (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL REFERENCES public_statistics.series(id),
  geography_id TEXT NOT NULL REFERENCES public_statistics.geographies(id),
  period TEXT NOT NULL,
  value DOUBLE PRECISION,
  text_value TEXT,
  margin_of_error DOUBLE PRECISION,
  unit TEXT,
  release_id TEXT REFERENCES public_statistics.releases(id),
  status TEXT,
  source_query_id TEXT REFERENCES public_statistics.source_queries(id),
  retrieved_timestamp TIMESTAMPTZ,
  revised_from_observation_id TEXT,
  validation_status TEXT,
  UNIQUE (series_id, geography_id, period, release_id)
);

CREATE TABLE IF NOT EXISTS public_statistics.revisions (
  id TEXT PRIMARY KEY,
  old_observation_id TEXT NOT NULL REFERENCES public_statistics.observations(id),
  new_observation_id TEXT NOT NULL REFERENCES public_statistics.observations(id),
  reason TEXT,
  source_release TEXT,
  detected_timestamp TIMESTAMPTZ NOT NULL,
  materiality TEXT,
  public_impact_status TEXT
);

CREATE TABLE IF NOT EXISTS public_statistics.metric_mappings (
  id TEXT PRIMARY KEY,
  consumer_system TEXT NOT NULL,
  consumer_metric_id TEXT NOT NULL,
  canonical_series_id TEXT NOT NULL REFERENCES public_statistics.series(id),
  geography_rules JSONB,
  calculation_rules JSONB,
  preferred_source TEXT,
  corroborating_source_ids JSONB,
  reference_year_policy TEXT,
  freshness_requirement TEXT,
  output_format TEXT,
  approval_status TEXT
);

CREATE TABLE IF NOT EXISTS public_statistics.cross_checks (
  id TEXT PRIMARY KEY,
  subject_metric TEXT NOT NULL,
  primary_observation_id TEXT,
  corroborating_observation_id TEXT,
  comparison_method TEXT,
  definition_compatibility TEXT,
  period_compatibility TEXT,
  geography_compatibility TEXT,
  variance DOUBLE PRECISION,
  tolerance DOUBLE PRECISION,
  status TEXT,
  explanation TEXT,
  confidence_effect TEXT,
  reviewed_timestamp TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public_statistics.exports (
  id TEXT PRIMARY KEY,
  consumer TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  generated_timestamp TIMESTAMPTZ NOT NULL,
  generating_commit TEXT,
  source_run_ids JSONB,
  series_count INT,
  observation_count INT,
  geography_count INT,
  validation_status TEXT,
  checksum TEXT,
  export_path TEXT,
  imported_commit TEXT,
  status TEXT
);

-- Future-ready read-only role (create only when operator approves):
-- CREATE ROLE cc_public_statistics_reader NOINHERIT;
-- GRANT USAGE ON SCHEMA public_statistics TO cc_public_statistics_reader;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public_statistics TO cc_public_statistics_reader;
