/**
 * Victory OS — numeric maps for deployment priority (doctrine: VICTORY_OS_DOCTRINE.md)
 *
 * Deployment Priority =
 *   Victory Importance × Opportunity × Readiness Gap × Urgency
 *
 * Each factor normalized 0–1 before multiply. Display score = product × 100 (capped).
 */

import type {
  CountyOpsStatus,
  DeploymentPriorityFactors,
  ElectoralImportance,
  OpportunityLevel,
  OrganizationalReadiness,
} from "./types";

const ELECTORAL_IMPORTANCE: Record<ElectoralImportance, number> = {
  critical: 1.0,
  important: 0.75,
  helpful: 0.5,
  maintenance: 0.25,
};

const OPPORTUNITY: Record<OpportunityLevel, number> = {
  high: 1.0,
  medium: 0.6,
  low: 0.3,
};

/** Readiness gap: weak org = high gap (needs intervention); strong org = low gap. */
const READINESS_GAP: Record<OrganizationalReadiness, number> = {
  weak: 1.0,
  moderate: 0.55,
  strong: 0.2,
};

const OPS_URGENCY: Record<CountyOpsStatus, number> = {
  red: 1.0,
  yellow: 0.65,
  green: 0.35,
};

export function electoralImportanceScore(v: ElectoralImportance): number {
  return ELECTORAL_IMPORTANCE[v];
}

export function opportunityScore(v: OpportunityLevel): number {
  return OPPORTUNITY[v];
}

export function readinessGapScore(v: OrganizationalReadiness): number {
  return READINESS_GAP[v];
}

export function opsUrgencyScore(status: CountyOpsStatus, neglectDays?: number | null): number {
  const base = OPS_URGENCY[status];
  if (neglectDays == null || neglectDays <= 0) return base;
  const neglectBoost = Math.min(0.25, neglectDays / 120);
  return Math.min(1, base + neglectBoost);
}

export function computeDeploymentPriority(input: {
  electoralImportance: ElectoralImportance;
  opportunityLevel: OpportunityLevel;
  organizationalReadiness: OrganizationalReadiness;
  opsStatus: CountyOpsStatus;
  neglectDays?: number | null;
}): DeploymentPriorityFactors {
  const victoryImportance = electoralImportanceScore(input.electoralImportance);
  const opportunity = opportunityScore(input.opportunityLevel);
  const readinessGap = readinessGapScore(input.organizationalReadiness);
  const urgency = opsUrgencyScore(input.opsStatus, input.neglectDays);
  const product = victoryImportance * opportunity * readinessGap * urgency;
  return {
    victoryImportance,
    opportunity,
    readinessGap,
    urgency,
    deploymentPriority: Math.round(Math.min(100, product * 100)),
  };
}
