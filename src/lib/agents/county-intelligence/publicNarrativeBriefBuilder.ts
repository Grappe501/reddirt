import { countyConcernAnalyzer } from "./countyConcernAnalyzer";
import { recurringIssueTracker } from "./recurringIssueTracker";
import { publicNarrativeMonitor } from "./publicNarrativeMonitor";
import { localIssueHeatmap } from "./localIssueHeatmap";
import { earnedMediaOpportunityFinder } from "./earnedMediaOpportunityFinder";
import { publicMeetingSignalReader } from "./publicMeetingSignalReader";
import { civicSentimentSummaryBuilder } from "./civicSentimentSummaryBuilder";
import { messagingReadinessAudit } from "./messagingReadinessAudit";
import { loadPublicIssueSignalRegistry } from "./publicIssueSignalRegistry";
import type { PublicNarrativeBrief } from "./publicNarrativeTypes";

export function publicNarrativeBriefBuilder(countySlug: string): PublicNarrativeBrief {
  const concern = countyConcernAnalyzer(countySlug);
  const recurring = recurringIssueTracker(countySlug);
  const monitor = publicNarrativeMonitor(countySlug);
  const heat = localIssueHeatmap(countySlug);
  const media = earnedMediaOpportunityFinder(countySlug);
  const meetings = publicMeetingSignalReader(countySlug);
  const sentiment = civicSentimentSummaryBuilder(countySlug);
  const readiness = messagingReadinessAudit(countySlug);
  const sourceRow = loadPublicIssueSignalRegistry().rows.find((row) => row.countySlug === countySlug);

  return {
    countySlug,
    countyName: sourceRow?.countyName ?? countySlug,
    topPublicIssues: concern.topConcerns,
    recurringIssueTimeline: recurring.recurringIssueTimeline,
    narrativeClusters: heat.issueHeat.map((x) => `${x.clusterId}:${x.issue}`),
    regionalAlignment: "TREND: regional alignment inferred from public issue overlap.",
    earnedMediaOpportunities: media.opportunities,
    issueVolatility: monitor.narrativeVolatility,
    civicSentimentSummary: `TREND: civic sentiment ${sentiment.civicSentiment}`,
    publicMeetingWatchItems: meetings.watchItems,
    narrativeConfidenceScore: readiness.narrativeConfidenceScore,
    messagingReadinessStatus: readiness.messagingReadiness,
    recommendedSafeOperatorActions: [
      "Review high-volatility public issues with county communications lead.",
      "Prioritize earned-media opportunities with strong readiness scores.",
      "Treat all narrative outputs as aggregate SIGNAL/TREND only.",
      "No individualized persuasion or automated outreach actions.",
    ],
    signalKind: "TREND",
    sourceLayers:
      sourceRow?.sourceLayers ?? ["data/public-narrative/public-issue-signal-registry.json"],
  };
}

