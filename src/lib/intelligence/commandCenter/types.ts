import type { HumanActionOwnerRole, HumanActionQueueItem } from "@/lib/intelligence/types/humanActionQueue";
import type { HumanActionQueueSummary } from "@/lib/intelligence/types/humanActionQueue";
import type { CampaignIntelligenceBrainState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import type { InstitutionalMemorySummary } from "@/lib/intelligence/institutionalMemory/types";
import type { ReadinessScore } from "@/lib/opposition/debateCommandCenter";

export type CommandCenterInstitutionalMemoryStrip = {
  memoryHealthScore: number;
  memoryHealthDetail: string;
  recentDecisionTitles: string[];
  recentLessonTitles: string[];
  recentRecommendationTitles: string[];
  topPatterns: string[];
  emergingLessons: string[];
  weeklyReflectionStatus: InstitutionalMemorySummary["weeklyReflectionStatus"];
  href: string;
};

export type CommandCenterReadinessCard = {
  id: string;
  label: string;
  score: number;
  detail: string;
  href?: string;
};

export type CommandCenterChangeSignal = {
  label: string;
  detail: string;
  source: string;
  isSnapshot: boolean;
};

export type CommandCenterReviewBacklog = {
  llmDraftPending: number;
  humanActionRecommended: number;
  citationWarnings: number;
  blockedPublicUse: number;
  mediaFindingsPending: number;
  topReviewItem: string;
  governanceLabels: string[];
};

export type CommandCenterEvidenceControl = {
  totalClaims: number;
  exportReadyClaims: number;
  reviewNeededClaims: number;
  blockedClaims: number;
  citationProblems: string[];
  unsupportedWarnings: string[];
  publicUseBlocked: string[];
  exportReadyUnchangedNote: string;
};

export type CommandCenterWarRoomStrip = {
  opponentStatus: string;
  debateReadinessScore: number;
  debateWeakAreas: string[];
  rapidResponseReadiness: number;
  rapidResponseSignals: string[];
  attackLineWarnings: string[];
  approvalBeforeResponse: string[];
  hrefs: {
    evidenceCommand: string;
    debateCommand: string;
    debatePrep: string;
    mediaIntake: string;
  };
};

export type CommandCenterScenarioWatch = {
  totalScenarios: number;
  topRiskTitle: string;
  topRiskSignal: string;
  lowConfidenceNotes: string[];
  assumptionCalibration: string[];
  reviewPoints: string[];
  href: string;
};

export type CommandCenterWeeklyPacket = {
  status: "live" | "placeholder";
  packetId?: string;
  generatedAt?: string;
  generatedBy?: string;
  publicationSafety?: "NON_PUBLISHABLE";
  humanReviewRequired?: true;
  message?: string;
  sourceSystemsUsed?: string[];
  topIntelligencePriorities?: string[];
  countyRisks?: string[];
  debateReadinessMovement?: string[];
  oppositionResearchGaps?: string[];
  recommendedHumanActions?: string[];
  unresolvedClaimRisks?: string[];
  messagingOpportunities?: string[];
  governanceWarnings?: string[];
  notVerifiedNeedsHumanReview?: string[];
  confidenceSummary?: string;
  relatedHrefs: string[];
};

export type IntelligenceCommandCenterSnapshot = {
  generatedAt: string;
  governanceBanner: string[];
  readinessCards: CommandCenterReadinessCard[];
  changeSignals: CommandCenterChangeSignal[];
  reviewBacklog: CommandCenterReviewBacklog;
  actionQueue: HumanActionQueueSummary;
  actionQueueTop: HumanActionQueueItem[];
  evidence: CommandCenterEvidenceControl;
  scenarioWatch: CommandCenterScenarioWatch;
  warRoom: CommandCenterWarRoomStrip;
  leadershipFocus: string[];
  kellyFocus: string[];
  weeklyPacket: CommandCenterWeeklyPacket;
  institutionalMemory: CommandCenterInstitutionalMemoryStrip;
  brain: CampaignIntelligenceBrainState;
  debateReadinessScores: ReadinessScore[];
  sourceLinks: {
    morningBrief: string;
    actionQueue: string;
    evidenceCommand: string;
    llmReview: string;
    scenarioSimulation: string;
    mediaIntake: string;
    targetPathway: string;
    briefingPapers: string;
    campaignMemory: string;
  };
};

export const COMMAND_CENTER_ROLES: Array<HumanActionOwnerRole | "All"> = [
  "All",
  "Research",
  "Citation Desk",
  "Debate Prep",
  "Comms",
  "Field",
  "Strategy",
  "Legal/Compliance",
  "Candidate Prep",
  "Media Monitoring",
];
