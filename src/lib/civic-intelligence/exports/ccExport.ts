import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  CC_EXPORT_CONTRACT_VERSION,
  type CcBaselineMetricV1,
  type CcExportManifestV1,
} from "../contracts/constitutional-capitalism-export-v1";
import { scanExportPayload } from "./privacyScan";
import type { FileWarehouse } from "../types";
import { newId, recordExport } from "../repositories/fileWarehouse";

function checksumPayload(files: Record<string, unknown>): string {
  const ordered = Object.keys(files)
    .filter((k) => k !== "manifest.json")
    .sort()
    .map((k) => JSON.stringify(files[k]));
  return createHash("sha256").update(ordered.join("\n"), "utf8").digest("hex");
}

function agencyName(sourceId: string): string {
  if (sourceId === "census") return "United States Census Bureau";
  if (sourceId === "eia") return "U.S. Energy Information Administration";
  if (sourceId === "fdic") return "Federal Deposit Insurance Corporation";
  if (sourceId === "hrsa") return "Health Resources and Services Administration";
  if (sourceId === "fred") return "Federal Reserve Economic Data (FRED)";
  return "Bureau of Labor Statistics";
}

function officialUrl(source: string, _series: string): string {
  if (source === "census") return "https://api.census.gov/data.html";
  if (source === "eia") return "https://www.eia.gov/opendata/";
  if (source === "fdic") return "https://banks.data.fdic.gov/";
  if (source === "hrsa") return "https://data.hrsa.gov/";
  if (source === "fred") return "https://fred.stlouisfed.org/";
  return "https://www.bls.gov/data/";
}

export function buildCcExportFiles(opts: {
  warehouse: FileWarehouse;
  generatorCommit: string | null;
  exportId?: string;
}): { files: Record<string, unknown>; privacyOk: boolean; privacyErrors: string[] } {
  const exportId = opts.exportId || newId("exp");
  const accepted = opts.warehouse.observations.filter((o) => o.validationStatus === "accepted");
  const toMetric = (o: (typeof accepted)[number]): CcBaselineMetricV1 => ({
    consumer_metric_id: o.consumerMetricId || o.seriesCode,
    title: o.seriesTitle,
    value: o.value,
    unit: o.unit,
    reference_period: o.period,
    geography_id: o.geographyId,
    geography_name: o.geographyName,
    source_agency: agencyName(o.sourceId),
    dataset: o.datasetId,
    series_code: o.seriesCode,
    definition: o.definition,
    limitations: o.limitations,
    margin_of_error: o.marginOfError ?? null,
    confidence: o.confidence,
    cross_check_status:
      opts.warehouse.crossChecks.find((c) => c.primaryObservationId === o.observationId)?.status ||
      "not_applicable",
    official_source_url: officialUrl(o.sourceId, o.seriesCode),
    reddirt_observation_id: o.observationId,
    reddirt_export_id: exportId,
    reddirt_source_query_id: o.sourceQueryId,
    reddirt_ingestion_run_id: o.ingestionRunId,
  });

  const national = accepted.filter((o) => o.geographyType === "nation").map(toMetric);
  const arkansas = accepted.filter((o) => o.geographyId === "geo:us-ar").map(toMetric);
  const county = accepted.filter((o) => o.geographyType === "county").map(toMetric);

  const periods = accepted.map((o) => o.period).sort();
  const arrayKey = (o: (typeof accepted)[number]) =>
    `${o.consumerMetricId || o.seriesCode}|${o.seriesCode}|${o.geographyId}`;
  const arrayMap = new Map<
    string,
    {
      consumer_metric_id: string;
      series_code: string;
      geography_id: string;
      geography_name: string;
      dataset: string;
      source_agency: string;
      unit: string;
      points: Array<{ period: string; value: number | null; observation_id: string }>;
    }
  >();
  for (const o of accepted) {
    const key = arrayKey(o);
    if (!arrayMap.has(key)) {
      arrayMap.set(key, {
        consumer_metric_id: o.consumerMetricId || o.seriesCode,
        series_code: o.seriesCode,
        geography_id: o.geographyId,
        geography_name: o.geographyName,
        dataset: o.datasetId,
        source_agency: agencyName(o.sourceId),
        unit: o.unit,
        points: [],
      });
    }
    arrayMap.get(key)!.points.push({
      period: o.period,
      value: o.value,
      observation_id: o.observationId,
    });
  }
  for (const series of arrayMap.values()) {
    series.points.sort((a, b) => a.period.localeCompare(b.period));
  }

  const files: Record<string, unknown> = {
    "national-baseline.json": { metrics: national },
    "arkansas-baseline.json": { metrics: arkansas },
    "county-baselines.json": { metrics: county },
    "series-arrays.json": {
      contract_note:
        "Multi-period observation arrays for publication evidence systems. Do not interpolate missing periods. Do not collapse AR/US unless definitions match.",
      series: [...arrayMap.values()],
    },
    "series-metadata.json": {
      series: accepted.map((o) => ({
        series_code: o.seriesCode,
        title: o.seriesTitle,
        dataset: o.datasetId,
        unit: o.unit,
        definition: o.definition,
        limitations: o.limitations,
      })),
    },
    "source-registry.json": {
      sources: [
        {
          slug: "census",
          name: "United States Census Bureau",
          abbreviation: "Census",
          homepage: "https://www.census.gov/",
          api_docs: "https://www.census.gov/data/developers/data-sets.html",
        },
        {
          slug: "bls",
          name: "Bureau of Labor Statistics",
          abbreviation: "BLS",
          homepage: "https://www.bls.gov/",
          api_docs: "https://www.bls.gov/developers/",
        },
        {
          slug: "eia",
          name: "U.S. Energy Information Administration",
          abbreviation: "EIA",
          homepage: "https://www.eia.gov/",
          api_docs: "https://www.eia.gov/opendata/",
        },
        {
          slug: "fdic",
          name: "Federal Deposit Insurance Corporation",
          abbreviation: "FDIC",
          homepage: "https://www.fdic.gov/",
          api_docs: "https://api.fdic.gov/banks/docs",
        },
        {
          slug: "hrsa",
          name: "Health Resources and Services Administration",
          abbreviation: "HRSA",
          homepage: "https://www.hrsa.gov/",
          api_docs: "https://data.hrsa.gov/",
        },
      ],
    },
    "source-citations.json": {
      citations: accepted.map((o) => ({
        consumer_metric_id: o.consumerMetricId || o.seriesCode,
        agency: o.sourceId,
        dataset: o.datasetId,
        series_code: o.seriesCode,
        period: o.period,
        geography_id: o.geographyId,
        official_source_url: officialUrl(o.sourceId, o.seriesCode),
        source_query_id: o.sourceQueryId,
        response_checksum:
          opts.warehouse.sourceQueries.find((q) => q.queryId === o.sourceQueryId)?.responseChecksum ||
          null,
      })),
    },
    "cross-check-results.json": { results: opts.warehouse.crossChecks },
    "limitations.json": {
      items: [
        "Phase 1 uses a limited indicator manifest only.",
        "ACS 5-Year and BLS series are not interchangeable without disclosure.",
        "Durable production object storage for raw responses is not claimed; H: raw archive + metadata only.",
        "PostgreSQL public_statistics migration may be prepared but not applied to hosted production.",
        ...accepted.flatMap((o) => o.limitations),
      ],
    },
    "validation-report.json": {
      observation_count: accepted.length,
      rejected_count: opts.warehouse.observations.filter((o) => o.validationStatus === "rejected")
        .length,
      cross_check_count: opts.warehouse.crossChecks.length,
      privacy_scan: "pending",
    },
  };

  const validationStatus: CcExportManifestV1["validation_status"] =
    accepted.length > 0 ? "passed" : "failed";
  const crossStatus: CcExportManifestV1["cross_check_status"] =
    opts.warehouse.crossChecks.length === 0
      ? "pending"
      : opts.warehouse.crossChecks.some((c) => c.status === "conflict")
        ? "failed"
        : "partial";

  // Privacy scan must mutate validation-report BEFORE checksum — otherwise
  // on-disk privacy_scan ("passed") will not match the pre-scan hash.
  const privacy = scanExportPayload({
    ...files,
    "manifest.json": {
      contract_version: CC_EXPORT_CONTRACT_VERSION,
      export_id: exportId,
      contains_private_data: false,
    },
  });
  (files["validation-report.json"] as { privacy_scan: string; privacy_errors?: string[] }).privacy_scan =
    privacy.ok ? "passed" : "failed";
  if (!privacy.ok) {
    (files["validation-report.json"] as { privacy_errors?: string[] }).privacy_errors = privacy.errors;
  }

  const checksum = checksumPayload(files);
  const manifest: CcExportManifestV1 = {
    contract_version: CC_EXPORT_CONTRACT_VERSION,
    export_id: exportId,
    generated_at: new Date().toISOString(),
    consumer: "constitutional_capitalism",
    generator_repository: "RedDirt",
    generator_commit: opts.generatorCommit,
    source_agencies: [...new Set(accepted.map((o) => agencyName(o.sourceId)))],
    dataset_versions: [...new Set(accepted.map((o) => o.datasetId))],
    series_count: new Set(accepted.map((o) => o.seriesCode)).size,
    observation_count: accepted.length,
    geography_count: new Set(accepted.map((o) => o.geographyId)).size,
    minimum_reference_period: periods[0] || null,
    maximum_reference_period: periods[periods.length - 1] || null,
    validation_status: validationStatus,
    cross_check_status: crossStatus,
    contains_private_data: false,
    checksum,
  };
  files["manifest.json"] = manifest;

  return { files, privacyOk: privacy.ok, privacyErrors: privacy.errors };
}

export function writeCcExport(opts: {
  repoRoot: string;
  warehouse: FileWarehouse;
  generatorCommit: string | null;
}): {
  exportDir: string;
  exportId: string;
  privacyOk: boolean;
  privacyErrors: string[];
  observationCount: number;
} {
  const { files, privacyOk, privacyErrors } = buildCcExportFiles({
    warehouse: opts.warehouse,
    generatorCommit: opts.generatorCommit,
  });
  const manifest = files["manifest.json"] as CcExportManifestV1;
  if (!privacyOk) {
    throw new Error(`Export privacy scan failed: ${privacyErrors.join("; ")}`);
  }
  if (manifest.observation_count === 0) {
    throw new Error("Refusing to write publication export with zero accepted observations");
  }

  const exportDir = path.join(
    opts.repoRoot,
    "exports",
    "constitutional-capitalism",
    manifest.export_id,
  );
  mkdirSync(exportDir, { recursive: true });
  for (const [name, payload] of Object.entries(files)) {
    writeFileSync(path.join(exportDir, name), JSON.stringify(payload, null, 2), "utf8");
  }
  // also write "latest" pointer copy
  const latestDir = path.join(opts.repoRoot, "exports", "constitutional-capitalism", "latest");
  mkdirSync(latestDir, { recursive: true });
  for (const [name, payload] of Object.entries(files)) {
    writeFileSync(path.join(latestDir, name), JSON.stringify(payload, null, 2), "utf8");
  }

  recordExport(opts.warehouse, {
    exportId: manifest.export_id,
    consumer: manifest.consumer,
    contractVersion: manifest.contract_version,
    generatedAt: manifest.generated_at,
    generatingCommit: manifest.generator_commit,
    seriesCount: manifest.series_count,
    observationCount: manifest.observation_count,
    geographyCount: manifest.geography_count,
    validationStatus: manifest.validation_status,
    checksum: manifest.checksum,
    exportPath: exportDir,
    status: "generated",
  });

  return {
    exportDir,
    exportId: manifest.export_id,
    privacyOk,
    privacyErrors,
    observationCount: manifest.observation_count,
  };
}
