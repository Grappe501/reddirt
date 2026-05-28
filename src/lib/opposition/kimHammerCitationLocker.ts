import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  KimHammerCitationCard,
  KimHammerCitationClaimLink,
  KimHammerCitationLockerFile,
  KimHammerCitationReviewStatus,
  KimHammerSourceHealthStatus,
} from "@/lib/opposition/types/kimHammerCitationLocker";

export const KIM_HAMMER_CITATION_LOCKER_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-citation-locker.json";

const STALE_DAYS = 120;

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

function readJsonFile<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, relPath), "utf8")) as T;
}

export function computeCitationSourceHealth(
  card: Pick<
    KimHammerCitationCard,
    | "reviewStatus"
    | "archiveCaptured"
    | "sourceDurability"
    | "lastValidatedAt"
    | "capturedAt"
    | "sourceUrl"
  >,
  now: Date = new Date(),
): KimHammerSourceHealthStatus {
  if (card.reviewStatus === "STALE") return "STALE";
  if (card.reviewStatus === "ARCHIVED") return "HEALTHY";
  if (!card.sourceUrl.startsWith("http")) return "NEEDS_REVALIDATION";
  if (!card.archiveCaptured && card.sourceDurability !== "HIGH") return "ARCHIVE_MISSING";
  if (card.reviewStatus === "NEEDS_REVIEW" || card.reviewStatus === "DRAFT") {
    return "NEEDS_REVALIDATION";
  }

  const anchor = card.lastValidatedAt ?? card.capturedAt;
  const daysSince = (now.getTime() - new Date(anchor).getTime()) / 86_400_000;
  if (daysSince > STALE_DAYS) return "STALE";

  return "HEALTHY";
}

export function loadKimHammerCitationLocker(
  repoRoot: string = process.cwd(),
): KimHammerCitationLockerFile {
  if (!existsSync(absPath(repoRoot, KIM_HAMMER_CITATION_LOCKER_REL))) {
    return {
      generatedAt: new Date().toISOString(),
      lockerVersion: "1.0",
      purpose: "Citation locker not yet initialized.",
      sources: [],
      citations: [],
      claimLinks: [],
    };
  }

  const locker = readJsonFile<KimHammerCitationLockerFile>(
    repoRoot,
    KIM_HAMMER_CITATION_LOCKER_REL,
  );

  const citations = locker.citations.map((card) => ({
    ...card,
    sourceHealth: computeCitationSourceHealth(card),
  }));

  return { ...locker, citations };
}

export type KimHammerCitationLockerSummary = import("@/lib/opposition/types/kimHammerCitationLocker").KimHammerCitationLockerSummary;

export function summarizeKimHammerCitationLocker(
  repoRoot?: string,
): KimHammerCitationLockerSummary {
  const locker = loadKimHammerCitationLocker(repoRoot);

  const reviewStatusCounts: Record<KimHammerCitationReviewStatus, number> = {
    DRAFT: 0,
    NEEDS_REVIEW: 0,
    VERIFIED: 0,
    STALE: 0,
    ARCHIVED: 0,
  };

  const sourceHealthCounts: Record<KimHammerSourceHealthStatus, number> = {
    HEALTHY: 0,
    NEEDS_REVALIDATION: 0,
    STALE: 0,
    ARCHIVE_MISSING: 0,
    BROKEN: 0,
  };

  for (const card of locker.citations) {
    reviewStatusCounts[card.reviewStatus] += 1;
    sourceHealthCounts[card.sourceHealth] += 1;
  }

  const staleOrBlocked = locker.citations.filter(
    (card) =>
      card.sourceHealth !== "HEALTHY" ||
      card.reviewStatus === "NEEDS_REVIEW" ||
      card.reviewStatus === "DRAFT" ||
      card.reviewStatus === "STALE",
  ).length;

  return {
    generatedAt: locker.generatedAt,
    totalCitations: locker.citations.length,
    totalSources: locker.sources.length,
    totalClaimLinks: locker.claimLinks.length,
    reviewStatusCounts,
    sourceHealthCounts,
    staleOrBlockedCount: staleOrBlocked,
    narrativeLinkedCount: locker.citations.filter(
      (card) => (card.linkedNarrativeIds?.length ?? 0) > 0,
    ).length,
    taskOriginCount: locker.citations.filter((card) => Boolean(card.originTaskId)).length,
  };
}

export function resolveCitationById(
  citationId: string,
  repoRoot?: string,
): KimHammerCitationCard | undefined {
  return loadKimHammerCitationLocker(repoRoot).citations.find((row) => row.id === citationId);
}

export function citationsForClaim(
  claimId: string,
  repoRoot?: string,
): KimHammerCitationCard[] {
  const locker = loadKimHammerCitationLocker(repoRoot);
  const linkedIds = new Set(
    locker.claimLinks.filter((link) => link.claimId === claimId).map((link) => link.citationId),
  );
  return locker.citations.filter((card) => linkedIds.has(card.id));
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

export function narrativeHealthSignals(
  narrativeId: string,
  repoRoot?: string,
): {
  narrativeId: string;
  linkedCitationCount: number;
  staleCount: number;
  needsReviewCount: number;
  healthyCount: number;
  signal: string;
} {
  const locker = loadKimHammerCitationLocker(repoRoot);
  const linked = locker.citations.filter((card) =>
    card.linkedNarrativeIds?.includes(narrativeId),
  );

  const staleCount = linked.filter(
    (card) => card.sourceHealth === "STALE" || card.reviewStatus === "STALE",
  ).length;
  const needsReviewCount = linked.filter(
    (card) =>
      card.reviewStatus === "NEEDS_REVIEW" ||
      card.reviewStatus === "DRAFT" ||
      card.sourceHealth === "NEEDS_REVALIDATION",
  ).length;
  const healthyCount = linked.filter((card) => card.sourceHealth === "HEALTHY").length;

  let signal = "No linked citations.";
  if (linked.length > 0) {
    if (staleCount > 0) {
      signal = `Weak: ${staleCount} stale citation(s) linked to ${narrativeId}.`;
    } else if (needsReviewCount > 0) {
      signal = `Blocked: ${needsReviewCount} citation(s) still NEEDS_REVIEW for ${narrativeId}.`;
    } else {
      signal = `Strong: ${healthyCount}/${linked.length} citations healthy for ${narrativeId}.`;
    }
  }

  return {
    narrativeId,
    linkedCitationCount: linked.length,
    staleCount,
    needsReviewCount,
    healthyCount,
    signal,
  };
}
