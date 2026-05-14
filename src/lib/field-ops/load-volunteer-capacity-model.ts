import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { VolunteerCapacityModelFile } from "@/lib/field-ops/volunteer-capacity-types";

const DATA = "data/field-ops";
const FILE = "volunteer-capacity-model-v1.json";

export function loadVolunteerCapacityModelFile(repoRoot?: string): VolunteerCapacityModelFile | null {
  const root = repoRoot ?? process.cwd();
  const p = path.join(root, DATA, FILE);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as VolunteerCapacityModelFile;
  } catch {
    return null;
  }
}

export function getVolunteerCapacityRowForCounty(countyShortName: string, repoRoot?: string) {
  const file = loadVolunteerCapacityModelFile(repoRoot);
  if (!file) return null;
  const key = countyShortName.replace(/\s+County$/i, "").trim();
  return file.counties.find((c) => c.county === key) ?? null;
}
