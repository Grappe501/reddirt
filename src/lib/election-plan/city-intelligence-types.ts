/** Ten-dimension city intelligence enrichment — field + API + county inheritance. */

export type EnrichmentStatus = "verified" | "api" | "inherited" | "scaffold";

export type CivicContactRef = {
  label: string;
  name?: string | null;
  title?: string | null;
  district?: string | null;
  party?: string | null;
  phone?: string | null;
  email?: string | null;
  url?: string | null;
  status: EnrichmentStatus;
  source: string;
  note?: string;
};

export type CityIntelligenceNarrative = {
  geographic: string;
  historicalCultural: string;
  socioEconomic: string;
  clusterContext: string;
  countyContext: string;
};

export type CityIntelligenceProfile = {
  slug: string;
  name: string;
  county: string;
  rank: number;
  population2020: number;
  generatedAt: string;
  narrative: CityIntelligenceNarrative;
  election: {
    targetVotes: number;
    baselineVote: number;
    voteGain: number;
    influenceCategory: string;
    strategicRole: string;
    influenceTags: string[];
    visitFrequency: string;
    countySharePct: number;
  };
  cluster: {
    id: string;
    name: string;
    description: string;
  } | null;
  countyIntel: {
    seat: string | null;
    topIssues: string[];
    wikiExcerpt: string | null;
    primaryMission: string | null;
    tier: string | null;
  };
  /** The ten enrichment dimensions */
  dimensions: {
    stateHouse: CivicContactRef;
    stateSenate: CivicContactRef;
    usCongress: CivicContactRef;
    chamberOfCommerce: CivicContactRef;
    rotaryClub: CivicContactRef;
    mainHighSchool: CivicContactRef;
    localGovernment: CivicContactRef;
    schoolDistrict: CivicContactRef;
    mediaMarket: CivicContactRef;
    fieldValidatorTargets: CivicContactRef;
  };
  enrichmentSummary: {
    verified: number;
    api: number;
    inherited: number;
    scaffold: number;
  };
  sources: string[];
  strategicPlanReady: boolean;
};

export type CityIntelligenceBundle = {
  version: number;
  generatedAt: string;
  modelNote: string;
  dimensionLabels: Record<keyof CityIntelligenceProfile["dimensions"], string>;
  cities: Record<string, CityIntelligenceProfile>;
};

export const CITY_INTELLIGENCE_DIMENSION_LABELS: Record<
  keyof CityIntelligenceProfile["dimensions"],
  string
> = {
  stateHouse: "State House district & representative",
  stateSenate: "State Senate district & senator",
  usCongress: "U.S. House district & representative",
  chamberOfCommerce: "Chamber of Commerce",
  rotaryClub: "Rotary / civic club",
  mainHighSchool: "Main high school",
  localGovernment: "City government (mayor / council)",
  schoolDistrict: "School district",
  mediaMarket: "Media market & regional reach",
  fieldValidatorTargets: "Field validator targets (who to recruit)",
};
