/** V3-D AI suggestion sandbox types — non-publishable, human-gated orchestration hints. */

export type KimHammerSuggestionType =
  | "RETRIEVAL_PRIORITY"
  | "CITATION_PROMOTION"
  | "CITATION_REVALIDATION"
  | "CONTRADICTION_FLAG"
  | "NARRATIVE_WEAKNESS"
  | "REVIEW_ROUTING"
  | "DEBATE_PREP";

export type KimHammerSuggestionStatus = "PENDING" | "ACCEPTED" | "DISMISSED" | "DEFERRED";

export type KimHammerSuggestionRouteTarget =
  | "RETRIEVAL_TASK"
  | "CITATION_LOCKER"
  | "CLAIM_REVIEW"
  | "NARRATIVE_MODULE"
  | "EVIDENCE_COMMAND";

export type KimHammerAiSuggestion = {
  id: string;
  suggestionType: KimHammerSuggestionType;
  agentId: string;
  title: string;
  body: string;
  confidence: number;
  status: KimHammerSuggestionStatus;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  relatedClaimIds?: string[];
  relatedCitationIds?: string[];
  relatedTaskIds?: string[];
  relatedNarrativeIds?: string[];
  suggestedRoute?: KimHammerSuggestionRouteTarget;
  suggestedRouteHref?: string;
  operator?: string;
  operatorNotes?: string;
  dispositionedAt?: string | null;
  createdAt: string;
  lastUpdated: string;
};

export type KimHammerAiSuggestionSandboxFile = {
  generatedAt: string;
  sandboxVersion: string;
  purpose: string;
  nonPublishableLabel: string;
  suggestions: KimHammerAiSuggestion[];
};

export type KimHammerSuggestionSandboxSummary = {
  generatedAt: string;
  totalSuggestions: number;
  pendingCount: number;
  acceptedCount: number;
  dismissedCount: number;
  deferredCount: number;
  typeCounts: Record<KimHammerSuggestionType, number>;
  agentCounts: Record<string, number>;
};

export const KIM_HAMMER_SUGGESTION_STATUSES: KimHammerSuggestionStatus[] = [
  "PENDING",
  "ACCEPTED",
  "DISMISSED",
  "DEFERRED",
];

export const KIM_HAMMER_SUGGESTION_TYPES: KimHammerSuggestionType[] = [
  "RETRIEVAL_PRIORITY",
  "CITATION_PROMOTION",
  "CITATION_REVALIDATION",
  "CONTRADICTION_FLAG",
  "NARRATIVE_WEAKNESS",
  "REVIEW_ROUTING",
  "DEBATE_PREP",
];

export function getAllowedKimHammerSuggestionTransitions(
  currentStatus: KimHammerSuggestionStatus,
): KimHammerSuggestionStatus[] {
  switch (currentStatus) {
    case "PENDING":
      return ["ACCEPTED", "DISMISSED", "DEFERRED"];
    case "ACCEPTED":
    case "DISMISSED":
    case "DEFERRED":
      return ["PENDING"];
    default:
      return [];
  }
}
