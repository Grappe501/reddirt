import { execSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCensusConnector, censusCanonicalQuery } from "../connectors/census";
import { createBlsConnector } from "../connectors/bls";
import { createEiaConnector } from "../connectors/eia";
import { createFdicConnector } from "../connectors/fdic";
import { createHrsaConnector } from "../connectors/hrsa";
import { createNassConnector } from "../connectors/nass";
import { runPhase1CrossChecks } from "../cross-checks/engine";
import { writeCcExport } from "../exports/ccExport";
import {
  loadWarehouse,
  saveWarehouse,
  newId,
  upsertObservation,
  recordSourceQuery,
  recordIngestionRun,
  recordCrossChecks,
  warehousePath,
} from "../repositories/fileWarehouse";
import type { WarehouseObservation } from "../types";

export function repoRoot(): string {
  return process.cwd();
}

export function gitCommitShort(): string | null {
  const candidates = ["git", "C:\\Program Files\\Git\\bin\\git.exe", "C:\\Program Files\\Git\\cmd\\git.exe"];
  for (const gitBin of candidates) {
    try {
      return execSync(`"${gitBin}" rev-parse --short HEAD`, {
        cwd: repoRoot(),
        encoding: "utf8",
        shell: process.platform === "win32" ? "cmd.exe" : undefined,
      }).trim();
    } catch {
      // try next
    }
  }
  return null;
}

function classifyDbTarget(): Record<string, unknown> {
  const databaseUrl = process.env.DATABASE_URL || "";
  const directUrl = process.env.DIRECT_URL || "";
  const hostHint = (databaseUrl || directUrl).toLowerCase();
  return {
    DATABASE_URL: databaseUrl ? "SET" : "MISSING",
    DIRECT_URL: directUrl ? "SET" : "MISSING",
    hosted_supabase: hostHint.includes("supabase"),
    pooler: hostHint.includes("pooler") || hostHint.includes("6543"),
    local_docker_hint: hostHint.includes("localhost") || hostHint.includes("127.0.0.1"),
    public_statistics_migration_applied: "unknown_not_probed",
    operator_warehouse: warehousePath(repoRoot()),
  };
}

function loadManifest(name = "cc-phase2-initial-indicators.json") {
  const p = path.join(repoRoot(), "data", "public-statistics", "manifests", name);
  return JSON.parse(readFileSync(p, "utf8")) as {
    indicators: Array<Record<string, unknown>>;
  };
}

export async function diagnose(): Promise<Record<string, unknown>> {
  const commit = gitCommitShort();
  const rawRoot = path.join(repoRoot(), "data", "public-statistics", "raw");
  const census = createCensusConnector({ rawRoot, commit });
  const bls = createBlsConnector({ rawRoot, commit });
  const eia = createEiaConnector({ rawRoot, commit });
  const fdic = createFdicConnector({ rawRoot, commit });
  const hrsa = createHrsaConnector({ rawRoot, commit });
  const nass = createNassConnector({ rawRoot, commit });
  const warehouse = loadWarehouse(repoRoot());
  const report = {
    mission: "RCIP-PHASE-1-PUBLIC-STATISTICS-SPINE-1.0",
    generator_commit: commit,
    connectors: {
      census: await census.validateConfiguration(),
      bls: await bls.validateConfiguration(),
      eia: await eia.validateConfiguration(),
      fdic: await fdic.validateConfiguration(),
      hrsa: await hrsa.validateConfiguration(),
      nass: await nass.validateConfiguration(),
    },
    supported_datasets: {
      census: await census.listSupportedDatasets(),
      bls: await bls.listSupportedDatasets(),
      eia: await eia.listSupportedDatasets(),
      fdic: await fdic.listSupportedDatasets(),
      hrsa: await hrsa.listSupportedDatasets(),
      nass: await nass.listSupportedDatasets(),
    },
    database_target: classifyDbTarget(),
    raw_archive_path: rawRoot,
    warehouse_path: warehousePath(repoRoot()),
    observation_count: warehouse.observations.filter((o) => o.validationStatus === "accepted").length,
    latest_ingestion:
      warehouse.ingestionRuns.slice().sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""))[0] ||
      null,
    latest_export: warehouse.exports.slice(-1)[0] || null,
    warnings: [] as string[],
  };
  if (!report.connectors.census.keyPresent) report.warnings.push("CENSUS_API_KEY missing");
  if (!report.connectors.bls.keyPresent) report.warnings.push("BLS_API_KEY missing");
  if (!report.connectors.eia.keyPresent) report.warnings.push("EIA_API_KEY missing");
  if (!report.connectors.nass.keyPresent) {
    report.warnings.push("NASS_API_KEY missing (Quick Stats; not API_DOT_GOV_KEY)");
  }
  if ((report.database_target as { hosted_supabase?: boolean }).hosted_supabase) {
    report.warnings.push(
      "Configured DB appears hosted Supabase — do not apply public_statistics migration without operator confirmation",
    );
  }
  return report;
}

async function ingestFromManifest(
  connectorName: "census" | "bls",
  manifestName = "cc-phase2-initial-indicators.json",
): Promise<Record<string, unknown>> {
  const commit = gitCommitShort();
  const rawRoot = path.join(repoRoot(), "data", "public-statistics", "raw");
  const connector =
    connectorName === "census"
      ? createCensusConnector({ rawRoot, commit })
      : createBlsConnector({ rawRoot, commit });
  const validation = await connector.validateConfiguration();
  if (!validation.ok) {
    return {
      status: "failed",
      connector: connectorName,
      errors: validation.errors,
      note: "Fail-closed: no invented observations",
    };
  }

  const warehouse = loadWarehouse(repoRoot());
  const manifest = loadManifest(manifestName);
  const indicators = manifest.indicators.filter((i) => i.source === connectorName);
  const runId = newId("run");
  const run: import("../types").IngestionRunRecord = {
    runId,
    connector: connectorName,
    startedAt: new Date().toISOString(),
    completedAt: null,
    environment: process.env.NODE_ENV || "development",
    status: "running",
    requestedSeries: indicators.map((i) => String(i.variable || i.series)),
    requestedGeographies: indicators.map((i) => String(i.geography)),
    insertedObservations: 0,
    updatedObservations: 0,
    rejectedObservations: 0,
    warnings: [],
    errors: [],
    softwareCommit: commit,
    operator: "publicdata-cli",
  };
  recordIngestionRun(warehouse, run);

  for (const indicator of indicators) {
    try {
      const primary = String(indicator.variable || indicator.series);
      const variablesOrSeries = [primary];
      if (indicator.moe) variablesOrSeries.push(String(indicator.moe));
      const request = {
        dataset: String(indicator.dataset),
        variablesOrSeries,
        geography: String(indicator.geography),
        period: String((indicator.periods as string[])[0]),
        consumerMetricId: String(indicator.consumer_metric_id),
      };
      const raw = await connector.fetch(request);
      const queryId = newId("qry");
      recordSourceQuery(warehouse, {
        queryId,
        sourceId: connectorName,
        datasetId: request.dataset,
        endpoint: raw.endpoint,
        safeParams: raw.safeParams,
        canonicalQuery:
          connectorName === "census"
            ? censusCanonicalQuery(raw.safeParams)
            : `bls|${raw.safeParams.seriesid}|${raw.safeParams.startyear}|${raw.safeParams.geography}`,
        requestTimestamp: raw.retrievedAt,
        responseStatus: raw.status,
        responseChecksum: raw.checksum,
        rawResponseLocation: raw.rawPath || null,
        rowCount: 0,
        retryCount: raw.retryCount,
        ingestionRunId: runId,
      });
      const batch = await connector.normalize(raw);
      run.warnings.push(...batch.warnings);
      const releaseId = newId("rel");
      warehouse.releases.push({
        releaseId,
        datasetId: request.dataset,
        releaseDate: raw.retrievedAt.slice(0, 10),
        referencePeriod: request.period,
        publicationStatus: "retrieved",
        sourceUrl: raw.endpoint,
        retrievalTimestamp: raw.retrievedAt,
        checksum: raw.checksum,
      });
      for (const obs of batch.observations) {
        if (obs.seriesCode !== primary && connectorName === "census") {
          continue;
        }
        obs.consumerMetricId = request.consumerMetricId;
        if (obs.value == null) {
          run.rejectedObservations += 1;
          continue;
        }
        const warehouseObs: WarehouseObservation = {
          ...obs,
          observationId: newId("obs"),
          sourceId: connectorName,
          datasetId: request.dataset,
          releaseId,
          sourceQueryId: queryId,
          ingestionRunId: runId,
          validationStatus: "accepted",
          confidence: "verified_primary",
          retrievedAt: raw.retrievedAt,
        };
        const result = upsertObservation(warehouse, warehouseObs);
        if (result.inserted) run.insertedObservations += 1;
        if (result.revised) run.updatedObservations += 1;
      }
    } catch (err) {
      run.errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  run.completedAt = new Date().toISOString();
  if (run.insertedObservations === 0 && run.updatedObservations === 0) {
    run.status = "failed";
    if (!run.errors.length && run.warnings.length) {
      run.errors.push("No observations accepted — check API key validity and response bodies");
    }
  } else if (run.errors.length || run.warnings.length) {
    run.status = "partial";
  } else {
    run.status = "succeeded";
  }
  recordIngestionRun(warehouse, { ...run, status: run.status });
  saveWarehouse(repoRoot(), warehouse);
  return run;
}

export async function seedCensus() {
  return ingestFromManifest("census");
}

export async function seedBls() {
  return ingestFromManifest("bls");
}

/** Ontology-driven BDS seed for B01/B02/C02. */
export async function seedBaselineAlignedBds() {
  return ingestFromManifest("census", "cc-baseline-aligned-indicators-1.0.json");
}

/**
 * CPS Voting P20-587 workbook seed for HC07 (file product, not API).
 * Archives the official xlsx and extracts the 18–24 citizen voted percent.
 */
export async function seedBaselineAlignedCpsVoting(): Promise<Record<string, unknown>> {
  const commit = gitCommitShort();
  const warehouse = loadWarehouse(repoRoot());
  const manifest = loadManifest("cc-baseline-aligned-indicators-1.0.json");
  const indicator = manifest.indicators.find((i) => i.consumer_metric_id === "CC-IND-HC07");
  if (!indicator) {
    return { status: "failed", errors: ["CC-IND-HC07 missing from aligned manifest"] };
  }
  const fileUrl = String(indicator.file_url || "");
  if (!fileUrl.startsWith("https://www2.census.gov/")) {
    return { status: "failed", errors: ["HC07 file_url must be official www2.census.gov"] };
  }

  const runId = newId("run");
  const run: import("../types").IngestionRunRecord = {
    runId,
    connector: "census_cps_voting_file",
    startedAt: new Date().toISOString(),
    completedAt: null,
    environment: process.env.NODE_ENV || "development",
    status: "running",
    requestedSeries: [String(indicator.variable)],
    requestedGeographies: [String(indicator.geography)],
    insertedObservations: 0,
    updatedObservations: 0,
    rejectedObservations: 0,
    warnings: [],
    errors: [],
    softwareCommit: commit,
    operator: "publicdata-cli",
  };
  recordIngestionRun(warehouse, run);

  try {
    const res = await fetch(fileUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    if (res.status !== 200 || buf.length < 1000) {
      run.status = "failed";
      run.errors.push(`CPS voting workbook HTTP ${res.status} bytes=${buf.length}`);
      run.completedAt = new Date().toISOString();
      recordIngestionRun(warehouse, run);
      saveWarehouse(repoRoot(), warehouse);
      return run;
    }

    const rawDir = path.join(
      repoRoot(),
      "data",
      "public-statistics",
      "raw",
      "census_cps_voting",
      new Date().toISOString().slice(0, 10),
    );
    mkdirSync(rawDir, { recursive: true });
    const rawPath = path.join(rawDir, "vote01_2024.xlsx");
    writeFileSync(rawPath, buf);

    const pyScript = path.join(repoRoot(), "scripts", "extract-cps-voting-hc07.py");
    const pythonCandidates = [
      "C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
      "C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python313\\python.exe",
      "C:\\Windows\\py.exe",
      "python",
    ];
    let extractedRaw = "";
    let lastPyErr: unknown = null;
    for (const bin of pythonCandidates) {
      try {
        extractedRaw = execSync(`"${bin}" "${pyScript}" "${rawPath}"`, {
          cwd: repoRoot(),
          encoding: "utf8",
        }).trim();
        lastPyErr = null;
        break;
      } catch (err) {
        lastPyErr = err;
      }
    }
    if (!extractedRaw) {
      throw lastPyErr instanceof Error
        ? lastPyErr
        : new Error("No working Python launcher found for CPS extract");
    }
    const extracted = JSON.parse(extractedRaw) as {
      ok: boolean;
      value?: number;
      error?: string;
      definition?: string;
    };
    if (!extracted.ok || extracted.value == null) {
      run.status = "failed";
      run.errors.push(extracted.error || "CPS extract failed");
      run.completedAt = new Date().toISOString();
      recordIngestionRun(warehouse, run);
      saveWarehouse(repoRoot(), warehouse);
      return run;
    }

    const { createHash } = await import("node:crypto");
    const queryId = newId("qry");
    const checksum = createHash("sha256").update(buf).digest("hex");
    recordSourceQuery(warehouse, {
      queryId,
      sourceId: "census",
      datasetId: "cps_voting_p20_587",
      endpoint: fileUrl,
      safeParams: {
        file: "vote01_2024.xlsx",
        band: "18 to 24 years",
        measure: "citizen_reported_voted_percent",
        dataset: "cps_voting_p20_587",
      },
      canonicalQuery: `census|cps_voting|vote01_2024|18_to_24|citizen_voted_percent`,
      requestTimestamp: new Date().toISOString(),
      responseStatus: 200,
      responseChecksum: checksum,
      rawResponseLocation: rawPath,
      rowCount: 1,
      retryCount: 0,
      ingestionRunId: runId,
    });

    const releaseId = newId("rel");
    warehouse.releases.push({
      releaseId,
      datasetId: "cps_voting_p20_587",
      releaseDate: new Date().toISOString().slice(0, 10),
      referencePeriod: "2024",
      publicationStatus: "retrieved",
      sourceUrl: fileUrl,
      retrievalTimestamp: new Date().toISOString(),
      checksum,
    });

    const warehouseObs: WarehouseObservation = {
      observationId: newId("obs"),
      sourceId: "census",
      datasetId: "cps_voting_p20_587",
      seriesCode: "citizen_voted_percent_18_to_24",
      seriesTitle: "CPS 18-24 citizen reported voting rate",
      geographyId: "geo:us",
      geographyType: "nation",
      geographyName: "United States",
      period: "2024",
      value: extracted.value,
      marginOfError: null,
      unit: "percent",
      estimateType: "cps_voting_supplement",
      definition:
        extracted.definition ||
        "CPS Voting: percent of citizens ages 18-24 who reported voting",
      limitations: [
        "Self-reported voting; overstates administrative turnout",
        "Age band 18-24 citizen population — not total population rate",
      ],
      releaseId,
      sourceQueryId: queryId,
      ingestionRunId: runId,
      validationStatus: "accepted",
      confidence: "verified_primary",
      retrievedAt: new Date().toISOString(),
      consumerMetricId: "CC-IND-HC07",
    };
    const result = upsertObservation(warehouse, warehouseObs);
    if (result.inserted) run.insertedObservations += 1;
    if (result.revised) run.updatedObservations += 1;
    run.status = "succeeded";
    run.completedAt = new Date().toISOString();
    recordIngestionRun(warehouse, run);
    saveWarehouse(repoRoot(), warehouse);
    return run;
  } catch (err) {
    run.status = "failed";
    run.errors.push(err instanceof Error ? err.message : String(err));
    run.completedAt = new Date().toISOString();
    recordIngestionRun(warehouse, run);
    saveWarehouse(repoRoot(), warehouse);
    return run;
  }
}

/**
 * Pass 6: retrieve multi-year series arrays for CC evidence systems.
 * Supports period_start/period_end + point_policy. BDS years are looped one YEAR at a time.
 */
export async function seedPass6SeriesArrays(): Promise<Record<string, unknown>> {
  const commit = gitCommitShort();
  const rawRoot = path.join(repoRoot(), "data", "public-statistics", "raw");
  const warehouse = loadWarehouse(repoRoot());
  const manifest = loadManifest("cc-pass6-series-arrays-1.0.json") as {
    indicators: Array<Record<string, unknown>>;
    blocked_without_adapter?: Array<Record<string, unknown>>;
  };
  const runId = newId("run");
  const run: import("../types").IngestionRunRecord = {
    runId,
    connector: "pass6_series_arrays",
    startedAt: new Date().toISOString(),
    completedAt: null,
    environment: process.env.NODE_ENV || "development",
    status: "running",
    requestedSeries: manifest.indicators.map((i) => String(i.variable || i.series)),
    requestedGeographies: manifest.indicators.map((i) => String(i.geography)),
    insertedObservations: 0,
    updatedObservations: 0,
    rejectedObservations: 0,
    warnings: [],
    errors: [],
    softwareCommit: commit,
    operator: "publicdata-cli",
  };
  recordIngestionRun(warehouse, run);

  for (const indicator of manifest.indicators) {
    const source = String(indicator.source);
    const primary = String(indicator.variable || indicator.series);
    const geography = String(indicator.geography);
    const dataset = String(indicator.dataset);
    const consumerMetricId = String(indicator.consumer_metric_id);
    const start = Number(indicator.period_start || (indicator.periods as string[] | undefined)?.[0]);
    const end = Number(indicator.period_end || indicator.period_start || start);
    const pointPolicy = String(indicator.point_policy || "latest_only") as import("../types").PointPolicy;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      run.errors.push(`${consumerMetricId}: invalid period range`);
      continue;
    }

    try {
      if (source === "bls") {
        const connector = createBlsConnector({ rawRoot, commit });
        const validation = await connector.validateConfiguration();
        if (!validation.ok) {
          run.errors.push(`BLS not configured for ${consumerMetricId}`);
          continue;
        }
        // BLS registered keys typically allow ≤20-year windows — chunk if needed.
        for (let chunkStart = start; chunkStart <= end; chunkStart += 20) {
          const chunkEnd = Math.min(end, chunkStart + 19);
          const request = {
            dataset,
            variablesOrSeries: [primary],
            geography,
            period: String(chunkStart),
            endPeriod: String(chunkEnd),
            pointPolicy,
            consumerMetricId,
          };
          const raw = await connector.fetch(request);
          const queryId = newId("qry");
          recordSourceQuery(warehouse, {
            queryId,
            sourceId: "bls",
            datasetId: dataset,
            endpoint: raw.endpoint,
            safeParams: raw.safeParams,
            canonicalQuery: `bls|${raw.safeParams.seriesid}|${raw.safeParams.startyear}-${raw.safeParams.endyear}|${raw.safeParams.geography}|${pointPolicy}`,
            requestTimestamp: raw.retrievedAt,
            responseStatus: raw.status,
            responseChecksum: raw.checksum,
            rawResponseLocation: raw.rawPath || null,
            rowCount: 0,
            retryCount: raw.retryCount,
            ingestionRunId: runId,
          });
          const batch = await connector.normalize(raw);
          run.warnings.push(...batch.warnings);
          const releaseId = newId("rel");
          warehouse.releases.push({
            releaseId,
            datasetId: dataset,
            releaseDate: raw.retrievedAt.slice(0, 10),
            referencePeriod: `${chunkStart}-${chunkEnd}`,
            publicationStatus: "retrieved",
            sourceUrl: raw.endpoint,
            retrievalTimestamp: raw.retrievedAt,
            checksum: raw.checksum,
          });
          for (const obs of batch.observations) {
            if (obs.seriesCode !== primary) continue;
            obs.consumerMetricId = consumerMetricId;
            if (obs.value == null) {
              run.rejectedObservations += 1;
              continue;
            }
            const warehouseObs: WarehouseObservation = {
              ...obs,
              observationId: newId("obs"),
              sourceId: "bls",
              datasetId: dataset,
              releaseId,
              sourceQueryId: queryId,
              ingestionRunId: runId,
              validationStatus: "accepted",
              confidence: "verified_primary",
              retrievedAt: raw.retrievedAt,
            };
            const result = upsertObservation(warehouse, warehouseObs);
            if (result.inserted) run.insertedObservations += 1;
            if (result.revised) run.updatedObservations += 1;
          }
        }
      } else if (source === "census" && dataset === "bds") {
        const connector = createCensusConnector({ rawRoot, commit });
        const validation = await connector.validateConfiguration();
        if (!validation.ok) {
          run.errors.push(`Census not configured for ${consumerMetricId}`);
          continue;
        }
        for (let year = start; year <= end; year += 1) {
          const request = {
            dataset: "bds",
            variablesOrSeries: [primary],
            geography,
            period: String(year),
            pointPolicy: "all_annual" as const,
            consumerMetricId,
          };
          const raw = await connector.fetch(request);
          const queryId = newId("qry");
          recordSourceQuery(warehouse, {
            queryId,
            sourceId: "census",
            datasetId: "bds",
            endpoint: raw.endpoint,
            safeParams: raw.safeParams,
            canonicalQuery: censusCanonicalQuery(raw.safeParams),
            requestTimestamp: raw.retrievedAt,
            responseStatus: raw.status,
            responseChecksum: raw.checksum,
            rawResponseLocation: raw.rawPath || null,
            rowCount: 0,
            retryCount: raw.retryCount,
            ingestionRunId: runId,
          });
          const batch = await connector.normalize(raw);
          run.warnings.push(...batch.warnings.map((w) => `${year}:${w}`));
          const releaseId = newId("rel");
          warehouse.releases.push({
            releaseId,
            datasetId: "bds",
            releaseDate: raw.retrievedAt.slice(0, 10),
            referencePeriod: String(year),
            publicationStatus: "retrieved",
            sourceUrl: raw.endpoint,
            retrievalTimestamp: raw.retrievedAt,
            checksum: raw.checksum,
          });
          for (const obs of batch.observations) {
            if (obs.seriesCode !== primary) continue;
            obs.consumerMetricId = consumerMetricId;
            if (obs.value == null) {
              run.rejectedObservations += 1;
              continue;
            }
            const warehouseObs: WarehouseObservation = {
              ...obs,
              observationId: newId("obs"),
              sourceId: "census",
              datasetId: "bds",
              releaseId,
              sourceQueryId: queryId,
              ingestionRunId: runId,
              validationStatus: "accepted",
              confidence: "verified_primary",
              retrievedAt: raw.retrievedAt,
            };
            const result = upsertObservation(warehouse, warehouseObs);
            if (result.inserted) run.insertedObservations += 1;
            if (result.revised) run.updatedObservations += 1;
          }
        }
      } else {
        run.errors.push(`${consumerMetricId}: unsupported source/dataset ${source}/${dataset}`);
      }
    } catch (err) {
      run.errors.push(
        `${consumerMetricId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  run.completedAt = new Date().toISOString();
  if (run.insertedObservations === 0 && run.updatedObservations === 0) {
    run.status = "failed";
  } else if (run.errors.length || run.warnings.length) {
    run.status = "partial";
  } else {
    run.status = "succeeded";
  }
  recordIngestionRun(warehouse, { ...run, status: run.status });
  saveWarehouse(repoRoot(), warehouse);
  return {
    ...run,
    blocked_without_adapter: manifest.blocked_without_adapter || [],
    accepted_observation_count: warehouse.observations.filter((o) => o.validationStatus === "accepted")
      .length,
  };
}

/**
 * Pass 7: EIA adapter expansion — retrieve demanded energy series arrays,
 * then export for bind-only into existing CC energy evidence system.
 * Energy data describes the system; it does not prove the prosperity-fund model.
 */
export async function seedPass7EiaSeries(): Promise<Record<string, unknown>> {
  const commit = gitCommitShort();
  const rawRoot = path.join(repoRoot(), "data", "public-statistics", "raw");
  const warehouse = loadWarehouse(repoRoot());
  const manifest = loadManifest("cc-pass7-eia-series-1.0.json") as {
    indicators: Array<Record<string, unknown>>;
    still_blocked_without_defensible_series?: Array<Record<string, unknown>>;
  };
  const runId = newId("run");
  const run: import("../types").IngestionRunRecord = {
    runId,
    connector: "pass7_eia_series",
    startedAt: new Date().toISOString(),
    completedAt: null,
    environment: process.env.NODE_ENV || "development",
    status: "running",
    requestedSeries: manifest.indicators.map((i) => String(i.series)),
    requestedGeographies: manifest.indicators.map((i) => String(i.geography)),
    insertedObservations: 0,
    updatedObservations: 0,
    rejectedObservations: 0,
    warnings: [],
    errors: [],
    softwareCommit: commit,
    operator: "publicdata-cli",
  };
  recordIngestionRun(warehouse, run);

  const connector = createEiaConnector({ rawRoot, commit });
  const validation = await connector.validateConfiguration();
  if (!validation.ok) {
    run.status = "failed";
    run.errors.push(...validation.errors);
    run.completedAt = new Date().toISOString();
    recordIngestionRun(warehouse, { ...run, status: "failed" });
    saveWarehouse(repoRoot(), warehouse);
    return {
      ...run,
      note: "Fail-closed: configure EIA_API_KEY via scripts/configure-eia-key.ps1",
      still_blocked_without_defensible_series:
        manifest.still_blocked_without_defensible_series || [],
    };
  }

  for (const indicator of manifest.indicators) {
    const consumerMetricId = String(indicator.consumer_metric_id);
    const dataset = String(indicator.dataset);
    const series = String(indicator.series);
    const geography = String(indicator.geography);
    const start = String(indicator.period_start || "2000");
    const end = String(indicator.period_end || start);
    const frequency = (indicator.frequency as "annual" | "monthly" | undefined) || "annual";
    const dataColumns = (indicator.data_columns as string[] | undefined) || undefined;
    const facets = (indicator.facets as Record<string, string[]> | undefined) || undefined;
    const unit = indicator.unit ? String(indicator.unit) : undefined;
    const seriesTitle = indicator.title ? String(indicator.title) : undefined;
    const demandIds = (indicator.demand_ids as string[] | undefined) || undefined;

    try {
      const request = {
        dataset,
        variablesOrSeries: [series],
        geography,
        period: start,
        endPeriod: end,
        frequency,
        dataColumns,
        facets,
        unit,
        seriesTitle,
        consumerMetricId,
        demandIds,
        pointPolicy: "all_annual" as const,
      };
      const raw = await connector.fetch(request);
      const queryId = newId("qry");
      recordSourceQuery(warehouse, {
        queryId,
        sourceId: "eia",
        datasetId: dataset,
        endpoint: raw.endpoint,
        safeParams: raw.safeParams,
        canonicalQuery: `eia|${dataset}|${series}|${start}-${end}|${geography}|${JSON.stringify(facets || {})}|${frequency}`,
        requestTimestamp: raw.retrievedAt,
        responseStatus: raw.status,
        responseChecksum: raw.checksum,
        rawResponseLocation: raw.rawPath || null,
        rowCount: 0,
        retryCount: raw.retryCount,
        ingestionRunId: runId,
      });
      const batch = await connector.normalize(raw);
      run.warnings.push(...batch.warnings.map((w) => `${consumerMetricId}: ${w}`));
      if (raw.status !== 200 || !batch.observations.length) {
        run.errors.push(
          `${consumerMetricId}: EIA returned status ${raw.status} with ${batch.observations.length} observations`,
        );
        continue;
      }
      const releaseId = newId("rel");
      warehouse.releases.push({
        releaseId,
        datasetId: dataset,
        releaseDate: raw.retrievedAt.slice(0, 10),
        referencePeriod: `${start}-${end}`,
        publicationStatus: "retrieved",
        sourceUrl: raw.endpoint,
        retrievalTimestamp: raw.retrievedAt,
        checksum: raw.checksum,
      });
      for (const obs of batch.observations) {
        obs.consumerMetricId = consumerMetricId;
        if (obs.value == null) {
          run.rejectedObservations += 1;
          continue;
        }
        const warehouseObs: WarehouseObservation = {
          ...obs,
          observationId: newId("obs"),
          sourceId: "eia",
          datasetId: dataset,
          releaseId,
          sourceQueryId: queryId,
          ingestionRunId: runId,
          validationStatus: "accepted",
          confidence: "verified_primary",
          retrievedAt: raw.retrievedAt,
        };
        const result = upsertObservation(warehouse, warehouseObs);
        if (result.inserted) run.insertedObservations += 1;
        if (result.revised) run.updatedObservations += 1;
      }
    } catch (err) {
      run.errors.push(
        `${consumerMetricId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  run.completedAt = new Date().toISOString();
  if (run.insertedObservations === 0 && run.updatedObservations === 0) {
    run.status = "failed";
  } else if (run.errors.length || run.warnings.length) {
    run.status = "partial";
  } else {
    run.status = "succeeded";
  }
  recordIngestionRun(warehouse, { ...run, status: run.status });
  saveWarehouse(repoRoot(), warehouse);
  return {
    ...run,
    still_blocked_without_defensible_series:
      manifest.still_blocked_without_defensible_series || [],
    accepted_observation_count: warehouse.observations.filter((o) => o.validationStatus === "accepted")
      .length,
  };
}

/**
 * Pass 8: FDIC + HRSA adapters for local-capital and healthcare evidence systems.
 * FRED is intentionally not seeded generically — reserved for awkward agency gaps
 * with original-producer provenance.
 */
export async function seedPass8FdicHrsa(): Promise<Record<string, unknown>> {
  const commit = gitCommitShort();
  const rawRoot = path.join(repoRoot(), "data", "public-statistics", "raw");
  const warehouse = loadWarehouse(repoRoot());
  const manifest = loadManifest("cc-pass8-fdic-hrsa-1.0.json") as {
    indicators: Array<Record<string, unknown>>;
    still_blocked?: Array<Record<string, unknown>>;
  };
  const runId = newId("run");
  const run: import("../types").IngestionRunRecord = {
    runId,
    connector: "pass8_fdic_hrsa",
    startedAt: new Date().toISOString(),
    completedAt: null,
    environment: process.env.NODE_ENV || "development",
    status: "running",
    requestedSeries: manifest.indicators.map((i) => String(i.series)),
    requestedGeographies: manifest.indicators.map((i) => String(i.geography)),
    insertedObservations: 0,
    updatedObservations: 0,
    rejectedObservations: 0,
    warnings: [],
    errors: [],
    softwareCommit: commit,
    operator: "publicdata-cli",
  };
  recordIngestionRun(warehouse, run);

  const fdic = createFdicConnector({ rawRoot, commit });
  const hrsa = createHrsaConnector({ rawRoot, commit });

  for (const indicator of manifest.indicators) {
    const consumerMetricId = String(indicator.consumer_metric_id);
    const source = String(indicator.source);
    const dataset = String(indicator.dataset);
    const series = String(indicator.series);
    const geography = String(indicator.geography);
    const start = String(indicator.period_start || "2000");
    const end = String(indicator.period_end || start);
    const facets = (indicator.facets as Record<string, string[]> | undefined) || undefined;
    const unit = indicator.unit ? String(indicator.unit) : undefined;
    const seriesTitle = indicator.title ? String(indicator.title) : undefined;
    const demandIds = (indicator.demand_ids as string[] | undefined) || undefined;
    const connector = source === "fdic" ? fdic : source === "hrsa" ? hrsa : null;
    if (!connector) {
      run.errors.push(`${consumerMetricId}: unsupported source ${source}`);
      continue;
    }
    try {
      const validation = await connector.validateConfiguration();
      if (!validation.ok) {
        run.errors.push(`${consumerMetricId}: ${validation.errors.join("; ")}`);
        continue;
      }
      const request = {
        dataset,
        variablesOrSeries: [series],
        geography,
        period: start,
        endPeriod: end,
        facets,
        unit,
        seriesTitle,
        consumerMetricId,
        demandIds,
        pointPolicy: "all_annual" as const,
      };
      const raw = await connector.fetch(request);
      const queryId = newId("qry");
      recordSourceQuery(warehouse, {
        queryId,
        sourceId: source,
        datasetId: dataset,
        endpoint: raw.endpoint,
        safeParams: raw.safeParams,
        canonicalQuery: `${source}|${dataset}|${series}|${start}-${end}|${geography}|${JSON.stringify(facets || {})}`,
        requestTimestamp: raw.retrievedAt,
        responseStatus: raw.status,
        responseChecksum: raw.checksum,
        rawResponseLocation: raw.rawPath || null,
        rowCount: 0,
        retryCount: raw.retryCount,
        ingestionRunId: runId,
      });
      const batch = await connector.normalize(raw);
      run.warnings.push(...batch.warnings.map((w) => `${consumerMetricId}: ${w}`));
      if (raw.status !== 200 || !batch.observations.length) {
        run.errors.push(
          `${consumerMetricId}: ${source} status ${raw.status} with ${batch.observations.length} observations`,
        );
        continue;
      }
      const releaseId = newId("rel");
      warehouse.releases.push({
        releaseId,
        datasetId: dataset,
        releaseDate: raw.retrievedAt.slice(0, 10),
        referencePeriod: `${start}-${end}`,
        publicationStatus: "retrieved",
        sourceUrl: raw.endpoint,
        retrievalTimestamp: raw.retrievedAt,
        checksum: raw.checksum,
      });
      for (const obs of batch.observations) {
        obs.consumerMetricId = consumerMetricId;
        if (obs.value == null) {
          run.rejectedObservations += 1;
          continue;
        }
        const warehouseObs: WarehouseObservation = {
          ...obs,
          observationId: newId("obs"),
          sourceId: source,
          datasetId: dataset,
          releaseId,
          sourceQueryId: queryId,
          ingestionRunId: runId,
          validationStatus: "accepted",
          confidence: "verified_primary",
          retrievedAt: raw.retrievedAt,
        };
        const result = upsertObservation(warehouse, warehouseObs);
        if (result.inserted) run.insertedObservations += 1;
        if (result.revised) run.updatedObservations += 1;
      }
    } catch (err) {
      run.errors.push(
        `${consumerMetricId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  run.completedAt = new Date().toISOString();
  if (run.insertedObservations === 0 && run.updatedObservations === 0) {
    run.status = "failed";
  } else if (run.errors.length || run.warnings.length) {
    run.status = "partial";
  } else {
    run.status = "succeeded";
  }
  recordIngestionRun(warehouse, { ...run, status: run.status });
  saveWarehouse(repoRoot(), warehouse);
  return {
    ...run,
    still_blocked: manifest.still_blocked || [],
    accepted_observation_count: warehouse.observations.filter((o) => o.validationStatus === "accepted")
      .length,
    fred_note:
      "FRED not seeded in Pass 8 — no demanded local-capital/healthcare series required FRED as a distribution channel.",
  };
}

export async function seedPass9Nass(): Promise<Record<string, unknown>> {
  const commit = gitCommitShort();
  const rawRoot = path.join(repoRoot(), "data", "public-statistics", "raw");
  const warehouse = loadWarehouse(repoRoot());
  const manifest = loadManifest("cc-pass9-nass-1.0.json") as {
    indicators: Array<Record<string, unknown>>;
    still_blocked?: Array<Record<string, unknown>>;
    distinction?: string;
  };
  const runId = newId("run");
  const run: import("../types").IngestionRunRecord = {
    runId,
    connector: "pass9_nass",
    startedAt: new Date().toISOString(),
    completedAt: null,
    environment: process.env.NODE_ENV || "development",
    status: "running",
    requestedSeries: manifest.indicators.map((i) => String(i.series)),
    requestedGeographies: manifest.indicators.map((i) => String(i.geography)),
    insertedObservations: 0,
    updatedObservations: 0,
    rejectedObservations: 0,
    warnings: [],
    errors: [],
    softwareCommit: commit,
    operator: "publicdata-cli",
  };
  recordIngestionRun(warehouse, run);

  const nass = createNassConnector({ rawRoot, commit });
  const validation = await nass.validateConfiguration();
  if (!validation.ok) {
    run.completedAt = new Date().toISOString();
    run.status = "failed";
    run.errors.push(...validation.errors);
    recordIngestionRun(warehouse, { ...run, status: run.status });
    saveWarehouse(repoRoot(), warehouse);
    return {
      ...run,
      still_blocked: manifest.still_blocked || [],
      note: "Fail-closed: configure NASS_API_KEY via npm run publicdata:configure-nass-key",
    };
  }

  for (const indicator of manifest.indicators) {
    const consumerMetricId = String(indicator.consumer_metric_id);
    const source = String(indicator.source);
    const dataset = String(indicator.dataset);
    const series = String(indicator.series);
    const geography = String(indicator.geography);
    const start = String(indicator.period_start || "1987");
    const end = String(indicator.period_end || start);
    const facets = (indicator.facets as Record<string, string[]> | undefined) || undefined;
    const unit = indicator.unit ? String(indicator.unit) : undefined;
    const seriesTitle = indicator.title ? String(indicator.title) : undefined;
    const demandIds = (indicator.demand_ids as string[] | undefined) || undefined;
    if (source !== "nass") {
      run.errors.push(`${consumerMetricId}: unsupported source ${source}`);
      continue;
    }
    try {
      const request = {
        dataset,
        variablesOrSeries: [series],
        geography,
        period: start,
        endPeriod: end,
        facets,
        unit,
        seriesTitle,
        consumerMetricId,
        demandIds,
        pointPolicy: "all_annual" as const,
      };
      const raw = await nass.fetch(request);
      const queryId = newId("qry");
      recordSourceQuery(warehouse, {
        queryId,
        sourceId: source,
        datasetId: dataset,
        endpoint: raw.endpoint,
        safeParams: raw.safeParams,
        canonicalQuery: `${source}|${dataset}|${series}|${start}-${end}|${geography}|${JSON.stringify(facets || {})}`,
        requestTimestamp: raw.retrievedAt,
        responseStatus: raw.status,
        responseChecksum: raw.checksum,
        rawResponseLocation: raw.rawPath || null,
        rowCount: 0,
        retryCount: raw.retryCount,
        ingestionRunId: runId,
      });
      const batch = await nass.normalize(raw);
      run.warnings.push(...batch.warnings.map((w) => `${consumerMetricId}: ${w}`));
      if (raw.status !== 200 || !batch.observations.length) {
        run.errors.push(
          `${consumerMetricId}: ${source} status ${raw.status} with ${batch.observations.length} observations`,
        );
        continue;
      }
      const releaseId = newId("rel");
      warehouse.releases.push({
        releaseId,
        datasetId: dataset,
        releaseDate: raw.retrievedAt.slice(0, 10),
        referencePeriod: `${start}-${end}`,
        publicationStatus: "retrieved",
        sourceUrl: raw.endpoint,
        retrievalTimestamp: raw.retrievedAt,
        checksum: raw.checksum,
      });
      for (const obs of batch.observations) {
        obs.consumerMetricId = consumerMetricId;
        if (obs.value == null) {
          run.rejectedObservations += 1;
          continue;
        }
        const warehouseObs: WarehouseObservation = {
          ...obs,
          observationId: newId("obs"),
          sourceId: source,
          datasetId: dataset,
          releaseId,
          sourceQueryId: queryId,
          ingestionRunId: runId,
          validationStatus: "accepted",
          confidence: "verified_primary",
          retrievedAt: raw.retrievedAt,
        };
        const result = upsertObservation(warehouse, warehouseObs);
        if (result.inserted) run.insertedObservations += 1;
        if (result.revised) run.updatedObservations += 1;
      }
    } catch (err) {
      run.errors.push(
        `${consumerMetricId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  run.completedAt = new Date().toISOString();
  if (run.insertedObservations === 0 && run.updatedObservations === 0) {
    run.status = "failed";
  } else if (run.errors.length || run.warnings.length) {
    run.status = "partial";
  } else {
    run.status = "succeeded";
  }
  recordIngestionRun(warehouse, { ...run, status: run.status });
  saveWarehouse(repoRoot(), warehouse);
  return {
    ...run,
    still_blocked: manifest.still_blocked || [],
    distinction: manifest.distinction,
    accepted_observation_count: warehouse.observations.filter((o) => o.validationStatus === "accepted")
      .length,
    note: "Bind into existing agriculture/rural panels only. 0 new panels by default.",
  };
}

export function crosscheck() {
  const warehouse = loadWarehouse(repoRoot());
  const checks = runPhase1CrossChecks(warehouse.observations);
  recordCrossChecks(warehouse, checks);
  saveWarehouse(repoRoot(), warehouse);
  return { count: checks.length, results: checks };
}

export function validateWarehouse() {
  const warehouse = loadWarehouse(repoRoot());
  const errors: string[] = [];
  const accepted = warehouse.observations.filter((o) => o.validationStatus === "accepted");
  for (const o of accepted) {
    if (!o.sourceQueryId) errors.push(`${o.observationId} missing sourceQueryId`);
    if (!o.ingestionRunId) errors.push(`${o.observationId} missing ingestionRunId`);
    if (!o.releaseId) errors.push(`${o.observationId} missing releaseId`);
    const q = warehouse.sourceQueries.find((x) => x.queryId === o.sourceQueryId);
    if (!q) errors.push(`${o.observationId} source query missing`);
    if (q && /key=|registrationkey=/i.test(JSON.stringify(q.safeParams))) {
      errors.push(`${q.queryId} appears to store secret params`);
    }
  }
  return {
    ok: errors.length === 0,
    observation_count: accepted.length,
    errors,
  };
}

export function exportCc() {
  const warehouse = loadWarehouse(repoRoot());
  const result = writeCcExport({
    repoRoot: repoRoot(),
    warehouse,
    generatorCommit: gitCommitShort(),
  });
  saveWarehouse(repoRoot(), warehouse);
  return result;
}

export function report() {
  const warehouse = loadWarehouse(repoRoot());
  const accepted = warehouse.observations.filter((o) => o.validationStatus === "accepted");
  const out = {
    mission: "RCIP-PHASE-1-PUBLIC-STATISTICS-SPINE-1.0",
    generator_commit: gitCommitShort(),
    observations: accepted.length,
    geographies: new Set(accepted.map((o) => o.geographyId)).size,
    cross_checks: warehouse.crossChecks.length,
    exports: warehouse.exports.length,
    latest_export: warehouse.exports.slice(-1)[0] || null,
    ingestion_runs: warehouse.ingestionRuns.length,
    database_target: classifyDbTarget(),
  };
  const reportDir = path.join(repoRoot(), "data", "public-statistics", "reports");
  mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `publicdata-report-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(out, null, 2), "utf8");
  return { ...out, reportPath };
}

export async function runAll() {
  const steps: Record<string, unknown> = {};
  steps.diagnose = await diagnose();
  steps.census = await seedCensus();
  steps.bls = await seedBls();
  steps.crosscheck = crosscheck();
  steps.validate = validateWarehouse();
  try {
    steps.export = exportCc();
  } catch (err) {
    steps.export = {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
  steps.report = report();
  return steps;
}

export function ensureDirs() {
  for (const rel of [
    "data/public-statistics/raw",
    "data/public-statistics/warehouse",
    "data/public-statistics/reports",
    "exports/constitutional-capitalism",
  ]) {
    const p = path.join(repoRoot(), rel);
    if (!existsSync(p)) mkdirSync(p, { recursive: true });
  }
}
