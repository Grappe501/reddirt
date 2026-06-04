import type { DebateIntelligenceV3Packet, V3DebatePrepSection } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import type { DebateDrillCard } from "@/lib/opposition/kimHammerWorkbench";

export type V4LikelyArgument = {
  id: string;
  argument: string;
  evidenceHeMayCite: string[];
  sourceAnchors: string[];
};

export type V4RebuttalCard = {
  prompt: string;
  agreeWhereValid: string;
  contrastMethod: string;
  kellyBridge: string;
  evidenceStatus: string;
};

export type V4StrengthWeakness = {
  id: string;
  label: string;
  evidenceStatus: string;
  sourceConfidence: string;
  debateUsefulness?: string;
  saferWording?: string;
  sources: string[];
};

export type V4ThemeRow = {
  theme: string;
  label: string;
  billCount: number;
  bills: string[];
};

export type V4TimelineRow = {
  year: string;
  billOrAct: string;
  whatChanged: string;
  hammerRole: string;
  impactCategories: string[];
  sourceConfidence: string;
};

export type V4RetrievalTask = {
  id: string;
  priority: string;
  description: string;
  taskStatus: string;
  closureStatus: string;
  recommendedHumanAction: string;
};

export type V4IntegrityPackage = {
  packageId: string;
  sessionYear: string;
  billNumbers: string[];
  plainEnglishSummary: string;
  narrativeArc: string[];
  strategicBriefing: {
    howToMessage: string;
    debateImpact: string;
    whenToUse: string;
    whenNotToUse: string;
    oppositionSetup: string;
    kellyMessageHelp: string;
  };
};

export type V4RehearsalCard = DebateDrillCard & {
  answer30: string;
  answer60: string;
  rebuttalHint: string;
};

export type V4ExecutiveBrief = {
  headline: string;
  tonightFocus: string[];
  threeMoves: string[];
  confidenceLabel: string;
  archiveConfidenceScore: number;
  archiveConfidenceBasis: string;
};

export type V4ReadinessDimension = {
  id: string;
  label: string;
  score: number;
  note: string;
};

export type DebateIntelligenceV4Packet = Omit<DebateIntelligenceV3Packet, "version"> & {
  version: "4.0";
  executiveBrief: V4ExecutiveBrief;
  readinessScorecard: V4ReadinessDimension[];
  themeMatrix: V4ThemeRow[];
  timeline: V4TimelineRow[];
  likelyArguments: V4LikelyArgument[];
  rebuttalPlaybook: V4RebuttalCard[];
  strengths: V4StrengthWeakness[];
  weaknesses: V4StrengthWeakness[];
  integrity2021: V4IntegrityPackage | null;
  retrievalQueue: V4RetrievalTask[];
  intelligenceGaps: Array<{ id: string; priority: string; description: string; externalMessageReadiness: string }>;
  rapidResponseAssets: Array<{ id: string; category: string; asset: string; verificationStatus: string }>;
  rehearsalDeck: V4RehearsalCard[];
  debatePrepSectionsV4: V3DebatePrepSection[];
};
