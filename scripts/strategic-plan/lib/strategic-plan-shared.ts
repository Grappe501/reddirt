import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../../src/lib/county/arkansas-county-registry";
import { GLOBAL_NEW_VOTER_REGISTRATION_GOAL } from "../../../src/lib/campaign-dates";
import { loadCountyCampaignStatsSource } from "../../../src/lib/field-ops/county-campaign-stats-source";
import type { CountyElectionHistoryRow } from "../../../src/lib/election-targets/win-target-types";
import type { KellyWinTargetScenarioFile } from "../../../src/lib/election-targets/win-target-types";

import {
  CAMPAIGN_WEEKS_REMAINING,
  GLOBAL_REGISTRATION_GOAL,
  STATEWIDE_HS_GRADUATES_ESTIMATE,
} from "../data/arkansas-top-40-cities";

const ROOT = process.cwd();
export const DATA_ELECTION = path.join(ROOT, "data/election");
export const PLAN_ROOT = path.join(ROOT, "docs/strategic-plan/plurality-victory-plan");

export function shortCountyName(displayName: string): string {
  return displayName.replace(/\s+County$/i, "").trim();
}

export function fmt(n: number | undefined | null): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

export function pct(n: number, d: number): string {
  if (!d) return "—";
  return `${((n / d) * 100).toFixed(1)}%`;
}

export function readJson<T>(p: string): T | null {
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

export type DropOffSummary = {
  totals: { rawDropOff: number; recovery50Total: number; recovery75Total: number };
  counties: Array<{
    county: string;
    slug: string;
    rawLoss: number;
    recovery50: number;
    recovery75: number;
    hopeIndex: number;
    hopeTier: string;
    rank: number;
  }>;
};

export type RegistrationGoalResolved = {
  county: string;
  slug: string;
  goal: number;
  source: "CountyCampaignStats.registrationGoal" | "allocated_from_lane2_weight";
  registrationsSoFar: number | null;
  gapRemaining: number;
};

export function loadDropOffSummary(): DropOffSummary {
  const p = path.join(PLAN_ROOT, "part-ii-electoral-math/chapter-04-democratic-drop-off/statewide-drop-off-summary.json");
  const data = readJson<DropOffSummary>(p);
  if (!data) throw new Error("Run strategic-plan:chapter-04:build first.");
  return data;
}

export function loadElectionHistory(): Map<string, CountyElectionHistoryRow> {
  const hist = readJson<{ rows: CountyElectionHistoryRow[] }>(
    path.join(DATA_ELECTION, "arkansas-county-election-history.normalized.json"),
  );
  return new Map((hist?.rows ?? []).map((r) => [r.county, r]));
}

export function loadWinTargets(): KellyWinTargetScenarioFile {
  const scenario = readJson<KellyWinTargetScenarioFile>(path.join(DATA_ELECTION, "kelly-win-target-scenario-v1.json"));
  if (!scenario) throw new Error("Run election:targets:build first.");
  return scenario;
}

/** Largest-remainder allocation of statewide goal across counties. */
export function allocateIntegerByWeight(
  total: number,
  weights: Array<{ key: string; weight: number; floor?: number }>,
): Map<string, number> {
  const floors = weights.map((w) => ({ ...w, floor: w.floor ?? 0 }));
  const floorSum = floors.reduce((s, w) => s + w.floor, 0);
  const pool = Math.max(0, total - floorSum);
  const weightSum = floors.reduce((s, w) => s + w.weight, 0) || 1;

  const raw = floors.map((w) => ({
    key: w.key,
    floor: w.floor,
    extra: (pool * w.weight) / weightSum,
  }));

  const result = new Map<string, number>();
  let assigned = 0;
  const remainders: Array<{ key: string; rem: number }> = [];

  for (const r of raw) {
    const extraInt = Math.floor(r.extra);
    remainders.push({ key: r.key, rem: r.extra - extraInt });
    const v = r.floor + extraInt;
    result.set(r.key, v);
    assigned += v;
  }

  let left = total - assigned;
  remainders.sort((a, b) => b.rem - a.rem);
  for (let i = 0; left > 0 && i < remainders.length; i++, left--) {
    const k = remainders[i].key;
    result.set(k, (result.get(k) ?? 0) + 1);
  }

  return result;
}

export async function resolveRegistrationGoals(
  dropOff: DropOffSummary,
): Promise<{ goals: RegistrationGoalResolved[]; dbWarning?: string }> {
  const dbGoals = new Map<string, { goal: number; soFar: number | null }>();
  let dbWarning: string | undefined;

  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const stats = await loadCountyCampaignStatsSource(prisma);
    await prisma.$disconnect();
    dbWarning = stats.warning;
    for (const row of stats.rows) {
      if (typeof row.registrationGoal === "number") {
        dbGoals.set(row.county, {
          goal: row.registrationGoal,
          soFar: row.newRegistrationsSinceBaseline ?? null,
        });
      }
    }
  } catch (e) {
    dbWarning = `DB lookup skipped (${e instanceof Error ? e.message : "unknown"}).`;
  }

  const hasDbGoals = dbGoals.size > 0;
  const statewideGoal = GLOBAL_NEW_VOTER_REGISTRATION_GOAL || GLOBAL_REGISTRATION_GOAL;

  const weights = dropOff.counties.map((c) => ({
    key: c.county,
    weight: Math.max(c.recovery50, 50),
    floor: 25,
  }));

  const allocated = allocateIntegerByWeight(statewideGoal, weights);

  const goals: RegistrationGoalResolved[] = [];

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const db = dbGoals.get(county);
    const drop = dropOff.counties.find((c) => c.county === county);
    const goal = db?.goal ?? allocated.get(county) ?? 0;
    const soFar = db?.soFar ?? null;
    goals.push({
      county,
      slug: reg.slug,
      goal,
      source: db ? "CountyCampaignStats.registrationGoal" : "allocated_from_lane2_weight",
      registrationsSoFar: soFar,
      gapRemaining: Math.max(0, goal - (soFar ?? 0)),
    });
  }

  if (!hasDbGoals) {
    dbWarning = [
      dbWarning,
      "No CountyCampaignStats.registrationGoal rows — using Lane 2-weighted allocation of 50,000 statewide.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return { goals, dbWarning };
}

export function estimateCountyHsSeniors(
  county: string,
  history: CountyElectionHistoryRow | undefined,
  statewidePresTotal: number,
): number {
  const countyPresTotal = history?.presidential2024TotalVotes ?? 0;
  if (!statewidePresTotal) return 0;
  return Math.round(STATEWIDE_HS_GRADUATES_ESTIMATE * (countyPresTotal / statewidePresTotal));
}

export function registrationPace(goal: number, gap: number) {
  const weeks = CAMPAIGN_WEEKS_REMAINING;
  const days = weeks * 7;
  const months = 4.5;
  return {
    weeksRemaining: weeks,
    daysRemaining: days,
    monthsRemaining: months,
    weeklyTarget: Math.ceil(gap / weeks),
    dailyTarget: Math.ceil(gap / days),
    monthlyTarget: Math.ceil(gap / months),
  };
}

export function writeRegistrationGoalsJson(
  goals: RegistrationGoalResolved[],
  sourceNote: string,
): void {
  const outPath = path.join(DATA_ELECTION, "arkansas-voter-registration-goals.normalized.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        sourceNote,
        rows: goals.map((g) => ({
          county: g.county,
          goal: g.goal,
          registeredVoters: g.registrationsSoFar ?? undefined,
          source: g.source,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );
}
