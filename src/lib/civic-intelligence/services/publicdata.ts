import { execSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCensusConnector, censusCanonicalQuery } from "../connectors/census";
import { createBlsConnector } from "../connectors/bls";
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

function loadManifest() {
  const p = path.join(
    repoRoot(),
    "data",
    "public-statistics",
    "manifests",
    "cc-phase2-initial-indicators.json",
  );
  return JSON.parse(readFileSync(p, "utf8")) as {
    indicators: Array<Record<string, unknown>>;
  };
}

export async function diagnose(): Promise<Record<string, unknown>> {
  const commit = gitCommitShort();
  const census = createCensusConnector({
    rawRoot: path.join(repoRoot(), "data", "public-statistics", "raw"),
    commit,
  });
  const bls = createBlsConnector({
    rawRoot: path.join(repoRoot(), "data", "public-statistics", "raw"),
    commit,
  });
  const warehouse = loadWarehouse(repoRoot());
  const report = {
    mission: "RCIP-PHASE-1-PUBLIC-STATISTICS-SPINE-1.0",
    generator_commit: commit,
    connectors: {
      census: await census.validateConfiguration(),
      bls: await bls.validateConfiguration(),
    },
    supported_datasets: {
      census: await census.listSupportedDatasets(),
      bls: await bls.listSupportedDatasets(),
    },
    database_target: classifyDbTarget(),
    raw_archive_path: path.join(repoRoot(), "data", "public-statistics", "raw"),
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
  if ((report.database_target as { hosted_supabase?: boolean }).hosted_supabase) {
    report.warnings.push(
      "Configured DB appears hosted Supabase — do not apply public_statistics migration without operator confirmation",
    );
  }
  return report;
}

async function ingestFromManifest(connectorName: "census" | "bls"): Promise<Record<string, unknown>> {
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
  const manifest = loadManifest();
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
