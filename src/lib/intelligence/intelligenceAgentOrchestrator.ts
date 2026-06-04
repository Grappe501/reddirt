import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import {
  loadHumanActionQueue,
  rankHumanActions,
  summarizeHumanActionQueue,
  summarizePersistedHumanActionQueue,
  syncHumanActionQueue,
} from "@/lib/intelligence/strategicDecisionSupport";
import { summarizeInstitutionalMemory } from "@/lib/intelligence/institutionalMemory/institutionalMemoryEngine";
import { summarizeDraftReviewQueue } from "@/lib/intelligence/llmDraftGateway";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import { loadOppositionArchiveRollup } from "@/lib/opposition/oppositionBriefConfidence";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { loadStatewideCountySummary } from "@/lib/agents/county-intelligence/county-workbench-adapter";
import {
  buildCountyReadinessClassifications,
  summarizeCountyReadinessRollup,
} from "@/lib/agents/county-intelligence/countyDeploymentReadiness";
import type { HumanActionQueueItem } from "@/lib/intelligence/types/humanActionQueue";
import { HUMAN_ACTION_GOVERNANCE_LABELS, HUMAN_ACTION_QUEUE_REL } from "@/lib/intelligence/types/humanActionQueue";
import {
  generateAllCountyBriefBundles,
  summarizeCountyPublicBriefReadiness,
} from "@/lib/intelligence/briefs/countyPublicBriefGenerator";
import { generateOppositionDebateBriefPack } from "@/lib/intelligence/briefs/oppositionDebateBriefGenerator";
import {
  buildBrainOrchestrationAnswers,
  type BrainOrchestrationAnswers,
} from "@/lib/intelligence/briefs/messageIntelligenceLayer";
import { buildMessageIntelligenceEngine } from "@/lib/intelligence/messageIntelligence/messageIntelligenceEngine";
import type { CountyPublicBriefReadiness } from "@/lib/intelligence/briefs/governedBriefTypes";
import { shouldSkipCountyIntelligenceForLaunch } from "@/lib/intelligence/intelligenceLaunchMode";

export const AGENT_RUN_AUDIT_LOG_REL = "data/intelligence/agent-run-audit-log.json";

export type DailyPriorityItem = {
  rank: number;
  title: string;
  summary: string;
  subsystem: string;
  evidenceAnchors: string[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  researchGaps: string[];
  humanNextAction: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  tags: string[];
};

export type DailyIntelligencePacket = {
  runId: string;
  generatedAt: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  governanceWarnings: string[];
  topPriorities: DailyPriorityItem[];
  debatePrepPriorities: DailyPriorityItem[];
  oppositionResearchPriorities: DailyPriorityItem[];
  countyWorkbenchPriorities: DailyPriorityItem[];
  researchGapsToClose: string[];
  humanActionsNeeded: string[];
  draftingOpportunities: string[];
  risksAndGovernanceWarnings: string[];
  next24HourActions: string[];
  confidenceSummary: string;
  countyReadinessRollup: Record<string, number>;
  debateReadinessOverall: number;
  actionsSynced: number;
  productionJsonPersistenceNote: string;
  publicBriefReadinessRollup: Record<CountyPublicBriefReadiness, number>;
  oppositionBriefReadinessScore: number;
  debateBriefReadinessScore: number;
  messageIntelligenceReadinessScore: number;
  brainAnswers: BrainOrchestrationAnswers;
  topResearchGapsBlockingPublicMessaging: string[];
};

function resolveRepoRoot(repoRoot?: string): string {
  return repoRoot ?? process.cwd();
}

function stableAgentActionId(key: string): string {
  const hash = createHash("sha256").update(`agent-daily:${key}`).digest("hex").slice(0, 10);
  return `ha-agent-daily-${hash}`;
}

function buildAgentQueueItem(input: {
  key: string;
  actionType: HumanActionQueueItem["actionType"];
  title: string;
  summary: string;
  whyItMatters: string;
  owner: HumanActionQueueItem["recommendedOwnerRole"];
  priority: HumanActionQueueItem["priority"];
  urgency: HumanActionQueueItem["urgency"];
  sourceSystems: HumanActionQueueItem["sourceSystems"];
  evidenceDependencies: string[];
  riskLevel: HumanActionQueueItem["riskLevel"];
  recommendedNextStep: string;
  linkedCounties?: string[];
  linkedTasks?: string[];
}): HumanActionQueueItem {
  const now = new Date().toISOString();
  return {
    actionId: stableAgentActionId(input.key),
    actionType: input.actionType,
    title: input.title,
    summary: input.summary,
    whyItMatters: input.whyItMatters,
    recommendedOwnerRole: input.owner,
    priority: input.priority,
    urgency: input.urgency,
    status: "RECOMMENDED",
    sourceSystems: input.sourceSystems,
    linkedNarratives: [],
    linkedCounties: input.linkedCounties ?? [],
    linkedBills: [],
    linkedClaims: [],
    linkedCitations: [],
    linkedTasks: input.linkedTasks ?? [],
    linkedMediaFindings: [],
    linkedScenarios: [],
    linkedDoctrines: [],
    linkedExports: [],
    linkedDrafts: [],
    evidenceDependencies: input.evidenceDependencies,
    riskLevel: input.riskLevel,
    opportunityLevel: "MEDIUM",
    governanceWarnings: [...HUMAN_ACTION_GOVERNANCE_LABELS, "AGENT_DAILY_ORCHESTRATOR"],
    publicationSafety: "NON_PUBLISHABLE",
    humanActionRequired: true,
    recommendedNextStep: input.recommendedNextStep,
    blockedBy: [],
    createdAt: now,
    updatedAt: now,
    operatorNotes: "",
  };
}

function toPriorityItem(
  rank: number,
  partial: Omit<DailyPriorityItem, "rank">,
): DailyPriorityItem {
  return { rank, ...partial };
}

export function runDailyIntelligenceAgentPass(options?: {
  repoRoot?: string;
  syncActionQueue?: boolean;
  canonicalGoalsMap?: Map<string, import("@/lib/campaign-engine/county-registration-goal-read").CanonicalRegistrationGoalRow>;
  skipCounty?: boolean;
}): DailyIntelligencePacket {
  const repoRoot = resolveRepoRoot(options?.repoRoot);
  const skipCounty = options?.skipCounty ?? shouldSkipCountyIntelligenceForLaunch();
  const runId = `agent-${Date.now().toString(36)}`;
  const brain = summarizeCampaignIntelligenceState(repoRoot);
  const memory = summarizeInstitutionalMemory(repoRoot);
  const llmQueue = summarizeDraftReviewQueue(repoRoot);
  const actionSummary = skipCounty
    ? summarizePersistedHumanActionQueue(repoRoot)
    : summarizeHumanActionQueue(repoRoot);
  const evidence = loadKimHammerEvidenceIndex();
  const metrics = evidence.metrics;
  const debate = buildDebateCommandCenterState();
  const archiveRollup = loadOppositionArchiveRollup(repoRoot);
  const legislativeRollup = buildLegislativeVideoIntelligenceRollup(repoRoot);
  const statewide = skipCounty ? null : loadStatewideCountySummary();
  const countyRows = skipCounty ? [] : buildCountyReadinessClassifications(options?.canonicalGoalsMap);
  const countyRollup = skipCounty
    ? { DEPLOYMENT_READY: 0, INTERNAL_PLANNING_ONLY: 0, SHELL_ONLY: 0, BLOCKED: 0 }
    : summarizeCountyReadinessRollup(countyRows);

  const overallDebate = debate.readinessScores.find((s) => s.id === "overall");

  const candidates: DailyPriorityItem[] = [];

  if (metrics.retrievalTasks > 0) {
    candidates.push(
      toPriorityItem(0, {
        title: "Close opposition retrieval tasks",
        summary: `${metrics.retrievalTasks} Kim Hammer retrieval tasks open (0 COMPLETE).`,
        subsystem: "KH-3B",
        evidenceAnchors: ["kim-hammer-intelligence-gaps.json"],
        confidence: "HIGH",
        researchGaps: Object.entries(metrics.taskStatusCounts)
          .filter(([k]) => k !== "COMPLETE")
          .map(([k, v]) => `${k}: ${v}`),
        humanNextAction: "Review /admin/intelligence/kim-hammer/intelligence-gaps — assign owner per task",
        riskLevel: "HIGH",
        tags: ["opposition", "research"],
      }),
    );
  }

  if (debate.filmRoom.directClipCount < 2) {
    candidates.push(
      toPriorityItem(0, {
        title: "Film room clip archive gap",
        summary: debate.filmRoom.archiveHonestyNote,
        subsystem: "Debate Command",
        evidenceAnchors: ["kim-hammer-debate-archive-index.json"],
        confidence: "HIGH",
        researchGaps: debate.filmRoom.coverageGaps,
        humanNextAction: "Execute kh3b-long-tail-video-forum-record retrieval task",
        riskLevel: "MEDIUM",
        tags: ["debate", "film-room"],
      }),
    );
  }

  for (const trap of brain.scenarioDebateTraps?.slice(0, 2) ?? []) {
    candidates.push(
      toPriorityItem(0, {
        title: "Debate trap review",
        summary: trap,
        subsystem: "NSI-14",
        evidenceAnchors: ["strategic-scenario-registry.json"],
        confidence: "MEDIUM",
        researchGaps: ["Verify rebuttal paths before live debate"],
        humanNextAction: "Open scenario simulation + debate prep — human review only",
        riskLevel: "CRITICAL",
        tags: ["debate"],
      }),
    );
  }

  if (llmQueue.pendingCount > 0) {
    candidates.push(
      toPriorityItem(0, {
        title: "LLM draft review backlog",
        summary: `${llmQueue.pendingCount} drafts pending human review.`,
        subsystem: "NSI-12",
        evidenceAnchors: ["llm-draft-review-queue.json"],
        confidence: "HIGH",
        researchGaps: [],
        humanNextAction: "Review /admin/intelligence/llm-review-queue — no auto-promotion",
        riskLevel: "MEDIUM",
        tags: ["governance", "draft"],
      }),
    );
  }

  const shellCounties = skipCounty ? 0 : countyRows.filter((c) => c.deploymentReadiness === "SHELL_ONLY").length;
  if (!skipCounty) {
    candidates.push(
      toPriorityItem(0, {
        title: "County workbench shell coverage",
        summary: `${shellCounties}/75 counties are SHELL_ONLY — not field-deployable.`,
        subsystem: "County Workbench",
        evidenceAnchors: ["dashboard-v2-county-coverage.csv"],
        confidence: "HIGH",
        researchGaps: ["Institutional memory empty for all 75 counties"],
        humanNextAction: "Prioritize full-profile counties; do not treat shell counties as ready",
        riskLevel: "HIGH",
        tags: ["county", "field"],
      }),
    );
  }

  if (statewide) {
    for (const weak of statewide.weakCounties.slice(0, 3)) {
      candidates.push(
        toPriorityItem(0, {
          title: `County attention: ${weak.countyName}`,
          summary: weak.topWeaknesses[0] ?? "Low readiness",
          subsystem: "County Intelligence Engine",
          evidenceAnchors: [weak.countySlug],
          confidence: "MEDIUM",
          researchGaps: [],
          humanNextAction: "Verify canonical registration goal in /admin/counties before field ops",
          riskLevel: "MEDIUM",
          tags: ["county"],
        }),
      );
    }
  }

  const ranked = candidates
    .map((c, i) => ({ ...c, rank: i + 1 }))
    .slice(0, 10);

  const debatePrepPriorities = debate.readinessScores
    .filter((s) => s.id !== "overall")
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((s, i) =>
      toPriorityItem(i + 1, {
        title: s.label,
        summary: s.whyThisScore,
        subsystem: "Debate Command",
        evidenceAnchors: s.computedFrom,
        confidence: s.scoreConfidence,
        researchGaps: s.weakAreas,
        humanNextAction: s.raiseScoreToday[0] ?? s.nextModule,
        riskLevel: s.score < 50 ? "HIGH" : "MEDIUM",
        tags: ["debate"],
      }),
    );

  const oppositionPriorities = metrics.reviewNeededClaims > 0
    ? [
        toPriorityItem(1, {
          title: "Claims needing review",
          summary: `${metrics.reviewNeededClaims} claims flagged for review.`,
          subsystem: "KH-4",
          evidenceAnchors: ["kim-hammer-kh4-claim-graph.json"],
          confidence: "HIGH",
          researchGaps: [],
          humanNextAction: "Evidence command → claims review workflow",
          riskLevel: "HIGH",
          tags: ["opposition"],
        }),
      ]
    : [];

  const countyPriorities = skipCounty
    ? []
    : countyRows
        .filter((c) => c.deploymentReadiness === "INTERNAL_PLANNING_ONLY")
        .slice(0, 5)
        .map((c, i) =>
          toPriorityItem(i + 1, {
            title: c.countyName,
            summary: c.biggestBlocker,
            subsystem: "County Workbench",
            evidenceAnchors: [c.countySlug, c.dashboardStatus],
            confidence: "MEDIUM",
            researchGaps: c.humanVerifyBeforeDeploy,
            humanNextAction: c.humanVerifyBeforeDeploy[0] ?? "Verify before field deploy",
            riskLevel: "MEDIUM",
            tags: ["county"],
          }),
        );

  const agentQueueItems: HumanActionQueueItem[] = [];

  if (debate.filmRoom.directClipCount < 2) {
    agentQueueItems.push(
      buildAgentQueueItem({
        key: "film-room-clip-gap",
        actionType: "CREATE_RETRIEVAL_TASK",
        title: "Film room: index opponent debate/forum video",
        summary: debate.filmRoom.archiveHonestyNote,
        whyItMatters: "Media readiness score blocked by thin clip archive.",
        owner: "Research",
        priority: "HIGH",
        urgency: "SOON",
        sourceSystems: ["NSI-11", "KH-3B"],
        evidenceDependencies: ["kim-hammer-debate-archive-index.json"],
        riskLevel: "MEDIUM",
        recommendedNextStep: "Assign kh3b-long-tail-video-forum-record — human creates task in intelligence-gaps UI",
        linkedTasks: ["kh3b-long-tail-video-forum-record"],
      }),
    );
  }

  for (const gap of debate.filmRoom.coverageGaps.slice(0, 2)) {
    agentQueueItems.push(
      buildAgentQueueItem({
        key: `film-gap-${gap.slice(0, 40)}`,
        actionType: "PREPARE_DEBATE_RESPONSE",
        title: `Film room gap: ${gap.slice(0, 80)}`,
        summary: gap,
        whyItMatters: "Debate film room MVP — gap blocks media readiness.",
        owner: "Debate Prep",
        priority: "MEDIUM",
        urgency: "ROUTINE",
        sourceSystems: ["NSI-14"],
        evidenceDependencies: ["debateFilmRoom"],
        riskLevel: "LOW",
        recommendedNextStep: "Open /admin/intelligence/film-room — close gap before debate",
      }),
    );
  }

  let actionsSynced = 0;
  if (options?.syncActionQueue !== false && agentQueueItems.length > 0) {
    mergeAgentRecommendationsIntoQueue(agentQueueItems, repoRoot);
    syncHumanActionQueue(repoRoot);
    actionsSynced = agentQueueItems.length;
  }

  appendAgentRunAuditLog(
    {
      runId,
      generatedAt: new Date().toISOString(),
      priorityCount: ranked.length,
      actionsSynced,
    },
    repoRoot,
  );

  const countyBriefBundles = skipCounty ? [] : generateAllCountyBriefBundles();
  const publicBriefRollup = skipCounty
    ? { PUBLIC_BRIEF_READY: 0, INTERNAL_MESSAGE_SOURCE_ONLY: 0, FIELD_PLANNING_ONLY: 0, SHELL_ONLY: 0, BLOCKED: 0 }
    : summarizeCountyPublicBriefReadiness(countyBriefBundles);
  const oppositionDebate = generateOppositionDebateBriefPack();
  const messageIntelligenceRollup = buildMessageIntelligenceEngine(repoRoot);
  const brainAnswers = buildBrainOrchestrationAnswers({
    countySummaries: countyBriefBundles.map((b) => ({
      name: b.countyName,
      readiness: b.publicBriefReadiness,
    })),
    oppositionGaps: [
      ...Object.entries(metrics.taskStatusCounts)
        .filter(([k]) => k !== "COMPLETE")
        .map(([k, v]) => `Retrieval task ${k}: ${v}`),
      ...debate.filmRoom.coverageGaps.slice(0, 3),
    ],
    debateRaiseToday: overallDebate?.raiseScoreToday ?? [],
    whatNotToSay: brain.whatNotToSayToday,
    exportReadyCount: metrics.exportReadyClaims,
    archiveRollup: {
      topUsableEvidence: archiveRollup.topUsableEvidence,
      topUnusableClaims: archiveRollup.topUnusableClaims,
      nextHumanRetrievalActions: archiveRollup.nextHumanRetrievalActions,
      filmRoomGapNote: archiveRollup.filmRoomGapNote,
      directClipCount: archiveRollup.directClipCount,
      retrievalTasksComplete: archiveRollup.retrievalTasksComplete,
      retrievalTasksTotal: archiveRollup.retrievalTasksTotal,
      usableQuoteCount: archiveRollup.usableQuoteCount,
    },
    legislativeRollup: {
      topHammerCommitteeQuotes: legislativeRollup.topHammerCommitteeQuotes,
      strongestQuotes: legislativeRollup.strongestQuotes,
      quotesNeedingReview: legislativeRollup.quotesNeedingReview,
      billsWithTranscriptCoverage: legislativeRollup.billsWithTranscriptCoverage,
      billsMissingVideo: legislativeRollup.billsMissingVideo,
      policyThemesRepeating: legislativeRollup.policyThemesRepeating,
      debateUsefulChunks: legislativeRollup.debateUsefulChunks,
      countyMessagingUseful: legislativeRollup.countyMessagingUseful,
      tooRiskyToUse: legislativeRollup.tooRiskyToUse,
      chunkCount: legislativeRollup.chunkCount,
    },
    messageIntelligence: {
      readinessScore: messageIntelligenceRollup.readinessScore,
      safeThemes: messageIntelligenceRollup.safeMessageThemes.map((m) => m.text),
      riskyThemes: messageIntelligenceRollup.riskyMessageThemes.map((m) => m.text),
      citationGaps: messageIntelligenceRollup.claimsNeedingCitation.map((m) => m.text),
    },
  });

  const topResearchGapsBlockingPublicMessaging = [
    ...Object.keys(metrics.taskStatusCounts).filter((k) => k !== "COMPLETE").map((k) => `Opposition retrieval: ${k}`),
    ...debate.filmRoom.coverageGaps.slice(0, 3),
    ...(skipCounty
      ? ["County brief rollup deferred in emergency launch mode"]
      : [
          `${publicBriefRollup.SHELL_ONLY}/75 counties SHELL_ONLY for public briefs`,
          `${publicBriefRollup.PUBLIC_BRIEF_READY} counties PUBLIC_BRIEF_READY`,
          "All county registration goals require admin verification before public messaging",
        ]),
  ].slice(0, 10);

  const oppositionBriefScore = oppositionDebate.opposition.confidenceScore;
  const debateBriefScore = oppositionDebate.debatePrep.confidenceScore;
  const messageIntelligenceScore = messageIntelligenceRollup.readinessScore;

  return {
    runId,
    generatedAt: new Date().toISOString(),
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    governanceWarnings: [
      "INTERNAL_DRAFT — NON_PUBLISHABLE — HUMAN_REVIEW_REQUIRED",
      "Agent pass does not send, publish, or mutate voter goals",
      "JSON action queue persistence — production multi-instance limitation applies",
    ],
    topPriorities: ranked,
    debatePrepPriorities,
    oppositionResearchPriorities: oppositionPriorities,
    countyWorkbenchPriorities: countyPriorities,
    researchGapsToClose: [
      ...Object.keys(metrics.taskStatusCounts).filter((k) => k !== "COMPLETE"),
      ...debate.filmRoom.coverageGaps.slice(0, 3),
    ],
    humanActionsNeeded: actionSummary.topUrgent.map((a) => `${a.title} → ${a.recommendedNextStep}`).slice(0, 8),
    draftingOpportunities: [
      llmQueue.pendingCount > 0 ? `${llmQueue.pendingCount} LLM drafts await review` : "No pending LLM drafts",
      "Debate-ai-workbench copilot tools (governed queue only)",
    ],
    risksAndGovernanceWarnings: [
      ...brain.whatNotToSayToday.slice(0, 3),
      `${shellCounties} shell counties must not be treated as deployment-ready`,
      memory.memoryHealthScore < 50 ? `Institutional memory health ${memory.memoryHealthScore}/100` : "Review memory drift in NSI-13",
    ],
    next24HourActions: [
      ranked[0]?.humanNextAction ?? "Run morning brief review",
      debatePrepPriorities[0]?.humanNextAction ?? "Debate drill queue",
      "Verify county canonical goals in admin before any field goal messaging",
    ],
    confidenceSummary: `Debate overall ${overallDebate?.score ?? "—"}/100 (${overallDebate?.scoreConfidence ?? "LOW"}). ${metrics.exportReadyClaims} export-ready claims. ${shellCounties} shell counties.`,
    countyReadinessRollup: countyRollup,
    debateReadinessOverall: overallDebate?.score ?? 0,
    actionsSynced,
    productionJsonPersistenceNote:
      "Human action queue uses JSON file persistence. Safe for single-operator internal deploy; not recommended for multi-instance production without Postgres migration.",
    publicBriefReadinessRollup: publicBriefRollup,
    oppositionBriefReadinessScore: oppositionBriefScore,
    debateBriefReadinessScore: debateBriefScore,
    messageIntelligenceReadinessScore: messageIntelligenceScore,
    brainAnswers,
    topResearchGapsBlockingPublicMessaging,
  };
}

export function mergeAgentRecommendationsIntoQueue(
  agentItems: HumanActionQueueItem[],
  repoRoot?: string,
): void {
  const root = resolveRepoRoot(repoRoot);
  const persisted = loadHumanActionQueue(root);
  const byId = new Map(persisted.items.map((row) => [row.actionId, row]));

  for (const rec of agentItems) {
    const existing = byId.get(rec.actionId);
    if (!existing) {
      byId.set(rec.actionId, rec);
      continue;
    }
    if (existing.status === "RECOMMENDED") {
      byId.set(rec.actionId, { ...rec, createdAt: existing.createdAt, updatedAt: new Date().toISOString() });
    }
  }

  const merged = {
    ...persisted,
    generatedAt: new Date().toISOString(),
    items: rankHumanActions([...byId.values()]),
  };
  const abs = path.join(root, HUMAN_ACTION_QUEUE_REL);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
}

function appendAgentRunAuditLog(
  entry: { runId: string; generatedAt: string; priorityCount: number; actionsSynced: number },
  repoRoot: string,
): void {
  const abs = path.join(repoRoot, AGENT_RUN_AUDIT_LOG_REL);
  mkdirSync(path.dirname(abs), { recursive: true });
  const prior = existsSync(abs)
    ? (JSON.parse(readFileSync(abs, "utf8")) as { entries: typeof entry[] })
    : { entries: [] };
  prior.entries.push(entry);
  writeFileSync(abs, `${JSON.stringify(prior, null, 2)}\n`, "utf8");
}

/** Server/async variant with canonical DB goals for county classifications. */
export async function runDailyIntelligenceAgentPassAsync(options?: {
  repoRoot?: string;
  syncActionQueue?: boolean;
}): Promise<DailyIntelligencePacket> {
  const { loadCanonicalRegistrationGoalsBySlug } = await import(
    "@/lib/campaign-engine/county-registration-goal-read"
  );
  const map = await loadCanonicalRegistrationGoalsBySlug();
  return runDailyIntelligenceAgentPass({ ...options, canonicalGoalsMap: map });
}
