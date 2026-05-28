import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  ARKANSAS_MEDIA_SOURCE_REGISTRY_REL,
  loadMediaSourceRegistry,
  type MediaSourceRegistry,
} from "@/lib/intelligence/publicMediaMonitor";

export type ArkansasMediaSourceRecord = MediaSourceRegistry["sources"][number] & {
  mediaMarket?: string;
  homeMarket?: string;
  state?: string;
  arkansasBorderCountiesInfluenced?: string[];
  borderMarketRelevance?: string;
  localInfluenceScore?: number;
  monitoringPriority?: string;
  lastVerifiedAt?: string | null;
  verificationMethod?: string;
  approvedForFetch?: boolean;
  sourceReliability?: string;
  allowedUse?: string;
  notes?: string;
};

export type SourceCoverageSummary = {
  generatedAt: string;
  totalSources: number;
  fetchApprovedCount: number;
  manualReviewCount: number;
  rssKnownCount: number;
  unknownRobotsCount: number;
  bySourceType: Record<string, number>;
  byRegion: Record<string, number>;
  byReviewStatus: Record<string, number>;
};

export type CoverageGapSummary = {
  weakRegions: string[];
  weakTopics: string[];
  countiesWithoutSource: string[];
  podcastAudioGaps: string[];
  publicMeetingGaps: string[];
  courtLegalGaps: string[];
  fetchReadyPendingApproval: string[];
  discoveryPriorities: string[];
};

const NSI5_COUNTIES = ["pulaski", "benton", "washington", "sebastian", "craighead", "statewide"];

const REGION_TARGETS = [
  "statewide",
  "central-arkansas",
  "northwest-arkansas",
  "northeast-arkansas",
  "river-valley",
  "delta",
  "south-arkansas",
  "southwest-arkansas",
];

const TOPIC_TARGETS = [
  "elections",
  "election-integrity",
  "legislation",
  "secretary-of-state",
  "local-politics",
  "court-legal",
  "public-meetings",
  "campaigns",
  "podcasts",
];

function asRecords(sources: MediaSourceRegistry["sources"]): ArkansasMediaSourceRecord[] {
  return sources as ArkansasMediaSourceRecord[];
}

export function loadArkansasMediaSourceRegistry(
  repoRoot: string = process.cwd(),
): MediaSourceRegistry & { sources: ArkansasMediaSourceRecord[] } {
  return loadMediaSourceRegistry(repoRoot) as MediaSourceRegistry & { sources: ArkansasMediaSourceRecord[] };
}

export function summarizeSourceCoverage(repoRoot?: string): SourceCoverageSummary {
  const registry = loadArkansasMediaSourceRegistry(repoRoot);
  const sources = asRecords(registry.sources);

  const bySourceType: Record<string, number> = {};
  const byRegion: Record<string, number> = {};
  const byReviewStatus: Record<string, number> = {};

  for (const row of sources) {
    bySourceType[row.sourceType] = (bySourceType[row.sourceType] ?? 0) + 1;
    byRegion[row.region] = (byRegion[row.region] ?? 0) + 1;
    byReviewStatus[row.reviewStatus] = (byReviewStatus[row.reviewStatus] ?? 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    totalSources: sources.length,
    fetchApprovedCount: sources.filter((row) => row.approvedForFetch === true).length,
    manualReviewCount: sources.filter((row) => row.ingestionMethod === "MANUAL_REVIEW").length,
    rssKnownCount: sources.filter((row) => row.rssUrl).length,
    unknownRobotsCount: sources.filter((row) => row.robotsPolicyStatus === "UNKNOWN").length,
    bySourceType,
    byRegion,
    byReviewStatus,
  };
}

export function summarizeFetchApprovedSources(repoRoot?: string): ArkansasMediaSourceRecord[] {
  return asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources).filter(
    (row) => row.approvedForFetch === true,
  );
}

export function summarizeManualReviewSources(repoRoot?: string): ArkansasMediaSourceRecord[] {
  return asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources).filter(
    (row) => row.ingestionMethod === "MANUAL_REVIEW" || row.approvedForFetch !== true,
  );
}

export function summarizeCoverageGaps(repoRoot?: string): CoverageGapSummary {
  const sources = asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources);

  const regionsWithSources = new Set(sources.map((row) => row.region));
  const weakRegions = REGION_TARGETS.filter((region) => !regionsWithSources.has(region) || sources.filter((s) => s.region === region).length < 2);

  const topicsCovered = new Set(sources.flatMap((row) => row.topics));
  const weakTopics = TOPIC_TARGETS.filter((topic) => !topicsCovered.has(topic));

  const countiesWithSource = new Set(sources.flatMap((row) => row.countiesCovered));
  const countiesWithoutSource = NSI5_COUNTIES.filter(
    (county) => county !== "statewide" && !countiesWithSource.has(county),
  );

  const podcastAudioGaps = [
    "No verified Arkansas political podcast RSS feeds registered.",
    "Public radio programs require manual review until feeds verified.",
  ];

  const publicMeetingGaps = [
    "Quorum Court agendas/minutes not systematically registered per county.",
    "County election commission pages need county-by-county verification.",
  ];

  const courtLegalGaps = [
    "Supreme Court opinions page registered — automated fetch not approved.",
    "Lower court / administrative docket monitoring requires manual review.",
  ];

  const fetchReadyPendingApproval = sources
    .filter((row) => row.rssUrl && row.approvedForFetch !== true && row.reviewStatus !== "PLACEHOLDER")
    .map((row) => `${row.name} — RSS probed, robots UNKNOWN, pending operator approval`);

  const discoveryPriorities = [
    ...weakRegions.slice(0, 3).map((r) => `Expand sources in region: ${r}`),
    ...countiesWithoutSource.slice(0, 3).map((c) => `Add county-specific sources: ${c}`),
    "Verify robots.txt before enabling fetch on probed RSS feeds (NSI-10).",
    "Register public meeting agendas for NSI-5 overlay counties.",
  ];

  return {
    weakRegions,
    weakTopics,
    countiesWithoutSource,
    podcastAudioGaps,
    publicMeetingGaps,
    courtLegalGaps,
    fetchReadyPendingApproval,
    discoveryPriorities,
  };
}

export function resolveSourcesByCounty(
  countyId: string,
  repoRoot?: string,
): ArkansasMediaSourceRecord[] {
  return asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources).filter(
    (row) => row.countiesCovered.includes(countyId) || row.countiesCovered.includes("statewide"),
  );
}

export function resolveSourcesByTopic(
  topic: string,
  repoRoot?: string,
): ArkansasMediaSourceRecord[] {
  return asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources).filter((row) =>
    row.topics.includes(topic),
  );
}

export function resolveSourcesByRegion(
  region: string,
  repoRoot?: string,
): ArkansasMediaSourceRecord[] {
  return asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources).filter(
    (row) => row.region === region || row.region === "statewide",
  );
}

export function resolveCrossStateSources(repoRoot?: string): ArkansasMediaSourceRecord[] {
  return asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources).filter(
    (row) => row.state && row.state !== "AR",
  );
}

export function resolveSourcesByMediaMarket(
  marketId: string,
  repoRoot?: string,
): ArkansasMediaSourceRecord[] {
  return asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources).filter(
    (row) => row.homeMarket === marketId || row.mediaMarket === marketId,
  );
}

export function resolveSourcesByState(state: string, repoRoot?: string): ArkansasMediaSourceRecord[] {
  return asRecords(loadArkansasMediaSourceRegistry(repoRoot).sources).filter(
    (row) => row.state === state,
  );
}

export { ARKANSAS_MEDIA_SOURCE_REGISTRY_REL };
