export type GopSos2026CandidateSlot = "norris" | "hammer" | "harrison" | "tie";

export type GopSos2026PrimarySlice = {
  totalVotes: number;
  norrisVotes: number;
  hammerVotes: number;
  harrisonVotes: number;
  norrisPct: number;
  hammerPct: number;
  harrisonPct: number;
  winner: GopSos2026CandidateSlot;
};

export type GopSos2026RunoffSlice = {
  totalVotes: number;
  norrisVotes: number;
  hammerVotes: number;
  norrisPct: number;
  hammerPct: number;
  marginVotes: number;
  marginPct: number;
  winner: "norris" | "hammer" | "tie";
};

export type GopSos2026CountyAnalysis = {
  headline: string;
  coalitionFrame: string;
  hammerWeakness: string;
  opportunityTier: "high" | "medium" | "watch";
  norrisWonPrimary: boolean;
  norrisWonRunoff: boolean;
  hammerWonBoth: boolean;
  primaryToRunoffFlip: boolean;
};

export type GopSos2026CountyRow = {
  county: string;
  countySlug: string;
  fips: string;
  regionId: string;
  primary: GopSos2026PrimarySlice;
  runoff: GopSos2026RunoffSlice;
  analysis: GopSos2026CountyAnalysis;
};

export type GopSos2026ResultsBundle = {
  schemaVersion: string;
  builtAt: string;
  sources: {
    primaryFile: string;
    primaryContestId: string;
    runoffApi: string;
    runoffElectionId: string;
    runoffContestId: string;
    evidenceNote: string;
  };
  statewide: {
    primary: GopSos2026PrimarySlice & {
      norrisCountiesWon: number;
      hammerCountiesWon: number;
      harrisonCountiesWon: number;
    };
    runoff: GopSos2026RunoffSlice & {
      norrisCountiesWon: number;
      hammerCountiesWon: number;
    };
  };
  counties: GopSos2026CountyRow[];
  validation: {
    countyCount: number;
    missingPrimaryCounties: string[];
    missingRunoffCounties: string[];
  };
};

export type GopSos2026LocationView = GopSos2026CountyRow & {
  scope: "county" | "city";
  cityName?: string;
  citySlug?: string;
};
