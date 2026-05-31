import { ARKANSAS_COUNTY_REGISTRY, regionLabelForId } from "@/lib/county/arkansas-county-registry";
import {
  appendCountyFactoryAuditEvent,
  batchUpsertCountyFacts,
  findFactsByCounty,
  loadCountyFacts,
  saveIngestionRun,
  seedRegistryIdentityFacts,
  summarizeCountyFactCoverage,
} from "./countyFactStore";
import { allCountySlugs } from "./countySourceCatalog";
import {
  ALL_COUNTY_ADAPTERS,
  getAdapterByName,
  toIngestionResult,
} from "./ingestion/countyIngestionAdapters";
import type { CountyIngestionResult } from "./countyFactoryTypes";

export type CountyIngestionPlan = {
  adapters: string[];
  countySlugs?: string[];
  dryRun?: boolean;
};

export async function runCountyIngestionPlan(
  plan: CountyIngestionPlan,
  repoRoot: string = process.cwd(),
): Promise<CountyIngestionResult[]> {
  seedRegistryIdentityFacts(repoRoot);
  const results: CountyIngestionResult[] = [];
  for (const adapterName of plan.adapters) {
    const adapter = getAdapterByName(adapterName);
    if (!adapter) continue;
    const targetSlugs = plan.countySlugs ?? allCountySlugs();
    for (const slug of targetSlugs) {
      const r = await runAdapterForCounty(adapterName, slug, plan.dryRun ?? false, repoRoot);
      results.push(r);
    }
  }
  return results;
}

export async function runAdapterForAllCounties(
  adapterName: string,
  dryRun = false,
  repoRoot: string = process.cwd(),
): Promise<CountyIngestionResult[]> {
  return Promise.all(allCountySlugs().map((slug) => runAdapterForCounty(adapterName, slug, dryRun, repoRoot)));
}

export async function runAdapterForCounty(
  adapterName: string,
  countySlug: string,
  dryRun = false,
  repoRoot: string = process.cwd(),
): Promise<CountyIngestionResult> {
  const adapter = getAdapterByName(adapterName);
  if (!adapter) {
    const fail: CountyIngestionResult = {
      jobId: `ing-missing-${adapterName}`,
      adapterName,
      countySlug,
      status: "FAILED",
      factsAdded: 0,
      factsUpdated: 0,
      deferredReason: `Unknown adapter: ${adapterName}`,
      warnings: [],
      completedAt: new Date().toISOString(),
    };
    saveIngestionRun(fail, repoRoot);
    return fail;
  }

  const input = await adapter.ingestCounty(countySlug, dryRun);
  let factsAdded = 0;
  if (!dryRun && input.facts.length && !input.deferredReason) {
    factsAdded = batchUpsertCountyFacts(input.facts, repoRoot);
    appendCountyFactoryAuditEvent(
      { eventType: "INGEST_COMPLETE", countySlug, detail: `${adapterName} added ${factsAdded} facts` },
      repoRoot,
    );
  } else if (input.deferredReason) {
    appendCountyFactoryAuditEvent(
      { eventType: "INGEST_DEFERRED", countySlug, detail: `${adapterName}: ${input.deferredReason}` },
      repoRoot,
    );
  }

  const result = toIngestionResult(adapterName, countySlug, dryRun, input, factsAdded);
  saveIngestionRun(result, repoRoot);
  return result;
}

export async function dryRunCountyIngestion(repoRoot: string = process.cwd()): Promise<CountyIngestionResult[]> {
  return runCountyIngestionPlan(
    { adapters: ALL_COUNTY_ADAPTERS.map((a) => a.name), dryRun: true },
    repoRoot,
  );
}

export function summarizeIngestionResults(results: CountyIngestionResult[]) {
  return {
    total: results.length,
    complete: results.filter((r) => r.status === "COMPLETE").length,
    deferred: results.filter((r) => r.status === "DEFERRED").length,
    dryRun: results.filter((r) => r.status === "DRY_RUN").length,
    failed: results.filter((r) => r.status === "FAILED").length,
    factsAdded: results.reduce((n, r) => n + r.factsAdded, 0),
    topDeferredReasons: [...new Set(results.map((r) => r.deferredReason).filter(Boolean))].slice(0, 8),
  };
}

export function buildRegistrySeedSummary(repoRoot?: string) {
  seedRegistryIdentityFacts(repoRoot);
  return summarizeCountyFactCoverage(repoRoot);
}

export { ARKANSAS_COUNTY_REGISTRY, regionLabelForId, findFactsByCounty, loadCountyFacts };
