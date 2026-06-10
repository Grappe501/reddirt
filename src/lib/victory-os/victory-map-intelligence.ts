/**
 * Victory OS — AI-ready deterministic helpers (Sprint 0).
 * Read-only context for agents; no autonomous decisions or calendar writes.
 */

import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { loadVictoryMapCounties, loadVictoryMapStatewideSummary } from "./load-victory-map";
import type {
  CountyVictoryContext,
  ElectoralImportance,
  OpportunityLevel,
  OrganizationalReadiness,
  VictoryMapCountyProfile,
} from "./types";

export type VictoryMapCountyBrief = {
  countySlug: string;
  county: string;
  displayName: string;
  regionSlug: string;
  electoralImportance: ElectoralImportance;
  opportunityLevel: OpportunityLevel;
  organizationalReadiness: OrganizationalReadiness;
  opsStatus: CountyVictoryContext["opsStatus"];
  deploymentPriority: number;
  neglectDays: number | null;
  narrativeLine: string;
};

export type VictoryMapAuditFinding = {
  severity: "info" | "warn" | "critical";
  code: string;
  message: string;
  countySlug?: string;
};

function narrativeForCounty(c: CountyVictoryContext): string {
  const parts = [
    `${c.displayName}: ${c.electoralImportance} electoral importance`,
    `${c.opportunityLevel} opportunity`,
    `${c.organizationalReadiness} readiness`,
    `ops ${c.opsStatus}`,
    `priority ${c.deploymentPriority.deploymentPriority}`,
  ];
  if (c.neglectDays != null && c.neglectDays > 30) parts.push(`${c.neglectDays}d since last touch`);
  return parts.join(" · ");
}

export function buildVictoryMapCountyBrief(countySlug: string): VictoryMapCountyBrief | null {
  const counties = loadVictoryMapCounties();
  const c = counties.find((x) => x.countySlug === countySlug);
  if (!c) return null;
  return {
    countySlug: c.countySlug,
    county: c.county,
    displayName: c.displayName,
    regionSlug: c.regionSlug,
    electoralImportance: c.electoralImportance,
    opportunityLevel: c.opportunityLevel,
    organizationalReadiness: c.organizationalReadiness,
    opsStatus: c.opsStatus,
    deploymentPriority: c.deploymentPriority.deploymentPriority,
    neglectDays: c.neglectDays ?? null,
    narrativeLine: narrativeForCounty(c),
  };
}

export function rankCountiesByDeploymentPriority(limit = 10): VictoryMapCountyBrief[] {
  return loadVictoryMapCounties()
    .slice(0, limit)
    .map((c) => ({
      countySlug: c.countySlug,
      county: c.county,
      displayName: c.displayName,
      regionSlug: c.regionSlug,
      electoralImportance: c.electoralImportance,
      opportunityLevel: c.opportunityLevel,
      organizationalReadiness: c.organizationalReadiness,
      opsStatus: c.opsStatus,
      deploymentPriority: c.deploymentPriority.deploymentPriority,
      neglectDays: c.neglectDays ?? null,
      narrativeLine: narrativeForCounty(c),
    }));
}

export function filterVictoryMapCounties(filters: {
  electoralImportance?: ElectoralImportance;
  opportunityLevel?: OpportunityLevel;
  organizationalReadiness?: OrganizationalReadiness;
  opsStatus?: CountyVictoryContext["opsStatus"];
  regionSlug?: string;
}): VictoryMapCountyBrief[] {
  let rows = loadVictoryMapCounties();
  if (filters.electoralImportance) rows = rows.filter((c) => c.electoralImportance === filters.electoralImportance);
  if (filters.opportunityLevel) rows = rows.filter((c) => c.opportunityLevel === filters.opportunityLevel);
  if (filters.organizationalReadiness) {
    rows = rows.filter((c) => c.organizationalReadiness === filters.organizationalReadiness);
  }
  if (filters.opsStatus) rows = rows.filter((c) => c.opsStatus === filters.opsStatus);
  if (filters.regionSlug) rows = rows.filter((c) => c.regionSlug === filters.regionSlug);
  return rows.map((c) => ({
    countySlug: c.countySlug,
    county: c.county,
    displayName: c.displayName,
    regionSlug: c.regionSlug,
    electoralImportance: c.electoralImportance,
    opportunityLevel: c.opportunityLevel,
    organizationalReadiness: c.organizationalReadiness,
    opsStatus: c.opsStatus,
    deploymentPriority: c.deploymentPriority.deploymentPriority,
    neglectDays: c.neglectDays ?? null,
    narrativeLine: narrativeForCounty(c),
  }));
}

export function composeVictoryMapStatewideBrief(): string {
  const s = loadVictoryMapStatewideSummary();
  const season = s.currentSeason ? `${s.currentSeason.label} — ${s.currentSeason.headlineQuestion}` : "Season TBD";
  const lines = [
    `Victory Map Sprint 0 · ${s.totalCounties} counties · status ${s.mapClassificationStatus}`,
    `Statewide vote gap (planning): ${s.statewideVoteGap.toLocaleString()} · cushion target ${s.workingTargetWithCushion.toLocaleString()}`,
    `Current season: ${season}`,
    `Electoral: ${s.dimensionCounts.electoral.critical} critical · ${s.dimensionCounts.electoral.important} important · ${s.dimensionCounts.electoral.helpful} helpful · ${s.dimensionCounts.electoral.maintenance} maintenance`,
    `Readiness: ${s.dimensionCounts.readiness.weak} weak · ${s.dimensionCounts.readiness.moderate} moderate · ${s.dimensionCounts.readiness.strong} strong`,
    `${s.criticalCountiesAtRisk.length} critical counties yellow/red on ops touch`,
    `${s.leadershipReviewRemaining} counties awaiting leadership lock`,
  ];
  if (s.topByDeploymentPriority[0]) {
    lines.push(`Highest deployment priority: ${s.topByDeploymentPriority[0].displayName} (${s.topByDeploymentPriority[0].deploymentPriority.deploymentPriority})`);
  }
  return lines.join("\n");
}

export function auditVictoryMapCompleteness(): VictoryMapAuditFinding[] {
  const findings: VictoryMapAuditFinding[] = [];
  const counties = loadVictoryMapCounties();
  const registrySlugs = new Set(ARKANSAS_COUNTY_REGISTRY.map((c) => c.slug));

  if (counties.length !== 75) {
    findings.push({
      severity: "critical",
      code: "COUNTY_COUNT_MISMATCH",
      message: `Victory map has ${counties.length} counties; 75 required.`,
    });
  }

  for (const slug of registrySlugs) {
    if (!counties.some((c) => c.countySlug === slug)) {
      findings.push({
        severity: "critical",
        code: "MISSING_COUNTY",
        message: `Registry county ${slug} missing from victory map.`,
        countySlug: slug,
      });
    }
  }

  for (const c of counties) {
    if (c.classificationStatus !== "leadership_locked") {
      findings.push({
        severity: "info",
        code: "NEEDS_LEADERSHIP_LOCK",
        message: `${c.displayName} classification status: ${c.classificationStatus}.`,
        countySlug: c.countySlug,
      });
    }
    if (c.electoralImportance === "critical" && c.opsStatus === "red") {
      findings.push({
        severity: "warn",
        code: "CRITICAL_OPS_RED",
        message: `${c.displayName} is critical electoral importance with red ops status.`,
        countySlug: c.countySlug,
      });
    }
  }

  return findings;
}

export function listCriticalCountiesNeedingIntervention(): VictoryMapCountyBrief[] {
  return filterVictoryMapCounties({ electoralImportance: "critical" }).filter(
    (c) => c.opsStatus === "red" || c.opsStatus === "yellow" || c.organizationalReadiness === "weak",
  );
}

/** Agent context bundle — safe to pass into copilots before Sprint 1 decision engine. */
export function buildVictoryMapAgentContext() {
  const summary = loadVictoryMapStatewideSummary();
  return {
    publicationSafety: "INTERNAL_DRAFT" as const,
    humanReviewRequired: true as const,
    sprint: 0 as const,
    layer: "victory_map" as const,
    statewideBrief: composeVictoryMapStatewideBrief(),
    dimensionCounts: summary.dimensionCounts,
    currentSeason: summary.currentSeason,
    topCountiesByPriority: rankCountiesByDeploymentPriority(10),
    criticalAtRisk: listCriticalCountiesNeedingIntervention().slice(0, 10),
    auditFindings: auditVictoryMapCompleteness().filter((f) => f.severity !== "info").slice(0, 20),
    guardrails: [
      "Victory Map is Layer 0 — no Top 10 decisions until Sprint 1 Decision Engine.",
      "Deployment priority is advisory; CM approves all resource moves.",
      "Vote math is planning scenario only — not a forecast.",
    ],
  };
}

export type { VictoryMapCountyProfile };
