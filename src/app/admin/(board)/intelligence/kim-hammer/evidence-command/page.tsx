import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import {
  loadKimHammerEvidenceIndex,
  resolveRetrievalTaskStatus,
} from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  canExportClaim,
  getExternalUseStatus,
  getLegalRiskLabel,
  getPublicationTier,
  getReviewStatusLabel,
  getSafetyBlockers,
  KIM_HAMMER_EXPORT_FILTER,
} from "@/lib/opposition/kimHammerPublicationSafety";
import { loadKimHammerKh4SuggestionAgents } from "@/lib/opposition/kimHammerKh4SuggestionAgents";
import { loadKimHammerNarrativeBriefings } from "@/lib/opposition/kimHammerNarrativeBriefings";
import { EvidenceCommandNarrativeBrief } from "./EvidenceCommandNarrativeBrief";
import {
  EvidenceCommandDashboard,
  type EvidenceCommandAnalytics,
} from "./EvidenceCommandDashboard";
import {
  EvidenceCommandFilters,
  type EvidenceCommandClaimRow,
  type EvidenceCommandTaskRow,
} from "./EvidenceCommandFilters";
import {
  EvidenceCommandReviewPanel,
  type KimHammerClaimReviewRow,
} from "../EvidenceCommandReviewPanel";
import {
  EvidenceCommandTaskPanel,
  type KimHammerRetrievalTaskRow,
} from "../EvidenceCommandTaskPanel";
import { getAllowedReviewTransitions } from "@/lib/opposition/kimHammerReviewWorkflow";
import { getAllowedTaskTransitions } from "@/lib/opposition/kimHammerTaskWorkflow";
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

function buildRecommendedActions(index: ReturnType<typeof loadKimHammerEvidenceIndex>): string[] {
  const actions: string[] = [];

  if (index.metrics.blockedClaims > 0) {
    actions.push(
      `Keep ${index.metrics.blockedClaims} safety-blocked claim(s) out of external messaging until blockers are resolved.`,
    );
  }

  if (index.metrics.reviewNeededClaims > 0) {
    actions.push(
      `Complete human review for ${index.metrics.reviewNeededClaims} claim(s) before treating caution-tier material as deployable.`,
    );
  }

  const highPriorityTasks = [...index.retrievalTasks]
    .filter((task) => task.priority === "HIGH" && resolveRetrievalTaskStatus(task) !== "COMPLETE")
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .slice(0, 3);

  if (highPriorityTasks.length > 0) {
    actions.push(
      `Execute top KH-3B retrieval tasks (${highPriorityTasks.map((task) => `#${task.rank ?? "?"}`).join(", ")}) to close evidence gaps.`,
    );
  }

  if (index.metrics.exportReadyClaims > 0) {
    actions.push(
      `Use only ${index.metrics.exportReadyClaims} export-ready claim(s) for citation-backed debate prep; download from debate packet export after final review.`,
    );
  } else {
    actions.push("No claims currently pass the full export filter; prioritize retrieval and review before external debate prep.");
  }

  actions.push("Treat all KH-4 copilot suggestions as non-publishable until human review and publication-safety clearance.");

  if (index.reviewNeededClaims.some((claim) => claim.citationStatus === "PARTIAL")) {
    actions.push("Strengthen partial citations on caution-tier claims before moving them toward Tier 1 deployability.");
  }

  return actions;
}

function buildExecutableTaskRows(
  index: ReturnType<typeof loadKimHammerEvidenceIndex>,
): KimHammerRetrievalTaskRow[] {
  return [...index.retrievalTasks]
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .map((task) => ({
      id: task.id,
      rank: task.rank ?? null,
      title: task.description,
      taskStatus: resolveRetrievalTaskStatus(task),
      owner: task.owner ?? "",
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      completionNotes: task.completionNotes ?? "",
      reviewRequired: task.reviewRequired ?? false,
      externalReadiness: task.externalMessageReadiness ?? "—",
      allowedTransitions: getAllowedTaskTransitions(resolveRetrievalTaskStatus(task)),
    }));
}

function buildReviewRows(index: ReturnType<typeof loadKimHammerEvidenceIndex>): KimHammerClaimReviewRow[] {
  return index.claims.map((claim) => ({
    id: claim.id,
    indexSource: claim.indexSource,
    title: claim.topic ?? claim.id,
    text: claim.text ?? claim.claim ?? "",
    reviewStatus: getReviewStatusLabel(claim),
    reviewer: claim.reviewer,
    reviewNotes: claim.reviewNotes,
    exportReady: canExportClaim(claim),
    allowedTransitions: getAllowedReviewTransitions(claim.reviewStatus),
  }));
}

function buildClaimRows(index: ReturnType<typeof loadKimHammerEvidenceIndex>): EvidenceCommandClaimRow[] {
  return index.claims.map((claim) => ({
    id: claim.id,
    indexSource: claim.indexSource,
    title: claim.topic ?? claim.id,
    text: claim.text ?? claim.claim ?? "",
    reviewStatus: getReviewStatusLabel(claim),
    publicationTier: getPublicationTier(claim) ?? "—",
    legalRisk: getLegalRiskLabel(claim),
    externalUseStatus: getExternalUseStatus(claim) ?? "—",
    exportReady: canExportClaim(claim),
    blocked: claim.blocked,
    reviewNeeded: claim.reviewNeeded,
    safetyBlockers: getSafetyBlockers(claim, index.publicationSafety.rules),
  }));
}

function buildTaskRows(index: ReturnType<typeof loadKimHammerEvidenceIndex>): EvidenceCommandTaskRow[] {
  return index.retrievalTasks.map((task) => ({
    id: task.id,
    rank: task.rank ?? null,
    title: task.description,
    taskStatus: resolveRetrievalTaskStatus(task),
    owner: task.owner ?? "—",
    priority: task.priority,
    confidenceNeed: task.confidenceNeed ?? "—",
    externalReadiness: task.externalMessageReadiness ?? "—",
  }));
}

function buildAnalytics(
  index: ReturnType<typeof loadKimHammerEvidenceIndex>,
  taskRows: EvidenceCommandTaskRow[],
  copilotAgentCount: number,
): EvidenceCommandAnalytics {
  const retrievalWorkNeededCount = taskRows.filter(
    (task) =>
      task.taskStatus === "NOT_STARTED" ||
      task.taskStatus === "ASSIGNED" ||
      task.externalReadiness === "NOT_READY",
  ).length;

  return {
    exportReadyCount: index.metrics.exportReadyClaims,
    reviewNeededCount: index.metrics.reviewNeededClaims,
    blockedCount: index.metrics.blockedClaims,
    retrievalWorkNeededCount,
    copilotAgentCount,
    activeRetrievalCount: taskRows.filter((task) => task.taskStatus === "IN_PROGRESS").length,
    reviewBottleneckCount:
      index.metrics.reviewStatusCounts.NEEDS_REVIEW + index.metrics.reviewStatusCounts.DRAFT,
    partialCitationCount: index.claims.filter((claim) => claim.citationStatus === "PARTIAL").length,
    mediumHighRiskCount: index.claims.filter(
      (claim) => claim.legalRisk === "MEDIUM" || claim.legalRisk === "HIGH",
    ).length,
    notReadyTaskCount: taskRows.filter((task) => task.externalReadiness === "NOT_READY").length,
    needsContextTaskCount: taskRows.filter((task) => task.externalReadiness === "NEEDS_CONTEXT").length,
    exportReadyClaimIds: index.exportReadyClaims.map((claim) => claim.id),
  };
}

export default async function KimHammerEvidenceCommandPage() {
  const index = loadKimHammerEvidenceIndex();
  const { metrics } = index;
  const copilot = loadKimHammerKh4SuggestionAgents();
  const claimRows = buildClaimRows(index);
  const reviewRows = buildReviewRows(index);
  const executableTaskRows = buildExecutableTaskRows(index);
  const taskRows = buildTaskRows(index);
  const analytics = buildAnalytics(index, taskRows, copilot.agents.length);
  const recommendedActions = buildRecommendedActions(index);
  const geographicSummary = summarizeGeographicNarrativeForCommand();
  const usageSummary = summarizeNarrativeUsageRisk();
  const strategicSummary = summarizeStrategicAlignmentRisk();
  const countyBriefingSummary = summarizeCountyBriefingForEvidenceCommand();
  const countyBriefings = loadCountyBriefingIntelligenceIndex();
  const operationalSummary = summarizeOperationalIntelligenceForEvidenceCommand(countyBriefings.counties);
  const registration = computeStatewideRegistrationRollup();
  const media = summarizeMediaMonitoringReadiness();
  const brain = summarizeCampaignIntelligenceState();
  const nsi7Summary = {
    mediaGaps: media.gaps,
    targetPathwayGaps: brain.targetPathwayMissingData,
    registrationNote: registration.assumptions.notes,
    expectedSupportYield: registration.expectedSupportVotes,
    morningBriefHref: "/admin/intelligence/morning-brief",
    writingToolboxHref: "/admin/intelligence/writing-toolbox",
    targetPathwayHref: "/admin/intelligence/strategic-target-pathway",
  };
  const nsi11Summary = {
    aiToolCount: brain.aiToolCount,
    aiCopilotRecommendedRuns: brain.aiCopilotRecommendedRuns,
    oppositionResearchNextActions: brain.oppositionResearchNextActions,
    debatePrepNextActions: brain.debatePrepNextActions,
    citationImprovementPriorities: brain.citationImprovementPriorities,
    mediaMonitoringPriorities: brain.mediaMonitoringPriorities,
    publicMeetingWatchlistGaps: brain.publicMeetingWatchlistGaps,
    briefingPaperGaps: brain.briefingPaperQueueExtended.slice(0, 4).map((row) => ({
      title: row.title,
      href: row.href,
    })),
    writingOpportunities: brain.writingOpportunitiesExtended.slice(0, 4),
    aiToolsHref: "/admin/intelligence/ai-tools",
    oppositionCopilotHref: "/admin/intelligence/kim-hammer/ai-opposition-copilot",
    debateWorkbenchHref: "/admin/intelligence/kim-hammer/debate-ai-workbench",
    briefingPapersHref: "/admin/intelligence/briefing-papers",
  };
  const nsi12Summary = {
    pendingDraftCount: brain.llmDraftQueueSummary.pendingCount,
    debateDraftBacklog: brain.llmDraftQueueSummary.debateDraftBacklog,
    writingDraftBacklog: brain.llmDraftQueueSummary.writingDraftBacklog,
    citationRiskDraftCount: brain.llmDraftQueueSummary.citationRiskDraftCount,
    unsupportedClaimDraftCount: brain.llmDraftQueueSummary.unsupportedClaimDraftCount,
    reviewPriorities: brain.llmDraftReviewPriorities.slice(0, 4),
    unsafeWarnings: brain.llmUnsafeDraftWarnings.slice(0, 4),
    llmReviewQueueHref: "/admin/intelligence/llm-review-queue",
  };
  const nsi13Summary = {
    narrativeFatigueAlerts: brain.memoryOverusedArguments.slice(0, 3),
    citationAgingAlerts: brain.memoryStaleCitations.slice(0, 3),
    debateRecurrenceWarnings: brain.memoryDebateTraps.slice(0, 3),
    countyDriftWarnings: brain.memoryCountyDriftWarnings.slice(0, 3),
    doctrineInconsistencyWarnings: brain.memoryDoctrineDriftWarnings.slice(0, 3),
    exportFatigueAlerts: brain.longitudinalIntelligence.exportFatigueWarnings.map((r) => r.reason).slice(0, 3),
    recurringAttackSummaries: brain.memoryOpponentEscalation.slice(0, 3),
    intelligenceMemoryHref: "/admin/intelligence/intelligence-memory",
  };
  syncHumanActionQueue();
  const actionQueueSection = getEvidenceCommandActionQueueSection();
  const nsi15Summary = {
    topUrgent: actionQueueSection.topUrgent.map((row) => ({
      actionId: row.actionId,
      title: row.title,
      recommendedNextStep: row.recommendedNextStep,
    })),
    topBlocked: actionQueueSection.topBlocked.map((row) => ({
      actionId: row.actionId,
      title: row.title,
      blockedBy: row.blockedBy,
    })),
    topOpportunity: actionQueueSection.topOpportunity.map((row) => ({
      actionId: row.actionId,
      title: row.title,
    })),
    debatePrep: actionQueueSection.debatePrep.map((row) => ({
      actionId: row.actionId,
      title: row.title,
    })),
    citationReview: actionQueueSection.citationReview.map((row) => ({
      actionId: row.actionId,
      title: row.title,
    })),
    countyBriefing: actionQueueSection.countyBriefing.map((row) => ({
      actionId: row.actionId,
      title: row.title,
    })),
    targetPathway: actionQueueSection.targetPathway.map((row) => ({
      actionId: row.actionId,
      title: row.title,
    })),
    queueHref: actionQueueSection.queueHref,
  };
  const nsi14Summary = {
    scenarioTopRisks: brain.scenarioTopRisks,
    scenarioTopOpportunities: brain.scenarioTopOpportunities,
    scenarioDebateTraps: brain.scenarioDebateTraps.slice(0, 4),
    scenarioMediaEscalationWarnings: brain.scenarioMediaEscalationWarnings.slice(0, 4),
    scenarioCountyReactionWarnings: brain.scenarioCountyReactionWarnings.slice(0, 4),
    scenarioRegistrationPathwayRisks: brain.scenarioRegistrationPathwayRisks.slice(0, 4),
    scenarioEvidenceBlockers: brain.scenarioEvidenceBlockers.slice(0, 4),
    scenarioHumanReviewActions: brain.scenarioHumanReviewActions.slice(0, 5),
    scenarioSimulationHref: "/admin/intelligence/scenario-simulation",
  };

  const blockerRules = index.publicationSafety.rules.filter((rule) =>
    metrics.safetyBlockers.includes(rule.id),
  );

  const exportFilterLabel = `${KIM_HAMMER_EXPORT_FILTER.externalUseStatus} · ${KIM_HAMMER_EXPORT_FILTER.citationStatus} · ${KIM_HAMMER_EXPORT_FILTER.confidenceTier} · ${KIM_HAMMER_EXPORT_FILTER.legalRisk} legal risk · review APPROVED_FOR_EXTERNAL_USE or EXPORTED`;

  return (
    <KimHammerBriefingPageShell moduleId="evidence-command">
<EvidenceCommandNarrativeBrief sections={loadKimHammerNarrativeBriefings().sections} />

      <EvidenceCommandDashboard
        analytics={analytics}
        reviewStatusCounts={metrics.reviewStatusCounts}
        taskStatusCounts={metrics.taskStatusCounts}
        tierDistribution={metrics.tierDistribution}
        safetyBlockerIds={metrics.safetyBlockers}
        safetyBlockerDescriptions={blockerRules.map((rule) => ({
          id: rule.id,
          description: rule.description,
        }))}
        exportFilterLabel={exportFilterLabel}
        copilotLabel={copilot.nonPublishableLabel}
        recommendedActions={recommendedActions}
        geographicSummary={geographicSummary}
        usageSummary={usageSummary}
        strategicSummary={strategicSummary}
        countyBriefingSummary={countyBriefingSummary}
        operationalSummary={operationalSummary}
        nsi7Summary={nsi7Summary}
        nsi11Summary={nsi11Summary}
        nsi12Summary={nsi12Summary}
        nsi13Summary={nsi13Summary}
        nsi14Summary={nsi14Summary}
        nsi15Summary={nsi15Summary}
      />

      <EvidenceCommandReviewPanel claims={reviewRows} />

      <EvidenceCommandTaskPanel tasks={executableTaskRows} />

      <EvidenceCommandFilters claims={claimRows} tasks={taskRows} />
    </KimHammerBriefingPageShell>
  );
}
