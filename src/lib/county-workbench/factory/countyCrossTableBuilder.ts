import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { findFactsByCounty, loadCountyFacts } from "./countyFactStore";
import type { CountyDataTable, CountyDataTableRow } from "./countyFactoryTypes";
import { COUNTY_FACTORY_GOVERNANCE } from "./countyFactoryTypes";
import { COUNTY_FACTORY_PATHS, countyFactoryAbs } from "./countyFactoryPaths";

export const COUNTY_TABLE_TYPES = [
  "demographics",
  "election_history",
  "registration",
  "turnout",
  "economic",
  "education",
  "healthcare",
  "civic_infrastructure",
  "event_opportunity",
  "local_media",
  "message_risk",
  "readiness",
] as const;

export type CountyTableType = (typeof COUNTY_TABLE_TYPES)[number];

function mapFactsToTableRows(tableType: CountyTableType): CountyDataTable {
  const factTypeMap: Record<CountyTableType, string[]> = {
    demographics: ["demographics"],
    election_history: ["election_history"],
    registration: ["voter_registration", "registration"],
    turnout: ["turnout"],
    economic: ["economic", "employment"],
    education: ["education", "schools"],
    healthcare: ["healthcare", "hospitals"],
    civic_infrastructure: ["civic_infrastructure"],
    event_opportunity: ["event_opportunities"],
    local_media: ["media"],
    message_risk: ["message_themes", "message_risk"],
    readiness: ["readiness", "planning_proxy", "profile_depth"],
  };

  const types = factTypeMap[tableType];
  const allFacts = loadCountyFacts().facts;
  const rows: CountyDataTableRow[] = [];

  for (const county of ARKANSAS_COUNTY_REGISTRY) {
    const facts = allFacts.filter(
      (f) => f.countySlug === county.slug && types.some((t) => f.factType === t || f.factType.startsWith(t)),
    );
    const row: CountyDataTableRow = {
      countySlug: county.slug,
      countyName: county.displayName,
      fips: county.fips,
      regionId: county.regionId,
      factCount: facts.length,
      verifiedCount: facts.filter((f) => f.verificationStatus === "VERIFIED").length,
      missing: facts.length === 0,
      shellLabel: facts.length === 0 ? "SHELL — no facts for table" : null,
    };
    for (const f of facts.slice(0, 5)) {
      row[`${f.factKey}`] = typeof f.value === "object" ? JSON.stringify(f.value) : f.value;
      row[`${f.factKey}_status`] = f.verificationStatus;
    }
    rows.push(row);
  }

  const withData = rows.filter((r) => !r.missing).length;
  return {
    tableType,
    generatedAt: new Date().toISOString(),
    countyCount: ARKANSAS_COUNTY_REGISTRY.length,
    rowCount: rows.length,
    columns: ["countySlug", "countyName", "fips", "regionId", "factCount", "verifiedCount", "missing", "shellLabel"],
    rows,
    completenessScore: Math.round((withData / ARKANSAS_COUNTY_REGISTRY.length) * 100),
    governance: COUNTY_FACTORY_GOVERNANCE,
  };
}

export function buildCountyTable(tableType: CountyTableType, repoRoot: string = process.cwd()): CountyDataTable {
  const table = mapFactsToTableRows(tableType);
  const abs = countyFactoryAbs(`${COUNTY_FACTORY_PATHS.tablesDir}/${tableType}.json`, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(table, null, 2)}\n`, "utf8");
  return table;
}

export function buildAllCountyCrossTables(repoRoot: string = process.cwd()): CountyDataTable[] {
  return COUNTY_TABLE_TYPES.map((t) => buildCountyTable(t, repoRoot));
}

export function summarizeCrossTableCompleteness(repoRoot?: string) {
  const root = repoRoot ?? process.cwd();
  const tables = COUNTY_TABLE_TYPES.map((t) => {
    const abs = countyFactoryAbs(`${COUNTY_FACTORY_PATHS.tablesDir}/${t}.json`, root);
    if (!existsSync(abs)) return { tableType: t, completenessScore: 0, rowCount: 0 };
    const parsed = JSON.parse(readFileSync(abs, "utf8")) as CountyDataTable;
    return { tableType: t, completenessScore: parsed.completenessScore, rowCount: parsed.rowCount };
  });
  return {
    tableCount: tables.length,
    avgCompleteness: Math.round(tables.reduce((n, t) => n + t.completenessScore, 0) / tables.length),
    tables,
  };
}

export function compareCountiesByFactType(factType: string, repoRoot?: string) {
  return ARKANSAS_COUNTY_REGISTRY.map((c) => ({
    countySlug: c.slug,
    countyName: c.displayName,
    count: findFactsByCounty(c.slug, repoRoot).filter((f) => f.factType === factType).length,
  })).sort((a, b) => b.count - a.count);
}

export function identifyOutliers(factType: string, repoRoot?: string) {
  const rows = compareCountiesByFactType(factType, repoRoot);
  const max = rows[0]?.count ?? 0;
  return rows.filter((r) => r.count === max && max > 0).map((r) => `${r.countyName} (${r.count} facts)`);
}

export function identifyMissingRows(tableType: CountyTableType, repoRoot?: string): string[] {
  const table = buildCountyTable(tableType, repoRoot);
  return table.rows.filter((r) => r.missing).map((r) => String(r.countySlug));
}
