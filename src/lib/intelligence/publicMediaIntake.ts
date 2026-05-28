import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadCampaignIntelligenceGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import { loadCampaignStrategicDoctrineRegistry } from "@/lib/intelligence/campaignStrategicAlignment";
import {
  ARKANSAS_MEDIA_SOURCE_REGISTRY_REL,
  loadMediaSourceRegistry,
} from "@/lib/intelligence/publicMediaMonitor";
import { loadKimHammerNarrativeRegistry } from "@/lib/opposition/kimHammerNarrativeState";

export const PUBLIC_MEDIA_INTAKE_QUEUE_REL = "data/intelligence/public-media-intake-queue.json";

export type MediaFindingReviewStatus =
  | "NEEDS_REVIEW"
  | "IN_REVIEW"
  | "ACCEPTED_FOR_RESEARCH"
  | "ROUTED_TO_TASK"
  | "ROUTED_TO_CITATION_CANDIDATE"
  | "DISMISSED"
  | "ARCHIVED";

export type MediaRoutingSuggestion = {
  system: string;
  action: string;
  status: string;
  reason: string;
};

export type PublicMediaIntakeFinding = {
  findingId: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  rssUrl: string | null;
  publishedAt: string | null;
  capturedAt: string;
  title: string;
  summary: string;
  rawTextExcerpt: string;
  canonicalUrl: string;
  author: string | null;
  region: string;
  countiesMentioned: string[];
  topics: string[];
  detectedEntities: string[];
  possibleNarrativeLinks: string[];
  possibleBillLinks: string[];
  possibleCountyLinks: string[];
  possibleDoctrineLinks: string[];
  possibleOpponentLinks: string[];
  relevanceScore: number;
  routingSuggestions: MediaRoutingSuggestion[];
  reviewStatus: MediaFindingReviewStatus;
  publicationSafety: "NON_PUBLISHABLE";
  claimStatus: "NOT_A_CLAIM";
  humanReviewRequired: true;
  operatorNotes: string;
  sourceReliability: string;
  ingestionMethod: string;
  robotsPolicyStatus: string;
  duplicateOf: string | null;
  contentHash: string;
};

export type PublicMediaIntakeQueue = {
  version: number;
  generatedAt: string;
  purpose: string;
  findings: PublicMediaIntakeFinding[];
};

export type ApprovedMediaSource = {
  sourceId: string;
  name: string;
  sourceType: string;
  url: string;
  rssUrl: string | null;
  region: string;
  countiesCovered: string[];
  topics: string[];
  ingestionMethod: string;
  robotsPolicyStatus: string;
  reviewStatus: string;
  approvedForFetch: boolean;
  sourceReliability: string;
  allowedUse: string;
  lastFetchedAt: string | null;
  lastSuccessfulFetchAt: string | null;
  failureCount: number;
};

export type MediaIntakeQueueSummary = {
  generatedAt: string;
  totalFindings: number;
  pendingReviewCount: number;
  inReviewCount: number;
  acceptedCount: number;
  dismissedCount: number;
  archivedCount: number;
  duplicateCount: number;
  topPendingFindings: PublicMediaIntakeFinding[];
  topRelevantFindings: PublicMediaIntakeFinding[];
  staleIntakeWarnings: string[];
  sourceCoverageGaps: string[];
  suggestedReviewPriorities: string[];
};

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

export function loadPublicMediaIntakeQueue(repoRoot: string = process.cwd()): PublicMediaIntakeQueue {
  const abs = absPath(repoRoot, PUBLIC_MEDIA_INTAKE_QUEUE_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "Public media intake queue not initialized.",
      findings: [],
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as PublicMediaIntakeQueue;
}

export function loadApprovedMediaSources(repoRoot: string = process.cwd()): ApprovedMediaSource[] {
  const registry = loadMediaSourceRegistry(repoRoot);
  return registry.sources
    .filter((row) => row.approvedForFetch === true && row.reviewStatus === "APPROVED")
    .map((row) => ({
      sourceId: row.sourceId,
      name: row.name,
      sourceType: row.sourceType,
      url: row.url,
      rssUrl: row.rssUrl,
      region: row.region,
      countiesCovered: row.countiesCovered,
      topics: row.topics,
      ingestionMethod: row.ingestionMethod,
      robotsPolicyStatus: row.robotsPolicyStatus,
      reviewStatus: row.reviewStatus,
      approvedForFetch: row.approvedForFetch === true,
      sourceReliability: row.sourceReliability ?? "UNVERIFIED",
      allowedUse: row.allowedUse ?? "NONE",
      lastFetchedAt: row.lastFetchedAt ?? null,
      lastSuccessfulFetchAt: row.lastSuccessfulFetchAt ?? null,
      failureCount: row.failureCount ?? 0,
    }));
}

export function computeContentHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

const BILL_PATTERN = /\b(SB|HB|HCR|SCR|SJR|HJR)\s?\d{1,4}\b/gi;
const COUNTY_NAMES = [
  "pulaski", "benton", "washington", "sebastian", "craighead", "faulkner", "saline", "garland",
];

export function resolveFindingEntityLinks(
  text: string,
  repoRoot: string = process.cwd(),
): {
  detectedEntities: string[];
  possibleNarrativeLinks: string[];
  possibleBillLinks: string[];
  possibleCountyLinks: string[];
  possibleDoctrineLinks: string[];
  possibleOpponentLinks: string[];
  topics: string[];
} {
  const lower = text.toLowerCase();
  const bills = [...new Set((text.match(BILL_PATTERN) ?? []).map((b) => b.toUpperCase().replace(/\s+/g, "")))];
  const counties: string[] = [];
  for (const county of COUNTY_NAMES) {
    if (lower.includes(county)) counties.push(county);
  }
  if (lower.includes("statewide") || lower.includes("arkansas")) counties.push("statewide");

  const narratives = loadKimHammerNarrativeRegistry(repoRoot);
  const possibleNarrativeLinks = narratives.narratives
    .filter((row) => lower.includes(row.title.toLowerCase().slice(0, 20)) || lower.includes(row.narrativeId.replaceAll("-", " ")))
    .slice(0, 4)
    .map((row) => row.narrativeId);

  if (lower.includes("trust") || lower.includes("transparency")) {
    possibleNarrativeLinks.push("narrative-trust-transparency");
  }
  if (lower.includes("county") && lower.includes("burden")) {
    possibleNarrativeLinks.push("narrative-county-burden");
  }
  if (lower.includes("kim hammer") || lower.includes("hammer-authored")) {
    possibleNarrativeLinks.push("narrative-opponent-record");
  }

  const doctrine = loadCampaignStrategicDoctrineRegistry(repoRoot);
  const possibleDoctrineLinks = doctrine.doctrines
    .filter((row) => lower.includes(row.title.toLowerCase().slice(0, 16)))
    .slice(0, 3)
    .map((row) => row.doctrineId);

  const possibleOpponentLinks: string[] = [];
  if (lower.includes("kim hammer") || lower.includes("hammer")) {
    possibleOpponentLinks.push("kim-hammer");
  }

  const graph = loadCampaignIntelligenceGraph(repoRoot);
  const graphHits = graph.entities
    .filter((row) => lower.includes(row.title.toLowerCase()))
    .slice(0, 3)
    .map((row) => row.entityId);

  const topics: string[] = [];
  if (lower.includes("election")) topics.push("elections");
  if (lower.includes("secretary of state")) topics.push("secretary-of-state");
  if (lower.includes("legislat")) topics.push("legislation");
  if (lower.includes("integrity")) topics.push("election-integrity");

  const detectedEntities = [
    ...bills,
    ...counties.map((c) => `${c} County`),
    ...graphHits,
  ].slice(0, 12);

  return {
    detectedEntities,
    possibleNarrativeLinks: [...new Set(possibleNarrativeLinks)],
    possibleBillLinks: bills,
    possibleCountyLinks: [...new Set(counties)],
    possibleDoctrineLinks,
    possibleOpponentLinks,
    topics,
  };
}

export function computeFindingRelevance(
  finding: Pick<PublicMediaIntakeFinding, "title" | "summary" | "topics" | "possibleBillLinks" | "possibleOpponentLinks" | "possibleCountyLinks">,
): number {
  let score = 0;
  if (finding.possibleBillLinks.length > 0) score += 12;
  if (finding.possibleOpponentLinks.length > 0) score += 10;
  if (finding.possibleCountyLinks.length > 0) score += 6;
  if (finding.topics.includes("secretary-of-state")) score += 8;
  if (finding.topics.includes("election-integrity")) score += 5;
  if (finding.title.toLowerCase().includes("secretary of state")) score += 6;
  return score;
}

export function routeFindingForReview(
  finding: PublicMediaIntakeFinding,
): MediaRoutingSuggestion[] {
  const suggestions: MediaRoutingSuggestion[] = [
    {
      system: "opposition_research",
      action: "queue_for_review",
      status: "SUGGESTION_ONLY",
      reason: "Default opposition research queue — no auto-promotion",
    },
    {
      system: "citation_locker",
      action: "hold_as_candidate",
      status: "SUGGESTION_ONLY",
      reason: "Citation candidate only after human review",
    },
    {
      system: "retrieval_tasks",
      action: "suggest_task",
      status: "SUGGESTION_ONLY",
      reason: "May suggest retrieval task — operator must create",
    },
    {
      system: "narrative_state",
      action: "no_auto_update",
      status: "BLOCKED",
      reason: "Narrative state cannot update automatically",
    },
    {
      system: "ai_suggestion_sandbox",
      action: "suggest_relevance_only",
      status: "SUGGESTION_ONLY",
      reason: "AI relevance suggestion only",
    },
    {
      system: "debate_prep",
      action: "surface_for_review",
      status: "SUGGESTION_ONLY",
      reason: "Debate prep relevance — morning brief / review queue only",
    },
    {
      system: "strategic_doctrine",
      action: "review_alignment",
      status: "SUGGESTION_ONLY",
      reason: "Doctrine review suggestion only",
    },
  ];

  if (finding.possibleCountyLinks.length > 0) {
    suggestions.push({
      system: "county_briefing_intelligence",
      action: "review_for_county",
      status: "SUGGESTION_ONLY",
      reason: `County links: ${finding.possibleCountyLinks.join(", ")}`,
    });
  }

  return suggestions;
}

export function normalizePublicMediaFinding(input: {
  source: ApprovedMediaSource;
  title: string;
  summary: string;
  canonicalUrl: string;
  publishedAt?: string | null;
  author?: string | null;
  rawTextExcerpt?: string;
  repoRoot?: string;
}): PublicMediaIntakeFinding {
  const repoRoot = input.repoRoot ?? process.cwd();
  const combined = `${input.title} ${input.summary}`;
  const links = resolveFindingEntityLinks(combined, repoRoot);
  const contentHash = computeContentHash(`${input.canonicalUrl}|${input.title}|${input.summary}`);

  const base: PublicMediaIntakeFinding = {
    findingId: `media-finding-${contentHash}`,
    sourceId: input.source.sourceId,
    sourceName: input.source.name,
    sourceType: input.source.sourceType,
    sourceUrl: input.source.url,
    rssUrl: input.source.rssUrl,
    publishedAt: input.publishedAt ?? null,
    capturedAt: new Date().toISOString(),
    title: input.title,
    summary: input.summary,
    rawTextExcerpt: input.rawTextExcerpt ?? input.summary.slice(0, 280),
    canonicalUrl: input.canonicalUrl,
    author: input.author ?? null,
    region: input.source.region,
    countiesMentioned: links.possibleCountyLinks,
    topics: [...new Set([...input.source.topics, ...links.topics])],
    detectedEntities: links.detectedEntities,
    possibleNarrativeLinks: links.possibleNarrativeLinks,
    possibleBillLinks: links.possibleBillLinks,
    possibleCountyLinks: links.possibleCountyLinks,
    possibleDoctrineLinks: links.possibleDoctrineLinks,
    possibleOpponentLinks: links.possibleOpponentLinks,
    relevanceScore: 0,
    routingSuggestions: [],
    reviewStatus: "NEEDS_REVIEW",
    publicationSafety: "NON_PUBLISHABLE",
    claimStatus: "NOT_A_CLAIM",
    humanReviewRequired: true,
    operatorNotes: "",
    sourceReliability: input.source.sourceReliability,
    ingestionMethod: input.source.ingestionMethod,
    robotsPolicyStatus: input.source.robotsPolicyStatus,
    duplicateOf: null,
    contentHash,
  };

  base.relevanceScore = computeFindingRelevance(base);
  base.routingSuggestions = routeFindingForReview(base);
  return base;
}

export function dedupeMediaFindings(
  incoming: PublicMediaIntakeFinding[],
  existing: PublicMediaIntakeFinding[],
): { unique: PublicMediaIntakeFinding[]; duplicates: PublicMediaIntakeFinding[] } {
  const hashSet = new Set(existing.map((row) => row.contentHash));
  const urlSet = new Set(existing.map((row) => row.canonicalUrl));
  const unique: PublicMediaIntakeFinding[] = [];
  const duplicates: PublicMediaIntakeFinding[] = [];

  for (const finding of incoming) {
    if (hashSet.has(finding.contentHash) || urlSet.has(finding.canonicalUrl)) {
      duplicates.push({ ...finding, duplicateOf: existing.find((e) => e.contentHash === finding.contentHash)?.findingId ?? null });
    } else {
      unique.push(finding);
      hashSet.add(finding.contentHash);
      urlSet.add(finding.canonicalUrl);
    }
  }

  return { unique, duplicates };
}

export function summarizeMediaIntakeQueue(repoRoot: string = process.cwd()): MediaIntakeQueueSummary {
  const queue = loadPublicMediaIntakeQueue(repoRoot);
  const approved = loadApprovedMediaSources(repoRoot);
  const registry = loadMediaSourceRegistry(repoRoot);

  const pending = queue.findings.filter((row) => row.reviewStatus === "NEEDS_REVIEW");
  const inReview = queue.findings.filter((row) => row.reviewStatus === "IN_REVIEW");
  const accepted = queue.findings.filter((row) => row.reviewStatus === "ACCEPTED_FOR_RESEARCH");
  const dismissed = queue.findings.filter((row) => row.reviewStatus === "DISMISSED");
  const archived = queue.findings.filter((row) => row.reviewStatus === "ARCHIVED");
  const duplicateCount = queue.findings.filter((row) => row.duplicateOf).length;

  const topRelevant = [...queue.findings]
    .filter((row) => row.reviewStatus === "NEEDS_REVIEW" || row.reviewStatus === "IN_REVIEW")
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  const staleIntakeWarnings: string[] = [];
  const oldPending = pending.filter((row) => {
    const ageMs = Date.now() - new Date(row.capturedAt).getTime();
    return ageMs > 7 * 86_400_000;
  });
  if (oldPending.length > 0) {
    staleIntakeWarnings.push(`${oldPending.length} findings pending review for more than 7 days.`);
  }

  const sourceCoverageGaps: string[] = [];
  const unapproved = registry.sources.filter((row) => row.approvedForFetch !== true);
  if (unapproved.length > 0) {
    sourceCoverageGaps.push(`${unapproved.length} sources not approved for fetch.`);
  }
  if (approved.length === 0) {
    sourceCoverageGaps.push("No approved RSS/feed sources — only dry-run or manual intake available.");
  }

  const suggestedReviewPriorities = topRelevant.map(
    (row) => `[${row.relevanceScore}] ${row.title.slice(0, 80)} — ${row.reviewStatus}`,
  );

  return {
    generatedAt: new Date().toISOString(),
    totalFindings: queue.findings.length,
    pendingReviewCount: pending.length,
    inReviewCount: inReview.length,
    acceptedCount: accepted.length,
    dismissedCount: dismissed.length,
    archivedCount: archived.length,
    duplicateCount,
    topPendingFindings: pending.slice(0, 5),
    topRelevantFindings: topRelevant,
    staleIntakeWarnings,
    sourceCoverageGaps,
    suggestedReviewPriorities,
  };
}

export function filterMediaIntakeFindings(
  findings: PublicMediaIntakeFinding[],
  filters: {
    sourceId?: string;
    topic?: string;
    county?: string;
    reviewStatus?: MediaFindingReviewStatus | "ALL";
    minRelevance?: number;
  },
): PublicMediaIntakeFinding[] {
  return findings.filter((row) => {
    if (filters.sourceId && filters.sourceId !== "ALL" && row.sourceId !== filters.sourceId) return false;
    if (filters.topic && filters.topic !== "ALL" && !row.topics.includes(filters.topic)) return false;
    if (filters.county && filters.county !== "ALL" && !row.countiesMentioned.includes(filters.county)) return false;
    if (filters.reviewStatus && filters.reviewStatus !== "ALL" && row.reviewStatus !== filters.reviewStatus) return false;
    if (filters.minRelevance !== undefined && row.relevanceScore < filters.minRelevance) return false;
    return true;
  });
}

export { ARKANSAS_MEDIA_SOURCE_REGISTRY_REL };

export {
  rankMediaFindingsForOppositionResearch,
  rankMediaFindingForOppositionResearch,
  routeMediaCopilotFinding,
  suggestCitationCandidateFromFinding,
  suggestMediaFollowupTask,
  summarizeFindingForMorningBrief,
} from "@/lib/intelligence/mediaIntelligenceCopilot";
