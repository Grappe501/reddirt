import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import { buildMorningBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import { summarizeDraftReviewQueue } from "@/lib/intelligence/llmDraftGateway";
import {
  summarizeHumanActionQueue,
  rankHumanActions,
  loadHumanActionQueue,
  syncHumanActionQueue,
} from "@/lib/intelligence/strategicDecisionSupport";
import type { HumanActionQueueItem } from "@/lib/intelligence/types/humanActionQueue";
import { summarizeStrategicScenarioSimulation } from "@/lib/intelligence/strategicScenarioSimulation";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadHumanActionQueueAuditLog } from "@/lib/intelligence/humanActionQueueWorkflow";
import { loadPublicMediaIntakeQueue } from "@/lib/intelligence/publicMediaIntake";
import { HUMAN_ACTION_QUEUE_REL } from "@/lib/intelligence/types/humanActionQueue";
import {
  summarizeInstitutionalMemory,
  syncRecommendationLedgerFromActionQueue,
} from "@/lib/intelligence/institutionalMemory/institutionalMemoryEngine";
import { runDailyIntelligenceAgentPass } from "@/lib/intelligence/intelligenceAgentOrchestrator";
import { buildWeeklyIntelligencePacket } from "@/lib/intelligence/briefs/weeklyIntelligenceBrief";
import type {
  CommandCenterChangeSignal,
  IntelligenceCommandCenterSnapshot,
} from "@/lib/intelligence/commandCenter/types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveRepoRoot(repoRoot?: string): string {
  return repoRoot ?? process.cwd();
}

function buildChangeSignals(repoRoot: string, newFindingsFromLastRun: number): CommandCenterChangeSignal[] {
  const signals: CommandCenterChangeSignal[] = [];
  const paper = buildMorningBriefingPaper(repoRoot);

  for (const line of paper.whatChanged) {
    signals.push({
      label: "Briefing composition",
      detail: line,
      source: "NSI-7 strategic briefing paper",
      isSnapshot: true,
    });
  }

  const queuePath = path.join(repoRoot, HUMAN_ACTION_QUEUE_REL);
  if (existsSync(queuePath)) {
    const queue = JSON.parse(readFileSync(queuePath, "utf8")) as { generatedAt?: string; items?: unknown[] };
    signals.push({
      label: "Action queue artifact",
      detail: `Queue generatedAt ${queue.generatedAt ?? "unknown"} · ${queue.items?.length ?? 0} items on file.`,
      source: "NSI-15 human-action-queue.json",
      isSnapshot: true,
    });
  }

  const audit = loadHumanActionQueueAuditLog(repoRoot);
  const recentAudit = audit.entries.slice(-3).reverse();
  for (const entry of recentAudit) {
    signals.push({
      label: "Operator action update",
      detail: `${entry.actionId}: ${entry.previousStatus} → ${entry.nextStatus} (${entry.changedAt.slice(0, 10)})`,
      source: "NSI-15 audit log",
      isSnapshot: false,
    });
  }

  if (newFindingsFromLastRun > 0) {
    signals.push({
      label: "Media intake run",
      detail: `${newFindingsFromLastRun} new finding(s) from last scheduled intake run.`,
      source: "NSI-10 run log",
      isSnapshot: true,
    });
  }

  signals.push({
    label: "Institutional memory",
    detail:
      "NSI-17 decision, recommendation, and lesson ledgers capture campaign outcomes. Cross-hub timestamp diff engine remains a future pass.",
    source: "NSI-17 institutional memory",
    isSnapshot: true,
  });

  return signals.slice(0, 12);
}

export function composeIntelligenceCommandCenter(
  repoRoot?: string,
  options?: { syncActionQueue?: boolean },
): IntelligenceCommandCenterSnapshot {
  const root = resolveRepoRoot(repoRoot);

  if (options?.syncActionQueue) {
    syncHumanActionQueue(root);
    syncRecommendationLedgerFromActionQueue(root);
  }

  const memory = summarizeInstitutionalMemory(root);
  const brain = summarizeCampaignIntelligenceState(root);
  const evidenceIndex = loadKimHammerEvidenceIndex(root);
  const citations = loadKimHammerCitationLocker(root);
  const llm = summarizeDraftReviewQueue(root);
  const actionQueue = summarizeHumanActionQueue(root);
  const queueFile = loadHumanActionQueue(root);
  const rankedActions = rankHumanActions(
    queueFile.items.filter(
      (row: HumanActionQueueItem) => row.status !== "ARCHIVED" && row.status !== "DISMISSED",
    ),
  );
  const scenarios = summarizeStrategicScenarioSimulation(root);
  const debate = buildDebateCommandCenterState();
  const workbench = loadKimHammerWorkbench();
  const mediaQueue = loadPublicMediaIntakeQueue(root);
  const pendingMedia = mediaQueue.findings.filter((f) => f.reviewStatus === "NEEDS_REVIEW").length;

  const exportReady = evidenceIndex.metrics.exportReadyClaims;
  const totalClaims = evidenceIndex.metrics.totalClaims;
  const exportPct = totalClaims > 0 ? (exportReady / totalClaims) * 100 : 0;
  const blockedCount = brain.blockedNarratives.length;
  const urgentCount = actionQueue.urgentCount;

  const overallReadiness = clampScore(
    exportPct * 0.25 +
      (100 - Math.min(blockedCount * 8, 40)) * 0.2 +
      (100 - Math.min(urgentCount * 5, 35)) * 0.2 +
      (100 - Math.min(llm.pendingCount * 2, 30)) * 0.2 +
      (debate.readinessScores.find((r) => r.id === "overall")?.score ?? 70) * 0.15,
  );

  const debateScore = debate.readinessScores.find((r) => r.id === "overall")?.score ?? 71;
  const rapidScore = clampScore(
    100 -
      Math.min(pendingMedia * 4, 30) -
      Math.min(brain.scenarioMediaEscalationWarnings.length * 5, 25) -
      Math.min(actionQueue.urgentCount * 3, 25),
  );

  const scenarioConfidence = clampScore(
    100 -
      scenarios.highestRisk.filter((r) => r.confidenceBand === "LOW").length * 8 -
      scenarios.evidenceDependencyBlockers.length * 6,
  );

  const topRisk = scenarios.highestRisk[0];
  const topOpportunity = scenarios.strongestOpportunity[0];
  const opportunityLine = topOpportunity
    ? `Strongest opportunity: ${topOpportunity.title}`
    : null;

  const citationWarningCount =
    citations.citations.filter(
      (c) => c.reviewStatus === "NEEDS_REVIEW" || c.reviewStatus === "STALE" || c.sourceHealth === "ARCHIVE_MISSING",
    ).length + brain.citationProblems.length;

  const leadershipFocus = [
    ...brain.topLeadershipItems.slice(0, 4),
    topRisk ? `Highest scenario risk: ${topRisk.title}` : "Review scenario watchlist.",
    opportunityLine ?? "Review scenario opportunities.",
    actionQueue.urgentCount > 0
      ? `${actionQueue.urgentCount} urgent human action(s) awaiting operator review.`
      : "No urgent actions in queue.",
  ].slice(0, 7);

  const kellyFocus = [
    ...brain.whatNotToSayToday.slice(0, 2).map((line) => `Avoid: ${line}`),
    ...brain.debatePrepPriorities.slice(0, 2).map((line) => `Debate prep: ${line}`),
    `Export-ready claims available: ${exportReady} (human verification still required).`,
    "All candidate-facing language: INTERNAL · NON_PUBLISHABLE until comms approval.",
  ].slice(0, 6);

  return {
    generatedAt: new Date().toISOString(),
    governanceBanner: [
      "RECOMMENDATION_ONLY",
      "HUMAN_ACTION_REQUIRED",
      "NON_PUBLISHABLE",
      "INTERNAL_USE_ONLY",
      "No auto-send · No auto-publish · No autonomous execution",
    ],
    readinessCards: [
      {
        id: "overall",
        label: "Overall intelligence readiness",
        score: overallReadiness,
        detail: "Composite of evidence, blockers, review backlog, and debate posture.",
        href: "/admin/intelligence/kim-hammer/evidence-command",
      },
      {
        id: "evidence",
        label: "Evidence & export gate",
        score: clampScore(exportPct),
        detail: `${exportReady} of ${totalClaims} claims export-ready.`,
        href: "/admin/intelligence/kim-hammer/evidence-command",
      },
      {
        id: "review",
        label: "Human review clearance",
        score: clampScore(100 - Math.min(llm.pendingCount * 3 + actionQueue.recommendedCount * 0.5, 60)),
        detail: `${llm.pendingCount} LLM draft(s) pending · ${actionQueue.recommendedCount} recommended action(s).`,
        href: "/admin/intelligence/llm-review-queue",
      },
      {
        id: "debate",
        label: "Debate readiness",
        score: debateScore,
        detail: debate.readinessScores.find((r) => r.id === "overall")?.weakAreas.join("; ") || "Review debate command.",
        href: "/admin/intelligence/debate-command",
      },
      {
        id: "rapid",
        label: "Rapid response readiness",
        score: rapidScore,
        detail: `${pendingMedia} media finding(s) NEEDS_REVIEW · scenario media warnings tracked.`,
        href: "/admin/intelligence/media-intake",
      },
      {
        id: "scenario",
        label: "Scenario confidence",
        score: scenarioConfidence,
        detail: `${scenarios.totalScenarios} scenarios modeled · ${scenarios.evidenceDependencyBlockers.length} evidence blockers.`,
        href: "/admin/intelligence/scenario-simulation",
      },
    ],
    changeSignals: buildChangeSignals(root, brain.newFindingsFromLastRun),
    reviewBacklog: {
      llmDraftPending: llm.pendingCount,
      humanActionRecommended: actionQueue.recommendedCount,
      citationWarnings: citationWarningCount,
      blockedPublicUse: blockedCount + evidenceIndex.metrics.blockedClaims,
      mediaFindingsPending: pendingMedia,
      topReviewItem:
        llm.reviewQueuePriorities[0] ??
        actionQueue.topUrgent[0]?.title ??
        brain.citationProblems[0] ??
        "No single priority flagged.",
      governanceLabels: ["HUMAN REVIEW REQUIRED", "NON_PUBLISHABLE", "INTERNAL DRAFT"],
    },
    actionQueue,
    actionQueueTop: rankedActions.slice(0, 10),
    evidence: {
      totalClaims,
      exportReadyClaims: exportReady,
      reviewNeededClaims: evidenceIndex.metrics.reviewNeededClaims,
      blockedClaims: evidenceIndex.metrics.blockedClaims,
      citationProblems: brain.citationProblems.slice(0, 6),
      unsupportedWarnings: workbench.riskClaims.slice(0, 5),
      publicUseBlocked: [
        ...brain.blockedNarratives.map((n) => `Blocked narrative: ${n.title}`),
        ...brain.whatNotToSayToday.slice(0, 3),
      ],
      exportReadyUnchangedNote:
        "Export-ready count is governed by existing filters — this page does not mutate claims or exports.",
    },
    scenarioWatch: {
      totalScenarios: scenarios.totalScenarios,
      topRiskTitle: topRisk?.title ?? "No scenario",
      topRiskSignal: topRisk?.primarySignal ?? "Run scenario simulation.",
      lowConfidenceNotes: scenarios.highestRisk
        .filter((r) => r.confidenceBand === "LOW")
        .slice(0, 4)
        .map((r) => `${r.title}: ${r.primarySignal.slice(0, 100)}`),
      assumptionCalibration: [
        ...scenarios.registrationAssumptionNotes.slice(0, 3),
        ...brain.targetPathwayMissingData.slice(0, 2),
      ],
      reviewPoints: scenarios.recommendedHumanReviewActions.slice(0, 5),
      href: "/admin/intelligence/scenario-simulation",
    },
    warRoom: {
      opponentStatus: `${workbench.totalBills} bills indexed · ${workbench.researchConfidenceScore}% research confidence · ${workbench.claimBuckets.needsResearch.length} claims need research.`,
      debateReadinessScore: debateScore,
      debateWeakAreas: debate.readinessScores.find((r) => r.id === "overall")?.weakAreas ?? [],
      rapidResponseReadiness: rapidScore,
      rapidResponseSignals: [
        ...brain.scenarioMediaEscalationWarnings.slice(0, 2),
        ...brain.mediaIntakeWarnings.slice(0, 2),
      ],
      attackLineWarnings: workbench.riskClaims.slice(0, 4),
      approvalBeforeResponse: [
        "All response language requires human review before press, social, or field use.",
        "Use export-ready claims only through export control center workflow.",
        ...brain.whatNotToSayToday.slice(0, 2),
      ],
      hrefs: {
        evidenceCommand: "/admin/intelligence/kim-hammer/evidence-command",
        debateCommand: "/admin/intelligence/debate-command",
        debatePrep: "/admin/intelligence/kim-hammer/debate-prep",
        mediaIntake: "/admin/intelligence/media-intake",
      },
    },
    leadershipFocus,
    kellyFocus,
    weeklyPacket: (() => {
      const dailyPacket = runDailyIntelligenceAgentPass({ repoRoot, syncActionQueue: false });
      const weekly = buildWeeklyIntelligencePacket(dailyPacket, repoRoot);
      return {
        status: "live" as const,
        packetId: weekly.packetId,
        generatedAt: weekly.generatedAt,
        generatedBy: weekly.generatedBy,
        publicationSafety: weekly.publicationSafety,
        humanReviewRequired: weekly.humanReviewRequired,
        message:
          "Orchestrator-composed weekly intelligence packet — INTERNAL_DRAFT only. No PDF export; human review required before any external use.",
        sourceSystemsUsed: weekly.sourceSystemsUsed,
        topIntelligencePriorities: weekly.topIntelligencePriorities,
        countyRisks: weekly.countyRisks,
        debateReadinessMovement: weekly.debateReadinessMovement,
        oppositionResearchGaps: weekly.oppositionResearchGaps,
        recommendedHumanActions: weekly.recommendedHumanActions,
        unresolvedClaimRisks: weekly.unresolvedClaimRisks,
        messagingOpportunities: weekly.messagingOpportunities,
        governanceWarnings: weekly.governanceWarnings,
        notVerifiedNeedsHumanReview: weekly.notVerifiedNeedsHumanReview,
        confidenceSummary: weekly.confidenceSummary,
        relatedHrefs: weekly.relatedHrefs,
      };
    })(),
    institutionalMemory: {
      memoryHealthScore: memory.memoryHealthScore,
      memoryHealthDetail: memory.memoryHealthDetail,
      recentDecisionTitles: memory.recentDecisions.map((d) => d.title).slice(0, 4),
      recentLessonTitles: memory.recentLessons.map((l) => l.title).slice(0, 4),
      recentRecommendationTitles: memory.recentRecommendations.map((r) => r.recommendation).slice(0, 4),
      topPatterns: memory.topPatterns.slice(0, 4),
      emergingLessons: memory.emergingLessons.slice(0, 3),
      weeklyReflectionStatus: memory.weeklyReflectionStatus,
      href: "/admin/intelligence/memory",
    },
    brain,
    debateReadinessScores: debate.readinessScores,
    sourceLinks: {
      morningBrief: "/admin/intelligence/morning-brief",
      actionQueue: "/admin/intelligence/action-queue",
      evidenceCommand: "/admin/intelligence/kim-hammer/evidence-command",
      llmReview: "/admin/intelligence/llm-review-queue",
      scenarioSimulation: "/admin/intelligence/scenario-simulation",
      mediaIntake: "/admin/intelligence/media-intake",
      targetPathway: "/admin/intelligence/strategic-target-pathway",
      briefingPapers: "/admin/intelligence/briefing-papers",
      campaignMemory: "/admin/intelligence/memory",
    },
  };
}
