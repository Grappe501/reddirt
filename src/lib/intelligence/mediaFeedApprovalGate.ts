import { loadArkansasMediaSourceRegistry } from "@/lib/intelligence/mediaSourceDiscovery";
import type { ArkansasMediaSourceRecord } from "@/lib/intelligence/mediaSourceDiscovery";
import type { ApprovedMediaSource } from "@/lib/intelligence/publicMediaIntake";

export type FeedApprovalCheckSource = {
  sourceId: string;
  name?: string;
  approvedForFetch?: boolean;
  rssUrl?: string | null;
  robotsPolicyStatus?: string;
  reviewStatus?: string;
  ingestionMethod?: string;
  allowedUse?: string;
};

const APPROVED_INGESTION_METHODS = new Set(["RSS", "PUBLIC_FEED"]);

/** Robots statuses explicitly treated as safe for governed fetch. */
const SAFE_ROBOTS_STATUSES = new Set(["ALLOWED", "LOCAL_FIXTURE"]);

export function getFeedApprovalBlockers(source: FeedApprovalCheckSource): string[] {
  const blockers: string[] = [];

  if (source.approvedForFetch !== true) {
    blockers.push("approvedForFetch is not true");
  }
  if (source.reviewStatus !== "APPROVED") {
    blockers.push(`reviewStatus is ${source.reviewStatus ?? "unknown"}, not APPROVED`);
  }
  if (!source.rssUrl) {
    blockers.push("missing rssUrl");
  }
  const robots = source.robotsPolicyStatus ?? "UNKNOWN";
  if (!SAFE_ROBOTS_STATUSES.has(robots)) {
    blockers.push(`robotsPolicyStatus is ${robots} — review required`);
  }
  const method = source.ingestionMethod ?? "UNKNOWN";
  if (method === "MANUAL_REVIEW") {
    blockers.push("ingestionMethod is MANUAL_REVIEW");
  }
  if (!APPROVED_INGESTION_METHODS.has(method)) {
    blockers.push(`ingestionMethod ${method} is not RSS/PUBLIC_FEED`);
  }
  if (source.allowedUse === "MANUAL_REVIEW_ONLY") {
    blockers.push("allowedUse is MANUAL_REVIEW_ONLY");
  }

  return blockers;
}

export function canFetchMediaSource(source: FeedApprovalCheckSource): boolean {
  return getFeedApprovalBlockers(source).length === 0;
}

export function resolveFetchEligibleSources(repoRoot?: string): ArkansasMediaSourceRecord[] {
  const registry = loadArkansasMediaSourceRegistry(repoRoot);
  return registry.sources.filter((row) => canFetchMediaSource(row));
}

export function summarizeFeedApprovalReadiness(repoRoot?: string): {
  generatedAt: string;
  totalSources: number;
  fetchEligibleCount: number;
  blockedFeedCount: number;
  robotsReviewNeededCount: number;
  manualReviewOnlyCount: number;
  blockersBySource: Array<{ sourceId: string; name: string; blockers: string[] }>;
  eligibleSourceIds: string[];
} {
  const registry = loadArkansasMediaSourceRegistry(repoRoot);
  const blockersBySource: Array<{ sourceId: string; name: string; blockers: string[] }> = [];
  let fetchEligibleCount = 0;
  let robotsReviewNeededCount = 0;
  let manualReviewOnlyCount = 0;

  for (const row of registry.sources) {
    const blockers = getFeedApprovalBlockers(row);
    if (blockers.length === 0) {
      fetchEligibleCount += 1;
    } else {
      blockersBySource.push({ sourceId: row.sourceId, name: row.name, blockers });
      if (blockers.some((b) => b.includes("robotsPolicyStatus"))) {
        robotsReviewNeededCount += 1;
      }
      if (
        blockers.some((b) => b.includes("MANUAL_REVIEW")) ||
        row.allowedUse === "MANUAL_REVIEW_ONLY"
      ) {
        manualReviewOnlyCount += 1;
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalSources: registry.sources.length,
    fetchEligibleCount,
    blockedFeedCount: registry.sources.length - fetchEligibleCount,
    robotsReviewNeededCount,
    manualReviewOnlyCount,
    blockersBySource,
    eligibleSourceIds: registry.sources.filter((row) => canFetchMediaSource(row)).map((row) => row.sourceId),
  };
}

export function toFeedApprovalCheck(source: ApprovedMediaSource): FeedApprovalCheckSource {
  return {
    sourceId: source.sourceId,
    name: source.name,
    approvedForFetch: source.approvedForFetch,
    rssUrl: source.rssUrl,
    robotsPolicyStatus: source.robotsPolicyStatus,
    reviewStatus: source.reviewStatus,
    ingestionMethod: source.ingestionMethod,
    allowedUse: source.allowedUse,
  };
}
