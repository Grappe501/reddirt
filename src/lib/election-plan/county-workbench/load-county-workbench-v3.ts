import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { buildCountyPoliticalProfile } from "@/lib/campaign-engine/county-political-profile";
import { getRegistryCountyBySlug, regionMetaForId } from "@/lib/county/arkansas-county-registry";
import { findFactsByCounty } from "@/lib/county-workbench/factory/countyFactStore";
import { registrySlugFromShort } from "@/lib/county-workbench/factory/countyFactoryPaths";
import { prisma } from "@/lib/db";
import type { ElectionPlanCounty } from "@/lib/election-plan/types";

import { loadCountyWikipediaReference } from "./load-county-wikipedia-reference";
import {
  bundledCountyElectionHistory,
  bundledRegisteredVotersEstimate,
  offlineEnrichmentWarnings,
} from "./load-county-offline-enrichment";
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

  const electionHistory = bundledCountyElectionHistory(county.county);
  const registeredVotersEstimate = bundledRegisteredVotersEstimate(county.slug);
  const offlineWarnings = offlineEnrichmentWarnings(county.county);

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
      source: registeredVotersEstimate ? "SOS voter file rollup (active registration — not Census population)" : null,
      asOfYear: null,
      missingWarnings: offlineWarnings,
    },
    blsEconomy: {
      unemploymentRate: null,
      industryMix: null,
      laborNote: registeredVotersEstimate
        ? `SOS active registration (voter file): ${registeredVotersEstimate.toLocaleString("en-US")} — BLS requires DB ingest.`
        : null,
      missingWarnings: ["BLS block requires CountyPublicDemographics in database."],
    },
    electionHistory,
    lastGeneralTurnoutPct: computeLastTurnout(electionHistory),
    registeredVotersEstimate,
    electedOfficials: [],
    factoryFacts,
    factoryBrief,
    dataGaps: [
      "County political profile could not load — Census/BLS/elected officials require DB.",
      ...(electionHistory.length > 0
        ? ["Election history from bundled SOS JSON below."]
        : ["No election history in bundled SOS JSON for this county."]),
      "Election plan snapshot metrics (VCI, tier, missions) still available above.",
      ...(factoryBrief?.whatWeDoNotKnow ?? []),
    ],
    sources: electionHistory.length > 0 ? [{ id: "bundled-sos-json", label: "Arkansas SOS election JSON", type: "file", pathOrNote: "data/election/arkansas-county-election-history.normalized.json" }] : [],
    profileMissingWarnings: offlineWarnings,
  };
}

function mergeDbCountyIntoIntel(
  view: CountyWorkbenchV3View,
  dbCounty: {
    demographics: {
      population: number | null;
      votingAgePopulation: number | null;
      medianHouseholdIncome: number | null;
      povertyRatePercent: number | null;
      bachelorsOrHigherPercent: number | null;
      ageBandsJson: unknown;
      raceEthnicityJson: unknown;
      source: string | null;
      sourceDetail: string | null;
      asOfYear: number | null;
      unemploymentRatePercent: number | null;
      blsIndustryMixJson: unknown;
      laborEmploymentNote: string | null;
    } | null;
    elected: Array<{
      jurisdiction: string;
      officeTitle: string;
      name: string;
      party: string | null;
      termEnd: string | null;
      sourceUrl: string | null;
      reviewStatus: string;
    }>;
  } | null,
): CountyWorkbenchV3View {
  if (!dbCounty) return view;
  const demo = dbCounty.demographics;
  const electedOfficials = (dbCounty.elected ?? []).map((o) => ({
    jurisdiction: o.jurisdiction,
    officeTitle: o.officeTitle,
    name: o.name,
    party: o.party,
    termEnd: o.termEnd,
    sourceUrl: o.sourceUrl,
    reviewStatus: o.reviewStatus,
  }));
  if (!demo && electedOfficials.length === 0) return view;
  return {
    ...view,
    censusDemographics: demo
      ? {
          population: demo.population,
          votingAgePopulation: demo.votingAgePopulation,
          medianIncome: demo.medianHouseholdIncome,
          povertyRate: demo.povertyRatePercent,
          bachelorsPct: demo.bachelorsOrHigherPercent,
          ageBands: demo.ageBandsJson,
          raceEthnicity: demo.raceEthnicityJson,
          source: demo.sourceDetail ?? demo.source ?? view.censusDemographics.source,
          asOfYear: demo.asOfYear,
          missingWarnings: view.censusDemographics.missingWarnings.filter(
            (w) => !w.includes("Census ACS and BLS blocks require"),
          ),
        }
      : view.censusDemographics,
    blsEconomy: demo
      ? {
          unemploymentRate: demo.unemploymentRatePercent,
          industryMix: demo.blsIndustryMixJson,
          laborNote: demo.laborEmploymentNote,
          missingWarnings: [],
        }
      : view.blsEconomy,
    electedOfficials: electedOfficials.length > 0 ? electedOfficials : view.electedOfficials,
  };
}

async function loadCountyWorkbenchV3Inner(county: ElectionPlanCounty): Promise<CountyWorkbenchV3View> {
  const registrySlug = toRegistrySlug(county.slug);
  const reg = getRegistryCountyBySlug(registrySlug);
  const fips = reg?.fips ?? "";
  const regionLabel = reg ? (regionMetaForId(reg.regionId)?.label ?? reg.regionId) : "—";
  const factoryBrief = loadFactoryBrief(registrySlug);

  const [profile, dbCounty, wiki] = await Promise.all([
    buildCountyPoliticalProfile({
      countyName: county.county,
      fips: fips || undefined,
      lite: true,
      includePrecincts: false,
      includeOpposition: false,
    }).catch(() => null),
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
    const fallback = buildCountyIntelFallback(county, registrySlug, reg, regionLabel, wiki, factoryBrief);
    return mergeDbCountyIntoIntel(fallback, dbCounty);
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

  const electionHistory =
    electionRowsFromProfile(profile.electionHistory).length > 0
      ? electionRowsFromProfile(profile.electionHistory)
      : bundledCountyElectionHistory(county.county);

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
      engagementPlan: profile.engagementPlan?.thisWeek?.slice(0, 5) ?? [],
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
    registeredVotersEstimate:
      profile.registrationProfile.lastKnownRegisteredFromResults ?? bundledRegisteredVotersEstimate(county.slug),
    electedOfficials,
    factoryFacts,
    factoryBrief,
    dataGaps,
    sources: profile.sources,
    profileMissingWarnings: profile.missingDataWarnings,
  };
}

export function loadCountyWorkbenchV3SyncFallback(county: ElectionPlanCounty): CountyWorkbenchV3View {
  const registrySlug = toRegistrySlug(county.slug);
  const reg = getRegistryCountyBySlug(registrySlug);
  const regionLabel = reg ? (regionMetaForId(reg.regionId)?.label ?? reg.regionId) : "—";
  const factoryBrief = loadFactoryBrief(registrySlug);
  const wiki = loadCountyWikipediaReference(registrySlug);
  return buildCountyIntelFallback(county, registrySlug, reg, regionLabel, wiki, factoryBrief);
}

export async function loadCountyWorkbenchV3(county: ElectionPlanCounty): Promise<CountyWorkbenchV3View> {
  try {
    return await loadCountyWorkbenchV3Inner(county);
  } catch {
    return loadCountyWorkbenchV3SyncFallback(county);
  }
}
