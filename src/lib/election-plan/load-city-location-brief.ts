import type { ElectionPlanCity } from "@/lib/election-plan/types";

import { getCityNumericTargets, type CityNumericTargets } from "@/lib/election-plan/load-city-numeric-targets";

import source from "../../../data/campaign-brain/city-location-briefs.source.json";

export type CityBriefStatus = "scaffold" | "draft" | "review" | "approved";

export type CityLocationBrief = {
  slug: string;
  name: string;
  county: string;
  rank: number;
  targetVotes: number;
  voteGain: number;
  influenceCategory: string;
  strategicRole: string;
  visitFrequency: string;
  isTop10: boolean;
  status: CityBriefStatus;
  briefBoard: string;
  situation: string;
  penetration: string;
  accomplishment: string;
  messaging: string;
  kellyTalkingPoints: string[];
  housePartyGoals: string;
  volunteerGoals: string;
  registrationGoals: string;
  numericTargets?: CityNumericTargets;
};

type SourceBrief = {
  status?: CityBriefStatus;
  briefBoard?: string;
  situation?: string;
  penetration?: string;
  accomplishment?: string;
  messaging?: string;
  kellyTalkingPoints?: string[];
  housePartyGoals?: string;
  volunteerGoals?: string;
  registrationGoals?: string;
};

function scaffoldFromCity(city: ElectionPlanCity): Omit<CityLocationBrief, "slug"> {
  const tags = city.influenceTags.map((t) => t.replace(/_/g, " ")).join(", ");
  return {
    name: city.name,
    county: city.county,
    rank: city.rank,
    targetVotes: city.targetVotes,
    voteGain: city.voteGain,
    influenceCategory: city.influenceCategory,
    strategicRole: city.strategicRole,
    visitFrequency: city.visitFrequency,
    isTop10: city.isTop10,
    status: "scaffold",
    briefBoard: `${city.name} sits in ${city.county} County as a ${city.influenceCategory.toLowerCase()} — ${city.strategicRole} Visit cadence: ${city.visitFrequency}. This brief board is scaffolded from the priority city strategy until field intelligence and leadership review fill narrative depth.`,
    situation: `${city.strategicRole} Influence tags: ${tags || "local community"}. Field context pending — describe what is happening politically and socially in ${city.name} before we ask for votes.`,
    penetration: `Penetration plan pending — start from ${tags || "local validators"}, county clerk relationships, and ${city.visitFrequency} visibility rhythm. See county workbench for ${city.county} County field memory.`,
    accomplishment: `Move the ${city.targetVotes.toLocaleString()}-vote city target (+${city.voteGain.toLocaleString()} estimated gain) through lane work aligned to county playbook missions.`,
    messaging: `Localize Big Table doctrine: competent SOS service, Arkansas everyday life, and respect for community identity — not national partisan framing.`,
    kellyTalkingPoints: [
      `In ${city.name}, the Secretary of State's job is to make elections understandable and county clerks supported.`,
      "I'm asking for your vote — and for neighbors to come back to the table even when we disagree.",
    ],
    housePartyGoals: "TBD — set after county captain stand-up and Power of 5 host recruitment.",
    volunteerGoals: "TBD — align to county workbench volunteer KPIs.",
    registrationGoals: "TBD — allocate from county registration goal once field plan locks.",
  };
}

export function buildCityLocationBrief(city: ElectionPlanCity): CityLocationBrief {
  const overrides = (source.briefs as Record<string, SourceBrief>)[city.slug];
  const base = scaffoldFromCity(city);
  const numericTargets = getCityNumericTargets(city.slug);
  const merged = !overrides
    ? { slug: city.slug, ...base }
    : {
        slug: city.slug,
        ...base,
        status: overrides.status ?? "draft",
        briefBoard: overrides.briefBoard ?? base.briefBoard,
        situation: overrides.situation ?? base.situation,
        penetration: overrides.penetration ?? base.penetration,
        accomplishment: overrides.accomplishment ?? base.accomplishment,
        messaging: overrides.messaging ?? base.messaging,
        kellyTalkingPoints: overrides.kellyTalkingPoints ?? base.kellyTalkingPoints,
        housePartyGoals: overrides.housePartyGoals ?? base.housePartyGoals,
        volunteerGoals: overrides.volunteerGoals ?? base.volunteerGoals,
        registrationGoals: overrides.registrationGoals ?? base.registrationGoals,
      };
  return numericTargets ? { ...merged, numericTargets } : merged;
}

export function getCityLocationBrief(
  slug: string,
  cities: ElectionPlanCity[],
): CityLocationBrief | undefined {
  const city = cities.find((c) => c.slug === slug);
  if (!city) return undefined;
  return buildCityLocationBrief(city);
}

export function allCityLocationBriefs(cities: ElectionPlanCity[]): CityLocationBrief[] {
  return cities.map(buildCityLocationBrief);
}
