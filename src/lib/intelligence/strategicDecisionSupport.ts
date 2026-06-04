import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildAggregateCampaignIntelligenceIndex } from "@/lib/intelligence/aggregateCampaignIntelligence";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { summarizeLongitudinalIntelligence } from "@/lib/intelligence/intelligenceMemoryEngine";
import { summarizeDraftReviewQueue, loadLlmDraftReviewQueue } from "@/lib/intelligence/llmDraftGateway";
import { recommendWatchlistGaps } from "@/lib/intelligence/publicMeetingWatchlist";
import { loadPublicMediaIntakeQueue } from "@/lib/intelligence/publicMediaIntake";
import {
  computeStatewideRegistrationRollup,
  loadVoterRegistrationAssumptions,
} from "@/lib/intelligence/voterRegistrationTargetModel";
import {
  simulateAllStrategicScenarios,
  summarizeStrategicScenarioSimulation,
  buildScenarioHumanActionHints,
} from "@/lib/intelligence/strategicScenarioSimulation";
import type {
  HumanActionOpportunityLevel,
  HumanActionOwnerRole,
  HumanActionPriority,
  HumanActionQueueFile,
  HumanActionQueueItem,
  HumanActionQueueSummary,
  HumanActionRecommendationBundle,
  HumanActionRiskLevel,
  HumanActionSourceSystem,
  HumanActionType,
  HumanActionUrgency,
} from "@/lib/intelligence/types/humanActionQueue";
import { HUMAN_ACTION_GOVERNANCE_LABELS } from "@/lib/intelligence/types/humanActionQueue";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import { summarizeNarrativeUsageRisk } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";

import { HUMAN_ACTION_QUEUE_REL } from "@/lib/intelligence/types/humanActionQueue";
import { shouldSkipHumanActionQueueSyncOnRequest } from "@/lib/intelligence/intelligenceLaunchMode";

export { HUMAN_ACTION_QUEUE_REL };

const GOVERNANCE_WARNINGS = [
  ...HUMAN_ACTION_GOVERNANCE_LABELS,
  "Recommendation only — human action required.",
  "No autonomous publish, export, claim, citation, or task mutation.",
];

let recommendationCache: { repoRoot: string; items: HumanActionQueueItem[] } | null = null;

function getCachedRecommendations(repoRoot?: string): HumanActionQueueItem[] {
  const root = resolveRepoRoot(repoRoot);
  if (recommendationCache?.repoRoot === root) {
    return recommendationCache.items;
  }
  const items = generateHumanActionRecommendationsUncached(root);
  recommendationCache = { repoRoot: root, items };
  return items;
}

const OWNER_BY_TYPE: Record<HumanActionType, HumanActionOwnerRole> = {
  REVIEW_CITATION: "Citation Desk",
  REVIEW_CLAIM: "Research",
  REVIEW_LLM_DRAFT: "Comms",
  CREATE_RETRIEVAL_TASK: "Research",
  REVIEW_MEDIA_FINDING: "Media Monitoring",
  STRENGTHEN_NARRATIVE: "Strategy",
  PREPARE_DEBATE_RESPONSE: "Debate Prep",
  UPDATE_COUNTY_BRIEFING: "Field",
  MONITOR_MEDIA_SOURCE: "Media Monitoring",
  VERIFY_BILL_SOURCE: "Research",
  REVIEW_STRATEGIC_TENSION: "Strategy",
  PREPARE_VOLUNTEER_GUIDANCE: "Field",
  PREPARE_CANDIDATE_BRIEF: "Candidate Prep",
  REVIEW_EXPORT_RISK: "Legal/Compliance",
  VALIDATE_TARGET_PATHWAY: "Strategy",
  INVESTIGATE_OPPONENT_MESSAGE: "Research",
  REVIEW_PUBLIC_MEETING_SOURCE: "Media Monitoring",
  CHECK_REGISTRATION_GOAL: "Strategy",
  CHECK_COUNTY_OPERATIONAL_RISK: "Field",
};

function resolveRepoRoot(repoRoot?: string): string {
  return repoRoot ?? process.cwd();
}

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function stableActionId(actionType: HumanActionType, key: string): string {
  const hash = createHash("sha256").update(`${actionType}:${key}`).digest("hex").slice(0, 10);
  return `ha-${actionType.toLowerCase().replace(/_/g, "-")}-${hash}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

type BaseItemInput = {
  actionIdKey: string;
  actionType: HumanActionType;
  title: string;
  summary: string;
  whyItMatters: string;
  priority: HumanActionPriority;
  urgency: HumanActionUrgency;
  sourceSystems: HumanActionSourceSystem[];
  riskLevel: HumanActionRiskLevel;
  opportunityLevel: HumanActionOpportunityLevel;
  recommendedNextStep: string;
  linkedNarratives?: string[];
  linkedCounties?: string[];
  linkedBills?: string[];
  linkedClaims?: string[];
  linkedCitations?: string[];
  linkedTasks?: string[];
  linkedMediaFindings?: string[];
  linkedScenarios?: string[];
  linkedDoctrines?: string[];
  linkedExports?: string[];
  linkedDrafts?: string[];
  evidenceDependencies?: string[];
  blockedBy?: string[];
  extraGovernanceWarnings?: string[];
};

function baseItem(partial: BaseItemInput): HumanActionQueueItem {
  const ts = nowIso();
  return {
    actionId: stableActionId(partial.actionType, partial.actionIdKey),
    actionType: partial.actionType,
    title: partial.title,
    summary: partial.summary,
    whyItMatters: partial.whyItMatters,
    recommendedOwnerRole: OWNER_BY_TYPE[partial.actionType],
    priority: partial.priority,
    urgency: partial.urgency,
    status: "RECOMMENDED",
    sourceSystems: partial.sourceSystems,
    linkedNarratives: partial.linkedNarratives ?? [],
    linkedCounties: partial.linkedCounties ?? [],
    linkedBills: partial.linkedBills ?? [],
    linkedClaims: partial.linkedClaims ?? [],
    linkedCitations: partial.linkedCitations ?? [],
    linkedTasks: partial.linkedTasks ?? [],
    linkedMediaFindings: partial.linkedMediaFindings ?? [],
    linkedScenarios: partial.linkedScenarios ?? [],
    linkedDoctrines: partial.linkedDoctrines ?? [],
    linkedExports: partial.linkedExports ?? [],
    linkedDrafts: partial.linkedDrafts ?? [],
    evidenceDependencies: partial.evidenceDependencies ?? [],
    riskLevel: partial.riskLevel,
    opportunityLevel: partial.opportunityLevel,
    governanceWarnings: [...GOVERNANCE_WARNINGS, ...(partial.extraGovernanceWarnings ?? [])],
    publicationSafety: "NON_PUBLISHABLE",
    humanActionRequired: true,
    recommendedNextStep: partial.recommendedNextStep,
    blockedBy: partial.blockedBy ?? [],
    createdAt: ts,
    updatedAt: ts,
    operatorNotes: "",
  };
}

function emptyQueueFile(): HumanActionQueueFile {
  return {
    version: 1,
    generatedAt: nowIso(),
    purpose: "NSI-15 governed human action queue — recommendations only; no autonomous execution.",
    governanceDefaults: {
      publicationSafety: "NON_PUBLISHABLE",
      humanActionRequired: true,
      labels: HUMAN_ACTION_GOVERNANCE_LABELS,
      autonomousExecution: false,
    },
    items: [],
  };
}

function isServerlessReadOnlyFs(): boolean {
  return Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL);
}

export function loadHumanActionQueue(repoRoot?: string): HumanActionQueueFile {
  const root = resolveRepoRoot(repoRoot);
  const abs = absPath(root, HUMAN_ACTION_QUEUE_REL);
  if (!existsSync(abs)) {
    const file = emptyQueueFile();
    if (!isServerlessReadOnlyFs()) {
      try {
        mkdirSync(path.dirname(abs), { recursive: true });
        writeFileSync(abs, `${JSON.stringify(file, null, 2)}\n`, "utf8");
      } catch (error) {
        console.error("[human-action-queue] could not create queue file", error);
      }
    }
    return file;
  }
  try {
    return JSON.parse(readFileSync(abs, "utf8")) as HumanActionQueueFile;
  } catch (error) {
    console.error("[human-action-queue] parse failed", error);
    return emptyQueueFile();
  }
}

function priorityScore(item: HumanActionQueueItem): number {
  const p = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[item.priority];
  const u = { ROUTINE: 1, SOON: 2, URGENT: 3, IMMEDIATE: 4 }[item.urgency];
  const r = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }[item.riskLevel];
  const o = { LOW: 0, MEDIUM: 1, HIGH: 2 }[item.opportunityLevel];
  const blocked = item.status === "BLOCKED" ? -2 : 0;
  const active =
    item.status === "RECOMMENDED" || item.status === "ACCEPTED" || item.status === "IN_PROGRESS" ? 2 : 0;
  return p * 10 + u * 5 + r * 3 + o * 2 + active + blocked;
}

export function rankHumanActions(items: HumanActionQueueItem[]): HumanActionQueueItem[] {
  return [...items].sort((a, b) => priorityScore(b) - priorityScore(a));
}

export function groupActionsByOwnerRole(
  items: HumanActionQueueItem[],
): Record<HumanActionOwnerRole, HumanActionQueueItem[]> {
  const out = {} as Record<HumanActionOwnerRole, HumanActionQueueItem[]>;
  for (const item of rankHumanActions(items)) {
    const bucket = out[item.recommendedOwnerRole] ?? [];
    bucket.push(item);
    out[item.recommendedOwnerRole] = bucket;
  }
  return out;
}

export function groupActionsByCounty(
  items: HumanActionQueueItem[],
): Record<string, HumanActionQueueItem[]> {
  const out: Record<string, HumanActionQueueItem[]> = {};
  for (const item of items) {
    for (const countyId of item.linkedCounties.length ? item.linkedCounties : ["statewide"]) {
      const bucket = out[countyId] ?? [];
      bucket.push(item);
      out[countyId] = bucket;
    }
  }
  for (const key of Object.keys(out)) {
    out[key] = rankHumanActions(out[key]!);
  }
  return out;
}

export function groupActionsByNarrative(
  items: HumanActionQueueItem[],
): Record<string, HumanActionQueueItem[]> {
  const out: Record<string, HumanActionQueueItem[]> = {};
  for (const item of items) {
    for (const narrativeId of item.linkedNarratives.length ? item.linkedNarratives : ["unlinked"]) {
      const bucket = out[narrativeId] ?? [];
      bucket.push(item);
      out[narrativeId] = bucket;
    }
  }
  return out;
}

export function groupActionsByActionType(
  items: HumanActionQueueItem[],
): Record<HumanActionType, HumanActionQueueItem[]> {
  const out = {} as Record<HumanActionType, HumanActionQueueItem[]>;
  for (const item of items) {
    const bucket = out[item.actionType] ?? [];
    bucket.push(item);
    out[item.actionType] = bucket;
  }
  return out;
}

export function resolveActionDependencies(items: HumanActionQueueItem[]): HumanActionQueueItem[] {
  return items.map((item) => {
    const blockedBy = [...item.blockedBy];
    if (item.linkedCitations.some((id) => id.includes("NEEDS_REVIEW"))) {
      blockedBy.push("Citation review incomplete.");
    }
    if (item.evidenceDependencies.some((dep) => dep.toLowerCase().includes("no export-ready"))) {
      blockedBy.push("Export-ready evidence missing.");
    }
    return { ...item, blockedBy: [...new Set(blockedBy)] };
  });
}

export function summarizeBlockedActions(items: HumanActionQueueItem[]): HumanActionQueueItem[] {
  return rankHumanActions(
    items.filter((row) => row.status === "BLOCKED" || row.blockedBy.length > 0),
  ).slice(0, 12);
}

export function summarizeHighOpportunityActions(items: HumanActionQueueItem[]): HumanActionQueueItem[] {
  return rankHumanActions(
    items.filter((row) => row.opportunityLevel === "HIGH" && row.status !== "DISMISSED" && row.status !== "ARCHIVED"),
  ).slice(0, 12);
}

export function summarizeUrgentActions(items: HumanActionQueueItem[]): HumanActionQueueItem[] {
  return rankHumanActions(
    items.filter(
      (row) =>
        (row.urgency === "URGENT" || row.urgency === "IMMEDIATE" || row.priority === "CRITICAL") &&
        row.status !== "COMPLETED" &&
        row.status !== "DISMISSED" &&
        row.status !== "ARCHIVED",
    ),
  ).slice(0, 12);
}

export function generateHumanActionRecommendations(repoRoot?: string): HumanActionQueueItem[] {
  return getCachedRecommendations(repoRoot);
}

function generateHumanActionRecommendationsUncached(repoRoot?: string): HumanActionQueueItem[] {
  const root = resolveRepoRoot(repoRoot);
  const items: HumanActionQueueItem[] = [];
  const evidence = loadKimHammerEvidenceIndex(root);
  const narratives = loadKimHammerNarrativeStateIndex(root);
  const citations = loadKimHammerCitationLocker(root);
  const usage = summarizeNarrativeUsageRisk(root);
  const alignment = summarizeStrategicAlignmentRisk(root);
  const memory = summarizeLongitudinalIntelligence(root);
  const scenarios = simulateAllStrategicScenarios(root);
  const scenarioSummary = summarizeStrategicScenarioSimulation(root);
  const llmSummary = summarizeDraftReviewQueue(root);
  const llmQueue = loadLlmDraftReviewQueue(root);
  const media = loadPublicMediaIntakeQueue(root);
  const countyIndex = loadCountyBriefingIntelligenceIndex(root);
  const registration = computeStatewideRegistrationRollup(root);
  const registrationAssumptions = loadVoterRegistrationAssumptions(root);
  const exportHistory = loadKimHammerExportHistory(root);
  const aggregate = buildAggregateCampaignIntelligenceIndex(countyIndex.counties, root);
  for (const citation of citations.citations.filter(
    (row) =>
      row.reviewStatus === "NEEDS_REVIEW" ||
      row.reviewStatus === "STALE" ||
      row.sourceHealth === "ARCHIVE_MISSING",
  ).slice(0, 8)) {
    const blockedNarratives = narratives.narratives
      .filter((n) => n.blockers.some((b) => b.toLowerCase().includes(citation.id)))
      .map((n) => n.narrativeId);
    items.push(
      baseItem({
        actionIdKey: citation.id,
        actionType: "REVIEW_CITATION",
        title: `Review citation ${citation.id}`,
        summary: `${citation.summary.slice(0, 80)} — ${citation.reviewStatus} / ${citation.sourceHealth}.`,
        whyItMatters: "Blocked or weak narratives may depend on this citation before external use.",
        priority: citation.reviewStatus === "STALE" ? "HIGH" : "MEDIUM",
        urgency: blockedNarratives.length > 0 ? "URGENT" : "SOON",
        sourceSystems: ["V3-C", "NSI-1"],
        linkedCitations: [citation.id],
        linkedNarratives: blockedNarratives,
        riskLevel: "HIGH",
        opportunityLevel: "MEDIUM",
        evidenceDependencies: [citation.sourceUrl ?? citation.id],
        recommendedNextStep: "Open citation locker; validate source, archive capture, and narrative linkage.",
        blockedBy: blockedNarratives.length ? [`${blockedNarratives.length} narrative(s) blocked pending citation.`] : [],
      }),
    );
  }

  for (const claim of evidence.claims.filter((row) => row.reviewNeeded || row.reviewStatus === "NEEDS_REVIEW").slice(0, 8)) {
    items.push(
      baseItem({
        actionIdKey: claim.id,
        actionType: "REVIEW_CLAIM",
        title: `Review claim ${claim.id}`,
        summary: `${claim.topic ?? claim.id}: review status ${claim.reviewStatus ?? "NEEDS_REVIEW"}.`,
        whyItMatters: "Potentially useful opposition framing cannot deploy until human claim review completes.",
        priority: claim.legalRisk === "HIGH" ? "CRITICAL" : "HIGH",
        urgency: "SOON",
        sourceSystems: ["V2-A", "KH-0"],
        linkedClaims: [claim.id],
        linkedBills: [],
        riskLevel: claim.legalRisk === "HIGH" ? "CRITICAL" : "MEDIUM",
        opportunityLevel: claim.exportReady ? "HIGH" : "LOW",
        evidenceDependencies: [claim.id, claim.citationStatus ?? "unknown citation"],
        recommendedNextStep: "Complete claim review workflow in Evidence Command — do not use externally until approved.",
        blockedBy: claim.blocked ? ["Publication safety blockers active."] : [],
      }),
    );
  }

  if (llmSummary.pendingCount > 0) {
    for (const draft of llmQueue.drafts
      .filter((row) => !row.archived && row.reviewStatus === "DRAFT_PENDING_REVIEW")
      .slice(0, 6)) {
      const actionType =
        draft.missingCitationWarnings.length > 0
          ? "REVIEW_LLM_DRAFT"
          : draft.unsupportedClaimWarnings.length > 0
            ? "REVIEW_LLM_DRAFT"
            : "REVIEW_LLM_DRAFT";
      items.push(
        baseItem({
          actionIdKey: draft.draftId,
          actionType,
          title: `Review LLM draft ${draft.draftId}`,
          summary: `${draft.draftType} — ${draft.reviewStatus}; tool ${draft.generatedByTool}.`,
          whyItMatters: "Pending internal drafts must not leak to public messaging without human review.",
          priority: draft.unsupportedClaimWarnings.length > 0 ? "CRITICAL" : "HIGH",
          urgency: "URGENT",
          sourceSystems: ["NSI-12", "NSI-11"],
          linkedDrafts: [draft.draftId],
          linkedNarratives: draft.narrativeDependencies ?? [],
          linkedCounties: draft.countyDependencies ?? [],
          riskLevel: draft.governanceWarnings.length > 0 ? "HIGH" : "MEDIUM",
          opportunityLevel: "LOW",
          evidenceDependencies: draft.sourceDependencies ?? [],
          recommendedNextStep:
            draft.missingCitationWarnings.length > 0
              ? "Add citation dependencies or reject draft; route strong drafts to briefing after review."
              : "Review in LLM queue; approve internal-only or request revision.",
          blockedBy: draft.unsupportedClaimWarnings,
          extraGovernanceWarnings: draft.governanceWarnings,
        }),
      );
    }
  }

  for (const result of scenarios.filter(
    (row) =>
      row.signals.includes("SCENARIO_HIGH_RISK") ||
      row.signals.includes("SCENARIO_DEBATE_TRAP") ||
      row.signals.includes("SCENARIO_FRAGILE"),
  ).slice(0, 10)) {
    const hints = buildScenarioHumanActionHints(result);
    const actionType = result.signals.includes("SCENARIO_DEBATE_TRAP")
      ? "PREPARE_DEBATE_RESPONSE"
      : result.evidenceBlockers.length > 0
        ? "REVIEW_EXPORT_RISK"
        : "REVIEW_STRATEGIC_TENSION";
    items.push(
      baseItem({
        actionIdKey: result.scenarioId,
        actionType,
        title: `Scenario: ${result.title}`,
        summary: `${result.primarySignal} — risk ${result.riskScore}.`,
        whyItMatters: hints.recommendedHumanAction,
        priority: result.riskScore >= 70 ? "CRITICAL" : "HIGH",
        urgency: result.signals.includes("SCENARIO_DEBATE_TRAP") ? "IMMEDIATE" : "URGENT",
        sourceSystems: ["NSI-14", "NSI-13"],
        linkedScenarios: [result.scenarioId],
        linkedNarratives: result.linkedNarratives,
        linkedCounties: result.linkedCounties,
        linkedBills: result.linkedBills,
        riskLevel: result.riskScore >= 70 ? "CRITICAL" : "HIGH",
        opportunityLevel: result.opportunityScore >= 55 ? "HIGH" : "MEDIUM",
        evidenceDependencies: result.evidenceBlockers,
        recommendedNextStep: hints.debatePrepAction || hints.evidenceBlockerAction || hints.escalationPath,
        blockedBy: result.evidenceBlockers,
        extraGovernanceWarnings: [hints.escalationPath],
      }),
    );
  }

  for (const finding of media.findings
    .filter((row) => row.reviewStatus === "NEEDS_REVIEW")
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 6)) {
    items.push(
      baseItem({
        actionIdKey: finding.findingId,
        actionType: "REVIEW_MEDIA_FINDING",
        title: `Review media finding ${finding.findingId}`,
        summary: `${finding.title.slice(0, 80)} — relevance ${finding.relevanceScore}.`,
        whyItMatters: "High-relevance public media signals may affect opposition research or rapid response prep.",
        priority: finding.relevanceScore >= 80 ? "HIGH" : "MEDIUM",
        urgency: finding.relevanceScore >= 85 ? "URGENT" : "SOON",
        sourceSystems: ["NSI-8", "NSI-10"],
        linkedMediaFindings: [finding.findingId],
        linkedCounties: finding.possibleCountyLinks ?? [],
        linkedNarratives: finding.possibleNarrativeLinks ?? [],
        riskLevel: "MEDIUM",
        opportunityLevel: finding.relevanceScore >= 75 ? "HIGH" : "MEDIUM",
        evidenceDependencies: [finding.canonicalUrl, finding.sourceName],
        recommendedNextStep: "Triage in media intake; human-promote to citation/task draft if validated — no auto-create.",
      }),
    );
  }

  for (const narrative of narratives.narratives.filter(
    (row) => row.readinessBand === "WEAK" || row.readinessBand === "BLOCKED",
  ).slice(0, 6)) {
    items.push(
      baseItem({
        actionIdKey: narrative.narrativeId,
        actionType: "STRENGTHEN_NARRATIVE",
        title: `Strengthen narrative ${narrative.title}`,
        summary: `${narrative.readinessBand} — ${narrative.signal.slice(0, 100)}.`,
        whyItMatters: "Strategically important narrative is not deployment-ready.",
        priority: narrative.readinessBand === "BLOCKED" ? "HIGH" : "MEDIUM",
        urgency: "SOON",
        sourceSystems: ["NSI-1", "SDI-1"],
        linkedNarratives: [narrative.narrativeId],
        riskLevel: narrative.readinessBand === "BLOCKED" ? "HIGH" : "MEDIUM",
        opportunityLevel: "HIGH",
        evidenceDependencies: narrative.blockers,
        recommendedNextStep: "Close citation/claim gaps; re-run narrative state after evidence updates.",
        blockedBy: narrative.blockers,
      }),
    );
  }

  for (const card of countyIndex.cards.filter(
    (row) => row.openResearchCount > 0 || row.blockedNarrativeCount > 0,
  ).slice(0, 8)) {
    const actionType = card.openResearchCount > 0 ? "CREATE_RETRIEVAL_TASK" : "UPDATE_COUNTY_BRIEFING";
    items.push(
      baseItem({
        actionIdKey: card.countyId,
        actionType,
        title: `${actionType === "CREATE_RETRIEVAL_TASK" ? "Research gap" : "County briefing"} — ${card.countyName}`,
        summary: `Blocked narratives: ${card.blockedNarrativeCount}; open research: ${card.openResearchCount}.`,
        whyItMatters: "High-opportunity county may be under-prepared for local deployment.",
        priority: card.localRiskLevel === "HIGH" ? "HIGH" : "MEDIUM",
        urgency: card.blockedNarrativeCount > 0 ? "URGENT" : "SOON",
        sourceSystems: ["NSI-5", "NSI-2", "V3-A"],
        linkedCounties: [card.countyId],
        riskLevel: card.blockedNarrativeCount > 1 ? "HIGH" : "MEDIUM",
        opportunityLevel: card.exportReadyTalkingPointCount > 0 ? "HIGH" : "MEDIUM",
        evidenceDependencies: [card.primarySignalText],
        recommendedNextStep:
          actionType === "CREATE_RETRIEVAL_TASK"
            ? "Human-create retrieval task in KH-3B — do not auto-mutate task board."
            : "Refresh county briefing after local validation.",
        blockedBy: card.blockedNarrativeCount > 0 ? ["Blocked narratives in county overlay."] : [],
      }),
    );
  }

  for (const tension of alignment.topStrategicTensions?.slice(0, 4) ?? []) {
    items.push(
      baseItem({
        actionIdKey: tension.narrativeId,
        actionType: "REVIEW_STRATEGIC_TENSION",
        title: `Doctrine tension: ${tension.narrativeTitle}`,
        summary: tension.signal.slice(0, 120),
        whyItMatters: "Narrative may conflict with campaign doctrine or philosophy alignment.",
        priority: "HIGH",
        urgency: "SOON",
        sourceSystems: ["SDI-1", "NSI-1"],
        linkedNarratives: [tension.narrativeId],
        riskLevel: "HIGH",
        opportunityLevel: "MEDIUM",
        recommendedNextStep: "Resolve tension in strategy alignment dashboard before field deployment.",
      }),
    );
  }

  for (const narrative of usage.topFatigueWarnings.slice(0, 4)) {
    const recentExports = exportHistory.entries
      .filter((e) => e.narrativeIds?.includes(narrative.narrativeId))
      .slice(0, 3);
    items.push(
      baseItem({
        actionIdKey: `export-fatigue-${narrative.narrativeId}`,
        actionType: "REVIEW_EXPORT_RISK",
        title: `Export fatigue — ${narrative.narrativeTitle}`,
        summary: narrative.signal.slice(0, 100),
        whyItMatters: "Frequently exported narrative may depend on stale citations.",
        priority: "HIGH",
        urgency: "SOON",
        sourceSystems: ["NSI-3", "V3-E"],
        linkedNarratives: [narrative.narrativeId],
        linkedExports: recentExports.map((e) => e.exportId),
        riskLevel: "HIGH",
        opportunityLevel: "LOW",
        evidenceDependencies: ["Verify citation freshness before next export."],
        recommendedNextStep: "Pause external repetition; refresh citations or rotate county examples.",
        blockedBy: memory.staleCitations.length
          ? ["Stale citation signals in intelligence memory."]
          : [],
      }),
    );
  }

  if (memory.opponentMessageEscalation.length > 0) {
    items.push(
      baseItem({
        actionIdKey: "opponent-drift",
        actionType: "INVESTIGATE_OPPONENT_MESSAGE",
        title: "Investigate opponent messaging drift",
        summary: memory.opponentMessageEscalation[0]!.reason.slice(0, 120),
        whyItMatters: "Opponent messaging drift may require updated contrast and debate prep.",
        priority: "HIGH",
        urgency: "URGENT",
        sourceSystems: ["NSI-13", "KH-0"],
        riskLevel: "HIGH",
        opportunityLevel: "MEDIUM",
        evidenceDependencies: memory.opponentMessageEscalation.map((r) => r.reason).slice(0, 3),
        recommendedNextStep: "Review media intake and public statements; source new citations before field use.",
      }),
    );
  }

  for (const gap of recommendWatchlistGaps(root).slice(0, 5)) {
    items.push(
      baseItem({
        actionIdKey: gap,
        actionType: "REVIEW_PUBLIC_MEETING_SOURCE",
        title: `Public meeting watchlist gap`,
        summary: gap.slice(0, 120),
        whyItMatters: "County may lack governed public meeting monitoring coverage.",
        priority: "MEDIUM",
        urgency: "ROUTINE",
        sourceSystems: ["NSI-8", "NSI-5"],
        riskLevel: "MEDIUM",
        opportunityLevel: "MEDIUM",
        recommendedNextStep: "Add verified public meeting URLs to watchlist — manual review only.",
      }),
    );
  }

  if (registration.missingCountyGoalCount > 0) {
    items.push(
      baseItem({
        actionIdKey: "registration-goals",
        actionType: "CHECK_REGISTRATION_GOAL",
        title: "Verify registration goal assumptions",
        summary: `${registration.missingCountyGoalCount} counties missing registration goals in governed sources.`,
        whyItMatters: "Pathway-to-win modeling depends on anecdotal registration assumptions — not voter targeting.",
        priority: "HIGH",
        urgency: "SOON",
        sourceSystems: ["NSI-7", "NSI-6"],
        riskLevel: "MEDIUM",
        opportunityLevel: "HIGH",
        evidenceDependencies: [registrationAssumptions.notes, registration.winTargetComparison.note],
        recommendedNextStep: "Validate county registration targets in strategic target pathway audit.",
        blockedBy: registration.countyRows.filter((row) => row.dataStatus === "MISSING").map((row) => row.countyId),
      }),
    );
  }

  items.push(
    baseItem({
      actionIdKey: "target-pathway-validation",
      actionType: "VALIDATE_TARGET_PATHWAY",
      title: "Validate strategic target pathway",
      summary: registration.winTargetComparison.note,
      whyItMatters: "Statewide win pathway requires verified county targets and turnout assumptions.",
      priority: registration.winTargetComparison.expectedSupportGap !== null ? "HIGH" : "MEDIUM",
      urgency: "SOON",
      sourceSystems: ["NSI-7", "NSI-6"],
      riskLevel: "MEDIUM",
      opportunityLevel: "HIGH",
      evidenceDependencies: [registrationAssumptions.notes],
      recommendedNextStep: "Open strategic target pathway audit; confirm county numbers with field and data stewards.",
    }),
  );

  const adapterRegistry = aggregate;
  if (adapterRegistry.liveAdapterCount < adapterRegistry.adapterCount) {
    items.push(
      baseItem({
        actionIdKey: "operational-adapters",
        actionType: "CHECK_COUNTY_OPERATIONAL_RISK",
        title: "Operational intelligence adapter gaps",
        summary: `${adapterRegistry.liveAdapterCount}/${adapterRegistry.adapterCount} read adapters LIVE.`,
        whyItMatters: "Operational intelligence adapter missing data for deployment decisions.",
        priority: "MEDIUM",
        urgency: "ROUTINE",
        sourceSystems: ["NSI-6"],
        riskLevel: "MEDIUM",
        opportunityLevel: "MEDIUM",
        recommendedNextStep: "Review aggregate campaign intelligence adapters; hydrate read-only data.",
      }),
    );
  }

  for (const task of evidence.retrievalTasks
    .filter((t) => t.priority === "HIGH" && t.taskStatus !== "COMPLETE")
    .slice(0, 3)) {
    items.push(
      baseItem({
        actionIdKey: task.id,
        actionType: "CREATE_RETRIEVAL_TASK",
        title: `Execute retrieval task #${task.rank ?? "?"}`,
        summary: task.description.slice(0, 120),
        whyItMatters: "High-priority evidence gap blocks stronger narratives and debate prep.",
        priority: "HIGH",
        urgency: "URGENT",
        sourceSystems: ["V3-A", "KH-3B"],
        linkedTasks: [task.id],
        riskLevel: "HIGH",
        opportunityLevel: "HIGH",
        recommendedNextStep: "Human-update task status in Evidence Command — recommendation does not execute task.",
      }),
    );
  }

  for (const partialClaim of evidence.claims.filter((c) => c.citationStatus === "PARTIAL").slice(0, 3)) {
    items.push(
      baseItem({
        actionIdKey: partialClaim.id,
        actionType: "VERIFY_BILL_SOURCE",
        title: `Verify source for claim ${partialClaim.id}`,
        summary: `Claim ${partialClaim.id} has partial citation — ${partialClaim.topic ?? "topic unset"}.`,
        whyItMatters: "Debate and county briefings require primary statutory verification.",
        priority: "MEDIUM",
        urgency: "SOON",
        sourceSystems: ["KH-0", "NSI-4"],
        linkedClaims: [partialClaim.id],
        riskLevel: "MEDIUM",
        opportunityLevel: "MEDIUM",
        evidenceDependencies: [partialClaim.id],
        recommendedNextStep: "Confirm act text on Arkleg; update citation locker after review.",
      }),
    );
  }

  if (scenarioSummary.debateTraps.length > 0) {
    items.push(
      baseItem({
        actionIdKey: "debate-trap-bundle",
        actionType: "PREPARE_DEBATE_RESPONSE",
        title: "Debate trap review bundle",
        summary: `${scenarioSummary.debateTraps.length} scenarios flagged SCENARIO_DEBATE_TRAP.`,
        whyItMatters: "Debate memory and scenario simulation indicate stale or risky rebuttal paths.",
        priority: "CRITICAL",
        urgency: "IMMEDIATE",
        sourceSystems: ["NSI-14", "NSI-13"],
        linkedScenarios: scenarioSummary.debateTraps.map((r) => r.scenarioId).slice(0, 5),
        riskLevel: "CRITICAL",
        opportunityLevel: "MEDIUM",
        recommendedNextStep: "Run debate prep center + what-not-to-say review before next public debate.",
        blockedBy: memory.recurringDebateTraps.map((r) => r.reason).slice(0, 2),
      }),
    );
  }

  const deduped = new Map<string, HumanActionQueueItem>();
  for (const item of resolveActionDependencies(items)) {
    deduped.set(item.actionId, item);
  }
  return rankHumanActions([...deduped.values()]);
}

function mergeQueueWithRecommendations(
  persisted: HumanActionQueueFile,
  recommendations: HumanActionQueueItem[],
): HumanActionQueueFile {
  const byId = new Map(persisted.items.map((row) => [row.actionId, row]));
  const recIds = new Set(recommendations.map((row) => row.actionId));

  for (const rec of recommendations) {
    const existing = byId.get(rec.actionId);
    if (!existing) {
      byId.set(rec.actionId, rec);
      continue;
    }
    if (existing.status === "RECOMMENDED") {
      byId.set(rec.actionId, {
        ...rec,
        operatorNotes: existing.operatorNotes,
        createdAt: existing.createdAt,
        updatedAt: nowIso(),
      });
    }
  }

  const merged = [...byId.values()].filter((row) => {
    if (row.status !== "RECOMMENDED") return true;
    return recIds.has(row.actionId);
  });

  return {
    ...persisted,
    generatedAt: nowIso(),
    items: rankHumanActions(merged),
  };
}

export function syncHumanActionQueue(repoRoot?: string): HumanActionQueueFile {
  const root = resolveRepoRoot(repoRoot);
  const persisted = loadHumanActionQueue(root);
  const recommendations = getCachedRecommendations(root);
  const merged = mergeQueueWithRecommendations(persisted, recommendations);
  writeFileSync(absPath(root, HUMAN_ACTION_QUEUE_REL), `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  return merged;
}

function composeHumanActionQueue(repoRoot?: string): HumanActionQueueFile {
  const root = resolveRepoRoot(repoRoot);
  const persisted = loadHumanActionQueue(root);
  const recommendations = getCachedRecommendations(root);
  return mergeQueueWithRecommendations(persisted, recommendations);
}

/** Fast path for debate launch — persisted queue only, no scenario/aggregate regeneration. */
export function summarizePersistedHumanActionQueue(repoRoot?: string): HumanActionQueueSummary {
  return summarizeHumanActionQueueFromFile(loadHumanActionQueue(repoRoot));
}

function summarizeHumanActionQueueFromFile(queue: HumanActionQueueFile): HumanActionQueueSummary {
  const items = queue.items.filter((row) => row.status !== "ARCHIVED" && row.status !== "DISMISSED");
  const byStatus = {} as HumanActionQueueSummary["byStatus"];
  const byOwnerRole = {} as HumanActionQueueSummary["byOwnerRole"];
  const byActionType: Record<string, number> = {};

  for (const row of queue.items) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    byOwnerRole[row.recommendedOwnerRole] = (byOwnerRole[row.recommendedOwnerRole] ?? 0) + 1;
    byActionType[row.actionType] = (byActionType[row.actionType] ?? 0) + 1;
  }

  const active = rankHumanActions(items);
  const filterType = (type: HumanActionType) => active.filter((row) => row.actionType === type);

  return {
    generatedAt: queue.generatedAt,
    totalActions: active.length,
    recommendedCount: active.filter((row) => row.status === "RECOMMENDED").length,
    urgentCount: summarizeUrgentActions(active).length,
    blockedCount: summarizeBlockedActions(active).length,
    highOpportunityCount: summarizeHighOpportunityActions(active).length,
    byStatus,
    byOwnerRole,
    byActionType,
    topUrgent: summarizeUrgentActions(active).slice(0, 5),
    topBlocked: summarizeBlockedActions(active).slice(0, 5),
    topOpportunity: summarizeHighOpportunityActions(active).slice(0, 5),
    debatePrepActions: filterType("PREPARE_DEBATE_RESPONSE").slice(0, 8),
    citationReviewActions: filterType("REVIEW_CITATION").slice(0, 8),
    countyBriefingActions: [
      ...filterType("UPDATE_COUNTY_BRIEFING"),
      ...filterType("CREATE_RETRIEVAL_TASK"),
    ].slice(0, 8),
    targetPathwayActions: [
      ...filterType("VALIDATE_TARGET_PATHWAY"),
      ...filterType("CHECK_REGISTRATION_GOAL"),
    ].slice(0, 8),
    candidatePrepActions: filterType("PREPARE_CANDIDATE_BRIEF").slice(0, 5),
    researchActions: [
      ...filterType("REVIEW_CLAIM"),
      ...filterType("INVESTIGATE_OPPONENT_MESSAGE"),
      ...filterType("VERIFY_BILL_SOURCE"),
    ].slice(0, 8),
    fieldActions: [
      ...filterType("PREPARE_VOLUNTEER_GUIDANCE"),
      ...filterType("CHECK_COUNTY_OPERATIONAL_RISK"),
    ].slice(0, 5),
    mediaMonitoringActions: [
      ...filterType("REVIEW_MEDIA_FINDING"),
      ...filterType("MONITOR_MEDIA_SOURCE"),
      ...filterType("REVIEW_PUBLIC_MEETING_SOURCE"),
    ].slice(0, 8),
    publicationSafety: "NON_PUBLISHABLE",
    humanActionRequired: true,
    queueHref: "/admin/intelligence/action-queue",
  };
}

export function summarizeHumanActionQueue(repoRoot?: string): HumanActionQueueSummary {
  if (shouldSkipHumanActionQueueSyncOnRequest()) {
    return summarizePersistedHumanActionQueue(repoRoot);
  }
  return summarizeHumanActionQueueFromFile(composeHumanActionQueue(repoRoot));
}

export function buildHumanActionRecommendationBundle(repoRoot?: string): HumanActionRecommendationBundle {
  const recommendations = generateHumanActionRecommendations(repoRoot);
  const summary = summarizeHumanActionQueue(repoRoot);
  return {
    generatedAt: nowIso(),
    recommendations,
    summary,
  };
}

export function getMorningBriefActionQueueSection(repoRoot?: string): {
  topFive: HumanActionQueueItem[];
  candidatePrep: HumanActionQueueItem[];
  debatePrep: HumanActionQueueItem[];
  research: HumanActionQueueItem[];
  fieldVolunteer: HumanActionQueueItem[];
  mediaMonitoring: HumanActionQueueItem[];
  blockedByCitation: HumanActionQueueItem[];
  highRiskScenarios: HumanActionQueueItem[];
} {
  const summary = summarizeHumanActionQueue(repoRoot);
  const all = composeHumanActionQueue(repoRoot).items.filter(
    (row) => row.status !== "DISMISSED" && row.status !== "ARCHIVED",
  );
  const ranked = rankHumanActions(all);

  return {
    topFive: ranked.slice(0, 5),
    candidatePrep: summary.candidatePrepActions,
    debatePrep: summary.debatePrepActions,
    research: summary.researchActions,
    fieldVolunteer: summary.fieldActions,
    mediaMonitoring: summary.mediaMonitoringActions,
    blockedByCitation: ranked.filter(
      (row) =>
        row.blockedBy.some((b) => b.toLowerCase().includes("citation")) ||
        row.actionType === "REVIEW_CITATION",
    ).slice(0, 5),
    highRiskScenarios: ranked.filter((row) => row.linkedScenarios.length > 0 && row.riskLevel === "CRITICAL").slice(0, 5),
  };
}

export function getEvidenceCommandActionQueueSection(repoRoot?: string): {
  topUrgent: HumanActionQueueItem[];
  topBlocked: HumanActionQueueItem[];
  topOpportunity: HumanActionQueueItem[];
  debatePrep: HumanActionQueueItem[];
  citationReview: HumanActionQueueItem[];
  countyBriefing: HumanActionQueueItem[];
  targetPathway: HumanActionQueueItem[];
  queueHref: string;
} {
  const summary = summarizeHumanActionQueue(repoRoot);
  return {
    topUrgent: summary.topUrgent,
    topBlocked: summary.topBlocked,
    topOpportunity: summary.topOpportunity,
    debatePrep: summary.debatePrepActions.slice(0, 5),
    citationReview: summary.citationReviewActions.slice(0, 5),
    countyBriefing: summary.countyBriefingActions.slice(0, 5),
    targetPathway: summary.targetPathwayActions.slice(0, 5),
    queueHref: summary.queueHref,
  };
}

export function getCopilotActionQueueRouting(
  toolCategory: string,
  repoRoot?: string,
): {
  recommendedHumanActions: string[];
  suggestedOwnerRole: HumanActionOwnerRole;
  actionQueueRouting: string;
  actionWarnings: string[];
} {
  const summary = summarizeHumanActionQueue(repoRoot);
  const categoryMap: Record<string, HumanActionOwnerRole> = {
    opposition_research: "Research",
    debate_prep: "Debate Prep",
    briefing_papers: "Candidate Prep",
    writing_tools: "Comms",
    intelligence_gathering: "Media Monitoring",
  };
  const owner = categoryMap[toolCategory] ?? "Strategy";
  const queueItems = shouldSkipHumanActionQueueSyncOnRequest()
    ? loadHumanActionQueue(repoRoot).items
    : composeHumanActionQueue(repoRoot).items;
  const related = rankHumanActions(
    queueItems.filter((row) => row.recommendedOwnerRole === owner && row.status === "RECOMMENDED"),
  ).slice(0, 3);

  return {
    recommendedHumanActions: related.map((row) => `${row.actionId}: ${row.title}`),
    suggestedOwnerRole: owner,
    actionQueueRouting: summary.queueHref,
    actionWarnings: [
      "Copilot output does not create queue items — review NSI-15 action queue separately.",
      ...GOVERNANCE_WARNINGS.slice(0, 2),
    ],
  };
}
