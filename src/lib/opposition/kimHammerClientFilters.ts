/**
 * Client-safe Kim Hammer filter helpers — no node:fs / node:crypto imports.
 * Used by "use client" admin browsers; server loaders stay in sibling modules.
 */

import type { CampaignAiSuggestionDoctrineContext } from "@/lib/intelligence/types/campaignStrategicAlignment";
import type {
  KimHammerAuditEntryKind,
  KimHammerAuditTimeline,
  KimHammerUnifiedAuditEntry,
} from "@/lib/opposition/types/kimHammerAuditBrowser";
import type {
  KimHammerAiSuggestion,
  KimHammerAiSuggestionSandboxFile,
  KimHammerSuggestionStatus,
  KimHammerSuggestionType,
} from "@/lib/opposition/types/kimHammerAiSuggestion";
import type {
  KimHammerCitationCard,
  KimHammerCitationClaimLink,
  KimHammerCitationLockerFile,
  KimHammerCitationReviewStatus,
  KimHammerSourceHealthStatus,
} from "@/lib/opposition/types/kimHammerCitationLocker";
import type {
  KimHammerExportHistoryEntry,
  KimHammerExportHistoryFile,
} from "@/lib/opposition/types/kimHammerExportControl";
import type {
  KimHammerGeographicCountyState,
  KimHammerGeographicNarrativeIndex,
  KimHammerGeographicReadinessSignal,
} from "@/lib/opposition/types/kimHammerGeographicNarrative";
import type {
  KimHammerNarrativeReadinessBand,
  KimHammerNarrativeStateIndex,
  KimHammerNarrativeStateRecord,
} from "@/lib/opposition/types/kimHammerNarrativeState";
import type {
  KimHammerNarrativeUsageAnalyticsIndex,
  KimHammerNarrativeUsageAnalyticsRecord,
  KimHammerNarrativeUsageSignal,
} from "@/lib/opposition/types/kimHammerNarrativeUsageAnalytics";

export function filterExportHistoryEntries(
  history: KimHammerExportHistoryFile,
  filters: {
    scopeQuery?: string;
    claimQuery?: string;
    operatorQuery?: string;
  },
): KimHammerExportHistoryEntry[] {
  const scopeQuery = filters.scopeQuery?.trim().toLowerCase() ?? "";
  const claimQuery = filters.claimQuery?.trim().toLowerCase() ?? "";
  const operatorQuery = filters.operatorQuery?.trim().toLowerCase() ?? "";

  return [...history.entries]
    .sort((a, b) => b.exportedAt.localeCompare(a.exportedAt))
    .filter((entry) => {
      if (scopeQuery && !entry.scope.toLowerCase().includes(scopeQuery)) return false;
      if (operatorQuery && !entry.operator.toLowerCase().includes(operatorQuery)) return false;
      if (claimQuery) {
        const haystack = [...entry.claimIds, ...entry.citationIds, entry.exportId]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(claimQuery)) return false;
      }
      return true;
    });
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

export function filterCitationCards(
  locker: KimHammerCitationLockerFile,
  filters: {
    reviewStatus?: KimHammerCitationReviewStatus | "ALL";
    sourceHealth?: KimHammerSourceHealthStatus | "ALL";
    claimQuery?: string;
    subjectQuery?: string;
  },
): KimHammerCitationCard[] {
  const reviewStatus = filters.reviewStatus ?? "ALL";
  const sourceHealth = filters.sourceHealth ?? "ALL";
  const claimQuery = filters.claimQuery?.trim().toLowerCase() ?? "";
  const subjectQuery = filters.subjectQuery?.trim().toLowerCase() ?? "";

  return locker.citations.filter((card) => {
    if (reviewStatus !== "ALL" && card.reviewStatus !== reviewStatus) return false;
    if (sourceHealth !== "ALL" && card.sourceHealth !== sourceHealth) return false;

    if (claimQuery) {
      const claimHaystack = [
        ...card.linkedClaimIds,
        ...locker.claimLinks
          .filter((link) => link.citationId === card.id)
          .map((link) => link.claimId),
      ]
        .join(" ")
        .toLowerCase();
      if (!claimHaystack.includes(claimQuery)) return false;
    }

    if (subjectQuery) {
      const haystack = [
        card.id,
        card.summary,
        card.sourceUrl,
        card.sourceId,
        card.originTaskId ?? "",
        ...(card.linkedNarrativeIds ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(subjectQuery)) return false;
    }

    return true;
  });
}

export function claimLinksForCitation(
  citationId: string,
  claimLinks: KimHammerCitationClaimLink[],
): KimHammerCitationClaimLink[] {
  return claimLinks.filter((link) => link.citationId === citationId);
}

export function filterKimHammerAuditTimeline(
  timeline: KimHammerAuditTimeline,
  filters: {
    kind?: KimHammerAuditEntryKind | "ALL";
    subjectQuery?: string;
    operatorQuery?: string;
    statusQuery?: string;
  },
): KimHammerUnifiedAuditEntry[] {
  const kind = filters.kind ?? "ALL";
  const subjectQuery = filters.subjectQuery?.trim().toLowerCase() ?? "";
  const operatorQuery = filters.operatorQuery?.trim().toLowerCase() ?? "";
  const statusQuery = filters.statusQuery?.trim().toLowerCase() ?? "";

  return timeline.entries.filter((entry) => {
    if (kind !== "ALL" && entry.kind !== kind) return false;

    if (subjectQuery) {
      const haystack = [entry.subjectId, entry.auditId, entry.sourceFile].join(" ").toLowerCase();
      if (!haystack.includes(subjectQuery)) return false;
    }

    if (operatorQuery && !entry.operator.toLowerCase().includes(operatorQuery)) {
      return false;
    }

    if (statusQuery) {
      const statusHaystack = `${entry.previousStatus} ${entry.nextStatus}`.toLowerCase();
      if (!statusHaystack.includes(statusQuery)) return false;
    }

    return true;
  });
}

export function filterGeographicCountyStates(
  index: KimHammerGeographicNarrativeIndex,
  filters: {
    countyQuery?: string;
    signal?: KimHammerGeographicReadinessSignal | "ALL";
    narrativeQuery?: string;
  },
): KimHammerGeographicCountyState[] {
  const countyQuery = filters.countyQuery?.trim().toLowerCase() ?? "";
  const narrativeQuery = filters.narrativeQuery?.trim().toLowerCase() ?? "";
  const signal = filters.signal ?? "ALL";

  return index.counties.filter((county) => {
    if (countyQuery) {
      const haystack = `${county.countyId} ${county.countyName} ${county.strategicNotes}`.toLowerCase();
      if (!haystack.includes(countyQuery)) return false;
    }
    if (signal !== "ALL" && county.dominantSignal !== signal) return false;
    if (narrativeQuery) {
      const haystack = county.narrativeStates
        .map((cell) => `${cell.narrativeId} ${cell.narrativeTitle}`)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(narrativeQuery)) return false;
    }
    return true;
  });
}

export function filterKimHammerNarrativeStates(
  index: KimHammerNarrativeStateIndex,
  filters: {
    band?: KimHammerNarrativeReadinessBand | "ALL";
    narrativeClass?: string;
    subjectQuery?: string;
  },
): KimHammerNarrativeStateRecord[] {
  const band = filters.band ?? "ALL";
  const narrativeClass = filters.narrativeClass?.trim() ?? "";
  const subjectQuery = filters.subjectQuery?.trim().toLowerCase() ?? "";

  return index.narratives.filter((row) => {
    if (band !== "ALL" && row.readinessBand !== band) return false;
    if (narrativeClass && row.narrativeClass !== narrativeClass) return false;
    if (subjectQuery) {
      const haystack = [
        row.narrativeId,
        row.title,
        row.description,
        row.signal,
        ...row.blockers,
        ...row.linkedClaimIds,
        ...row.linkedCitationIds,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(subjectQuery)) return false;
    }
    return true;
  });
}

export function filterNarrativeUsageAnalytics(
  index: KimHammerNarrativeUsageAnalyticsIndex,
  filters: {
    signal?: KimHammerNarrativeUsageSignal | "ALL";
    narrativeQuery?: string;
  },
): KimHammerNarrativeUsageAnalyticsRecord[] {
  const narrativeQuery = filters.narrativeQuery?.trim().toLowerCase() ?? "";
  const signal = filters.signal ?? "ALL";

  return index.narratives.filter((row) => {
    if (signal !== "ALL" && row.usageSignal !== signal) return false;
    if (narrativeQuery) {
      const haystack = `${row.narrativeId} ${row.narrativeTitle} ${row.signal}`.toLowerCase();
      if (!haystack.includes(narrativeQuery)) return false;
    }
    return true;
  });
}

export type KimHammerSuggestionDoctrineContextMap = Record<string, CampaignAiSuggestionDoctrineContext>;
