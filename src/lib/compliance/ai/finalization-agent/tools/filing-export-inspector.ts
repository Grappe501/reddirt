import { existsSync } from "node:fs";
import path from "node:path";
import { loadFilingSnapshots } from "../../../filings/filing-storage";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectFilingExport(): Promise<FinalizationInspectorResult> {
  const filings = await loadFilingSnapshots();
  const exportDir = path.join(process.cwd(), "data", "compliance", "filings", "exports");
  const hasExports = existsSync(exportDir);
  const score = filings.length && hasExports ? 80 : filings.length ? 55 : 30;
  return {
    id: "filing-export",
    label: "Filing Export Inspector",
    score,
    status: score >= 75 ? "yellow" : "red",
    explanation: filings.length
      ? `${filings.length} filing snapshot(s); exports ${hasExports ? "present" : "not yet generated"}.`
      : "No filing snapshots — create draft package before export readiness.",
  };
}
