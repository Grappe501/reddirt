import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import type { BuildWinTargetRegistryEntry } from "@/lib/election-targets/build-win-target-scenario";
import type { KellyWinTargetScenarioFile } from "@/lib/election-targets/win-target-types";

const DATA_ELECTION = "data/election";

export function registryEntriesForWinTargets(): BuildWinTargetRegistryEntry[] {
  return ARKANSAS_COUNTY_REGISTRY.map((c) => ({
    county: c.displayName.replace(/\s+County$/i, "").trim(),
    slug: c.slug,
    fips: c.fips,
  }));
}

export function loadKellyWinTargetScenarioFile(repoRoot?: string): KellyWinTargetScenarioFile | null {
  const root = repoRoot ?? process.cwd();
  const p = path.join(root, DATA_ELECTION, "kelly-win-target-scenario-v1.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as KellyWinTargetScenarioFile;
  } catch {
    return null;
  }
}

export function loadKellyWinTargetScenarioForCounty(
  countyShortName: string,
  repoRoot?: string,
): KellyWinTargetScenarioFile["counties"][number] | null {
  const file = loadKellyWinTargetScenarioFile(repoRoot);
  if (!file) return null;
  const key = countyShortName.replace(/\s+County$/i, "").trim();
  return file.counties.find((c) => c.county === key) ?? null;
}
