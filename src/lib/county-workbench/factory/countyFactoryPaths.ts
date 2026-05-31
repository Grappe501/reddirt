import path from "node:path";

export const COUNTY_FACTORY_DATA_ROOT = "data/county-workbench";

export const COUNTY_FACTORY_PATHS = {
  sourceCatalog: `${COUNTY_FACTORY_DATA_ROOT}/source-catalog/county-source-catalog.json`,
  facts: `${COUNTY_FACTORY_DATA_ROOT}/facts/county-facts.json`,
  sources: `${COUNTY_FACTORY_DATA_ROOT}/facts/county-sources.json`,
  ingestionRuns: `${COUNTY_FACTORY_DATA_ROOT}/facts/county-ingestion-runs.json`,
  auditLog: `${COUNTY_FACTORY_DATA_ROOT}/facts/county-factory-audit-log.json`,
  tablesDir: `${COUNTY_FACTORY_DATA_ROOT}/tables`,
  profilesDir: `${COUNTY_FACTORY_DATA_ROOT}/compiled-profiles`,
  profilesRollup: `${COUNTY_FACTORY_DATA_ROOT}/compiled-profiles/_rollup.json`,
  briefsDir: `${COUNTY_FACTORY_DATA_ROOT}/briefs`,
  briefsRollup: `${COUNTY_FACTORY_DATA_ROOT}/briefs/_rollup.json`,
  agentRun: `${COUNTY_FACTORY_DATA_ROOT}/agent/county-builder-agent-run.json`,
} as const;

export function countyFactoryAbs(rel: string, repoRoot: string = process.cwd()): string {
  return path.join(repoRoot, rel);
}

export function shortSlugFromRegistrySlug(registrySlug: string): string {
  return registrySlug.replace(/-county$/, "");
}

export function registrySlugFromShort(short: string): string {
  return short.endsWith("-county") ? short : `${short}-county`;
}
