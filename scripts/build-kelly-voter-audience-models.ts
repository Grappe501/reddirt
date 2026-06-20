/**
 * Build Kelly voter audience models — personas + county/city overlays.
 * Usage: npm run voter-audience-models:build
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../src/lib/county/arkansas-county-registry";
import { VOTER_AUDIENCE_SEEDS } from "./voter-audience/seeds";
import type {
  KellyVoterAudienceModelsFile,
  LocationAudienceOverlay,
  LocationAudienceProfileEstimate,
} from "../src/lib/election-plan/voter-audience-models/types";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/campaign-brain/kelly-voter-audience-models.json");
const CITY_INTEL = path.join(ROOT, "data/campaign-brain/city-intelligence-profiles.json");
const VOTER_ROLLUPS = path.join(ROOT, "data/election/voter-file-location-rollups.json");

const REGION_PROFILE_BOOST: Record<string, string[]> = {
  northwest: ["robert-kessler", "tyler-martinez", "maria-gutierrez", "susan-ellis"],
  north_central: ["linda-sutton", "coach-pat-nolan", "tom-rutherford", "diane-porter"],
  northeast: ["aisha-reed", "rev-james-holloway", "coach-pat-nolan", "frank-donnelly"],
  central: ["marcia-truman", "susan-ellis", "keisha-lyons", "tyler-martinez", "carol-whitfield"],
  west_central: ["frank-donnelly", "tom-rutherford", "linda-sutton", "carol-whitfield"],
  southwest: ["bill-jennings", "linda-sutton", "keisha-lyons", "carol-whitfield"],
  southeast: ["rev-james-holloway", "aisha-reed", "marcia-truman", "keisha-lyons"],
  south: ["rev-james-holloway", "linda-sutton", "bill-jennings", "aisha-reed"],
};

const INFLUENCE_TAG_BOOST: Record<string, string[]> = {
  democratic_recovery: ["marcia-truman", "aisha-reed", "rev-james-holloway"],
  moderate_republicans: ["robert-kessler", "linda-sutton", "susan-ellis"],
  persuasion: ["linda-sutton", "robert-kessler", "paul-listener"],
  students: ["tyler-martinez", "paul-listener"],
  turnout_growth: ["aisha-reed", "keisha-lyons", "tyler-martinez"],
  chambers: ["robert-kessler", "coach-pat-nolan"],
  volunteers: ["coach-pat-nolan", "maria-gutierrez", "rev-james-holloway"],
};

function slugifyCounty(name: string): string {
  return name
    .replace(/\s+County$/i, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function countyKeyFromRegistry(slug: string): string {
  return slug.replace(/-county$/, "");
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

function scoreProfilesForCounty(countySlug: string, regionId: string): string[] {
  const scores = new Map<string, number>();
  const bump = (id: string, n = 1) => scores.set(id, (scores.get(id) ?? 0) + n);

  for (const id of REGION_PROFILE_BOOST[regionId] ?? []) bump(id, 3);
  for (const p of VOTER_AUDIENCE_SEEDS) {
    if (p.homeCounties.includes(countySlug)) bump(p.id, 5);
  }

  if (existsSync(VOTER_ROLLUPS)) {
    const rollups = JSON.parse(readFileSync(VOTER_ROLLUPS, "utf8")) as {
      counties: Record<string, { registration: { party: { democrat: number; republican: number } } }>;
    };
    const c = rollups.counties[countySlug];
    if (c) {
      const d = c.registration.party.democrat;
      const r = c.registration.party.republican;
      if (d > r) {
        bump("marcia-truman", 2);
        bump("aisha-reed", 2);
        bump("rev-james-holloway", 2);
      } else if (r > d * 1.5) {
        bump("robert-kessler", 2);
        bump("linda-sutton", 2);
        bump("frank-donnelly", 1);
      }
    }
  }

  bump("carol-whitfield", 2);

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => id);
}

function buildCountyOverlays(): Record<string, LocationAudienceOverlay> {
  const out: Record<string, LocationAudienceOverlay> = {};
  for (const c of ARKANSAS_COUNTY_REGISTRY) {
    const slug = countyKeyFromRegistry(c.slug);
    const profileIds = scoreProfilesForCounty(slug, c.regionId);
    const names = profileIds
      .map((id) => VOTER_AUDIENCE_SEEDS.find((p) => p.id === id)?.displayName)
      .filter(Boolean);
    out[slug] = {
      slug,
      name: c.displayName.replace(/\s+County$/i, ""),
      kind: "county",
      populationNote: null,
      profileIds,
      makeupNote: `Primary speak-to cast for ${c.displayName.replace(/\s+County$/i, "")}: ${names.join(", ")}. Overlay uses region (${c.regionId}), persona home counties, and SOS registration party mix where available.`,
      sources: ["voter-audience/seeds.ts", "arkansas-county-registry", existsSync(VOTER_ROLLUPS) ? "voter-file-location-rollups.json" : "no rollups"],
    };
  }
  return out;
}

function profileEstimatesFromScores(
  profileIds: string[],
  scores: Map<string, number>,
  opts: { activeRegistered: number | null; voteTarget: number | null },
): LocationAudienceProfileEstimate[] {
  if (profileIds.length === 0) return [];
  const totalScore = profileIds.reduce((sum, id) => sum + (scores.get(id) ?? 1), 0);
  if (totalScore <= 0) return [];

  return profileIds.map((profileId) => {
    const weight = (scores.get(profileId) ?? 1) / totalScore;
    const weightPct = Math.round(weight * 1000) / 10;
    return {
      profileId,
      weightPct,
      estimatedRegisteredPool:
        opts.activeRegistered != null ? Math.max(1, Math.round(opts.activeRegistered * weight)) : 0,
      estimatedVoteTarget: opts.voteTarget != null ? Math.max(1, Math.round(opts.voteTarget * weight)) : 0,
    };
  });
}

function readCityRollup(citySlug: string): { active: number | null } {
  if (!existsSync(VOTER_ROLLUPS)) return { active: null };
  const rollups = JSON.parse(readFileSync(VOTER_ROLLUPS, "utf8")) as {
    cities: Record<string, { registration?: { active?: number } }>;
  };
  return { active: rollups.cities[citySlug]?.registration?.active ?? null };
}

function buildCityOverlays(counties: Record<string, LocationAudienceOverlay>): Record<string, LocationAudienceOverlay> {
  if (!existsSync(CITY_INTEL)) return {};
  const intel = JSON.parse(readFileSync(CITY_INTEL, "utf8")) as {
    cities: Record<
      string,
      {
        slug: string;
        name: string;
        county: string;
        population2020: number;
        election: { influenceTags: string[]; targetVotes: number };
        narrative: { socioEconomic: string };
      }
    >;
  };

  const out: Record<string, LocationAudienceOverlay> = {};
  for (const city of Object.values(intel.cities)) {
    const countySlug = slugifyCounty(city.county);
    const countyOverlay = counties[countySlug];
    const scores = new Map<string, number>();

    for (const id of countyOverlay?.profileIds ?? []) {
      scores.set(id, (scores.get(id) ?? 0) + 2);
    }
    for (const p of VOTER_AUDIENCE_SEEDS) {
      if (p.homeCities.includes(city.slug)) scores.set(p.id, (scores.get(p.id) ?? 0) + 6);
    }
    for (const tag of city.election.influenceTags) {
      for (const id of INFLUENCE_TAG_BOOST[tag] ?? []) {
        scores.set(id, (scores.get(id) ?? 0) + 2);
      }
    }

    const profileIds = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const names = profileIds
      .map((id) => VOTER_AUDIENCE_SEEDS.find((p) => p.id === id)?.displayName)
      .filter(Boolean);

    const rollup = readCityRollup(city.slug);
    const profileEstimates = profileEstimatesFromScores(profileIds, scores, {
      activeRegistered: rollup.active,
      voteTarget: city.election.targetVotes ?? null,
    });

    out[city.slug] = {
      slug: city.slug,
      name: city.name,
      kind: "city",
      countySlug,
      populationNote: `${city.population2020.toLocaleString("en-US")} (2020 Census)`,
      profileIds,
      profileEstimates,
      makeupNote: `${city.name} speak-to cast: ${names.join(", ")}. Tags: ${city.election.influenceTags.join(", ")}.`,
      sources: [
        "city-intelligence-profiles.json",
        "voter-audience/seeds.ts",
        existsSync(VOTER_ROLLUPS) ? "voter-file-location-rollups.json" : "no rollups",
      ],
    };
  }
  return out;
}

function main() {
  const counties = buildCountyOverlays();
  const cities = buildCityOverlays(counties);

  const file: KellyVoterAudienceModelsFile = {
    version: 1,
    builtAt: new Date().toISOString(),
    pageSummary:
      "Sixteen named Arkansans in Kelly's big tent — who she is talking to when she speaks. Use the badge on every practice line: picture one person, not a crowd.",
    modelNote:
      "Fictional personas for message targeting only — not voter file rows. Location overlays combine region, city intelligence tags, and aggregate SOS registration mix.",
    profiles: VOTER_AUDIENCE_SEEDS,
    counties,
    cities,
  };

  writeFileSync(OUT, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT} — ${file.profiles.length} personas, ${Object.keys(counties).length} counties, ${Object.keys(cities).length} cities`);
}

main();
