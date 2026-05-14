import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { buildGotvCommitmentAllocation } from "../../src/lib/field-ops/build-gotv-commitment-allocation";
import { loadCountyCampaignStatsSource } from "../../src/lib/field-ops/county-campaign-stats-source";
import type { CommunityOpportunity } from "../../src/lib/opportunities/community-opportunity-types";
import type { CountyWinTargetRow, KellyWinTargetScenarioFile } from "../../src/lib/election-targets/win-target-types";
import type { CountyVolunteerCapacityRow, VolunteerCapacityModelFile } from "../../src/lib/field-ops/volunteer-capacity-types";
import type { CountyCampaignStatsSourceRow } from "../../src/lib/field-ops/county-campaign-stats-source";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/field-ops");
const WIN = path.join(ROOT, "data/election/kelly-win-target-scenario-v1.json");
const VOL = path.join(OUT, "volunteer-capacity-model-v1.json");
const OPP = path.join(ROOT, "data/calendar-command-center/community-opportunities-2026.normalized.json");

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

async function main() {
  mkdirSync(OUT, { recursive: true });
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
    warnings.push(`CountyCampaignStats lookup skipped; staged JSON used (${e instanceof Error ? e.message : "unknown error"}).`);
  }

  const winByCounty = new Map<string, CountyWinTargetRow>();
  const winFile = readJson<KellyWinTargetScenarioFile>(WIN);
  for (const row of winFile?.counties ?? []) {
    winByCounty.set(normCountyKey(row.county), row);
  }

  const volunteerByCounty = new Map<string, CountyVolunteerCapacityRow>();
  const volFile = readJson<VolunteerCapacityModelFile>(VOL);
  for (const row of volFile?.counties ?? []) {
    volunteerByCounty.set(normCountyKey(row.county), row);
  }

  const highValueEventCountByCounty = new Map<string, number>();
  for (const c of counties) highValueEventCountByCounty.set(c, 0);
  const opps = readJson<{ rows?: CommunityOpportunity[] }>(OPP)?.rows ?? [];
  for (const o of opps) {
    if (o.verificationStatus === "duplicate" || o.verificationStatus === "not_relevant") continue;
    if (o.campaignValue !== "must_attend" && o.campaignValue !== "high_value") continue;
    const ck = normCountyKey(o.county);
    if (highValueEventCountByCounty.has(ck)) {
      highValueEventCountByCounty.set(ck, (highValueEventCountByCounty.get(ck) ?? 0) + 1);
    }
  }

  const allocation = buildGotvCommitmentAllocation({
    counties,
    winByCounty,
    volunteerByCounty,
    statsByCounty: dbStats,
    highValueEventCountByCounty,
  });
  allocation.warnings = [...new Set([...allocation.warnings, ...warnings])];

  writeFileSync(path.join(OUT, "gotv-commitment-allocation-v1.json"), JSON.stringify(allocation, null, 2), "utf8");

  const csv = toCsv(
    allocation.counties.map((c) => ({
      county: c.county,
      volunteerCommitmentTarget: c.volunteerCommitmentTarget,
      currentCommitments: c.currentCommitments ?? "",
      commitmentGap: c.commitmentGap,
      countyVolunteerNeedPct: c.countyVolunteerNeedPct.toFixed(3),
      countyVolunteerNeedFormula: c.countyVolunteerNeedFormula,
      housePartyGoal: c.housePartyGoal,
      estimatedRelationalCoverage: c.estimatedRelationalCoverage,
      phoneBankCapacityHours: c.phoneBankCapacityHours,
      postcardCapacityEstimate: c.postcardCapacityEstimate,
      textVolunteerCapacityHours: c.textVolunteerCapacityHours,
      localGuideNeed: c.localGuideNeed,
      accessSupportNeedScore: c.accessSupportNeedScore.toFixed(3),
      confidence: c.confidence,
      missingData: c.missingData.join("|"),
    })),
  );
  writeFileSync(path.join(OUT, "gotv-commitment-allocation-v1.csv"), csv, "utf8");

  console.log(
    `Wrote gotv-commitment-allocation-v1.json/csv (${allocation.counties.length} counties, total=${allocation.statewide.commitmentGoal}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
