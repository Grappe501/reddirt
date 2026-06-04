import "server-only";

import fs from "node:fs";
import path from "node:path";
import {
  KELLY_DILIGENCE_LOG_REL,
  KELLY_DILIGENCE_COUNSEL_FRAME,
  diligenceCompletionPctFromEntries,
  type DiligenceSearchEntry,
  type KellyCourtDiligenceLogFile,
} from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

export type { DiligenceSearchEntry, KellyCourtDiligenceLogFile } from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";
export {
  KELLY_DILIGENCE_COUNSEL_FRAME,
  diligenceCompletionPctFromEntries,
} from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

const FALLBACK_ENTRIES: DiligenceSearchEntry[] = [
  {
    id: "courtconnect-civil",
    source: "Arkansas CourtConnect (AOC)",
    searchQuery: "Kelly Grappe — civil, probate, domestic relations (all counties)",
    dateSearched: null,
    result: "NOT_SEARCHED",
    staffInitials: null,
    counselReviewed: false,
    notes: "Complete before debate. Log case numbers only — no public speculation.",
    debateStageLine: null,
  },
];

export function loadKellyCourtDiligenceLog(repoRoot?: string): KellyCourtDiligenceLogFile {
  const root = repoRoot ?? process.cwd();
  const filePath = path.join(root, KELLY_DILIGENCE_LOG_REL);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as KellyCourtDiligenceLogFile;
  } catch {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      governance: {
        classification: "INTERNAL_DRAFT",
        counselReviewRequired: true,
        note: "Fallback — JSON file missing",
      },
      entries: FALLBACK_ENTRIES,
      counselFrame: KELLY_DILIGENCE_COUNSEL_FRAME,
    };
  }
}

export function diligenceCompletionPct(repoRoot?: string): number {
  const log = loadKellyCourtDiligenceLog(repoRoot);
  return diligenceCompletionPctFromEntries(log.entries);
}

/** @deprecated Use loadKellyCourtDiligenceLog().entries */
export const KELLY_DILIGENCE_SEARCH_CHECKLIST = FALLBACK_ENTRIES;
