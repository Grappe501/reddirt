import "server-only";

import {
  allDiligenceCompletionSummary,
  diligenceCompletionPctForSubject,
  loadOpponentDiligenceLog,
} from "@/lib/intelligence/v4/opponentDiligenceLogStore";
import { KELLY_DILIGENCE_COUNSEL_FRAME } from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

export {
  allDiligenceCompletionSummary,
  diligenceCompletionPctForSubject,
  loadOpponentDiligenceLog,
  saveOpponentDiligenceLog,
  updateDiligenceEntry,
} from "@/lib/intelligence/v4/opponentDiligenceLogStore";

export type { OpponentDiligenceLogFile, DiligenceSearchEntry } from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

/** @deprecated Use loadOpponentDiligenceLog("kelly-grappe") */
export function loadKellyCourtDiligenceLog(repoRoot?: string) {
  const log = loadOpponentDiligenceLog("kelly-grappe", repoRoot);
  if (log) return log;
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    subjectId: "kelly-grappe" as const,
    displayName: "Kelly Grappe",
    governance: {
      classification: "INTERNAL_DRAFT",
      counselReviewRequired: true,
      note: "Fallback — JSON file missing",
    },
    researchProtocol: {
      order: [],
      counselGate: "",
      incompleteFrame: "",
    },
    entries: [],
    counselFrame: KELLY_DILIGENCE_COUNSEL_FRAME,
  };
}

/** @deprecated Use diligenceCompletionPctForSubject("kelly-grappe") */
export function diligenceCompletionPct(repoRoot?: string): number {
  return diligenceCompletionPctForSubject("kelly-grappe", repoRoot);
}

export function diligenceHubSummary(repoRoot?: string) {
  return allDiligenceCompletionSummary(repoRoot);
}
