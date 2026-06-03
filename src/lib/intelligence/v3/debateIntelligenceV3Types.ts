import type { HammerBillRow, ClaimRow, DebateDrillCard } from "@/lib/opposition/kimHammerWorkbench";
import type { V3MarkdownSection } from "@/lib/intelligence/v3/markdownSections";

export type V3BillNarrative = {
  billNumber: string;
  actNumber: string | null;
  title: string;
  plainEnglishSummary: string;
  billNarrative: string;
  countyImpactNarrative: string;
  debateFrames: { kellyFrame: string; hammerFrame: string; countyFrame: string };
  counterArguments: string[];
  supporterArguments: string[];
  publicationRisk: string;
  strategicBriefing: {
    howToMessage: string;
    debateImpact: string;
    whenToUse: string;
    whenNotToUse: string;
  };
};

export type V3DebatePrepSection = {
  id: string;
  title: string;
  bullets: string[];
  paragraphs: string[];
};

export type DebateIntelligenceV3Packet = {
  version: "3.0";
  generatedAt: string;
  hub: {
    totalBills: number;
    enactedActs: number;
    researchConfidenceScore: number;
    topQuestions: string[];
    debateDrillQueue: DebateDrillCard[];
    riskClaims: string[];
    strongestDebateAnchors: HammerBillRow[];
    highConfidenceThemes: Array<{ theme: string; billCount: number }>;
    topContrastThemes: string[];
    reportQuestions: string[];
    countyOfficialConcerns: string[];
    directDemocracyConcerns: string[];
    recommendedNextPass: string[];
    claims: {
      supported: ClaimRow[];
      partial: ClaimRow[];
      needsResearch: ClaimRow[];
    };
  };
  researchLayers: {
    debateProfile: V3MarkdownSection[];
    likelyArguments: V3MarkdownSection[];
    contrastVsKelly: V3MarkdownSection[];
    strengthsWeaknesses: V3MarkdownSection[];
    messageGuidance: V3MarkdownSection[];
    intelligenceGaps: V3MarkdownSection[];
    publicDossier: V3MarkdownSection[];
    kh3DeepResearch: V3MarkdownSection[];
    websiteAnalysis: V3MarkdownSection[];
  };
  billNarratives: V3BillNarrative[];
  debatePrepSections: V3DebatePrepSection[];
  opponentModules: Array<{ id: string; title: string; summary: string; href: string }>;
};
