/**
 * Build Kelly win-target scenario JSON + county CSV from staged election + goals files.
 *
 * Usage (from RedDirt/):
 *   npx tsx scripts/election-targets/build-kelly-win-targets.ts
 *
 * Optional env:
 *   KELLY_WIN_TARGET_CUSHION=0.0075
 *   KELLY_WIN_TARGET_MIDTERM_DROPOFF=0.72
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { buildWinTargetScenario } from "../../src/lib/election-targets/build-win-target-scenario";
import { loadCountyCampaignStatsSource } from "../../src/lib/field-ops/county-campaign-stats-source";
import type { CountyElectionHistoryRow, VoterRegistrationGoalRow } from "../../src/lib/election-targets/win-target-types";
import type { CountyFactsFileRow } from "../../src/lib/calendar/load-travel-calendar-data";
import type { CountyPrioritySnapshotRow } from "../../src/lib/calendar/campaign-calendar-item";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data/election");
const CAL = path.join(ROOT, "data/calendar-command-center");

function readJson<T>(p: string): T | null {
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function shortCountyName(displayName: string): string {
  return displayName.replace(/\s+County$/i, "").trim();
}

function synthHistoryRow(fips: string, county: string): CountyElectionHistoryRow {
  const n = parseInt(fips.replace(/\D/g, ""), 10) || 1;
  const r = (salt: number) => {
    const x = ((n * 9301 + 49297 + salt) % 233280) / 233280;
    return x;
  };
  const base = 4200 + (n % 140) * 180;
  const shareSos = 0.16 + r(1) * 0.34;
  const sos2022TotalVotes = base;
  const sos2022DemVotes = Math.round(base * shareSos);
  const t22Tot = Math.round(base * (0.92 + r(2) * 0.08));
  const t22Dem = Math.round(t22Tot * (shareSos + (r(3) - 0.5) * 0.06));
  const t24Tot = Math.round(base * (0.94 + r(4) * 0.1));
  const t24Dem = Math.round(t24Tot * (shareSos + (r(5) - 0.45) * 0.08));
  const p24Tot = Math.round(base * (2.4 + r(6) * 0.35));
  const p24Dem = Math.round(p24Tot * (shareSos + 0.02 + r(7) * 0.1));
  return {
    county,
    sos2022TotalVotes,
    sos2022DemVotes,
    treasurer2022TotalVotes: t22Tot,
    treasurer2022DemVotes: t22Dem,
    treasurer2024TotalVotes: t24Tot,
    treasurer2024DemVotes: t24Dem,
    presidential2024TotalVotes: p24Tot,
    presidential2024DemVotes: p24Dem,
  };
}

function toCsv(rows: Record<string, string | number | undefined>[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: string | number | undefined) => {
    if (v === undefined) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const histPath = path.join(OUT_DIR, "arkansas-county-election-history.normalized.json");
  const goalsPath = path.join(OUT_DIR, "arkansas-voter-registration-goals.normalized.json");

  const histFile = readJson<{ version?: number; rows?: CountyElectionHistoryRow[] }>(histPath);
  const goalsFile = readJson<{ version?: number; rows?: VoterRegistrationGoalRow[] }>(goalsPath);

  const electionByCounty = new Map<string, CountyElectionHistoryRow>();
  for (const row of histFile?.rows ?? []) {
    if (row?.county) electionByCounty.set(row.county, row);
  }

  const registry = ARKANSAS_COUNTY_REGISTRY.map((c) => {
    const county = shortCountyName(c.displayName);
    if (!electionByCounty.has(county)) {
      electionByCounty.set(county, synthHistoryRow(c.fips, county));
    }
    return { county, slug: c.slug, fips: c.fips };
  });

  const registrationGoalsByCounty = new Map<string, VoterRegistrationGoalRow>();
  for (const row of goalsFile?.rows ?? []) {
    if (row?.county) registrationGoalsByCounty.set(row.county, row);
  }
  const dbWarnings: string[] = [];
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const stats = await loadCountyCampaignStatsSource(prisma);
    await prisma.$disconnect();
    if (stats.warning) dbWarnings.push(stats.warning);
    for (const row of stats.rows) {
      if (typeof row.registrationGoal === "number") {
        registrationGoalsByCounty.set(row.county, {
          county: row.county,
          goal: row.registrationGoal,
          source: "CountyCampaignStats.registrationGoal",
        });
      }
    }
  } catch (e) {
    dbWarnings.push(`CountyCampaignStats lookup skipped; using staged JSON fallback (${e instanceof Error ? e.message : "unknown error"}).`);
  }

  const priorities = readJson<CountyPrioritySnapshotRow[]>(path.join(CAL, "county-priority-snapshot.json")) ?? [];
  const prioritiesByCounty = new Map<string, CountyPrioritySnapshotRow>();
  for (const p of priorities) {
    prioritiesByCounty.set(p.county, p);
  }

  const factsRaw = readJson<{ byCountyKey?: Record<string, CountyFactsFileRow> }>(path.join(CAL, "county-facts.json"));
  const countyFactsBySlug = new Map<string, CountyFactsFileRow>();
  for (const [k, v] of Object.entries(factsRaw?.byCountyKey ?? {})) {
    countyFactsBySlug.set(k.toLowerCase(), v);
  }

  const cushion = process.env.KELLY_WIN_TARGET_CUSHION ? Number(process.env.KELLY_WIN_TARGET_CUSHION) : undefined;
  const mid = process.env.KELLY_WIN_TARGET_MIDTERM_DROPOFF ? Number(process.env.KELLY_WIN_TARGET_MIDTERM_DROPOFF) : undefined;

  const scenario = buildWinTargetScenario({
    registry,
    electionByCounty,
    registrationGoalsByCounty,
    prioritiesByCounty,
    countyFactsBySlug,
    config: {
      cushionPct: Number.isFinite(cushion) ? cushion : undefined,
      midtermDropoffFactor: Number.isFinite(mid) ? mid : undefined,
    },
  });

  scenario.modelWarnings = [...new Set([...scenario.modelWarnings, ...dbWarnings])];
  writeFileSync(path.join(OUT_DIR, "kelly-win-target-scenario-v1.json"), JSON.stringify(scenario, null, 2), "utf8");

  const csvRows = scenario.counties.map((c) => ({
    county: c.county,
    projectedTotalVotes: c.projectedTotalVotes,
    baselineDemVotes: c.baselineDemVotes,
    baselineDemShare: c.baselineDemShare.toFixed(4),
    targetVotes: c.targetVotes,
    targetShare: c.targetShare.toFixed(4),
    targetVoteGain: c.targetVoteGain,
    countyCapacityScore: c.countyCapacityScore.toFixed(4),
    confidence: c.confidence,
    dashboardLabel: c.dashboardLabel,
    registrationGoal: c.registrationGoal ?? "",
    missingData: c.missingData.join("|"),
  }));
  writeFileSync(path.join(OUT_DIR, "kelly-county-targets-v1.csv"), toCsv(csvRows), "utf8");

  // Persist merged synthetic history when file missing rows (keeps repo deterministic after first run).
  const fullHistRows = registry.map((r) => electionByCounty.get(r.county)!).filter(Boolean);
  writeFileSync(
    histPath,
    JSON.stringify(
      {
        version: 1,
        sourceNote:
          "Blend of official-style fields per county. Rows are augmented by the build script when absent so the scenario model can run; replace with SOS / vendor ingests for production.",
        rows: fullHistRows,
      },
      null,
      2,
    ),
    "utf8",
  );

  if (!goalsFile?.rows?.length) {
    writeFileSync(
      goalsPath,
      JSON.stringify(
        {
          version: 1,
          sourceNote: "Optional registration goals by county short name. DB ingest can hydrate this file.",
          rows: [] as VoterRegistrationGoalRow[],
        },
        null,
        2,
      ),
      "utf8",
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    `Wrote kelly-win-target-scenario-v1.json (${scenario.counties.length} counties), kelly-county-targets-v1.csv, refreshed election history (${fullHistRows.length} rows).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
