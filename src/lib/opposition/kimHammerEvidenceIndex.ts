import fs from "node:fs";
import path from "node:path";
import type {
  KimHammerClaim,
  KimHammerClaimGraphClaim,
  KimHammerClaimGraphEvidence,
  KimHammerIntelligenceGapsFile,
  KimHammerPublicDebateEvidenceBoardFile,
  KimHammerPublicationTier,
  KimHammerRetrievalTask,
  KimHammerRetrievalTaskStatus,
  KimHammerReviewStatus,
} from "@/lib/opposition/types/kimHammerEvidence";
import { KIM_HAMMER_REVIEW_STATUSES } from "@/lib/opposition/types/kimHammerEvidence";
import {
  canExportClaim,
  evaluateClaimSafety,
  getPublicationTier,
  getReviewStatusLabel,
  KIM_HAMMER_EXPORT_FILTER,
  type KimHammerPublicationSafetyFile,
  type KimHammerPublicationSafetyRule,
} from "@/lib/opposition/kimHammerPublicationSafety";

export {
  canExportClaim,
  evaluateClaimSafety,
  getExternalUseStatus,
  getLegalRiskLabel,
  getPublicationTier,
  getReviewStatus,
  getReviewStatusLabel,
  getSafetyBlockers,
  KIM_HAMMER_EXPORT_FILTER,
  passesReviewExportGate,
  passesTierOneSafetyCriteria,
  type KimHammerPublicationSafetyFile,
  type KimHammerPublicationSafetyRule,
} from "@/lib/opposition/kimHammerPublicationSafety";

function readJson<T>(relPath: string, repoRoot: string = process.cwd()): T {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), "utf8")) as T;
}

export type KimHammerRiskRegisterEntry = {
  id: string;
  claimId: string;
  narrativeRiskScore: number;
  overallThreatIndex: number;
  counterattackRisk: number;
  notes: string;
};

export type KimHammerRiskRegisterFile = {
  generatedAt: string;
  risks: KimHammerRiskRegisterEntry[];
  scale?: string;
};

export type KimHammerClaimGraphFile = {
  generatedAt: string;
  claims: KimHammerClaimGraphClaim[];
  evidence: KimHammerClaimGraphEvidence[];
  retrievalSuggestions?: Array<{
    id: string;
    targetGapId: string;
    suggestion: string;
    retrievalConfidence: number;
    humanReviewRequired: boolean;
  }>;
  contradictions?: Array<{
    id: string;
    claimId?: string;
    contradictionSeverity: string;
    notes: string;
  }>;
};

export type KimHammerClaimIndexSource = "PUBLIC_DEBATE_BOARD" | "CLAIM_GRAPH";

export type KimHammerIndexedClaim = KimHammerClaim & {
  indexSource: KimHammerClaimIndexSource;
  exportReady: boolean;
  blocked: boolean;
  reviewNeeded: boolean;
  safetyBlockers: string[];
  riskEntry?: KimHammerRiskRegisterEntry;
};

export type KimHammerReviewStatusCountKey = KimHammerReviewStatus | "LEGACY_UNSET";

export type KimHammerEvidenceIndexMetrics = {
  totalClaims: number;
  exportReadyClaims: number;
  blockedClaims: number;
  retrievalTasks: number;
  safetyBlockers: string[];
  reviewNeededClaims: number;
  tierDistribution: Record<KimHammerPublicationTier, number>;
  taskStatusCounts: Record<KimHammerRetrievalTaskStatus, number>;
  reviewStatusCounts: Record<KimHammerReviewStatusCountKey, number>;
};

const TASK_STATUSES: KimHammerRetrievalTaskStatus[] = [
  "NOT_STARTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "BLOCKED",
  "READY_FOR_REVIEW",
  "COMPLETE",
  "ARCHIVED",
];

export function resolveRetrievalTaskStatus(
  task: KimHammerRetrievalTask,
): KimHammerRetrievalTaskStatus {
  return task.taskStatus ?? "NOT_STARTED";
}

export function computeTaskStatusCounts(
  tasks: KimHammerRetrievalTask[],
): Record<KimHammerRetrievalTaskStatus, number> {
  const counts = Object.fromEntries(
    TASK_STATUSES.map((status) => [status, 0]),
  ) as Record<KimHammerRetrievalTaskStatus, number>;

  for (const task of tasks) {
    counts[resolveRetrievalTaskStatus(task)] += 1;
  }

  return counts;
}

export type KimHammerEvidenceIndex = {
  generatedAt: string;
  intelligenceGaps: KimHammerIntelligenceGapsFile;
  publicDebateEvidenceBoard: KimHammerPublicDebateEvidenceBoardFile;
  claimGraph: KimHammerClaimGraphFile;
  riskRegister: KimHammerRiskRegisterFile;
  publicationSafety: KimHammerPublicationSafetyFile;
  claims: KimHammerIndexedClaim[];
  retrievalTasks: KimHammerRetrievalTask[];
  exportReadyClaims: KimHammerIndexedClaim[];
  blockedClaims: KimHammerIndexedClaim[];
  reviewNeededClaims: KimHammerIndexedClaim[];
  metrics: KimHammerEvidenceIndexMetrics;
};

const EMPTY_TIER_DISTRIBUTION = (): Record<KimHammerPublicationTier, number> => ({
  TIER_1_PUBLIC_DEPLOYABLE: 0,
  TIER_2_NEEDS_CORROBORATION: 0,
  TIER_3_INTERNAL_ONLY: 0,
  TIER_4_HIGH_CAUTION: 0,
});

export function computeReviewStatusCounts(
  claims: KimHammerClaim[],
): Record<KimHammerReviewStatusCountKey, number> {
  const counts = Object.fromEntries(
    KIM_HAMMER_REVIEW_STATUSES.map((status) => [status, 0]),
  ) as Record<KimHammerReviewStatus, number>;

  const withLegacy: Record<KimHammerReviewStatusCountKey, number> = {
    ...counts,
    LEGACY_UNSET: 0,
  };

  for (const claim of claims) {
    const key = getReviewStatusLabel(claim) as KimHammerReviewStatusCountKey;
    withLegacy[key] = (withLegacy[key] ?? 0) + 1;
  }

  return withLegacy;
}

export function normalizeDebateBoardClaim(
  item: import("@/lib/opposition/types/kimHammerEvidence").KimHammerPublicDebateEvidenceItem,
): KimHammerClaim {
  return {
    id: item.id,
    topic: item.topic,
    text: item.claim,
    claim: item.claim,
    supportingEvidence: item.supportingEvidence,
    challengingEvidence: item.challengingEvidence,
    confidenceTier: item.confidenceTier,
    confidenceScore: item.confidenceScore,
    citationStatus: item.citationStatus,
    externalUseStatus: item.externalUseStatus,
    legalRisk: item.legalRisk,
    humanReviewRequired: item.humanReviewRequired,
    reviewStatus: item.reviewStatus,
    reviewer: item.reviewer,
    reviewedAt: item.reviewedAt ?? undefined,
    reviewNotes: item.reviewNotes,
    lastExportedAt: item.lastExportedAt ?? undefined,
  };
}

export function normalizeClaimGraphClaim(item: KimHammerClaimGraphClaim): KimHammerClaim {
  return {
    id: item.id,
    entityId: item.entityId,
    text: item.text,
    verificationTier: item.verificationTier,
    confidenceScore: item.confidenceScore,
    publicationReadiness: item.publicationReadiness,
    externalUseStatus: item.publicationReadiness,
    reviewStatus: item.reviewStatus,
    reviewer: item.reviewer,
    reviewedAt: item.reviewedAt ?? undefined,
    reviewNotes: item.reviewNotes,
    lastExportedAt: item.lastExportedAt ?? undefined,
  };
}

/** @deprecated Use getPublicationTier from kimHammerPublicationSafety */
export function claimPublicationTier(claim: KimHammerClaim): KimHammerPublicationTier | undefined {
  return getPublicationTier(claim);
}

/** @deprecated Use canExportClaim from kimHammerPublicationSafety */
export function isKimHammerClaimExportReady(claim: KimHammerClaim): boolean {
  return canExportClaim(claim);
}

export function computeTierDistribution(
  claims: KimHammerClaim[],
): Record<KimHammerPublicationTier, number> {
  const distribution = EMPTY_TIER_DISTRIBUTION();
  for (const claim of claims) {
    const tier = getPublicationTier(claim);
    if (tier) {
      distribution[tier] += 1;
    }
  }
  return distribution;
}

function indexClaim(
  claim: KimHammerClaim,
  indexSource: KimHammerClaimIndexSource,
  rules: KimHammerPublicationSafetyRule[],
  riskByClaimId: Map<string, KimHammerRiskRegisterEntry>,
): KimHammerIndexedClaim {
  const safety = evaluateClaimSafety(claim, rules);
  return {
    ...claim,
    indexSource,
    exportReady: canExportClaim(claim),
    blocked: safety.blocked,
    reviewNeeded: safety.reviewNeeded,
    safetyBlockers: safety.safetyBlockers,
    riskEntry: riskByClaimId.get(claim.id),
  };
}

export function loadKimHammerEvidenceIndex(repoRoot: string = process.cwd()): KimHammerEvidenceIndex {
  const intelligenceGaps = readJson<KimHammerIntelligenceGapsFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-intelligence-gaps.json",
    repoRoot,
  );
  const publicDebateEvidenceBoard = readJson<KimHammerPublicDebateEvidenceBoardFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-public-debate-evidence-board.json",
    repoRoot,
  );
  const claimGraph = readJson<KimHammerClaimGraphFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-claim-graph.json",
    repoRoot,
  );
  const riskRegister = readJson<KimHammerRiskRegisterFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-risk-register.json",
    repoRoot,
  );
  const publicationSafety = readJson<KimHammerPublicationSafetyFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-publication-safety.json",
    repoRoot,
  );

  const riskByClaimId = new Map(riskRegister.risks.map((risk) => [risk.claimId, risk]));
  const rules = publicationSafety.rules;

  const debateClaims = publicDebateEvidenceBoard.items.map((item) =>
    indexClaim(normalizeDebateBoardClaim(item), "PUBLIC_DEBATE_BOARD", rules, riskByClaimId),
  );
  const graphClaims = claimGraph.claims.map((item) =>
    indexClaim(normalizeClaimGraphClaim(item), "CLAIM_GRAPH", rules, riskByClaimId),
  );
  const claims = [...debateClaims, ...graphClaims];
  const retrievalTasks = intelligenceGaps.gaps;

  const exportReadyClaims = claims.filter((claim) => canExportClaim(claim));
  const blockedClaims = claims.filter((claim) => claim.blocked);
  const reviewNeededClaims = claims.filter((claim) => claim.reviewNeeded);

  const activeBlockerRuleIds = rules
    .filter((rule) => rule.severity === "BLOCKER")
    .map((rule) => rule.id);
  const triggeredBlockers = [
    ...new Set(claims.flatMap((claim) => claim.safetyBlockers)),
  ].sort();

  const metrics: KimHammerEvidenceIndexMetrics = {
    totalClaims: claims.length,
    exportReadyClaims: exportReadyClaims.length,
    blockedClaims: blockedClaims.length,
    retrievalTasks: retrievalTasks.length,
    safetyBlockers: triggeredBlockers.length > 0 ? triggeredBlockers : activeBlockerRuleIds,
    reviewNeededClaims: reviewNeededClaims.length,
    tierDistribution: computeTierDistribution(claims),
    taskStatusCounts: computeTaskStatusCounts(retrievalTasks),
    reviewStatusCounts: computeReviewStatusCounts(claims),
  };

  return {
    generatedAt: new Date().toISOString(),
    intelligenceGaps,
    publicDebateEvidenceBoard,
    claimGraph,
    riskRegister,
    publicationSafety,
    claims,
    retrievalTasks,
    exportReadyClaims,
    blockedClaims,
    reviewNeededClaims,
    metrics,
  };
}
