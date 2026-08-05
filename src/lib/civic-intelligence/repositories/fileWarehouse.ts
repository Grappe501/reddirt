import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  CrossCheckRecord,
  FileWarehouse,
  IngestionRunRecord,
  SourceQueryRecord,
  WarehouseObservation,
} from "../types";

const EMPTY: FileWarehouse = {
  version: "1.0",
  sources: [],
  datasets: [],
  series: [],
  geographies: [],
  releases: [],
  observations: [],
  sourceQueries: [],
  ingestionRuns: [],
  revisions: [],
  metricMappings: [],
  crossChecks: [],
  exports: [],
};

export function warehousePath(repoRoot: string): string {
  return path.join(repoRoot, "data", "public-statistics", "warehouse", "warehouse.json");
}

export function loadWarehouse(repoRoot: string): FileWarehouse {
  const p = warehousePath(repoRoot);
  if (!existsSync(p)) return structuredClone(EMPTY);
  return JSON.parse(readFileSync(p, "utf8")) as FileWarehouse;
}

export function saveWarehouse(repoRoot: string, warehouse: FileWarehouse): void {
  const p = warehousePath(repoRoot);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(warehouse, null, 2), "utf8");
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function upsertObservation(
  warehouse: FileWarehouse,
  next: WarehouseObservation,
): { inserted: boolean; revised: boolean } {
  const existingIdx = warehouse.observations.findIndex(
    (o) =>
      o.seriesCode === next.seriesCode &&
      o.geographyId === next.geographyId &&
      o.period === next.period &&
      o.validationStatus === "accepted",
  );
  if (existingIdx < 0) {
    warehouse.observations.push(next);
    return { inserted: true, revised: false };
  }
  const existing = warehouse.observations[existingIdx];
  if (existing.value === next.value && existing.marginOfError === next.marginOfError) {
    return { inserted: false, revised: false };
  }
  existing.validationStatus = "rejected";
  next.revisedFromObservationId = existing.observationId;
  warehouse.observations.push(next);
  warehouse.revisions.push({
    revisionId: newId("rev"),
    oldObservationId: existing.observationId,
    newObservationId: next.observationId,
    reason: "value_changed_on_reingest",
    detectedAt: new Date().toISOString(),
    materiality: "unknown",
    publicImpactStatus: "pending_review",
  });
  return { inserted: false, revised: true };
}

export function recordSourceQuery(warehouse: FileWarehouse, query: SourceQueryRecord): void {
  warehouse.sourceQueries.push(query);
}

export function recordIngestionRun(warehouse: FileWarehouse, run: IngestionRunRecord): void {
  const idx = warehouse.ingestionRuns.findIndex((r) => r.runId === run.runId);
  if (idx >= 0) warehouse.ingestionRuns[idx] = run;
  else warehouse.ingestionRuns.push(run);
}

export function recordCrossChecks(warehouse: FileWarehouse, checks: CrossCheckRecord[]): void {
  warehouse.crossChecks = checks;
}

export function recordExport(warehouse: FileWarehouse, exportMeta: Record<string, unknown>): void {
  warehouse.exports.push(exportMeta);
}
