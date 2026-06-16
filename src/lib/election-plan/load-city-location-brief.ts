import type { ElectionPlanCity } from "@/lib/election-plan/types";

import {
  formatHousePartyGoalLine,
  formatRegistrationGoalLine,
  formatVolunteerGoalLine,
  getCityNumericTargets,
  type CityNumericTargets,
} from "@/lib/election-plan/load-city-numeric-targets";

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

function goalsFromNumeric(city: ElectionPlanCity, numeric: CityNumericTargets) {
  return {
    housePartyGoals: formatHousePartyGoalLine(numeric),
    volunteerGoals: formatVolunteerGoalLine(numeric),
    registrationGoals: formatRegistrationGoalLine(numeric, city.county),
  };
}

function scaffoldFromCity(city: ElectionPlanCity): Omit<CityLocationBrief, "slug"> {
  const numericTargets = getCityNumericTargets(city.slug);
  const goalLines = numericTargets ? goalsFromNumeric(city, numericTargets) : null;

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
    briefBoard: `Priority city #${city.rank} · ${city.county} County · ${city.influenceCategory}. Add narrative in city-location-briefs.source.json.`,
    situation: "Field intelligence pending — sourced narrative required in city-location-briefs.source.json.",
    penetration: "Penetration plan pending field review and county workbench input.",
    accomplishment: `${city.targetVotes.toLocaleString()}-vote target (+${city.voteGain.toLocaleString()} gain) from priority city / chapter-05 allocation.`,
    messaging: "Localized messaging pending in city-location-briefs.source.json.",
    kellyTalkingPoints: [],
    housePartyGoals: goalLines?.housePartyGoals ?? "Numeric targets pending in city-location-numeric-targets.source.json.",
    volunteerGoals: goalLines?.volunteerGoals ?? "Numeric targets pending in city-location-numeric-targets.source.json.",
    registrationGoals: goalLines?.registrationGoals ?? "Numeric targets pending in city-location-numeric-targets.source.json.",
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
