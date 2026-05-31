import { readFileSync, existsSync } from "node:fs";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import type { CountySource } from "./countyFactoryTypes";
import { COUNTY_FACTORY_PATHS, countyFactoryAbs } from "./countyFactoryPaths";

export type CountySourceCatalogFile = {
  version: number;
  generatedAt: string;
  sources: CountySource[];
};

export function loadCountySourceCatalog(repoRoot: string = process.cwd()): CountySourceCatalogFile {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.sourceCatalog, repoRoot);
  if (!existsSync(abs)) {
    return { version: 1, generatedAt: new Date().toISOString(), sources: [] };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as CountySourceCatalogFile;
}

export function findSourcesByDataType(dataType: string, repoRoot?: string): CountySource[] {
  return loadCountySourceCatalog(repoRoot).sources.filter((s) => s.dataTypes.includes(dataType));
}

export function findSourcesByCounty(_countySlug: string, repoRoot?: string): CountySource[] {
  return loadCountySourceCatalog(repoRoot).sources;
}

export function summarizeSourceCoverage(repoRoot?: string) {
  const catalog = loadCountySourceCatalog(repoRoot);
  const configured = catalog.sources.filter((s) => s.apiConfigured);
  const deferred = catalog.sources.filter((s) => !s.apiConfigured);
  const dataTypes = new Set(catalog.sources.flatMap((s) => s.dataTypes));
  return {
    totalSources: catalog.sources.length,
    configuredSources: configured.length,
    deferredSources: deferred.length,
    dataTypes: [...dataTypes],
    configuredIds: configured.map((s) => s.id),
    deferredIds: deferred.map((s) => s.id),
  };
}

export function identifyMissingSourceTypes(requiredTypes: string[], repoRoot?: string): string[] {
  const covered = new Set(loadCountySourceCatalog(repoRoot).sources.flatMap((s) => s.dataTypes));
  return requiredTypes.filter((t) => !covered.has(t));
}

export const GLOBAL_REQUIRED_FACT_TYPES = [
  "identity",
  "demographics",
  "voter_registration",
  "election_history",
  "turnout",
  "economic",
  "education",
  "healthcare",
  "civic_infrastructure",
  "event_opportunities",
  "media",
  "local_validators",
  "message_themes",
  "readiness",
] as const;

export function allCountySlugs(): string[] {
  return ARKANSAS_COUNTY_REGISTRY.map((c) => c.slug);
}
