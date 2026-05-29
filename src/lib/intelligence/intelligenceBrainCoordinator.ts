import { buildAggregateCampaignIntelligenceIndex } from "@/lib/intelligence/aggregateCampaignIntelligence";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import { computeStatewideRegistrationRollup } from "@/lib/intelligence/voterRegistrationTargetModel";
import { summarizeMediaMonitoringReadiness } from "@/lib/intelligence/publicMediaMonitor";
import { summarizeMediaIntakeQueue } from "@/lib/intelligence/publicMediaIntake";
import {
  summarizeCoverageGaps,
  summarizeFetchApprovedSources,
  summarizeManualReviewSources,
  summarizeSourceCoverage,
} from "@/lib/intelligence/mediaSourceDiscovery";
import {
  recommendBorderMarketMonitoringPriorities,
  recommendLocalPaperReviewPriorities,
  summarizeBorderMediaIntelligence,
  summarizeEdgeCountyCoverageGaps,
} from "@/lib/intelligence/mediaMarketIntelligence";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import { summarizeNarrativeUsageRisk } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { summarizeFeedApprovalReadiness } from "@/lib/intelligence/mediaFeedApprovalGate";
import {
  loadAiCopilotToolRegistry,
  recommendCopilotRuns,
  summarizeCopilotInternalDraftInsights,
} from "@/lib/intelligence/aiCopilotOrchestrator";
import { rankMediaFindingsForOppositionResearch } from "@/lib/intelligence/mediaIntelligenceCopilot";
import { recommendWatchlistGaps } from "@/lib/intelligence/publicMeetingWatchlist";
import {
  loadMediaDerivedCitationCandidates,
  loadMediaDerivedTaskDrafts,
  summarizePromotionQueue,
} from "@/lib/intelligence/mediaFindingPromotionWorkflow";
import { summarizeScheduledIntakeRun } from "@/lib/intelligence/scheduledPublicMediaIntake";
import { summarizeDraftReviewQueue } from "@/lib/intelligence/llmDraftGateway";
import { summarizeLongitudinalIntelligence } from "@/lib/intelligence/intelligenceMemoryEngine";
import { summarizeStrategicScenarioSimulation } from "@/lib/intelligence/strategicScenarioSimulation";

export type CampaignIntelligenceBrainState = {
  generatedAt: string;
  strongestNarratives: Array<{ narrativeId: string; title: string; signal: string }>;
  weakestNarratives: Array<{ narrativeId: string; title: string; signal: string }>;
  blockedNarratives: Array<{ narrativeId: string; title: string; signal: string }>;
  underusedNarratives: Array<{ narrativeId: string; title: string; signal: string }>;
  overusedNarratives: Array<{ narrativeId: string; title: string; signal: string }>;
  openResearchTasks: string[];
  citationProblems: string[];
  mediaIntakeReadiness: ReturnType<typeof summarizeMediaMonitoringReadiness>;
  countyRisks: Array<{ countyId: string; countyName: string; signal: string }>;
  countyOpportunities: Array<{ countyId: string; countyName: string; signal: string }>;
  doctrineTensions: Array<{ narrativeId: string; title: string; signal: string }>;
  registrationGoalGaps: string[];
  targetPathwayMissingData: string[];
  debatePrepPriorities: string[];
  writingOpportunities: string[];
  topLeadershipItems: string[];
  whatNotToSayToday: string[];
  mediaIntakeSummary: ReturnType<typeof summarizeMediaIntakeQueue>;
  topPendingMediaFindings: Array<{ findingId: string; title: string; relevanceScore: number }>;
  mediaIntakeWarnings: string[];
  mediaReviewPriorities: string[];
  sourceCoverageWarnings: string[];
  missingRegionCoverage: string[];
  missingTopicCoverage: string[];
  manualReviewBurden: number;
  fetchApprovedSourceSummary: string[];
  publicMediaDiscoveryPriorities: string[];
  borderMediaCoverageWarnings: string[];
  crossStateSourceGaps: string[];
  edgeCountyMediaAlerts: string[];
  localPaperPriorityNotes: string[];
  borderManualReviewBurdenByMarket: Record<string, number>;
  borderMonitoringPriorities: string[];
  scheduledIntakeReadiness: ReturnType<typeof summarizeFeedApprovalReadiness>;
  lastIntakeRunSummary: ReturnType<typeof summarizeScheduledIntakeRun>;
  newFindingsFromLastRun: number;
  promotionQueueSummary: ReturnType<typeof summarizePromotionQueue>;
  citationCandidateBacklog: string[];
  taskDraftBacklog: string[];
  feedApprovalBlockers: string[];
  oppositionResearchNextActions: string[];
  debatePrepNextActions: string[];
  citationImprovementPriorities: string[];
  mediaMonitoringPriorities: string[];
  publicMeetingWatchlistGaps: string[];
  countyIntelligenceGaps: string[];
  strategicTargetGaps: string[];
  briefingPaperQueueExtended: Array<{ paperId: string; title: string; href: string }>;
  writingOpportunitiesExtended: string[];
  aiCopilotRecommendedRuns: string[];
  aiCopilotInternalDraftInsights: string[];
  aiToolCount: number;
  llmDraftQueueSummary: ReturnType<typeof summarizeDraftReviewQueue>;
  llmDraftReviewPriorities: string[];
  llmUnsafeDraftWarnings: string[];
  llmTopDraftOpportunities: string[];
  longitudinalIntelligence: ReturnType<typeof summarizeLongitudinalIntelligence>;
  memoryStrengtheningNarratives: string[];
  memoryWeakeningNarratives: string[];
  memoryOverusedArguments: string[];
  memoryStaleCitations: string[];
  memoryCountyDriftWarnings: string[];
  memoryDoctrineDriftWarnings: string[];
  memoryDebateTraps: string[];
  memoryOpponentEscalation: string[];
  memoryMediaCycleChanges: string[];
  strategicScenarioSimulation: ReturnType<typeof summarizeStrategicScenarioSimulation>;
  scenarioTopRisks: string[];
  scenarioTopOpportunities: string[];
  scenarioDebateTraps: string[];
  scenarioMediaEscalationWarnings: string[];
  scenarioCountyReactionWarnings: string[];
  scenarioRegistrationPathwayRisks: string[];
  scenarioEvidenceBlockers: string[];
  scenarioHumanReviewActions: string[];
};

export function summarizeCampaignIntelligenceState(
  repoRoot: string = process.cwd(),
): CampaignIntelligenceBrainState {
  const narrativeIndex = loadKimHammerNarrativeStateIndex(repoRoot);
  const usage = summarizeNarrativeUsageRisk(repoRoot);
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const countyIndex = loadCountyBriefingIntelligenceIndex(repoRoot);
  const aggregate = buildAggregateCampaignIntelligenceIndex(countyIndex.counties, repoRoot);
  const alignment = summarizeStrategicAlignmentRisk(repoRoot);
  const registration = computeStatewideRegistrationRollup(repoRoot);
  const winTarget = loadKellyWinTargetScenarioFile(repoRoot);
  const media = summarizeMediaMonitoringReadiness(repoRoot);
  const mediaIntake = summarizeMediaIntakeQueue(repoRoot);
  const sourceCoverage = summarizeSourceCoverage(repoRoot);
  const coverageGaps = summarizeCoverageGaps(repoRoot);
  const fetchApproved = summarizeFetchApprovedSources(repoRoot);
  const manualReview = summarizeManualReviewSources(repoRoot);

  const strongestNarratives = narrativeIndex.narratives
    .filter((row) => row.readinessBand === "STRONG")
    .slice(0, 5)
    .map((row) => ({ narrativeId: row.narrativeId, title: row.title, signal: row.signal.slice(0, 140) }));

  const weakestNarratives = narrativeIndex.narratives
    .filter((row) => row.readinessBand === "WEAK")
    .slice(0, 5)
    .map((row) => ({ narrativeId: row.narrativeId, title: row.title, signal: row.signal.slice(0, 140) }));

  const blockedNarratives = narrativeIndex.narratives
    .filter((row) => row.readinessBand === "BLOCKED")
    .map((row) => ({ narrativeId: row.narrativeId, title: row.title, signal: row.signal.slice(0, 140) }));

  const underusedNarratives =
    usage.underutilizedAlerts?.slice(0, 4).map((row) => ({
      narrativeId: row.narrativeId,
      title: row.narrativeTitle,
      signal: row.signal,
    })) ?? [];

  const overusedNarratives =
    usage.topFatigueWarnings?.slice(0, 4).map((row) => ({
      narrativeId: row.narrativeId,
      title: row.narrativeTitle,
      signal: row.signal,
    })) ?? [];

  const openResearchTasks = evidence.retrievalTasks
    .filter((task) => task.taskStatus !== "COMPLETE" && task.taskStatus !== "ARCHIVED")
    .slice(0, 6)
    .map((task) => `${task.id}: ${task.description.slice(0, 100)}`);

  const citationProblems = evidence.claims
    .filter((claim) => claim.citationStatus === "PARTIAL" || claim.reviewNeeded)
    .slice(0, 5)
    .map((claim) => `${claim.id}: ${claim.citationStatus ?? "review"} — ${claim.topic ?? "claim"}`);

  const countyRisks = aggregate.countyEnvironments.flatMap((env) =>
    env.operationalSignals
      .filter((row) =>
        row.signal === "COUNTY_STRUCTURALLY_COMPLEX" ||
        row.signal === "COUNTY_MEDIA_SATURATED" ||
        row.signal === "COUNTY_OPERATIONALLY_STRAINED",
      )
      .slice(0, 1)
      .map((row) => ({ countyId: env.countyId, countyName: env.countyName, signal: row.text.slice(0, 140) })),
  );

  const countyOpportunities = aggregate.countyEnvironments.flatMap((env) =>
    env.operationalSignals
      .filter((row) => row.signal === "COUNTY_HIGH_OPPORTUNITY")
      .map((row) => ({ countyId: env.countyId, countyName: env.countyName, signal: row.text.slice(0, 140) })),
  );

  const doctrineTensions =
    alignment.topStrategicTensions?.slice(0, 4).map((row) => ({
      narrativeId: row.narrativeId,
      title: row.narrativeTitle,
      signal: row.signal,
    })) ?? [];

  const registrationGoalGaps = [
    `${registration.missingCountyGoalCount} of ${registration.countyRows.length} counties lack populated registration goals in normalized file.`,
    `Statewide anchor goal: ${registration.statewideRegistrationGoal} (constant) — county allocation file empty.`,
  ];

  const targetPathwayMissingData: string[] = [];
  if (!winTarget) targetPathwayMissingData.push("kelly-win-target-scenario-v1.json not loaded.");
  else {
    targetPathwayMissingData.push(
      `Win scenario confidence low on ${winTarget.counties.filter((c) => c.confidence === "low").length} counties.`,
    );
    if (winTarget.counties.every((c) => c.missingData.includes("registration_goal"))) {
      targetPathwayMissingData.push("All counties flag registration_goal missing in win-target model.");
    }
  }

  const debatePrepPriorities = countyIndex.counties
    .filter((row) => row.briefingSignals.some((s) => s.signal === "COUNTY_DEBATE_RELEVANT"))
    .slice(0, 4)
    .map((row) => `${row.countyName}: ${row.topOpponentBills[0]?.billNumber ?? "review bills"}`);

  const writingOpportunities = [
    "Export-ready debate claims available for INTERNAL_DRAFT talking point generation only.",
    "County briefings with doctrine-safe frames ready for volunteer script drafts.",
    "Blocked narratives require what-not-to-say summaries before any field use.",
  ];

  const topLeadershipItems = [
    ...strongestNarratives.slice(0, 2).map((row) => `Strong narrative: ${row.title}`),
    ...blockedNarratives.slice(0, 1).map((row) => `Blocked: ${row.title}`),
    ...countyRisks.slice(0, 1).map((row) => `County risk: ${row.countyName}`),
    ...doctrineTensions.slice(0, 1).map((row) => `Doctrine tension: ${row.title}`),
    `Export-ready claims: ${evidence.metrics.exportReadyClaims} (governed gate unchanged).`,
  ].slice(0, 5);

  const whatNotToSayToday = [
    "No motive inference without statutory confirmation.",
    ...blockedNarratives.slice(0, 2).map((row) => `Avoid blocked narrative: ${row.title}`),
    ...countyRisks.slice(0, 1).map((row) => `County-sensitive: ${row.signal}`),
  ];

  const mediaIntakeWarnings = [
    ...mediaIntake.staleIntakeWarnings,
    ...mediaIntake.sourceCoverageGaps,
  ];

  const topPendingMediaFindings = mediaIntake.topRelevantFindings.map((row) => ({
    findingId: row.findingId,
    title: row.title,
    relevanceScore: row.relevanceScore,
  }));

  const mediaReviewPriorities = mediaIntake.suggestedReviewPriorities;

  const sourceCoverageWarnings = [
    ...coverageGaps.weakRegions.map((r) => `Weak region coverage: ${r}`),
    ...coverageGaps.podcastAudioGaps.slice(0, 1),
  ];

  const missingRegionCoverage = coverageGaps.weakRegions;
  const missingTopicCoverage = coverageGaps.weakTopics;

  const manualReviewBurden = manualReview.length;

  const fetchApprovedSourceSummary = fetchApproved.map(
    (row) => `${row.name} (${row.verificationMethod ?? "verified"})`,
  );

  const publicMediaDiscoveryPriorities = coverageGaps.discoveryPriorities;

  const borderIntel = summarizeBorderMediaIntelligence(repoRoot);
  const borderMediaCoverageWarnings = borderIntel.gaps.slice(0, 6).map((g) => g.text);
  const crossStateSourceGaps =
    borderIntel.coverage.fetchApprovedCrossState === 0
      ? [`${borderIntel.coverage.crossStateSourceCount} cross-state sources registered — none fetch-approved until NSI-11 robots review.`]
      : [];
  const edgeCountyMediaAlerts = borderIntel.signals
    .filter((s) => s.signal === "BORDER_MEDIA_WEAK" || s.signal === "MEDIA_COVERAGE_GAP")
    .slice(0, 5)
    .map((s) => s.text);
  const localPaperPriorityNotes = recommendLocalPaperReviewPriorities(repoRoot);
  const borderManualReviewBurdenByMarket = borderIntel.manualBurden.byMarket;
  const borderMonitoringPriorities = recommendBorderMarketMonitoringPriorities(repoRoot);

  const scheduledIntakeReadiness = summarizeFeedApprovalReadiness(repoRoot);
  const lastIntakeRunSummary = summarizeScheduledIntakeRun(repoRoot);
  const newFindingsFromLastRun = lastIntakeRunSummary.lastNewFindingCount;
  const promotionQueueSummary = summarizePromotionQueue(repoRoot);
  const citationCandidates = loadMediaDerivedCitationCandidates(repoRoot);
  const taskDrafts = loadMediaDerivedTaskDrafts(repoRoot);
  const citationCandidateBacklog = citationCandidates.candidates.slice(0, 4).map(
    (row) => `${row.candidateId}: ${row.title.slice(0, 80)} (DRAFT — not citation card)`,
  );
  const taskDraftBacklog = taskDrafts.drafts.slice(0, 4).map(
    (row) => `${row.draftId}: ${row.suggestedTaskTitle.slice(0, 80)} (DRAFT — not active task)`,
  );
  const feedApprovalBlockers = scheduledIntakeReadiness.blockersBySource
    .slice(0, 5)
    .map((row) => `${row.name}: ${row.blockers.join("; ")}`);

  const copilotRegistry = loadAiCopilotToolRegistry(repoRoot);
  const aiCopilotRecommendedRuns = recommendCopilotRuns(repoRoot);
  const aiCopilotInternalDraftInsights = summarizeCopilotInternalDraftInsights(repoRoot);

  const oppositionResearchNextActions = [
    ...weakestNarratives.slice(0, 2).map((n) => `Research weakness: ${n.title}`),
    ...citationProblems.slice(0, 2),
    "Run vulnerability-finder before expanding opposition messaging.",
  ];

  const debatePrepNextActions = [
    ...debatePrepPriorities.slice(0, 3),
    "Run what-not-to-say-detector before rehearsal.",
    "Run debate-question-generator for bill anchors.",
  ];

  const citationImprovementPriorities = citationProblems.slice(0, 4);

  const mediaMonitoringPriorities = [
    ...mediaReviewPriorities.slice(0, 2),
    ...rankMediaFindingsForOppositionResearch(repoRoot).slice(0, 2).map((r) => `Media triage: ${r.title.slice(0, 60)}`),
  ];

  const publicMeetingWatchlistGaps = recommendWatchlistGaps(repoRoot);

  const countyIntelligenceGaps = countyRisks.slice(0, 4).map((r) => `${r.countyName}: ${r.signal}`);

  const strategicTargetGaps = [...targetPathwayMissingData, ...registrationGoalGaps.slice(0, 2)];

  const briefingPaperQueueExtended = [
    { paperId: "morning-intelligence", title: "Morning Brief", href: "/admin/intelligence/morning-brief" },
    { paperId: "debate-prep", title: "Debate Brief", href: "/admin/intelligence/kim-hammer/debate-ai-workbench" },
    { paperId: "county-pulaski", title: "County Brief", href: "/admin/intelligence/kim-hammer/counties/pulaski" },
    { paperId: "opposition-research", title: "Opposition Research Brief", href: "/admin/intelligence/kim-hammer/ai-opposition-copilot" },
    { paperId: "media-monitoring", title: "Media Monitoring Brief", href: "/admin/intelligence/media-intake" },
    { paperId: "doctrine", title: "Strategic Doctrine Brief", href: "/admin/intelligence/strategy-alignment" },
  ];

  const writingOpportunitiesExtended = [
    ...writingOpportunities,
    "Structured candidate talking points available (INTERNAL_DRAFT).",
    "Volunteer county scripts — field organizer review required.",
  ];

  const llmDraftQueueSummary = summarizeDraftReviewQueue(repoRoot);
  const longitudinalIntelligence = summarizeLongitudinalIntelligence(repoRoot);
  const strategicScenarioSimulation = summarizeStrategicScenarioSimulation(repoRoot);

  return {
    generatedAt: new Date().toISOString(),
    strongestNarratives,
    weakestNarratives,
    blockedNarratives,
    underusedNarratives,
    overusedNarratives,
    openResearchTasks,
    citationProblems,
    mediaIntakeReadiness: media,
    countyRisks,
    countyOpportunities,
    doctrineTensions,
    registrationGoalGaps,
    targetPathwayMissingData,
    debatePrepPriorities,
    writingOpportunities,
    topLeadershipItems,
    whatNotToSayToday,
    mediaIntakeSummary: mediaIntake,
    topPendingMediaFindings,
    mediaIntakeWarnings,
    mediaReviewPriorities,
    sourceCoverageWarnings,
    missingRegionCoverage,
    missingTopicCoverage,
    manualReviewBurden,
    fetchApprovedSourceSummary,
    publicMediaDiscoveryPriorities,
    borderMediaCoverageWarnings,
    crossStateSourceGaps,
    edgeCountyMediaAlerts,
    localPaperPriorityNotes,
    borderManualReviewBurdenByMarket,
    borderMonitoringPriorities,
    scheduledIntakeReadiness,
    lastIntakeRunSummary,
    newFindingsFromLastRun,
    promotionQueueSummary,
    citationCandidateBacklog,
    taskDraftBacklog,
    feedApprovalBlockers,
    oppositionResearchNextActions,
    debatePrepNextActions,
    citationImprovementPriorities,
    mediaMonitoringPriorities,
    publicMeetingWatchlistGaps,
    countyIntelligenceGaps,
    strategicTargetGaps,
    briefingPaperQueueExtended,
    writingOpportunitiesExtended,
    aiCopilotRecommendedRuns,
    aiCopilotInternalDraftInsights,
    aiToolCount: copilotRegistry.tools.length,
    llmDraftQueueSummary,
    llmDraftReviewPriorities: llmDraftQueueSummary.reviewQueuePriorities,
    llmUnsafeDraftWarnings: llmDraftQueueSummary.unsafeDraftWarnings,
    llmTopDraftOpportunities: llmDraftQueueSummary.topDraftOpportunities,
    longitudinalIntelligence,
    memoryStrengtheningNarratives: longitudinalIntelligence.strengtheningNarratives.map((r) => `${r.entityLabel}: ${r.reason.slice(0, 100)}`),
    memoryWeakeningNarratives: longitudinalIntelligence.weakeningNarratives.map((r) => `${r.entityLabel}: ${r.reason.slice(0, 100)}`),
    memoryOverusedArguments: longitudinalIntelligence.overusedArguments.map((r) => r.reason),
    memoryStaleCitations: longitudinalIntelligence.staleCitations.map((r) => `${r.entityLabel}: ${r.reason.slice(0, 80)}`),
    memoryCountyDriftWarnings: longitudinalIntelligence.countyDriftWarnings.map((r) => `${r.entityLabel}: ${r.reason.slice(0, 80)}`),
    memoryDoctrineDriftWarnings: longitudinalIntelligence.doctrineDriftWarnings.map((r) => r.reason.slice(0, 100)),
    memoryDebateTraps: longitudinalIntelligence.recurringDebateTraps.map((r) => r.reason.slice(0, 100)),
    memoryOpponentEscalation: longitudinalIntelligence.opponentMessageEscalation.map((r) => r.reason.slice(0, 100)),
    memoryMediaCycleChanges: longitudinalIntelligence.mediaCycleChanges.map((r) => r.reason.slice(0, 100)),
    strategicScenarioSimulation,
    scenarioTopRisks: strategicScenarioSimulation.highestRisk.slice(0, 5).map((r) => `${r.title}: ${r.primarySignal}`),
    scenarioTopOpportunities: strategicScenarioSimulation.strongestOpportunity.slice(0, 5).map((r) => `${r.title}: ${r.primarySignal}`),
    scenarioDebateTraps: strategicScenarioSimulation.debateTraps.map((r) => `${r.title} — ${r.reasons[0]?.slice(0, 80) ?? ""}`),
    scenarioMediaEscalationWarnings: strategicScenarioSimulation.mediaEscalationWarnings.map((r) => `${r.title}: ${r.primarySignal}`),
    scenarioCountyReactionWarnings: strategicScenarioSimulation.countyReactionScenarios.map((r) => `${r.linkedCounties.join(", ")}: ${r.title}`),
    scenarioRegistrationPathwayRisks: strategicScenarioSimulation.turnoutRegistrationScenarios.map((r) => r.reasons[0] ?? r.title),
    scenarioEvidenceBlockers: strategicScenarioSimulation.evidenceDependencyBlockers,
    scenarioHumanReviewActions: strategicScenarioSimulation.recommendedHumanReviewActions,
  };
}

export function recommendIntelligenceGatheringPriorities(
  repoRoot?: string,
): string[] {
  const state = summarizeCampaignIntelligenceState(repoRoot);
  return [
    ...state.openResearchTasks.slice(0, 3),
    ...state.citationProblems.slice(0, 2),
    ...state.targetPathwayMissingData.slice(0, 2),
    ...state.mediaIntakeReadiness.gaps.slice(0, 2),
    ...state.mediaReviewPriorities.slice(0, 2),
    ...state.publicMediaDiscoveryPriorities.slice(0, 2),
    ...state.borderMonitoringPriorities.slice(0, 2),
    ...state.oppositionResearchNextActions.slice(0, 2),
    ...state.debatePrepNextActions.slice(0, 2),
    ...state.aiCopilotRecommendedRuns.slice(0, 2),
    ...state.publicMeetingWatchlistGaps.slice(0, 2),
  ];
}

export function summarizeBriefingPaperQueue(repoRoot?: string): Array<{ paperId: string; title: string; href: string }> {
  return summarizeCampaignIntelligenceState(repoRoot).briefingPaperQueueExtended;
}

export function summarizeWritingOpportunities(repoRoot?: string): string[] {
  return summarizeCampaignIntelligenceState(repoRoot).writingOpportunitiesExtended;
}

export function summarizeMediaMonitoringNeeds(repoRoot?: string): string[] {
  const media = summarizeMediaMonitoringReadiness(repoRoot);
  const intake = summarizeMediaIntakeQueue(repoRoot);
  return [...media.gaps, ...media.recommendations, ...intake.suggestedReviewPriorities.slice(0, 3)];
}

export {
  summarizeBorderMediaIntelligence,
  recommendBorderMarketMonitoringPriorities,
  summarizeEdgeCountyCoverageGaps,
  recommendLocalPaperReviewPriorities,
};
