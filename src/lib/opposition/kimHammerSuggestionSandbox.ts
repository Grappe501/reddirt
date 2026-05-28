import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  loadKimHammerCitationLocker,
  narrativeHealthSignals,
} from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";
import { resolveNarrativeDoctrineAlignment } from "@/lib/intelligence/campaignStrategicAlignment";
import { KH4_NON_PUBLISHABLE_LABEL } from "@/lib/opposition/kimHammerKh4SuggestionAgents";
import type {
  KimHammerAiSuggestion,
  KimHammerAiSuggestionSandboxFile,
  KimHammerSuggestionStatus,
  KimHammerSuggestionType,
} from "@/lib/opposition/types/kimHammerAiSuggestion";

export const KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-ai-suggestion-sandbox.json";

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

function readJsonFile<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, relPath), "utf8")) as T;
}

export function loadKimHammerAiSuggestionSandbox(
  repoRoot: string = process.cwd(),
): KimHammerAiSuggestionSandboxFile {
  if (!existsSync(absPath(repoRoot, KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL))) {
    return {
      generatedAt: new Date().toISOString(),
      sandboxVersion: "1.0",
      purpose: "AI suggestion sandbox not yet initialized.",
      nonPublishableLabel: KH4_NON_PUBLISHABLE_LABEL,
      suggestions: [],
    };
  }
  return readJsonFile<KimHammerAiSuggestionSandboxFile>(
    repoRoot,
    KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL,
  );
}

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

export function summarizeKimHammerSuggestionSandbox(
  repoRoot?: string,
): KimHammerSuggestionSandboxSummary {
  const sandbox = loadKimHammerAiSuggestionSandbox(repoRoot);

  const typeCounts: Record<KimHammerSuggestionType, number> = {
    RETRIEVAL_PRIORITY: 0,
    CITATION_PROMOTION: 0,
    CITATION_REVALIDATION: 0,
    CONTRADICTION_FLAG: 0,
    NARRATIVE_WEAKNESS: 0,
    REVIEW_ROUTING: 0,
    DEBATE_PREP: 0,
  };

  const statusCounts: Record<KimHammerSuggestionStatus, number> = {
    PENDING: 0,
    ACCEPTED: 0,
    DISMISSED: 0,
    DEFERRED: 0,
  };

  const agentCounts: Record<string, number> = {};

  for (const suggestion of sandbox.suggestions) {
    typeCounts[suggestion.suggestionType] += 1;
    statusCounts[suggestion.status] += 1;
    agentCounts[suggestion.agentId] = (agentCounts[suggestion.agentId] ?? 0) + 1;
  }

  return {
    generatedAt: sandbox.generatedAt,
    totalSuggestions: sandbox.suggestions.length,
    pendingCount: statusCounts.PENDING,
    acceptedCount: statusCounts.ACCEPTED,
    dismissedCount: statusCounts.DISMISSED,
    deferredCount: statusCounts.DEFERRED,
    typeCounts,
    agentCounts,
  };
}

export function filterKimHammerSuggestions(
  sandbox: KimHammerAiSuggestionSandboxFile,
  filters: {
    status?: KimHammerSuggestionStatus | "ALL";
    suggestionType?: KimHammerSuggestionType | "ALL";
    agentId?: string;
    subjectQuery?: string;
  },
): KimHammerAiSuggestion[] {
  const status = filters.status ?? "ALL";
  const suggestionType = filters.suggestionType ?? "ALL";
  const agentId = filters.agentId?.trim() ?? "";
  const subjectQuery = filters.subjectQuery?.trim().toLowerCase() ?? "";

  return sandbox.suggestions.filter((suggestion) => {
    if (status !== "ALL" && suggestion.status !== status) return false;
    if (suggestionType !== "ALL" && suggestion.suggestionType !== suggestionType) return false;
    if (agentId && suggestion.agentId !== agentId) return false;

    if (subjectQuery) {
      const haystack = [
        suggestion.id,
        suggestion.title,
        suggestion.body,
        suggestion.agentId,
        ...(suggestion.relatedClaimIds ?? []),
        ...(suggestion.relatedCitationIds ?? []),
        ...(suggestion.relatedTaskIds ?? []),
        ...(suggestion.relatedNarrativeIds ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(subjectQuery)) return false;
    }

    return true;
  });
}

/** Deterministic corpus-derived suggestions for validation — does not mutate sandbox JSON. */
export function generateKimHammerLiveSuggestionCandidates(
  repoRoot: string = process.cwd(),
): KimHammerAiSuggestion[] {
  const index = loadKimHammerEvidenceIndex(repoRoot);
  const locker = loadKimHammerCitationLocker(repoRoot);
  const kh4 = loadKimHammerKh4Workbench();
  const now = new Date().toISOString();
  const candidates: KimHammerAiSuggestion[] = [];

  const foundationSignal = narrativeHealthSignals("kh0b-2021-integrity-foundation", repoRoot);
  if (foundationSignal.needsReviewCount > 0 || foundationSignal.staleCount > 0) {
    candidates.push({
      id: "live-narrative-kh0b-integrity",
      suggestionType: "NARRATIVE_WEAKNESS",
      agentId: "suggestion-publication-safety",
      title: "Integrity foundation narrative dependency alert",
      body: foundationSignal.signal,
      confidence: 0.9,
      status: "PENDING",
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
      relatedNarrativeIds: ["kh0b-2021-integrity-foundation"],
      suggestedRoute: "NARRATIVE_MODULE",
      suggestedRouteHref: "/admin/intelligence/kim-hammer/integrity-foundation-2021",
      createdAt: now,
      lastUpdated: now,
    });
  }

  for (const claim of index.reviewNeededClaims) {
    if (claim.citationStatus === "PARTIAL") {
      candidates.push({
        id: `live-review-${claim.id}`,
        suggestionType: "REVIEW_ROUTING",
        agentId: "suggestion-publication-safety",
        title: `Review routing: ${claim.id}`,
        body: `Claim ${claim.id} is ${claim.citationStatus} citation and ${claim.reviewStatus ?? "unset"} review.`,
        confidence: 0.85,
        status: "PENDING",
        publicationSafety: "NON_PUBLISHABLE",
        humanReviewRequired: true,
        relatedClaimIds: [claim.id],
        suggestedRoute: "CLAIM_REVIEW",
        suggestedRouteHref: "/admin/intelligence/kim-hammer/public-debate-evidence",
        createdAt: now,
        lastUpdated: now,
      });
    }
  }

  for (const card of locker.citations) {
    if (card.sourceHealth === "ARCHIVE_MISSING" || card.reviewStatus === "NEEDS_REVIEW") {
      candidates.push({
        id: `live-citation-${card.id}`,
        suggestionType:
          card.reviewStatus === "NEEDS_REVIEW" ? "CITATION_REVALIDATION" : "CITATION_PROMOTION",
        agentId: "suggestion-retrieval",
        title: `Citation attention: ${card.id}`,
        body: `${card.id} — health ${card.sourceHealth}, review ${card.reviewStatus}.`,
        confidence: 0.8,
        status: "PENDING",
        publicationSafety: "NON_PUBLISHABLE",
        humanReviewRequired: true,
        relatedCitationIds: [card.id],
        suggestedRoute: "CITATION_LOCKER",
        suggestedRouteHref: "/admin/intelligence/kim-hammer/citation-locker",
        createdAt: now,
        lastUpdated: now,
      });
    }
  }

  if (index.metrics.exportReadyClaims > 0) {
    candidates.push({
      id: "live-debate-export-ready",
      suggestionType: "DEBATE_PREP",
      agentId: "suggestion-debate-packet-readiness",
      title: "Export-ready claims available for human verification",
      body: `${index.metrics.exportReadyClaims} claim(s) pass export filter — operator must verify before use.`,
      confidence: 0.92,
      status: "PENDING",
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
      relatedClaimIds: index.exportReadyClaims.map((claim) => claim.id),
      suggestedRoute: "EVIDENCE_COMMAND",
      suggestedRouteHref: "/admin/intelligence/kim-hammer/debate-packet-export",
      createdAt: now,
      lastUpdated: now,
    });
  }

  for (const row of kh4.claimGraph.retrievalSuggestions.slice(0, 3)) {
    candidates.push({
      id: `live-retrieval-${row.id}`,
      suggestionType: "RETRIEVAL_PRIORITY",
      agentId: "suggestion-retrieval",
      title: `Retrieval: ${row.targetGapId}`,
      body: row.suggestion,
      confidence: row.retrievalConfidence,
      status: "PENDING",
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
      relatedTaskIds: [row.targetGapId],
      suggestedRoute: "RETRIEVAL_TASK",
      suggestedRouteHref: "/admin/intelligence/kim-hammer/intelligence-gaps",
      createdAt: now,
      lastUpdated: now,
    });
  }

  const countyBurdenAlignment = resolveNarrativeDoctrineAlignment(
    "kh0b-county-administration-burden",
    repoRoot,
  );
  if (
    countyBurdenAlignment &&
    (countyBurdenAlignment.alignmentSignal === "STRATEGICALLY_TENSE" ||
      countyBurdenAlignment.alignmentSignal === "STRATEGICALLY_FRAGILE")
  ) {
    candidates.push({
      id: "live-doctrine-county-burden-tension",
      suggestionType: "CONTRADICTION_FLAG",
      agentId: "suggestion-publication-safety",
      title: "Doctrine tension: county administration burden framing",
      body: countyBurdenAlignment.signal,
      confidence: 0.88,
      status: "PENDING",
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
      relatedNarrativeIds: ["kh0b-county-administration-burden"],
      suggestedRoute: "NARRATIVE_MODULE",
      suggestedRouteHref: "/admin/intelligence/strategy-alignment",
      createdAt: now,
      lastUpdated: now,
    });
  }

  return candidates;
}
