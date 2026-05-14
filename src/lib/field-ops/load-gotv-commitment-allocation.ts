import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { GotvCommitmentAllocationFile } from "@/lib/field-ops/gotv-commitment-types";

const DATA = "data/field-ops";
const FILE = "gotv-commitment-allocation-v1.json";

export function loadGotvCommitmentAllocationFile(repoRoot?: string): GotvCommitmentAllocationFile | null {
  const root = repoRoot ?? process.cwd();
  const p = path.join(root, DATA, FILE);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as GotvCommitmentAllocationFile;
  } catch {
    return null;
  }
}

export function getGotvCommitmentAllocationForCounty(countyShortName: string, repoRoot?: string) {
  const file = loadGotvCommitmentAllocationFile(repoRoot);
  if (!file) return null;
  const key = countyShortName.replace(/\s+County$/i, "").trim();
  return file.counties.find((c) => c.county === key) ?? null;
}
