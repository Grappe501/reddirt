import fs from "node:fs";
import path from "node:path";

export type Vvsg20Education = {
  version: number;
  generatedAt: string;
  governance: {
    classification: string;
    publicationSafety: string;
    sourceDocument: { title: string; publisher: string; contributors: string; published: string; url: string };
  };
  executiveSummaryForKelly: string;
  whatIsVvsg20: {
    headline: string;
    plainEnglish: string;
    votingSystemFunctions: string[];
    vvsg20ImprovementsOver10: string[];
    evidenceTier: string;
  };
  certificationPipeline: {
    headline: string;
    steps: Array<{ phase: string; detail: string; timelineNote?: string; arkansasNote?: string; kellySosMove?: string }>;
    federallyCertifiedAsOfReport: Array<{ vendor: string; system: string; certified: string }>;
    inPipeline: string[];
    industryDeploymentEstimate: string;
    evidenceTier: string;
  };
  nationalInventoryFacts: {
    headline: string;
    facts: string[];
    topReplacementMotivators: string[];
    topBarriers: string[];
    evidenceTier: string;
  };
  nationalCostEstimate: {
    headline: string;
    total: number;
    caveats: string[];
    eacFundingRecommendation: string;
    evidenceTier: string;
  };
  arkansasConnection: {
    headline: string;
    processSummary: string;
    statutoryHooks: string[];
    kellyOpportunity: string[];
    sources: Array<{ label: string; url: string }>;
    evidenceTier: string;
  };
  whatKellyShouldKnow: string[];
  debateAndTrailTalkingPoints: {
    kellyFrame: string;
    fairPublicLine: string;
    hammerLikelyFrame: string;
    kellyResponseIfHammerCitesRanking: string;
    kellyResponseIfModeratorAsksVvsg: string;
    trapQuestionForHammer: string;
    doNotSay: string[];
  };
  questionsForSosStaff: string[];
  verifiedClaimsForLedger: Array<{ claimText: string; classification: string; sourceHint: string }>;
};

let cache: Vvsg20Education | null = null;

export function loadVvsg20CandidateEducation(): Vvsg20Education {
  if (cache) return cache;
  const abs = path.join(process.cwd(), "data/intelligence/vvsg-20-eac-education.json");
  cache = JSON.parse(fs.readFileSync(abs, "utf8")) as Vvsg20Education;
  return cache;
}

export function getVvsg20DebateBrief() {
  const r = loadVvsg20CandidateEducation();
  return {
    headline: r.whatIsVvsg20.headline,
    fairLine: r.debateAndTrailTalkingPoints.fairPublicLine,
    trapQuestion: r.debateAndTrailTalkingPoints.trapQuestionForHammer,
    kellyFrame: r.debateAndTrailTalkingPoints.kellyFrame,
    sourceUrl: r.governance.sourceDocument.url,
  };
}
