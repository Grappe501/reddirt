import fs from "node:fs";
import path from "node:path";
import type {
  CountyIssueClustersFile,
  CivicSentimentSummaryFile,
  EarnedMediaOpportunitiesFile,
  PublicIssueSignalRegistryFile,
  PublicMeetingWatchlistFile,
  PublicNarrativeReadinessFile,
  RegionalNarrativeMapFile,
} from "./publicNarrativeTypes";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

export function loadPublicIssueSignalRegistry(): PublicIssueSignalRegistryFile {
  return readJson<PublicIssueSignalRegistryFile>(
    "data/public-narrative/public-issue-signal-registry.json",
  );
}

export function loadCountyIssueClusters(): CountyIssueClustersFile {
  return readJson<CountyIssueClustersFile>("data/public-narrative/county-issue-clusters.json");
}

export function loadRegionalNarrativeMap(): RegionalNarrativeMapFile {
  return readJson<RegionalNarrativeMapFile>("data/public-narrative/regional-narrative-map.json");
}

export function loadEarnedMediaOpportunities(): EarnedMediaOpportunitiesFile {
  return readJson<EarnedMediaOpportunitiesFile>(
    "data/public-narrative/earned-media-opportunities.json",
  );
}

export function loadCivicSentimentSummary(): CivicSentimentSummaryFile {
  return readJson<CivicSentimentSummaryFile>("data/public-narrative/civic-sentiment-summary.json");
}

export function loadPublicMeetingWatchlist(): PublicMeetingWatchlistFile {
  return readJson<PublicMeetingWatchlistFile>(
    "data/public-narrative/public-meeting-watchlist.json",
  );
}

export function loadPublicNarrativeReadiness(): PublicNarrativeReadinessFile {
  return readJson<PublicNarrativeReadinessFile>(
    "data/audit/public-narrative-readiness-table.json",
  );
}

