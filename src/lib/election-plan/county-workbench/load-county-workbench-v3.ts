import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { buildCountyPoliticalProfile } from "@/lib/campaign-engine/county-political-profile";
import { getRegistryCountyBySlug, regionMetaForId } from "@/lib/county/arkansas-county-registry";
import { findFactsByCounty } from "@/lib/county-workbench/factory/countyFactStore";
import { registrySlugFromShort } from "@/lib/county-workbench/factory/countyFactoryPaths";
import { prisma } from "@/lib/db";
import type { ElectionPlanCounty } from "@/lib/election-plan/types";

import { loadCountyWikipediaReference } from "./load-county-wikipedia-reference";
import type {
  CountyWorkbenchElectionRow,
  CountyWorkbenchFactRow,
  CountyWorkbenchV3View,
} from "./types";

function toRegistrySlug(electionPlanSlug: string): string {
  return electionPlanSlug.endsWith("-county") ? electionPlanSlug : registrySlugFromShort(electionPlanSlug);
}

function formatFactValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function loadFactoryBrief(registrySlug: string): CountyWorkbenchV3View["factoryBrief"] {
  const abs = path.join(process.cwd(), "data/county-workbench/briefs", `${registrySlug}.json`);
  if (!existsSync(abs)) return null;
  try {
    const raw = JSON.parse(readFileSync(abs, "utf8")) as {
      readinessScore?: number;
      whatWeKnow?: string[];
      whatWeDoNotKnow?: string[];
      researchTasks?: string[];
    };
    return {
      readinessScore: raw.readinessScore ?? 0,
      whatWeKnow: raw.whatWeKnow ?? [],
      whatWeDoNotKnow: raw.whatWeDoNotKnow ?? [],
      researchTasks: raw.researchTasks ?? [],
    };
  } catch {
    return null;
  }
}

function electionRowsFromProfile(
  rows: Awaited<ReturnType<typeof buildCountyPoliticalProfile>>["electionHistory"],
): CountyWorkbenchElectionRow[] {
  const generals = rows
    .filter((r) => r.contestName == null)
    .sort((a, b) => b.electionDate.localeCompare(a.electionDate))
    .slice(0, 8);

  return generals.map((r) => {
    const turnoutPct =
      r.ballotsCast != null && r.registeredVoters != null && r.registeredVoters > 0
        ? Math.round((r.ballotsCast / r.registeredVoters) * 1000) / 10
        : r.votePercent != null
          ? Math.round(Number(r.votePercent) * 10) / 10
          : null;
    return {
      electionName: r.electionName,
      electionDate: r.electionDate,
      registeredVoters: r.registeredVoters,
      ballotsCast: r.ballotsCast,
      turnoutPct,
      isOfficial: r.isOfficial,
    };
  });
}

function computeLastTurnout(rows: CountyWorkbenchElectionRow[]): number | null {
  return rows.find((r) => r.turnoutPct != null)?.turnoutPct ?? null;
}

function buildCountyIntelFallback(
  county: ElectionPlanCounty,
  registrySlug: string,
  reg: ReturnType<typeof getRegistryCountyBySlug>,
  regionLabel: string,
  wiki: ReturnType<typeof loadCountyWikipediaReference>,
  factoryBrief: CountyWorkbenchV3View["factoryBrief"],
): CountyWorkbenchV3View {
  const factoryFacts: CountyWorkbenchFactRow[] = findFactsByCounty(registrySlug)
    .filter((f) => f.factType !== "identity")
    .map((f) => ({
      factType: f.factType,
      factKey: f.factKey,
      value: formatFactValue(f.value),
      sourceName: f.sourceName,
      verificationStatus: f.verificationStatus,
    }));

  return {
    registrySlug,
    electionPlanSlug: county.slug,
    displayName: reg?.displayName ?? `${county.county} County`,
    fips: reg?.fips ?? "",
    regionLabel,
    countySeat: wiki?.countySeat ?? null,
    wikipediaUrl: wiki?.canonicalUrl ?? null,
    wikipediaExcerpt: wiki?.excerpt ?? null,
    wikipediaLicenseNote: wiki?.licenseNote ?? null,
    campaignReasoning: {
      strategicRole: county.strategicRole,
      primaryMission: county.primaryMission,
      secondaryMission: county.secondaryMission,
      recommendedAction: county.recommendedAction,
      pathToVictory: null,
      engagementPlan: [],
      vciRank: county.vciRank,
      vci: county.vci,
      tier: county.tier,
    },
    censusDemographics: {
      population: null,
      votingAgePopulation: null,
      medianIncome: null,
      povertyRate: null,
      bachelorsPct: null,
      ageBands: null,
      raceEthnicity: null,
      source: null,
      asOfYear: null,
      missingWarnings: ["County profile engine unavailable — DB or ingest not reachable."],
    },
    blsEconomy: {
      unemploymentRate: null,
      industryMix: null,
      laborNote: null,
      missingWarnings: ["BLS block unavailable offline."],
    },
    electionHistory: [],
    lastGeneralTurnoutPct: null,
    registeredVotersEstimate: null,
    electedOfficials: [],
    factoryFacts,
    factoryBrief,
    dataGaps: [
      "County political profile could not load — election history and census require DB or ingest.",
      "Election plan snapshot metrics (VCI, tier, missions) still available above.",
      ...(factoryBrief?.whatWeDoNotKnow ?? []),
    ],
    sources: [],
    profileMissingWarnings: ["County profile engine offline"],
  };
}

export async function loadCountyWorkbenchV3(county: ElectionPlanCounty): Promise<CountyWorkbenchV3View> {
  const registrySlug = toRegistrySlug(county.slug);
  const reg = getRegistryCountyBySlug(registrySlug);
  const fips = reg?.fips ?? "";
  const regionLabel = reg ? (regionMetaForId(reg.regionId)?.label ?? reg.regionId) : "—";
  const factoryBrief = loadFactoryBrief(registrySlug);

  const [profile, dbCounty, wiki] = await Promise.all([
    buildCountyPoliticalProfile({ countyName: county.county, fips: fips || undefined }).catch(() => null),
    prisma.county
      .findFirst({
        where: { OR: [{ slug: registrySlug }, ...(fips ? [{ fips }] : [])] },
        include: {
          demographics: true,
          elected: { orderBy: [{ jurisdiction: "asc" }, { sortOrder: "asc" }] },
        },
      })
      .catch(() => null),
    Promise.resolve(loadCountyWikipediaReference(registrySlug)),
  ]);

  if (!profile) {
    return buildCountyIntelFallback(county, registrySlug, reg, regionLabel, wiki, factoryBrief);
  }

  const demo = dbCounty?.demographics;
  const acs = profile.censusAcsBls;
  const censusWarnings = [...acs.missingDataWarnings];
  const blsWarnings = [...acs.missingDataWarnings.filter((w) => /bls|unemployment|industry|employment/i.test(w))];

  const factoryFacts: CountyWorkbenchFactRow[] = findFactsByCounty(registrySlug)
    .filter((f) => f.factType !== "identity")
    .map((f) => ({
      factType: f.factType,
      factKey: f.factKey,
      value: formatFactValue(f.value),
      sourceName: f.sourceName,
      verificationStatus: f.verificationStatus,
    }));

  const electedOfficials = (dbCounty?.elected ?? []).map((o) => ({
    jurisdiction: o.jurisdiction,
    officeTitle: o.officeTitle,
    name: o.name,
    party: o.party,
    termEnd: o.termEnd,
    sourceUrl: o.sourceUrl,
    reviewStatus: o.reviewStatus,
  }));

  const electionHistory = electionRowsFromProfile(profile.electionHistory);

  const dataGaps = [
    ...new Set([
      ...profile.missingDataWarnings,
      ...(factoryBrief?.whatWeDoNotKnow ?? []),
      ...(electedOfficials.length === 0 ? ["No elected officials in DB — add CountyElectedOfficial records or import."] : []),
      ...(electionHistory.length === 0 ? ["No election history rows ingested for this county."] : []),
      ...(acs.censusPopulation == null ? ["Census population not loaded — import CountyPublicDemographics or ACS ingest."] : []),
    ]),
  ].slice(0, 12);

  return {
    registrySlug,
    electionPlanSlug: county.slug,
    displayName: reg?.displayName ?? `${county.county} County`,
    fips: reg?.fips ?? profile.county?.fips ?? fips,
    regionLabel,
    countySeat: wiki?.countySeat ?? null,
    wikipediaUrl: wiki?.canonicalUrl ?? null,
    wikipediaExcerpt: wiki?.excerpt ?? null,
    wikipediaLicenseNote: wiki?.licenseNote ?? null,
    campaignReasoning: {
      strategicRole: county.strategicRole,
      primaryMission: county.primaryMission,
      secondaryMission: county.secondaryMission,
      recommendedAction: county.recommendedAction,
      pathToVictory: profile.pathToVictory || null,
      engagementPlan: profile.engagementPlan.thisWeek.slice(0, 5),
      vciRank: county.vciRank,
      vci: county.vci,
      tier: county.tier,
    },
    censusDemographics: {
      population: demo?.population ?? acs.censusPopulation,
      votingAgePopulation: demo?.votingAgePopulation ?? null,
      medianIncome: demo?.medianHouseholdIncome ?? acs.acsMedianIncome,
      povertyRate: demo?.povertyRatePercent ?? acs.acsPovertyRate,
      bachelorsPct: demo?.bachelorsOrHigherPercent ?? acs.acsEducation?.bachelorsOrHigherPercent ?? null,
      ageBands: demo?.ageBandsJson ?? acs.acsAgeBands,
      raceEthnicity: demo?.raceEthnicityJson ?? acs.acsRaceEthnicity,
      source: demo?.sourceDetail ?? demo?.source ?? null,
      asOfYear: demo?.asOfYear ?? null,
      missingWarnings: censusWarnings,
    },
    blsEconomy: {
      unemploymentRate: demo?.unemploymentRatePercent ?? acs.blsUnemployment,
      industryMix: demo?.blsIndustryMixJson ?? acs.blsIndustryMix,
      laborNote: demo?.laborEmploymentNote ?? null,
      missingWarnings: blsWarnings,
    },
    electionHistory,
    lastGeneralTurnoutPct: computeLastTurnout(electionHistory),
    registeredVotersEstimate: profile.registrationProfile.lastKnownRegisteredFromResults,
    electedOfficials,
    factoryFacts,
    factoryBrief,
    dataGaps,
    sources: profile.sources,
    profileMissingWarnings: profile.missingDataWarnings,
  };
}
