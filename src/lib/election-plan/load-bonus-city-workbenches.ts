import bonusSource from "../../../data/campaign-brain/bonus-city-workbenches.source.json";
import type { ElectionPlanCity } from "@/lib/election-plan/types";

type BonusCitySource = ElectionPlanCity & {
  population2020?: number;
};

type BonusSourceFile = {
  cities: BonusCitySource[];
};

export function getBonusCityWorkbenches(): ElectionPlanCity[] {
  const file = bonusSource as BonusSourceFile;
  return file.cities.map(({ population2020: _pop, ...city }) => city);
}

export function mergeBonusCitiesIntoSnapshot(cities: ElectionPlanCity[]): ElectionPlanCity[] {
  const bonus = getBonusCityWorkbenches();
  const existing = new Set(cities.map((c) => c.slug));
  const appended = bonus.filter((b) => !existing.has(b.slug));
  return [...cities, ...appended].sort((a, b) => a.rank - b.rank);
}

export function isBonusCitySlug(slug: string): boolean {
  return getBonusCityWorkbenches().some((c) => c.slug === slug);
}
