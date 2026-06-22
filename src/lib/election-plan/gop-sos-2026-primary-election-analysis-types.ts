import type { GopSos2026CountyRow } from "@/lib/election-plan/gop-sos-2026-results-types";

export type GopRegionAnalysisRow = {
  regionId: string;
  regionLabel: string;
  countyCount: number;
  primaryNorrisPct: number;
  primaryHammerPct: number;
  primaryHarrisonPct: number;
  runoffNorrisPct: number;
  runoffHammerPct: number;
  turnoutRetentionPct: number;
  norrisRunoffCountyWins: number;
  hammerRunoffCountyWins: number;
};

export type GopCountyFlipRow = {
  county: string;
  countySlug: string;
  primaryWinner: string;
  runoffWinner: string;
  runoffMarginPct: number;
  opportunityTier: GopSos2026CountyRow["analysis"]["opportunityTier"];
  headline: string;
};

export type GopTurnoutDropRow = {
  county: string;
  countySlug: string;
  primaryVotes: number;
  runoffVotes: number;
  retentionPct: number;
  runoffWinner: string;
};

export type GopPrecinctReportingRow = {
  county: string;
  countySlug: string;
  totalPrecincts: number;
  runoffVotes: number;
  runoffNorrisPct: number;
  runoffHammerPct: number;
  votesPerPrecinct: number;
};

export type GopSos2026PrimaryElectionAnalysis = {
  builtAt: string;
  kellyExecutiveOneLiner: string;
  executiveSummary: string[];
  theStory: string[];
  patterns: Array<{ title: string; body: string }>;
  campaignUtilization: Array<{ title: string; bullets: string[] }>;
  dataLimitations: string[];
  statewide: {
    primaryTotal: number;
    runoffTotal: number;
    turnoutRetentionPct: number;
    primaryNorrisPct: number;
    primaryHammerPct: number;
    primaryHarrisonPct: number;
    runoffNorrisPct: number;
    runoffHammerPct: number;
    runoffMarginVotes: number;
    runoffMarginPct: number;
    norrisRunoffCounties: number;
    hammerRunoffCounties: number;
    totalPrecinctsReporting: number;
  };
  coalitionMath: {
    norrisPrimaryNorrisRunoff: number;
    norrisPrimaryHammerRunoff: number;
    hammerPrimaryHammerRunoff: number;
    hammerPrimaryNorrisRunoff: number;
    harrisonPrimaryNorrisRunoff: number;
    harrisonPrimaryHammerRunoff: number;
    hammerStrongholds: number;
    closeHammerWins: number;
    closeNorrisWins: number;
    highOpportunityCounties: number;
  };
  regions: GopRegionAnalysisRow[];
  flipCounties: GopCountyFlipRow[];
  turnoutDropLeaders: GopTurnoutDropRow[];
  topNorrisRunoffCounties: GopCountyFlipRow[];
  hammerBaseCounties: GopCountyFlipRow[];
  precinctDensityLeaders: GopPrecinctReportingRow[];
  sourcesNote: string;
};
