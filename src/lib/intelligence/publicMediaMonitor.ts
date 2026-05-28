import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const ARKANSAS_MEDIA_SOURCE_REGISTRY_REL = "data/intelligence/arkansas-media-source-registry.json";

export type MediaSourceRecord = {
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
  updateFrequency: string;
  reliabilityNotes: string;
  aiAccessLevel: string;
  reviewStatus: string;
  approvedForFetch?: boolean;
  lastFetchedAt?: string | null;
  lastSuccessfulFetchAt?: string | null;
  failureCount?: number;
  sourceReliability?: string;
  allowedUse?: string;
  notes?: string;
  mediaMarket?: string;
  homeMarket?: string;
  state?: string;
  arkansasBorderCountiesInfluenced?: string[];
  borderMarketRelevance?: string;
  localInfluenceScore?: number;
  monitoringPriority?: string;
  lastVerifiedAt?: string | null;
  verificationMethod?: string;
};

export type MediaSourceRegistry = {
  version: number;
  generatedAt: string;
  purpose: string;
  sources: MediaSourceRecord[];
};

export type MediaFinding = {
  findingId: string;
  sourceId: string;
  sourceName: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string | null;
  reviewStatus: "NEEDS_REVIEW";
  publishability: "NON_PUBLISHABLE";
  relevanceScore: number;
  routeTargets: string[];
  evidenceDependencies: string[];
  safetyWarnings: string[];
};

export function loadMediaSourceRegistry(repoRoot: string = process.cwd()): MediaSourceRegistry {
  const abs = path.join(repoRoot, ARKANSAS_MEDIA_SOURCE_REGISTRY_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "Arkansas public media source registry — placeholder until NSI-8 live intake.",
      sources: [],
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as MediaSourceRegistry;
}

export function summarizeMediaMonitoringReadiness(repoRoot: string = process.cwd()): {
  sourceCount: number;
  rssReadyCount: number;
  placeholderCount: number;
  needsReviewCount: number;
  gaps: string[];
  recommendations: string[];
} {
  const registry = loadMediaSourceRegistry(repoRoot);
  const approvedCount = registry.sources.filter(
    (row) => (row as { approvedForFetch?: boolean }).approvedForFetch === true,
  ).length;
  const rssReadyCount = registry.sources.filter(
    (row) => row.rssUrl && (row as { approvedForFetch?: boolean }).approvedForFetch,
  ).length;
  const placeholderCount = registry.sources.filter((row) => row.reviewStatus === "PLACEHOLDER").length;
  const needsReviewCount = registry.sources.filter((row) => row.reviewStatus === "NEEDS_REVIEW").length;

  const gaps: string[] = [];
  if (registry.sources.length === 0) gaps.push("Media source registry empty.");
  if (approvedCount === 0) gaps.push("No sources approved for fetch.");
  if (rssReadyCount === 0) gaps.push("No approved RSS/feed sources with rssUrl configured.");
  if (placeholderCount > 0) gaps.push(`${placeholderCount} sources remain PLACEHOLDER — skipped by intake.`);

  const recommendations = [
    "Verify RSS URLs and robots.txt before NSI-8 live intake.",
    "Route all findings to NEEDS_REVIEW and NON_PUBLISHABLE by default.",
    "Human review required before promotion to citations, claims, or briefings.",
  ];

  return {
    sourceCount: registry.sources.length,
    rssReadyCount,
    placeholderCount,
    needsReviewCount,
    gaps,
    recommendations,
  };
}

export function normalizeMediaFinding(input: {
  sourceId: string;
  title: string;
  summary: string;
  url: string;
  publishedAt?: string | null;
  repoRoot?: string;
}): MediaFinding {
  const registry = loadMediaSourceRegistry(input.repoRoot);
  const source = registry.sources.find((row) => row.sourceId === input.sourceId);

  return {
    findingId: `media-finding-${Date.now()}`,
    sourceId: input.sourceId,
    sourceName: source?.name ?? input.sourceId,
    title: input.title,
    summary: input.summary,
    url: input.url,
    publishedAt: input.publishedAt ?? null,
    reviewStatus: "NEEDS_REVIEW",
    publishability: "NON_PUBLISHABLE",
    relevanceScore: 0,
    routeTargets: [],
    evidenceDependencies: ["Human review required before any claim linkage."],
    safetyWarnings: [
      "Do not auto-promote to export-ready messaging.",
      "AI may suggest relevance but must not create claims.",
    ],
  };
}

export function rankFindingForReview(finding: MediaFinding): number {
  let score = finding.relevanceScore;
  if (finding.sourceId.includes("legislative")) score += 10;
  if (finding.sourceId.includes("statewide")) score += 5;
  if (finding.title.toLowerCase().includes("secretary of state")) score += 8;
  return score;
}

export function routeFindingToIntelligenceSystem(finding: MediaFinding): {
  finding: MediaFinding;
  routes: Array<{ system: string; action: string; status: string }>;
} {
  const ranked = rankFindingForReview(finding);
  const routes = [
    { system: "opposition_research", action: "queue_for_review", status: "NEEDS_REVIEW" },
    { system: "citation_locker", action: "hold_pending_review", status: "NON_PUBLISHABLE" },
    { system: "retrieval_tasks", action: "suggest_task_if_relevant", status: "NEEDS_REVIEW" },
    { system: "ai_suggestion_sandbox", action: "suggest_relevance_only", status: "NEEDS_REVIEW" },
    { system: "county_briefing_intelligence", action: "attach_if_county_confirmed", status: "NEEDS_REVIEW" },
    { system: "narrative_state", action: "no_auto_update", status: "BLOCKED" },
    { system: "debate_prep", action: "surface_in_morning_brief_only", status: "NEEDS_REVIEW" },
  ];

  return {
    finding: { ...finding, relevanceScore: ranked, routeTargets: routes.map((row) => row.system) },
    routes,
  };
}
