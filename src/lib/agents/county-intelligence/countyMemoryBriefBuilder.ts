import {
  countyMemoryTimeline,
  countyPoliticalCultureProfile,
  eventOutcomeAnalyzer,
  institutionalMemoryGapExplainer,
  localInfluenceMap,
  recurringIssueTracker,
} from "./countyInstitutionalMemoryTools";
import {
  countyRelationshipGraphReader,
  regionalInfluenceAnalyzer,
} from "./countyRelationshipGraphTools";

export type CountyInstitutionalMemoryBrief = {
  countySlug: string;
  status: "PRESENT" | "MISSING" | "NEEDS_REVIEW";
  confidenceScore: number;
  timeline: string[];
  knownEvents: Array<{
    eventTitle: string;
    outcomeSummary: string;
    outcomeType?: string;
    source?: string;
  }>;
  recurringIssues: string[];
  organizations: string[];
  regionalRelationships: string[];
  crossCountyConnections: string[];
  memoryGaps: string[];
  nextSafeDataActions: string[];
};

export function buildCountyInstitutionalMemoryBrief(
  countySlug: string,
): CountyInstitutionalMemoryBrief {
  const timeline = countyMemoryTimeline(countySlug);
  const political = countyPoliticalCultureProfile(countySlug);
  const outcomes = eventOutcomeAnalyzer(countySlug);
  const recurring = recurringIssueTracker(countySlug);
  const influence = localInfluenceMap(countySlug);
  const graph = countyRelationshipGraphReader(countySlug);
  const gaps = institutionalMemoryGapExplainer(countySlug);

  const regionHint = countySlug.split("-").slice(0, 1).join("-");
  const regional = regionalInfluenceAnalyzer(regionHint);

  const statuses = [
    timeline.memoryStatus,
    political.profileStatus,
    outcomes.status,
    recurring.status,
    influence.status,
    graph.relationshipStatus,
  ];
  const status = statuses.includes("PRESENT")
    ? "PRESENT"
    : statuses.includes("NEEDS_REVIEW")
      ? "NEEDS_REVIEW"
      : "MISSING";

  return {
    countySlug,
    status,
    confidenceScore: Math.max(0, Math.min(100, Number(timeline.confidenceScore ?? 0))),
    timeline: timeline.timeline,
    knownEvents: outcomes.outcomes,
    recurringIssues: recurring.recurringIssues,
    organizations: influence.organizations,
    regionalRelationships:
      Array.isArray((regional as { dominantIssueSignals?: string[] }).dominantIssueSignals)
        ? ((regional as { dominantIssueSignals: string[] }).dominantIssueSignals ?? [])
        : ["NEEDS_REVIEW"],
    crossCountyConnections: graph.edges.map((edge) => `${edge.sourceCountySlug}->${edge.targetCountySlug}`),
    memoryGaps: gaps.gaps,
    nextSafeDataActions: gaps.nextSafeDataActions,
  };
}

