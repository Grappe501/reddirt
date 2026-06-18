import { getBonusCitySourceRecord } from "@/lib/election-plan/load-bonus-city-workbenches";
import { getCityNumericTargets } from "@/lib/election-plan/load-city-numeric-targets";
import { getCountyByName } from "@/lib/election-plan/load-county";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getSpecialKpiGoalForCity } from "@/lib/election-plan/load-special-kpi-goals";
import type { ElectionPlanCity } from "@/lib/election-plan/types";

export type CityElectionIntel = {
  citySlug: string;
  cityName: string;
  countyName: string;
  countySlug: string | null;
  rank: number;
  isBonusCity: boolean;
  population2020: number | null;
  populationSource: string | null;
  estimatedRegisteredVoters: number | null;
  registeredVotersNote: string | null;
  baselineSosVotes2022: number | null;
  baselineSource: string | null;
  voteTarget: number;
  voteGain: number;
  baselineVote: number;
  countyRegistrationGoal: number | null;
  influenceCategory: string;
  visitFrequency: string;
};

function findCity(slug: string): ElectionPlanCity | undefined {
  const data = loadElectionPlanSnapshot();
  return data.cities.find((c) => c.slug === slug);
}

export function getCityElectionIntel(citySlug: string): CityElectionIntel | null {
  const city = findCity(citySlug);
  if (!city) return null;

  const data = loadElectionPlanSnapshot();
  const countyRow = getCountyByName(data, city.county);
  const bonus = getBonusCitySourceRecord(citySlug);
  const specialKpi = getSpecialKpiGoalForCity(citySlug);
  const numeric = getCityNumericTargets(citySlug);

  const population2020 = bonus?.population2020 ?? city.population2020 ?? null;
  const populationSource = population2020
    ? bonus?.population2020
      ? "2020 U.S. Census · bonus-city-workbenches.source.json"
      : "2020 U.S. Census · election-plan snapshot"
    : null;

  let estimatedRegisteredVoters = bonus?.estimatedRegisteredVoters ?? null;
  let registeredVotersNote = bonus?.registeredVotersNote ?? null;

  if (estimatedRegisteredVoters == null && bonus?.population2020 && bonus?.countyPopulation2020) {
    const share = bonus.population2020 / bonus.countyPopulation2020;
    if (countyRow?.registrationGoal && share > 0 && share < 1) {
      estimatedRegisteredVoters = Math.round(countyRow.registrationGoal / share);
      registeredVotersNote =
        registeredVotersNote ??
        `Planning estimate from ${city.county} County registration goal (${countyRow.registrationGoal.toLocaleString()}) × city population share — not official SOS registration file.`;
    }
  }

  const baselineSosVotes2022 =
    specialKpi?.baseline2022SosVotes ?? numeric?.secondaryGoals?.[0]?.baseline2022SosVotes ?? null;
  const baselineSource =
    specialKpi?.baselineSource ?? numeric?.secondaryGoals?.[0]?.baselineSource ?? null;

  return {
    citySlug: city.slug,
    cityName: city.name,
    countyName: city.county,
    countySlug: countyRow?.slug ?? null,
    rank: city.rank,
    isBonusCity: city.isBonusCity ?? false,
    population2020,
    populationSource,
    estimatedRegisteredVoters,
    registeredVotersNote,
    baselineSosVotes2022,
    baselineSource,
    voteTarget: city.targetVotes,
    voteGain: city.voteGain,
    baselineVote: city.baselineVote,
    countyRegistrationGoal: countyRow?.registrationGoal ?? numeric?.registration.countyRegistrationGoal ?? null,
    influenceCategory: city.influenceCategory,
    visitFrequency: city.visitFrequency,
  };
}
