import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ArkansasCountyFairRow } from "@/lib/fairs/arkansas-county-fair-types";

const DATA = "data/calendar-command-center";
const FILE = "arkansas-county-fairs-2026.normalized.json";

export function loadArkansasCountyFairsNormalized(): ArkansasCountyFairRow[] {
  const p = path.join(process.cwd(), DATA, FILE);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as { rows?: ArkansasCountyFairRow[] };
    return raw.rows ?? [];
  } catch {
    return [];
  }
}

export function arkansasCountyFairsDataPresent(): boolean {
  return existsSync(path.join(process.cwd(), DATA, FILE));
}
