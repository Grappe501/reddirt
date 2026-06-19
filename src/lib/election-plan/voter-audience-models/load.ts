import type {
  KellyVoterAudienceModelsFile,
  LocationAudienceOverlay,
  VoterAudienceProfile,
} from "@/lib/election-plan/voter-audience-models/types";

import bundle from "../../../../data/campaign-brain/kelly-voter-audience-models.json";

const data = bundle as KellyVoterAudienceModelsFile;

export function loadKellyVoterAudienceModels(): KellyVoterAudienceModelsFile {
  return data;
}

export function listVoterAudienceProfiles(): VoterAudienceProfile[] {
  return data.profiles;
}

export function getVoterAudienceProfile(profileId: string): VoterAudienceProfile | undefined {
  return data.profiles.find((p) => p.id === profileId);
}

export function getCountyAudienceOverlay(countySlug: string): LocationAudienceOverlay | undefined {
  const key = countySlug.replace(/-county$/, "");
  return data.counties[key];
}

export function getCityAudienceOverlay(citySlug: string): LocationAudienceOverlay | undefined {
  return data.cities[citySlug];
}

export function voterAudienceModelsMeta() {
  return {
    version: data.version,
    builtAt: data.builtAt,
    pageSummary: data.pageSummary,
    modelNote: data.modelNote,
    profileCount: data.profiles.length,
    countyCount: Object.keys(data.counties).length,
    cityCount: Object.keys(data.cities).length,
  };
}
