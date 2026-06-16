import type { CountyPoliticalProfileResult } from "@/lib/campaign-engine/county-political-profile";

export type CountyWorkbenchFactRow = {
  factType: string;
  factKey: string;
  value: string;
  sourceName: string;
  verificationStatus: string;
};

export type CountyWorkbenchElectedRow = {
  jurisdiction: string;
  officeTitle: string;
  name: string;
  party: string | null;
  termEnd: string | null;
  sourceUrl: string | null;
  reviewStatus: string;
};

export type CountyWorkbenchElectionRow = {
  electionName: string;
  electionDate: string;
  registeredVoters: number | null;
  ballotsCast: number | null;
  turnoutPct: number | null;
  isOfficial: boolean | null;
};

export type CountyWorkbenchV3View = {
  registrySlug: string;
  electionPlanSlug: string;
  displayName: string;
  fips: string;
  regionLabel: string;
  countySeat: string | null;
  wikipediaUrl: string | null;
  wikipediaExcerpt: string | null;
  wikipediaLicenseNote: string | null;
  campaignReasoning: {
    strategicRole: string;
    primaryMission: string;
    secondaryMission: string;
    recommendedAction: string;
    pathToVictory: string | null;
    engagementPlan: string[];
    vciRank: number;
    vci: number;
    tier: string;
  };
  censusDemographics: {
    population: number | null;
    votingAgePopulation: number | null;
    medianIncome: number | null;
    povertyRate: number | null;
    bachelorsPct: number | null;
    ageBands: unknown;
    raceEthnicity: unknown;
    source: string | null;
    asOfYear: number | null;
    missingWarnings: string[];
  };
  blsEconomy: {
    unemploymentRate: number | null;
    industryMix: unknown;
    laborNote: string | null;
    missingWarnings: string[];
  };
  electionHistory: CountyWorkbenchElectionRow[];
  lastGeneralTurnoutPct: number | null;
  registeredVotersEstimate: number | null;
  electedOfficials: CountyWorkbenchElectedRow[];
  factoryFacts: CountyWorkbenchFactRow[];
  factoryBrief: {
    readinessScore: number;
    whatWeKnow: string[];
    whatWeDoNotKnow: string[];
    researchTasks: string[];
  } | null;
  dataGaps: string[];
  sources: CountyPoliticalProfileResult["sources"];
  profileMissingWarnings: string[];
};
