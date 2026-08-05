import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { scanExportPayload } from "../src/lib/civic-intelligence/exports/privacyScan";
import { buildCcExportFiles } from "../src/lib/civic-intelligence/exports/ccExport";
import { runPhase1CrossChecks } from "../src/lib/civic-intelligence/cross-checks/engine";
import type { FileWarehouse, WarehouseObservation } from "../src/lib/civic-intelligence/types";
import { createCensusConnector } from "../src/lib/civic-intelligence/connectors/census";
import { createBlsConnector } from "../src/lib/civic-intelligence/connectors/bls";

function sampleObs(partial: Partial<WarehouseObservation>): WarehouseObservation {
  return {
    observationId: partial.observationId || "obs_1",
    sourceId: partial.sourceId || "census",
    datasetId: partial.datasetId || "acs5",
    releaseId: partial.releaseId || "rel_1",
    sourceQueryId: partial.sourceQueryId || "qry_1",
    ingestionRunId: partial.ingestionRunId || "run_1",
    validationStatus: "accepted",
    confidence: "verified_primary",
    retrievedAt: new Date().toISOString(),
    seriesCode: partial.seriesCode || "B01003_001E",
    seriesTitle: partial.seriesTitle || "Population",
    geographyId: partial.geographyId || "geo:us",
    geographyType: partial.geographyType || "nation",
    geographyName: partial.geographyName || "United States",
    period: partial.period || "2022",
    value: partial.value ?? 100,
    marginOfError: partial.marginOfError ?? 1,
    unit: "persons",
    estimateType: "acs5_estimate",
    consumerMetricId: partial.consumerMetricId,
    definition: "test",
    limitations: ["test limitation"],
    revisedFromObservationId: null,
  };
}

async function main() {
  // Connector config fail-closed without keys
  const prevCensus = process.env.CENSUS_API_KEY;
  const prevBls = process.env.BLS_API_KEY;
  delete process.env.CENSUS_API_KEY;
  delete process.env.BLS_API_KEY;
  const census = createCensusConnector({ rawRoot: "H:/SOSWebsite/RedDirt/data/public-statistics/raw", commit: null });
  const bls = createBlsConnector({ rawRoot: "H:/SOSWebsite/RedDirt/data/public-statistics/raw", commit: null });
  assert.equal((await census.validateConfiguration()).ok, false);
  assert.equal((await bls.validateConfiguration()).ok, false);

  // Census normalize header/value
  const normalized = await census.normalize({
    source: "census",
    endpoint: "https://api.census.gov/data/2022/acs/acs5",
    safeParams: { get: "NAME,B01003_001E,B01003_001M", for: "state:05", year: "2022", dataset: "acs5" },
    retrievedAt: new Date().toISOString(),
    status: 200,
    mimeType: "application/json",
    bodyText: JSON.stringify([
      ["NAME", "B01003_001E", "B01003_001M", "state"],
      ["Arkansas", "3011524", "123", "05"],
    ]),
    checksum: createHash("sha256").update("x").digest("hex"),
    retryCount: 0,
  });
  assert.equal(normalized.observations.length, 1);
  assert.equal(normalized.observations[0].value, 3011524);
  assert.equal(normalized.observations[0].marginOfError, 123);

  // Privacy scan rejects private fields
  const bad = scanExportPayload({
    "manifest.json": { contains_private_data: false },
    "national-baseline.json": { email: "x@y.com" },
    "arkansas-baseline.json": { metrics: [] },
    "county-baselines.json": { metrics: [] },
    "series-metadata.json": {},
    "source-registry.json": {},
    "source-citations.json": {},
    "cross-check-results.json": {},
    "limitations.json": {},
    "validation-report.json": {},
  });
  assert.equal(bad.ok, false);

  // Export builder + privacy allowlist
  const warehouse: FileWarehouse = {
    version: "1.0",
    sources: [],
    datasets: [],
    series: [],
    geographies: [],
    releases: [],
    observations: [
      sampleObs({
        consumerMetricId: "CC-BASELINE-POP-001",
        sourceQueryId: "qry_1",
        ingestionRunId: "run_1",
      }),
    ],
    sourceQueries: [
      {
        queryId: "qry_1",
        sourceId: "census",
        datasetId: "acs5",
        endpoint: "https://api.census.gov/data/2022/acs/acs5",
        safeParams: { get: "B01003_001E", for: "us:*", year: "2022" },
        canonicalQuery: "census|acs5|2022|B01003_001E|us:*",
        requestTimestamp: new Date().toISOString(),
        responseStatus: 200,
        responseChecksum: "abc",
        rawResponseLocation: null,
        rowCount: 1,
        retryCount: 0,
        ingestionRunId: "run_1",
      },
    ],
    ingestionRuns: [],
    revisions: [],
    metricMappings: [],
    crossChecks: [],
    exports: [],
  };
  const built = buildCcExportFiles({ warehouse, generatorCommit: "test" });
  assert.equal(built.privacyOk, true);
  assert.equal((built.files["manifest.json"] as { observation_count: number }).observation_count, 1);

  // Cross-check conceptually related
  const checks = runPhase1CrossChecks([
    sampleObs({
      observationId: "obs_acs",
      sourceId: "census",
      geographyId: "geo:us-ar",
      seriesCode: "S2301_C02_001E",
      consumerMetricId: "CC-BASELINE-LF-001",
      value: 58,
    }),
    sampleObs({
      observationId: "obs_bls",
      sourceId: "bls",
      datasetId: "laus",
      geographyId: "geo:us-ar",
      seriesCode: "LASST050000000000003",
      consumerMetricId: "CC-BASELINE-UNEMP-002",
      value: 3.5,
    }),
  ]);
  assert.equal(checks[0].definitionCompatibility, "conceptually_related");
  assert.equal(checks[0].status, "not_applicable");

  if (prevCensus !== undefined) process.env.CENSUS_API_KEY = prevCensus;
  if (prevBls !== undefined) process.env.BLS_API_KEY = prevBls;

  console.log("[OK] publicdata spine unit tests passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
