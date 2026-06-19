import type { CityIntelligenceBundle, CityIntelligenceProfile } from "@/lib/election-plan/city-intelligence-types";
import { CITY_INTELLIGENCE_DIMENSION_LABELS } from "@/lib/election-plan/city-intelligence-types";

import bundle from "../../../data/campaign-brain/city-intelligence-profiles.json";

const data = bundle as CityIntelligenceBundle;

export function getCityIntelligenceProfile(slug: string): CityIntelligenceProfile | undefined {
  return data.cities[slug];
}

export function getAllCityIntelligenceProfiles(): CityIntelligenceProfile[] {
  return Object.values(data.cities).sort((a, b) => a.rank - b.rank);
}

export function cityIntelligenceBundleMeta() {
  return {
    version: data.version,
    generatedAt: data.generatedAt,
    cityCount: Object.keys(data.cities).length,
    dimensionLabels: CITY_INTELLIGENCE_DIMENSION_LABELS,
    modelNote: data.modelNote,
  };
}

export { CITY_INTELLIGENCE_DIMENSION_LABELS };
