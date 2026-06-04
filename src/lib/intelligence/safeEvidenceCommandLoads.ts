import {
  computeReviewStatusCounts,
  computeTaskStatusCounts,
  loadKimHammerEvidenceIndex,
  type KimHammerEvidenceIndex,
} from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerKh4SuggestionAgents } from "@/lib/opposition/kimHammerKh4SuggestionAgents";
import { loadKimHammerNarrativeBriefings } from "@/lib/opposition/kimHammerNarrativeBriefings";
import { summarizeGeographicNarrativeForCommand } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { summarizeNarrativeUsageRisk } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import {
  loadCountyBriefingIntelligenceIndex,
  summarizeCountyBriefingForEvidenceCommand,
} from "@/lib/intelligence/countyBriefingIntelligence";
import { summarizeOperationalIntelligenceForEvidenceCommand } from "@/lib/intelligence/aggregateCampaignIntelligence";
import { summarizeMediaMonitoringReadiness } from "@/lib/intelligence/publicMediaMonitor";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import {
  getEvidenceCommandActionQueueSection,
  syncHumanActionQueue,
} from "@/lib/intelligence/strategicDecisionSupport";
import { computeStatewideRegistrationRollup } from "@/lib/intelligence/voterRegistrationTargetModel";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import type { KimHammerPublicationTier } from "@/lib/opposition/types/kimHammerEvidence";

const EMPTY_TIER_DISTRIBUTION: Record<KimHammerPublicationTier, number> = {
  TIER_1_PUBLIC_DEPLOYABLE: 0,
  TIER_2_NEEDS_CORROBORATION: 0,
  TIER_3_INTERNAL_ONLY: 0,
  TIER_4_HIGH_CAUTION: 0,
};

const EMPTY_EVIDENCE_INDEX: KimHammerEvidenceIndex = {
  generatedAt: new Date().toISOString(),
  intelligenceGaps: { generatedAt: "", queueVersion: "", objective: "", gaps: [] },
  publicDebateEvidenceBoard: { generatedAt: "", purpose: "fallback", items: [] },
  claimGraph: { generatedAt: "", claims: [], evidence: [] },
  riskRegister: { generatedAt: "", risks: [] },
  publicationSafety: { generatedAt: "", rules: [] },
  claims: [],
  retrievalTasks: [],
  exportReadyClaims: [],
  blockedClaims: [],
  reviewNeededClaims: [],
  metrics: {
    totalClaims: 0,
    exportReadyClaims: 0,
    blockedClaims: 0,
    retrievalTasks: 0,
    safetyBlockers: [],
    reviewNeededClaims: 0,
    tierDistribution: EMPTY_TIER_DISTRIBUTION,
    taskStatusCounts: computeTaskStatusCounts([]),
    reviewStatusCounts: computeReviewStatusCounts([]),
  },
};

export function loadSafeEvidenceCommandPageData() {
  let indexLoaded = false;
  const index = tryIntelligenceLoad("evidence-command-index", () => {
    indexLoaded = true;
    return loadKimHammerEvidenceIndex();
  }, EMPTY_EVIDENCE_INDEX);
  const copilot = tryIntelligenceLoad(
    "evidence-command-copilot",
    () => loadKimHammerKh4SuggestionAgents(),
    { agents: [], nonPublishableLabel: "NON_PUBLISHABLE · copilot unavailable" } as unknown as ReturnType<
      typeof loadKimHammerKh4SuggestionAgents
    >,
  );
  const narrativeBriefings = tryIntelligenceLoad(
    "evidence-command-narrative-briefings",
    () => loadKimHammerNarrativeBriefings(),
    { generatedAt: "", sections: [] } as ReturnType<typeof loadKimHammerNarrativeBriefings>,
  );

  if (!isIntelligenceOppositionDebateLaunchMode()) {
    tryIntelligenceLoad("evidence-command-sync-queue", () => {
      syncHumanActionQueue();
      return true;
    }, false);
  }

  const geographicSummary = tryIntelligenceLoad("evidence-command-geo", () => summarizeGeographicNarrativeForCommand(), {
    countyCount: 0,
    blockedCells: 0,
    underdevelopedCells: 0,
    topRisks: [],
  });
  const usageSummary = tryIntelligenceLoad(
    "evidence-command-usage",
    () => summarizeNarrativeUsageRisk(),
    { overusedCount: 0, underusedCount: 0, warnings: [] } as unknown as ReturnType<typeof summarizeNarrativeUsageRisk>,
  );
  const strategicSummary = tryIntelligenceLoad(
    "evidence-command-strategic",
    () => summarizeStrategicAlignmentRisk(),
    { warnings: [], notes: [] } as unknown as ReturnType<typeof summarizeStrategicAlignmentRisk>,
  );
  const countyBriefingSummary = tryIntelligenceLoad(
    "evidence-command-county-brief",
    () => summarizeCountyBriefingForEvidenceCommand(),
    { readyCount: 0, gapCount: 0, topCounties: [] } as unknown as ReturnType<
      typeof summarizeCountyBriefingForEvidenceCommand
    >,
  );
  const countyBriefings = tryIntelligenceLoad(
    "evidence-command-county-index",
    () => loadCountyBriefingIntelligenceIndex(),
    { generatedAt: "", countyCount: 0, cards: [], counties: [] } as unknown as ReturnType<
      typeof loadCountyBriefingIntelligenceIndex
    >,
  );
  const operationalSummary = tryIntelligenceLoad(
    "evidence-command-operational",
    () => summarizeOperationalIntelligenceForEvidenceCommand(countyBriefings.counties),
    { readinessLabel: "Unavailable", gaps: [] } as unknown as ReturnType<
      typeof summarizeOperationalIntelligenceForEvidenceCommand
    >,
  );
  const registration = tryIntelligenceLoad(
    "evidence-command-registration",
    () => computeStatewideRegistrationRollup(),
    { expectedSupportVotes: 0, assumptions: { notes: "Registration model unavailable" } } as unknown as ReturnType<
      typeof computeStatewideRegistrationRollup
    >,
  );
  const media = tryIntelligenceLoad(
    "evidence-command-media",
    () => summarizeMediaMonitoringReadiness(),
    { gaps: ["Media monitoring unavailable"] } as unknown as ReturnType<typeof summarizeMediaMonitoringReadiness>,
  );
  const brain = tryIntelligenceLoad("evidence-command-brain", () => summarizeCampaignIntelligenceState(), {
    memoryDebateTraps: [],
    memoryCountyDriftWarnings: [],
    memoryDoctrineDriftWarnings: [],
    memoryOverusedArguments: [],
    memoryStaleCitations: [],
    memoryOpponentEscalation: [],
    longitudinalIntelligence: { exportFatigueWarnings: [] },
    aiToolCount: 0,
    aiCopilotRecommendedRuns: [],
    oppositionResearchNextActions: [],
    debatePrepNextActions: [],
    citationImprovementPriorities: [],
    mediaMonitoringPriorities: [],
    publicMeetingWatchlistGaps: [],
    briefingPaperQueueExtended: [],
    writingOpportunitiesExtended: [],
    llmDraftQueueSummary: {
      pendingCount: 0,
      debateDraftBacklog: 0,
      writingDraftBacklog: 0,
      citationRiskDraftCount: 0,
      unsupportedClaimDraftCount: 0,
    },
    llmDraftReviewPriorities: [],
    llmUnsafeDraftWarnings: [],
    scenarioTopRisks: [],
    scenarioTopOpportunities: [],
    scenarioDebateTraps: [],
    scenarioMediaEscalationWarnings: [],
    scenarioCountyReactionWarnings: [],
    scenarioRegistrationPathwayRisks: [],
    scenarioEvidenceBlockers: [],
    scenarioHumanReviewActions: [],
    targetPathwayMissingData: [],
  } as unknown as ReturnType<typeof summarizeCampaignIntelligenceState>);

  const actionQueueSection = tryIntelligenceLoad(
    "evidence-command-action-queue",
    () => getEvidenceCommandActionQueueSection(),
    {
      topUrgent: [],
      topBlocked: [],
      topOpportunity: [],
      debatePrep: [],
      citationReview: [],
      countyBriefing: [],
      targetPathway: [],
      queueHref: "/admin/intelligence/action-queue",
    },
  );

  return {
    index,
    copilot,
    narrativeBriefings,
    geographicSummary,
    usageSummary,
    strategicSummary,
    countyBriefingSummary,
    operationalSummary,
    registration,
    media,
    brain,
    actionQueueSection,
    indexUnavailable: !indexLoaded,
  };
}
