import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY, getRegistryCountyBySlug, regionLabelForId } from "@/lib/county/arkansas-county-registry";
import { findFactsByCounty, findMissingFactsByCounty } from "./countyFactStore";
import { GLOBAL_REQUIRED_FACT_TYPES } from "./countySourceCatalog";
import type { CountyProfileCompiled } from "./countyFactoryTypes";
import { COUNTY_FACTORY_GOVERNANCE } from "./countyFactoryTypes";
import { COUNTY_FACTORY_PATHS, countyFactoryAbs } from "./countyFactoryPaths";

function factsOfType(countySlug: string, types: string[]) {
  return findFactsByCounty(countySlug).filter((f) => types.includes(f.factType));
}

function computeReadiness(countySlug: string): { score: number; status: CountyProfileCompiled["profileStatus"] } {
  const facts = findFactsByCounty(countySlug);
  const verified = facts.filter((f) => f.verificationStatus === "VERIFIED").length;
  const missing = findMissingFactsByCounty(countySlug, [...GLOBAL_REQUIRED_FACT_TYPES]).length;
  let score = 15;
  score += Math.min(verified * 3, 30);
  score += Math.min(facts.length * 2, 35);
  score -= Math.min(missing * 2, 25);
  const readinessFacts = facts.filter((f) => f.factType === "readiness");
  const completion = readinessFacts.find((f) => f.factKey === "completionPercent");
  if (completion && typeof completion.value === "number") {
    score += Math.min(completion.value * 0.2, 20);
  }
  score = Math.max(0, Math.min(100, Math.round(score)));
  const status: CountyProfileCompiled["profileStatus"] =
    score >= 60 ? "COMPILED" : score >= 25 ? "PARTIAL" : "SHELL";
  return { score, status };
}

export function compileCountyProfile(countySlug: string, repoRoot: string = process.cwd()): CountyProfileCompiled {
  const reg = getRegistryCountyBySlug(countySlug);
  if (!reg) throw new Error(`Unknown county slug: ${countySlug}`);
  const { score, status } = computeReadiness(countySlug);
  const gaps = findMissingFactsByCounty(countySlug, [...GLOBAL_REQUIRED_FACT_TYPES]);
  const profile: CountyProfileCompiled = {
    countySlug: reg.slug,
    countyName: reg.displayName,
    fips: reg.fips,
    regionId: reg.regionId,
    regionLabel: regionLabelForId(reg.regionId),
    identity: {
      displayName: reg.displayName,
      fips: reg.fips,
      slug: reg.slug,
      regionId: reg.regionId,
    },
    demographicSnapshot: factsOfType(countySlug, ["demographics"]),
    voterSnapshot: factsOfType(countySlug, ["voter_registration", "registration"]),
    turnoutSnapshot: factsOfType(countySlug, ["turnout"]),
    economicSnapshot: factsOfType(countySlug, ["economic", "employment"]),
    educationSnapshot: factsOfType(countySlug, ["education", "schools"]),
    healthcareSnapshot: factsOfType(countySlug, ["healthcare", "hospitals"]),
    localValidators: factsOfType(countySlug, ["local_validators", "coalition"]),
    civicInfrastructure: factsOfType(countySlug, ["civic_infrastructure"]),
    mediaLandscape: factsOfType(countySlug, ["media"]),
    eventOpportunities: factsOfType(countySlug, ["event_opportunities"]),
    messageOpportunities: factsOfType(countySlug, ["message_themes"]),
    knownGaps: gaps.map((g) => `Missing fact type: ${g}`),
    riskWarnings: [
      ...(factsOfType(countySlug, ["planning_proxy"]).length
        ? ["Planning vote target proxy present — NOT registration goal"]
        : []),
      ...(status === "SHELL" ? ["SHELL county — not field-truth ready"] : []),
    ],
    recommendedNextResearch: gaps.slice(0, 5).map((g) => `Research ${g} for ${reg.displayName}`),
    readinessScore: score,
    profileStatus: status,
    governance: COUNTY_FACTORY_GOVERNANCE,
    generatedAt: new Date().toISOString(),
  };

  const abs = countyFactoryAbs(`${COUNTY_FACTORY_PATHS.profilesDir}/${countySlug}.json`, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
  return profile;
}

export function compileAllCountyProfiles(repoRoot: string = process.cwd()): CountyProfileCompiled[] {
  const profiles = ARKANSAS_COUNTY_REGISTRY.map((c) => compileCountyProfile(c.slug, repoRoot));
  const rollup = {
    ...summarizeCompiledProfileReadiness(profiles),
    countyIndex: profiles.map((p) => ({
      countySlug: p.countySlug,
      countyName: p.countyName,
      score: p.readinessScore,
      status: p.profileStatus,
    })),
  };
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.profilesRollup, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(rollup, null, 2)}\n`, "utf8");
  return profiles;
}

export type CountyProfileRollupSummary = {
  generatedAt: string;
  countyCount: number;
  all75: boolean;
  avgReadiness: number;
  byStatus: { SHELL: number; PARTIAL: number; COMPILED: number };
  lowestReadiness: Array<{ countySlug: string; score: number; status: CountyProfileCompiled["profileStatus"] }>;
  highestReadiness: Array<{ countySlug: string; score: number; status: CountyProfileCompiled["profileStatus"] }>;
  governance: typeof COUNTY_FACTORY_GOVERNANCE;
};

export type CountyProfileRollupFile = CountyProfileRollupSummary & {
  countyIndex?: Array<{
    countySlug: string;
    countyName: string;
    score: number;
    status: CountyProfileCompiled["profileStatus"];
  }>;
};

export function loadProfileRollup(repoRoot: string = process.cwd()): CountyProfileRollupFile | null {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.profilesRollup, repoRoot);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, "utf8")) as CountyProfileRollupFile;
}

export function loadCompiledProfile(countySlug: string, repoRoot: string = process.cwd()): CountyProfileCompiled | null {
  const abs = countyFactoryAbs(`${COUNTY_FACTORY_PATHS.profilesDir}/${countySlug}.json`, repoRoot);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, "utf8")) as CountyProfileCompiled;
}

export function summarizeCompiledProfileReadiness(profiles?: CountyProfileCompiled[]): CountyProfileRollupSummary {
  if (profiles) {
    const byStatus = { SHELL: 0, PARTIAL: 0, COMPILED: 0 };
    for (const p of profiles) byStatus[p.profileStatus]++;
    return {
      generatedAt: new Date().toISOString(),
      countyCount: profiles.length,
      all75: profiles.length >= 75,
      avgReadiness: Math.round(profiles.reduce((n, p) => n + p.readinessScore, 0) / Math.max(profiles.length, 1)),
      byStatus,
      lowestReadiness: [...profiles].sort((a, b) => a.readinessScore - b.readinessScore).slice(0, 10).map((p) => ({
        countySlug: p.countySlug,
        score: p.readinessScore,
        status: p.profileStatus,
      })),
      highestReadiness: [...profiles].sort((a, b) => b.readinessScore - a.readinessScore).slice(0, 10).map((p) => ({
        countySlug: p.countySlug,
        score: p.readinessScore,
        status: p.profileStatus,
      })),
      governance: COUNTY_FACTORY_GOVERNANCE,
    };
  }

  const rollup = loadProfileRollup();
  if (rollup) {
    return {
      generatedAt: rollup.generatedAt,
      countyCount: rollup.countyCount,
      all75: rollup.all75,
      avgReadiness: rollup.avgReadiness,
      byStatus: rollup.byStatus,
      lowestReadiness: rollup.lowestReadiness,
      highestReadiness: rollup.highestReadiness,
      governance: rollup.governance,
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    countyCount: 0,
    all75: false,
    avgReadiness: 0,
    byStatus: { SHELL: 0, PARTIAL: 0, COMPILED: 0 },
    lowestReadiness: [],
    highestReadiness: [],
    governance: COUNTY_FACTORY_GOVERNANCE,
  };
}
