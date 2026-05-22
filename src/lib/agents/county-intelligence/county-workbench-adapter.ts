import { getCountyWorkbenchPortalUrl } from "@/lib/county/county-workbench-portal-url";
import {
  countyWorkbenchFile,
  isCountyWorkbenchBridgeAvailable,
  readCountyWorkbenchJson,
  readCountyWorkbenchText,
} from "./county-workbench-path";
import type {
  CountyKpiSource,
  CountyNormalizedKpi,
  CountyWorkbenchCountyRef,
  StatewideCountyIntelligence,
} from "./county-kpi-types";

/** Pope profile planning constant — source: countyWorkbench `registrationPush.statewideGoal`. */
export const STATEWIDE_REGISTRATION_GOAL = 50_000;
/** Relational / Power of Five statewide planning target (same planning lane). */
export const STATEWIDE_POWER_OF_FIVE_GOAL = 50_000;

type CoverageCsvRow = {
  countySlug: string;
  countyName: string;
  regionSlug: string;
  workbenchDepth: "full" | "shell";
  hasCountyProfile: boolean;
  totalFields: number;
  verifiedFields: number;
  sourcedFields: number;
  candidateFields: number;
  missingFields: number;
  completionPercent: number;
};

type StateAlignedCounty = {
  countyName: string;
  demGov2022: number;
  targetDemVotesStatewide50: number;
  targetDemVotesStatewide40: number;
};

type StateAlignedFile = {
  counties: StateAlignedCounty[];
  statewideVoteThreshold50: number;
};

type FullProfileQaResult = {
  countySlug: string;
  countyName: string;
  connectedProfile: boolean;
  workbenchDepth: string;
  safeToConnect: boolean;
  warningCount: number;
};

type FullProfileQaFile = {
  results: FullProfileQaResult[];
};

let cachedCoverage: CoverageCsvRow[] | null = null;
let cachedStateAligned: Map<string, StateAlignedCounty> | null = null;
let cachedQa: Map<string, FullProfileQaResult> | null = null;

function slugFromCountyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+county$/i, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCoverageCsv(raw: string): CoverageCsvRow[] {
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",");
  const idx = (k: string) => header.indexOf(k);
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const verified = Number(cols[idx("verifiedFields")] ?? 0);
    const sourced = Number(cols[idx("sourcedFields")] ?? 0);
    const total = Number(cols[idx("totalFields")] ?? 1) || 1;
    const completion = Number(cols[idx("completionPercent")] ?? 0);
    return {
      countySlug: cols[idx("countySlug")] ?? "",
      countyName: cols[idx("countyName")] ?? "",
      regionSlug: cols[idx("regionSlug")] ?? "",
      workbenchDepth: (cols[idx("workbenchDepth")] === "full" ? "full" : "shell") as "full" | "shell",
      hasCountyProfile: cols[idx("hasCountyProfile")] === "true",
      totalFields: total,
      verifiedFields: verified,
      sourcedFields: sourced,
      candidateFields: Number(cols[idx("candidateFields")] ?? 0),
      missingFields: Number(cols[idx("missingFields")] ?? 0),
      completionPercent: completion,
      sourceCoverageScore: Math.round(((verified + sourced) / total) * 100),
      dataQualityScore: completion,
    } as CoverageCsvRow & { sourceCoverageScore: number; dataQualityScore: number };
  });
}

function loadCoverageRows(): CoverageCsvRow[] {
  if (cachedCoverage) return cachedCoverage;
  const raw = readCountyWorkbenchText("reports", "dashboard-v2", "dashboard-v2-county-coverage.csv");
  if (!raw) {
    cachedCoverage = [];
    return cachedCoverage;
  }
  cachedCoverage = parseCoverageCsv(raw) as CoverageCsvRow[];
  return cachedCoverage;
}

function loadStateAlignedMap(): Map<string, StateAlignedCounty> {
  if (cachedStateAligned) return cachedStateAligned;
  const file = readCountyWorkbenchJson<StateAlignedFile>("src", "data", "arkansasStateAlignedTargets2022.json");
  const map = new Map<string, StateAlignedCounty>();
  if (file?.counties) {
    for (const c of file.counties) {
      map.set(slugFromCountyName(c.countyName), c);
    }
    if (file && "pope" in file) {
      const pope = (file as StateAlignedFile & { pope?: StateAlignedCounty }).pope;
      if (pope) map.set("pope", { ...pope, countyName: "POPE" });
    }
  }
  cachedStateAligned = map;
  return map;
}

function loadQaMap(): Map<string, FullProfileQaResult> {
  if (cachedQa) return cachedQa;
  const file = readCountyWorkbenchJson<FullProfileQaFile>("reports", "full-profile-qa", "full-profile-qa-summary.json");
  const map = new Map<string, FullProfileQaResult>();
  for (const r of file?.results ?? []) {
    map.set(r.countySlug, r);
  }
  cachedQa = map;
  return map;
}

function workbenchLinks(slug: string): { label: string; href: string }[] {
  const portal = getCountyWorkbenchPortalUrl();
  if (!portal) {
    return [{ label: "County workbench (set NEXT_PUBLIC_COUNTY_WORKBENCH_URL)", href: `/admin/counties/${slug}` }];
  }
  return [
    { label: "Dashboard V2", href: `${portal}/counties/${slug}/dashboard-v2` },
    { label: "Intelligence", href: `${portal}/counties/${slug}/intelligence` },
    { label: "Path to victory", href: `${portal}/counties/${slug}/path-to-victory` },
    { label: "RedDirt bridge", href: `/admin/counties/${slug}` },
  ];
}

function normalizeSlug(input?: string | null): string | null {
  if (!input?.trim()) return null;
  const s = input
    .toLowerCase()
    .replace(/\s+county$/i, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-");
  const rows = loadCoverageRows();
  const exact = rows.find((r) => r.countySlug === s);
  if (exact) return exact.countySlug;
  const byName = rows.find((r) => r.countyName.toLowerCase().includes(s) || s.includes(r.countySlug));
  return byName?.countySlug ?? s;
}

export function listCountyWorkbenchCounties(): CountyWorkbenchCountyRef[] {
  return loadCoverageRows().map((r) => ({
    countySlug: r.countySlug,
    countyName: r.countyName,
    regionSlug: r.regionSlug,
    workbenchDepth: r.workbenchDepth,
    hasCountyProfile: r.hasCountyProfile,
    dataQualityScore: (r as CoverageCsvRow & { dataQualityScore?: number }).dataQualityScore ?? r.completionPercent,
    sourceCoverageScore:
      (r as CoverageCsvRow & { sourceCoverageScore?: number }).sourceCoverageScore ??
      Math.round(((r.verifiedFields + r.sourcedFields) / Math.max(r.totalFields, 1)) * 100),
    completionPercent: r.completionPercent,
  }));
}

export function loadCountyWorkbenchCounty(slug: string): CountyWorkbenchCountyRef | null {
  const norm = normalizeSlug(slug);
  if (!norm) return null;
  return listCountyWorkbenchCounties().find((c) => c.countySlug === norm) ?? null;
}

export function loadCountyGoals(slug: string) {
  const kpi = loadCountyKpis(slug);
  if (!kpi) return null;
  return {
    registrationGoal: kpi.registrationGoal,
    voterContactGoal: kpi.voterContactGoal,
    powerOfFiveGoal: kpi.powerOfFiveGoal,
    volunteerGoal: kpi.volunteerGoal,
    eventGoal: kpi.eventGoal,
    source: kpi.goalSource,
    notes: kpi.notes,
  };
}

export function loadCountyKpis(slug: string): CountyNormalizedKpi | null {
  const norm = normalizeSlug(slug);
  if (!norm) return null;
  const row = loadCoverageRows().find((r) => r.countySlug === norm);
  if (!row) return null;

  const aligned = loadStateAlignedMap().get(norm);
  const qa = loadQaMap().get(norm);
  const totalTargets = [...loadStateAlignedMap().values()].reduce((s, c) => s + c.targetDemVotesStatewide50, 0);
  const share = aligned && totalTargets > 0 ? aligned.targetDemVotesStatewide50 / totalTargets : 1 / 75;

  const registrationGoal =
    aligned != null ? aligned.targetDemVotesStatewide50 : Math.round(STATEWIDE_REGISTRATION_GOAL * share);
  const powerOfFiveGoal = Math.round(STATEWIDE_POWER_OF_FIVE_GOAL * share);

  const weaknesses: string[] = [];
  if (row.workbenchDepth === "shell") weaknesses.push("County profile still shell depth in countyWorkbench");
  if (row.completionPercent < 15) weaknesses.push("Low dashboard field completion — source intake needed");
  if (!row.hasCountyProfile) weaknesses.push("No connected full CountyProfile module");
  if (qa && qa.warningCount > 3) weaknesses.push(`${qa.warningCount} full-profile QA warnings`);
  if (!aligned) weaknesses.push("No state-aligned planning target row");

  const opportunities: string[] = [];
  if (row.hasCountyProfile) opportunities.push("Full profile connected — prioritize events and hot wash");
  if (row.completionPercent >= 10 && row.workbenchDepth === "full") opportunities.push("Field-ready for targeted house parties");
  if (aligned && aligned.demGov2022 > 3000) opportunities.push("Meaningful 2022 Dem base for persuasion events");

  const readiness = Math.round(
    row.completionPercent * 0.4 +
      (row.hasCountyProfile ? 25 : 0) +
      (row.workbenchDepth === "full" ? 20 : 5) +
      (qa?.connectedProfile ? 10 : 0),
  );

  const fieldStrength = Math.round(row.completionPercent * 0.6 + (row.hasCountyProfile ? 30 : 0));
  const persuasion = aligned ? Math.min(100, Math.round((aligned.demGov2022 / 50000) * 100)) : 20;
  const turnoutRisk = row.workbenchDepth === "shell" ? 70 : 35;

  const goalSource: CountyKpiSource = aligned ? "planning-estimate" : "not-connected";

  return {
    countySlug: row.countySlug,
    countyName: row.countyName,
    regionSlug: row.regionSlug,
    registrationGoal,
    registrationCurrent: null,
    registrationProgress: null,
    voterContactGoal: registrationGoal ? Math.round(registrationGoal * 3) : null,
    voterContactCurrent: null,
    powerOfFiveGoal,
    powerOfFiveCurrent: null,
    volunteerGoal: row.workbenchDepth === "full" ? 12 : 6,
    volunteerCurrent: null,
    eventGoal: row.workbenchDepth === "full" ? 4 : 2,
    eventCurrent: null,
    donationGoal: null,
    donationCurrent: null,
    countyReadinessScore: Math.min(100, readiness),
    fieldStrengthScore: Math.min(100, fieldStrength),
    persuasionOpportunityScore: Math.min(100, persuasion),
    turnoutRiskScore: Math.min(100, turnoutRisk),
    topWeaknesses: weaknesses.slice(0, 5),
    topOpportunities: opportunities.slice(0, 5),
    recommendedActions: buildCountyRecommendedActions(row, aligned != null),
    sourceLinks: workbenchLinks(row.countySlug),
    goalSource,
    notes: [
      goalSource === "planning-estimate"
        ? "Registration/Power of 5 goals use state-aligned 2022 Gov vote-share proxy until governance sheet connected."
        : "Governance registration goals not connected in countyWorkbench — using coverage metrics only.",
    ],
  };
}

function buildCountyRecommendedActions(row: CoverageCsvRow, hasAligned: boolean): string[] {
  const actions: string[] = [];
  if (row.completionPercent < 20) actions.push("Run countyWorkbench source intake for missing fields");
  if (!row.hasCountyProfile) actions.push("Connect or promote county profile per FULL_PROFILE_QA gate");
  if (hasAligned) actions.push("Schedule persuasion event aligned to state-aligned vote target");
  actions.push("Complete Power of 5 relational contacts after each event (hot wash)");
  return actions.slice(0, 5);
}

export function loadCountyVoterRegistration(slug: string) {
  const kpi = loadCountyKpis(slug);
  if (!kpi) return null;
  return {
    goal: kpi.registrationGoal,
    current: kpi.registrationCurrent,
    progress: kpi.registrationProgress,
    statewideGoal: STATEWIDE_REGISTRATION_GOAL,
    source: kpi.goalSource,
  };
}

export function loadCountyPowerOfFive(slug: string) {
  const kpi = loadCountyKpis(slug);
  if (!kpi) return null;
  return {
    goal: kpi.powerOfFiveGoal,
    current: kpi.powerOfFiveCurrent,
    gap: kpi.powerOfFiveGoal != null && kpi.powerOfFiveCurrent != null ? kpi.powerOfFiveGoal - kpi.powerOfFiveCurrent : null,
    source: kpi.goalSource,
  };
}

export function loadCountyLeaders(slug: string) {
  const ref = loadCountyWorkbenchCounty(slug);
  if (!ref) return null;
  return {
    countySlug: ref.countySlug,
    countyLeaderRoute: workbenchLinks(ref.countySlug).find((l) => l.label === "Intelligence")?.href,
    notes: ref.hasCountyProfile
      ? "Leader context available in connected CountyProfile — open countyWorkbench intelligence tab."
      : "Shell county — leader network not verified in workbench yet.",
  };
}

export function loadCountyWeaknesses(slug: string) {
  return loadCountyKpis(slug)?.topWeaknesses ?? [];
}

export function loadCountyOpportunities(slug: string) {
  return loadCountyKpis(slug)?.topOpportunities ?? [];
}

export function loadCountyDashboardSummary(slug: string) {
  const ref = loadCountyWorkbenchCounty(slug);
  const kpi = loadCountyKpis(slug);
  if (!ref || !kpi) return null;
  return { ref, kpi, links: kpi.sourceLinks };
}

export function loadStatewideCountySummary(): StatewideCountyIntelligence {
  const counties = listCountyWorkbenchCounties()
    .map((c) => loadCountyKpis(c.countySlug))
    .filter((k): k is CountyNormalizedKpi => k != null);

  const sorted = [...counties].sort((a, b) => a.countyReadinessScore - b.countyReadinessScore);
  const weak = sorted.filter((c) => c.countyReadinessScore < 35 || c.topWeaknesses.length >= 2).slice(0, 15);
  const opportunity = [...counties]
    .sort((a, b) => b.persuasionOpportunityScore - a.persuasionOpportunityScore)
    .slice(0, 10);

  const topAttention = [...counties]
    .map((c) => ({
      kpi: c,
      priorityScore: 100 - c.countyReadinessScore + c.turnoutRiskScore * 0.3,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10)
    .map((x) => x.kpi);

  return {
    generatedAt: new Date().toISOString(),
    bridgeAvailable: isCountyWorkbenchBridgeAvailable(),
    statewideRegistrationGoal: STATEWIDE_REGISTRATION_GOAL,
    statewidePowerOfFiveGoal: STATEWIDE_POWER_OF_FIVE_GOAL,
    counties,
    weakCounties: weak,
    opportunityCounties: opportunity,
    topAttention,
    heatList: topAttention.map((c) => ({
      countySlug: c.countySlug,
      countyName: c.countyName,
      priorityScore: Math.round(100 - c.countyReadinessScore + c.turnoutRiskScore * 0.3),
      reason: c.topWeaknesses[0] ?? "Low readiness",
    })),
    recommendedStateActions: [
      "Refresh countyWorkbench dashboard-v2 coverage exports after intake sprints",
      "Connect governance registration sheet to countyWorkbench registrationGoals adapter",
      "Prioritize events in weak counties with full profiles (Pulaski, Jefferson, etc.)",
      "Use Power of 5 follow-up after every event in priority counties",
    ],
  };
}

/** Clear parse caches (tests). */
export function resetCountyWorkbenchAdapterCache(): void {
  cachedCoverage = null;
  cachedStateAligned = null;
  cachedQa = null;
}

export function getCountyWorkbenchDataRoot(): string | null {
  return countyWorkbenchFile();
}
