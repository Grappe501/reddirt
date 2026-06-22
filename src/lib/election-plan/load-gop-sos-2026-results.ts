import { readFileSync } from "fs";
import path from "path";
import "server-only";

import { getRegistryCountyByFips, getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";
import type { GopSos2026LocationView, GopSos2026ResultsBundle } from "@/lib/election-plan/gop-sos-2026-results-types";

let cached: GopSos2026ResultsBundle | null = null;

const DATA_FILE = path.join(process.cwd(), "data/election/2026-gop-sos-primary-runoff-by-county.normalized.json");

function loadBundle(): GopSos2026ResultsBundle | null {
  if (cached) return cached;
  try {
    cached = JSON.parse(readFileSync(DATA_FILE, "utf8")) as GopSos2026ResultsBundle;
    return cached;
  } catch {
    return null;
  }
}

export function getGopSos2026StatewideSummary(): GopSos2026ResultsBundle["statewide"] | null {
  return loadBundle()?.statewide ?? null;
}

export function getGopSos2026CountyBySlug(countySlug: string): GopSos2026LocationView | null {
  const bundle = loadBundle();
  if (!bundle) return null;
  const row = bundle.counties.find((c) => c.countySlug === countySlug);
  if (!row) return null;
  return { ...row, scope: "county" };
}

export function getGopSos2026ForCity(countyName: string, citySlug?: string, cityName?: string): GopSos2026LocationView | null {
  const bundle = loadBundle();
  if (!bundle) return null;
  const slugGuess = countyName.toLowerCase().replace(/\s+/g, "-") + "-county";
  const reg = getRegistryCountyBySlug(slugGuess);
  const row =
    bundle.counties.find((c) => c.county.toLowerCase() === countyName.toLowerCase()) ??
    (reg ? bundle.counties.find((c) => c.fips === reg.fips) : undefined);
  if (!row) return null;
  return { ...row, scope: "city", citySlug, cityName };
}

export function listGopSos2026HighOpportunityCounties(limit = 10): GopSos2026LocationView[] {
  const bundle = loadBundle();
  if (!bundle) return [];
  return bundle.counties
    .filter((c) => c.analysis.opportunityTier === "high")
    .sort((a, b) => b.runoff.norrisPct - a.runoff.norrisPct)
    .slice(0, limit)
    .map((row) => ({ ...row, scope: "county" as const }));
}

export function getGopSos2026CountyByFips(fips: string): GopSos2026LocationView | null {
  const bundle = loadBundle();
  if (!bundle) return null;
  const reg = getRegistryCountyByFips(fips);
  const row = bundle.counties.find((c) => c.fips === fips);
  if (!row) return null;
  return { ...row, scope: "county", countySlug: reg?.slug ?? row.countySlug };
}

export function formatGopPct(n: number): string {
  return `${n.toFixed(1)}%`;
}
