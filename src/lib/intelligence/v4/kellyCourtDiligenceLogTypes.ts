/**
 * Kelly court/financial diligence log types — client-safe.
 */

export type DiligenceSearchResult = "CLEAN" | "HIT_REQUIRES_COUNSEL" | "NOT_SEARCHED" | "IN_PROGRESS";

export type DiligenceSearchEntry = {
  id: string;
  source: string;
  searchQuery: string;
  dateSearched: string | null;
  result: DiligenceSearchResult;
  staffInitials: string | null;
  counselReviewed: boolean;
  notes: string;
  debateStageLine: string | null;
  linkedPublicBriefIds?: string[];
};

export type DiligenceResearchProtocol = {
  order: string[];
  counselGate: string;
  incompleteFrame: string;
  pacerOptional?: boolean;
  pacerNote?: string;
};

export type OpponentDiligenceLogFile = {
  version: number;
  generatedAt: string;
  subjectId: "kelly-grappe" | "kim-hammer" | "michael-packo";
  displayName: string;
  governance: { classification: string; counselReviewRequired: boolean; note: string };
  publicBriefModule?: string;
  researchProtocol: DiligenceResearchProtocol;
  entries: DiligenceSearchEntry[];
  counselFrame: string;
};

/** @deprecated Use OpponentDiligenceLogFile — Kelly-only alias */
export type KellyCourtDiligenceLogFile = OpponentDiligenceLogFile;

export const KELLY_DILIGENCE_LOG_REL = "data/intelligence/kelly-court-diligence-log.json";

export const KELLY_DILIGENCE_COUNSEL_FRAME =
  "If search is incomplete: 'I am running to run the Secretary of State's office for every voter.' If clean and logged: pivot to small-business survival and service frame in one sentence. Never fabricate denials.";

export function diligenceCompletionPctFromEntries(entries: DiligenceSearchEntry[]): number {
  const searched = entries.filter((e) => e.result === "CLEAN" || e.result === "HIT_REQUIRES_COUNSEL").length;
  return Math.round((searched / Math.max(1, entries.length)) * 100);
}
