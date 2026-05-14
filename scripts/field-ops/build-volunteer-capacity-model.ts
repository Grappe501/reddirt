/**
 * Build file-staged volunteer capacity + community coverage model (RedDirt lane).
 *
 * Usage (from RedDirt/):
 *   npm run fieldops:volunteer-capacity:build
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { loadCountyCampaignStatsSource } from "../../src/lib/field-ops/county-campaign-stats-source";
import { buildVolunteerCapacityModel } from "../../src/lib/field-ops/build-volunteer-capacity-model";
import type { CommunityOpportunity } from "../../src/lib/opportunities/community-opportunity-types";
import type { CountyPrioritySnapshotRow } from "../../src/lib/calendar/campaign-calendar-item";
import type { CountyVolunteerCapacityRow } from "../../src/lib/field-ops/volunteer-capacity-types";
import type { KellyWinTargetScenarioFile } from "../../src/lib/election-targets/win-target-types";
import type { VolunteerRosterLite, AcsContextLite, WinTargetLite, PriorityLite } from "../../src/lib/field-ops/build-volunteer-capacity-model";
import type { CountyCampaignStatsSourceRow } from "../../src/lib/field-ops/county-campaign-stats-source";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/field-ops");
const WIN = path.join(ROOT, "data/election/kelly-win-target-scenario-v1.json");
const PRI = path.join(ROOT, "data/calendar-command-center/county-priority-snapshot.json");
const OPP = path.join(ROOT, "data/calendar-command-center/community-opportunities-2026.normalized.json");
const ROSTER = path.join(OUT, "volunteer-roster-inputs-v1.json");
const ACS = path.join(OUT, "county-acs-context-v1.json");

function readJson<T>(p: string): T | null {
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function shortCounty(displayName: string): string {
  return displayName.replace(/\s+County$/i, "").trim();
}

function normCountyKey(c: string): string {
  return c.replace(/\s+County$/i, "").trim();
}

function isUpcomingOpp(o: CommunityOpportunity): boolean {
  return o.verificationStatus !== "duplicate" && o.verificationStatus !== "not_relevant";
}

function isHighValue(o: CommunityOpportunity): boolean {
  return o.campaignValue === "must_attend" || o.campaignValue === "high_value";
}

function toCsv(rows: Record<string, string | number | undefined>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: string | number | undefined) => {
    if (v === undefined) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function ensureTemplateVolunteerRoster() {
  if (existsSync(ROSTER)) return;
  writeFileSync(
    ROSTER,
    JSON.stringify(
      {
        version: 1,
        sourceNote:
          "Optional staff-maintained volunteer roster hints per county short name. Not voter targeting — capacity planning only.",
        rows: [] as (VolunteerRosterLite & { county: string })[],
      },
      null,
      2,
    ),
    "utf8",
  );
}

function ensureTemplateAcs() {
  if (existsSync(ACS)) return;
  writeFileSync(
    ACS,
    JSON.stringify(
      {
        version: 1,
        sourceNote:
          "Optional ACS-style public context: Hispanic or Latino population share (percent) for accessibility planning — not political modeling.",
        rows: [] as (AcsContextLite & { county: string })[],
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  ensureTemplateVolunteerRoster();
  ensureTemplateAcs();

  const counties = ARKANSAS_COUNTY_REGISTRY.map((c) => shortCounty(c.displayName));
  const warnings: string[] = [];
  let dbStats = new Map<string, CountyCampaignStatsSourceRow>();
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const loaded = await loadCountyCampaignStatsSource(prisma);
    await prisma.$disconnect();
    if (loaded.warning) warnings.push(loaded.warning);
    dbStats = new Map(loaded.rows.map((r) => [r.county, r]));
  } catch (e) {
    warnings.push(`CountyCampaignStats lookup skipped; staged field-ops inputs used (${e instanceof Error ? e.message : "unknown error"}).`);
  }

  const winFile = readJson<KellyWinTargetScenarioFile>(WIN);
  const winByCounty = new Map<string, WinTargetLite>();
  for (const row of winFile?.counties ?? []) {
    const db = dbStats.get(normCountyKey(row.county));
    winByCounty.set(normCountyKey(row.county), {
      targetVotes: row.targetVotes,
      targetVoteGain: row.targetVoteGain,
      registrationGoal: db?.registrationGoal ?? row.registrationGoal,
    });
  }
  for (const [county, db] of dbStats) {
    if (!winByCounty.has(county) && typeof db.registrationGoal === "number") {
      winByCounty.set(county, { targetVotes: 0, targetVoteGain: 0, registrationGoal: db.registrationGoal });
    }
  }

  const priRows = readJson<CountyPrioritySnapshotRow[]>(PRI) ?? [];
  const prioritiesByCounty = new Map<string, PriorityLite>();
  for (const p of priRows) {
    const db = dbStats.get(normCountyKey(p.county));
    prioritiesByCounty.set(normCountyKey(p.county), {
      pastTouchesSinceNov1: db?.campaignVisits ?? p.pastTouchesSinceNov1,
      nextScheduledAnchor: p.nextScheduledAnchor,
      fewOpportunities: p.fewOpportunities,
      underTouched: p.underTouched,
      notes: p.notes,
    });
  }

  const opps = readJson<{ rows?: CommunityOpportunity[] }>(OPP)?.rows ?? [];
  const highValueEventCountByCounty = new Map<string, number>();
  const upcomingEventCountByCounty = new Map<string, number>();
  const campusEventCountByCounty = new Map<string, number>();
  const seniorTouchpointCountByCounty = new Map<string, number>();

  for (const c of counties) {
    highValueEventCountByCounty.set(c, 0);
    upcomingEventCountByCounty.set(c, 0);
    campusEventCountByCounty.set(c, 0);
    seniorTouchpointCountByCounty.set(c, 0);
  }

  for (const o of opps) {
    const ck = normCountyKey(o.county);
    if (!highValueEventCountByCounty.has(ck)) continue;
    if (isUpcomingOpp(o)) {
      upcomingEventCountByCounty.set(ck, (upcomingEventCountByCounty.get(ck) ?? 0) + 1);
    }
    if (isUpcomingOpp(o) && isHighValue(o)) {
      highValueEventCountByCounty.set(ck, (highValueEventCountByCounty.get(ck) ?? 0) + 1);
    }
    if (isUpcomingOpp(o) && o.type === "campus_event") {
      campusEventCountByCounty.set(ck, (campusEventCountByCounty.get(ck) ?? 0) + 1);
    }
    if (
      isUpcomingOpp(o) &&
      (o.type === "extension_homemakers" || o.type === "retired_teachers" || o.audienceTags?.includes("retirees"))
    ) {
      seniorTouchpointCountByCounty.set(ck, (seniorTouchpointCountByCounty.get(ck) ?? 0) + 1);
    }
  }

  const rosterFile = readJson<{ rows?: (VolunteerRosterLite & { county: string })[] }>(ROSTER);
  const volunteerRosterByCounty = new Map<string, VolunteerRosterLite>();
  for (const r of rosterFile?.rows ?? []) {
    if (r?.county) volunteerRosterByCounty.set(normCountyKey(r.county), r);
  }
  for (const [county, db] of dbStats) {
    const existing = volunteerRosterByCounty.get(county) ?? {};
    volunteerRosterByCounty.set(county, {
      ...existing,
      currentVolunteerCount: db.volunteerCount ?? existing.currentVolunteerCount,
      activeVolunteerCount: db.volunteerCount ?? existing.activeVolunteerCount,
      trainedVolunteerCount: existing.trainedVolunteerCount,
      housePartyHostsKnown: existing.housePartyHostsKnown,
      localGuidesKnown: existing.localGuidesKnown,
      bilingualSupportKnown: existing.bilingualSupportKnown,
    });
  }

  const acsFile = readJson<{ rows?: (AcsContextLite & { county: string })[] }>(ACS);
  const acsByCounty = new Map<string, AcsContextLite>();
  for (const r of acsFile?.rows ?? []) {
    if (r?.county) acsByCounty.set(normCountyKey(r.county), r);
  }

  const model = buildVolunteerCapacityModel({
    counties,
    winByCounty,
    prioritiesByCounty,
    highValueEventCountByCounty,
    upcomingEventCountByCounty,
    campusEventCountByCounty,
    seniorTouchpointCountByCounty,
    volunteerRosterByCounty,
    acsByCounty,
  });
  model.warnings = [...new Set([...model.warnings, ...warnings])];

  const outJson = path.join(OUT, "volunteer-capacity-model-v1.json");
  writeFileSync(outJson, JSON.stringify(model, null, 2), "utf8");

  const csvRows: Record<string, string | number | undefined>[] = model.counties.map((c: CountyVolunteerCapacityRow) => ({
    county: c.county,
    eventStaffingNeed: c.eventStaffingNeed,
    localGuideNeed: c.localGuideNeed,
    housePartyHostNeed: c.housePartyHostNeed,
    followUpVolunteerNeed: c.followUpVolunteerNeed,
    voterRegistrationEducationNeed: c.voterRegistrationEducationNeed,
    phoneBankCapacityNeedHours: c.phoneBankCapacityNeedHours,
    postcardCapacityNeedEstimate: c.postcardCapacityNeedEstimate,
    hispanicCommunityAccessNeed: c.hispanicCommunityAccessNeed,
    campusYouthAccessNeed: c.campusYouthAccessNeed ?? "",
    seniorCommunityAccessNeed: c.seniorCommunityAccessNeed ?? "",
    countyVolunteerNeedPct: c.countyVolunteerNeedPct?.toFixed(2),
    countyVolunteerNeedFormula: c.countyVolunteerNeedFormula,
    confidence: c.confidence,
    missingData: c.missingData.join("|"),
  }));
  writeFileSync(path.join(OUT, "volunteer-capacity-model-v1.csv"), toCsv(csvRows), "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outJson} and CSV (${model.counties.length} counties).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
