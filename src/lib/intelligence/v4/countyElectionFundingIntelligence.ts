import fs from "node:fs";
import path from "node:path";

export type EvidenceTier = "VERIFIED_FACT" | "VERIFIED_PARTIAL" | "PARTIAL" | "NEEDS_RESEARCH" | "DEFERRED" | "STRATEGY";

export type FundingSource = {
  label: string;
  url: string;
  note?: string;
};

export type CountyAwardRecord = {
  county: string;
  amount: number | null;
  year: number | null;
  label: string;
  evidenceTier: EvidenceTier;
  sourceNote: string;
  fundSource?: "CVSGF" | "HAVA" | "ACT_808" | "UNKNOWN";
};

export type CountyElectionFundingResearch = {
  version: number;
  generatedAt: string;
  governance: { classification: string; publicationSafety: string; researchStatus: string };
  executiveSummary: string;
  statutoryAuthority: Array<{
    id: string;
    citation: string;
    title: string;
    summary: string;
    evidenceTier: EvidenceTier;
    sources: FundingSource[];
  }>;
  sosControlDiscretion: {
    headline: string;
    controls: string[];
    evidenceTier: EvidenceTier;
    sourceNote: string;
  };
  appropriations: Array<{
    fiscalYear: string;
    session?: string;
    act: string;
    lineItem: string;
    amount: number | null;
    secondaryAmount?: number;
    fund: string;
    payableTo: string;
    purpose?: string;
    evidenceTier: EvidenceTier;
    sources: FundingSource[];
    note?: string;
  }>;
  oneTimeTransfers: Array<{
    id: string;
    year: number;
    amount: number;
    from: string;
    to: string;
    act: string;
    purpose: string;
    evidenceTier: EvidenceTier;
    sources: FundingSource[];
    documentedUses: string[];
  }>;
  expenditureHistory: { note: string; evidenceTier: EvidenceTier; sources: FundingSource[] };
  countyAwardLedger: {
    publicDashboardExists: boolean;
    masterLedgerLocation: string;
    researchStatus: string;
    countyBudgetBreadcrumbs: boolean;
    knownCountyReferences: CountyAwardRecord[];
    sosHistoricalCountyList: {
      source: string;
      url: string;
      fullyFunded2015_2016: string[];
      additionalFunded2016: string[];
      fiftyFifty2017: string[];
      pendingAtPresentation: string[];
      documented50_50Pending: string[];
      sosExpendedThroughPresentation: number;
      countiesExpendedThroughPresentation: number;
      evidenceTier: EvidenceTier;
    };
    deliveryTypes: string[];
  };
  recordsRequest: {
    title: string;
    exactAsk: string;
    alsoRequest: string[];
    framing: string;
    evidenceTier: EvidenceTier;
  };
  sosOutreach: {
    recommendedContact: string;
    approach: string;
    openingScript: string;
    questionsToAsk: string[];
    doNotOpenWith: string[];
    strategicGoal: string;
    evidenceTier: EvidenceTier;
  };
  debateStrategy: {
    kellyFrame: string;
    hammerLikelyFrame: string;
    hammerTrapQuestion: string;
    hammerRebuttalIfHeCounters: string;
    packoAngle: string;
    doNotSay: string[];
    fairPublicLine: string;
    trapLaneHref: string;
    relatedHref: string;
  };
  verifiedClaimsForLedger: Array<{
    claimText: string;
    classification: "VERIFIED" | "NEEDS_REVIEW";
    sourceHint: string;
  }>;
};

let cache: CountyElectionFundingResearch | null = null;

export function loadCountyElectionFundingResearch(): CountyElectionFundingResearch {
  if (cache) return cache;
  const abs = path.join(process.cwd(), "data/intelligence/county-voting-system-grant-fund-research.json");
  cache = JSON.parse(fs.readFileSync(abs, "utf8")) as CountyElectionFundingResearch;
  return cache;
}

export function formatFundingAmount(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)} million`;
  return `$${n.toLocaleString("en-US")}`;
}

export function listVerifiedAppropriations() {
  return loadCountyElectionFundingResearch().appropriations.filter((a) => a.evidenceTier === "VERIFIED_FACT");
}

export function getFundingDebateBrief() {
  const r = loadCountyElectionFundingResearch();
  return {
    headline: "County Voting System Grant Fund — SOS-controlled election equipment funding",
    verifiedTotals: listVerifiedAppropriations().map((a) => ({
      fy: a.fiscalYear,
      line: a.lineItem,
      amount: formatFundingAmount(a.amount),
      act: a.act,
    })),
    kellyTrap: r.debateStrategy.hammerTrapQuestion,
    fairLine: r.debateStrategy.fairPublicLine,
    missingResearch: r.countyAwardLedger.researchStatus,
  };
}
