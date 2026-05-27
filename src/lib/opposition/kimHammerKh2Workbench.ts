import fs from "node:fs";
import path from "node:path";
import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

type EvidenceStatus =
  | "VERIFIED_FACT"
  | "REPORTED_CLAIM"
  | "INTERPRETATION"
  | "RESEARCH_QUESTION"
  | "NEEDS_REVIEW";

type SourceConfidence = "LOW" | "MEDIUM" | "HIGH";

type WebsitePage = {
  url: string;
  pageTitle: string;
  capturedAt: string;
  rawText: string;
  headings: string[];
  claims: string[];
  repeatedPhrases: string[];
  policyPromises: string[];
  valuesLanguage: string[];
  electionOrSosClaims: string[];
  sourceConfidence: SourceConfidence;
};

type WebsitePagesFile = {
  generatedAt: string;
  pages: WebsitePage[];
};

type StrengthsMatrixFile = {
  generatedAt: string;
  strengths: Array<{
    id: string;
    strength: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
    sources: string[];
  }>;
};

type VulnerabilityMatrixFile = {
  generatedAt: string;
  weaknesses: Array<{
    id: string;
    weakness: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    debateUsefulness: "LOW" | "MEDIUM" | "HIGH";
    saferWording: string;
    sources: string[];
  }>;
};

type ContrastFile = {
  generatedAt: string;
  contrastFrames: Array<{
    frame: string;
    hammerPositionSummary: string;
    kellyContrast: string;
    evidenceStatus: EvidenceStatus;
    sources: string[];
    sourceConfidence: SourceConfidence;
  }>;
};

type DebateProfileFile = {
  generatedAt: string;
  entries: Array<{
    topic: string;
    likelyHammerArgument: string;
    kellyResponseFrame: string;
    supportingFacts: string[];
    bridgeLine: string;
    riskyPhrasingToAvoid: string;
    practiceQuestion: string;
    answer30: string;
    answer60: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
};

type LikelyArgumentsFile = {
  generatedAt: string;
  arguments: Array<{
    id: string;
    argument: string;
    evidenceHeMayCite: string[];
    sourceAnchors: string[];
  }>;
};

type RebuttalPrepFile = {
  generatedAt: string;
  rebuttals: Array<{
    prompt: string;
    agreeWhereValid: string;
    contrastMethod: string;
    kellyBridge: string;
    sourceCategory: string;
    evidenceStatus: EvidenceStatus;
  }>;
};

type IntelligenceGapsFile = {
  generatedAt: string;
  gaps: Array<{
    id: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    description: string;
    evidenceStatus: EvidenceStatus;
  }>;
};

type MessageAnalysisFile = {
  generatedAt: string;
  candidateFrame: {
    primary: string;
    secondary: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  };
  messageThemes: Array<{
    theme: string;
    strength: "LOW" | "MEDIUM" | "HIGH";
    evidenceStatus: EvidenceStatus;
    sources: string[];
  }>;
  riskyMessagingAreas: Array<{
    risk: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
};

type PublicClaimsIndexFile = {
  generatedAt: string;
  claims: Array<{
    claimId: string;
    statement: string;
    source: string;
    sourceUrl: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
    notes: string;
  }>;
};

type SourceConfidenceMapFile = {
  generatedAt: string;
  sourceConfidence: Array<{
    sourceCategory: string;
    confidence: SourceConfidence;
    examples: string[];
  }>;
};

type WebsiteMessageIndexFile = {
  generatedAt: string;
  repeatedPhrases: Array<{ phrase: string; occurrences: number; evidenceStatus: EvidenceStatus }>;
  campaignFrameSummary: {
    label: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  };
  valuesLanguage: string[];
  policyPromises: string[];
  contrastImplications: Array<{
    pattern: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
};

type WebsiteClaimsReviewFile = {
  generatedAt: string;
  claims: Array<{
    claim: string;
    source: string;
    evidenceStatus: EvidenceStatus;
    factCheckStatus: string;
    notes: string;
  }>;
};

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

function readText(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

export function loadKimHammerKh2Workbench() {
  const profile = loadKimHammerProfileWorkbench();
  const election = loadKimHammerWorkbench();

  const websitePages = readJson<WebsitePagesFile>(
    "data/opposition/kim-hammer-profile/website/kim-hammer-website-pages.json",
  );
  const websiteFulltext = readText(
    "data/opposition/kim-hammer-profile/website/kim-hammer-website-fulltext.txt",
  );
  const websiteMessageIndex = readJson<WebsiteMessageIndexFile>(
    "data/opposition/kim-hammer-profile/website/kim-hammer-website-message-index.json",
  );
  const websiteClaimsReview = readJson<WebsiteClaimsReviewFile>(
    "data/opposition/kim-hammer-profile/website/kim-hammer-website-claims-review.json",
  );
  const strengths = readJson<StrengthsMatrixFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-strengths-matrix.json",
  );
  const vulnerabilities = readJson<VulnerabilityMatrixFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-vulnerability-matrix.json",
  );
  const contrast = readJson<ContrastFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-contrast-vs-kelly.json",
  );
  const debateProfile = readJson<DebateProfileFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-debate-profile.json",
  );
  const likelyArguments = readJson<LikelyArgumentsFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-likely-arguments.json",
  );
  const rebuttalPrep = readJson<RebuttalPrepFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-rebuttal-prep.json",
  );
  const intelligenceGaps = readJson<IntelligenceGapsFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-intelligence-gaps.json",
  );
  const messageAnalysis = readJson<MessageAnalysisFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-message-analysis.json",
  );
  const publicClaims = readJson<PublicClaimsIndexFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-public-claims-index.json",
  );
  const sourceConfidenceMap = readJson<SourceConfidenceMapFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-source-confidence-map.json",
  );

  const dashboardSummary = {
    websitePagesCaptured: websitePages.pages.length,
    repeatedPhraseCount: websiteMessageIndex.repeatedPhrases.length,
    topStrengths: strengths.strengths.slice(0, 4),
    topWeaknesses: vulnerabilities.weaknesses.slice(0, 5),
    topContrastPoints: contrast.contrastFrames.slice(0, 3),
    riskiestClaimsToAvoid: [
      ...election.riskClaims.slice(0, 3),
      ...vulnerabilities.weaknesses.filter((w) => w.riskLevel === "HIGH").map((w) => w.saferWording),
    ].slice(0, 6),
    debatePrepPriority: debateProfile.entries.slice(0, 2).map((entry) => entry.practiceQuestion),
    highPriorityGaps: intelligenceGaps.gaps.filter((gap) => gap.priority === "HIGH"),
    sourceConfidence: sourceConfidenceMap.sourceConfidence,
  };

  return {
    profile,
    election,
    websitePages,
    websiteFulltext,
    websiteMessageIndex,
    websiteClaimsReview,
    strengths,
    vulnerabilities,
    contrast,
    debateProfile,
    likelyArguments,
    rebuttalPrep,
    intelligenceGaps,
    messageAnalysis,
    publicClaims,
    sourceConfidenceMap,
    dashboardSummary,
  };
}

