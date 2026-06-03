import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import { generateOppositionDebateBriefPack } from "@/lib/intelligence/briefs/oppositionDebateBriefGenerator";
import { summarizeDebateCommandMessaging } from "@/lib/intelligence/campaignMessagingIntelligence";
import { summarizeCampaignIntelligenceGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import { summarizeDebateScenarioPrep } from "@/lib/intelligence/strategicScenarioSimulation";
import { buildMessageIntelligenceEngine } from "@/lib/intelligence/messageIntelligence/messageIntelligenceEngine";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";

const emptyFilmRoom = {
  directClipCount: 0,
  legislativeClipCount: 0,
  referenceClipCount: 0,
  coverageGaps: ["Film room data unavailable — check opposition JSON on deploy"],
  archiveHonestyNote: "Archive not loaded",
  items: [] as { id: string; title: string }[],
};

const emptyState = {
  todayPriorities: [] as { title: string; value: string; detail: string }[],
  readinessScores: [] as { id: string; label: string; score: number; scoreConfidence: string }[],
  opponentIntelligence: { repeatedPhrases: [], emergingAngles: [], newestResearch: [] },
  academyTracks: [] as string[],
  messagePillars: [] as string[],
  filmRoom: emptyFilmRoom,
  opposition: { totalBills: 0, riskClaims: ["Opposition data unavailable"] },
  profile: { electoralHistory: { openGaps: [] }, mediaFootprint: { openGaps: [] } },
  oppositionArchive: null,
  legislativeVideo: { videoCandidatesTotal: 0, chunkCount: 0, automationNote: "", topHammerCommitteeQuotes: [] },
};

export function loadSafeDebateCommandPageData() {
  const state = tryIntelligenceLoad("debate-command-state", () => buildDebateCommandCenterState(), emptyState);
  const briefPack = tryIntelligenceLoad("debate-brief-pack", () => generateOppositionDebateBriefPack(), {
    debatePrep: { confidenceScore: 0, status: "UNAVAILABLE", recommendedMessaging: [], researchGaps: [], riskWarnings: [] },
    opposition: { confidenceScore: 0, researchGaps: [], riskWarnings: [] },
    rapidResponse: { confidenceScore: 0, publishabilityStatus: "NON_PUBLISHABLE" },
  });
  const civicDebate = tryIntelligenceLoad("debate-messaging", () => summarizeDebateCommandMessaging(), {
    headline: "Messaging rollup unavailable",
  });
  const graphSummary = tryIntelligenceLoad("intel-graph", () => summarizeCampaignIntelligenceGraph(), {
    nodeCount: 0,
    edgeCount: 0,
  });
  const scenarioPrep = tryIntelligenceLoad("scenario-prep", () => summarizeDebateScenarioPrep(), {
    scenarios: [],
    headline: "Scenario prep unavailable",
  });
  const messageIntel = tryIntelligenceLoad("message-intel", () => buildMessageIntelligenceEngine(), {
    readinessScore: 0,
    debateMessageLanes: [],
    phrasesToAvoid: [],
    claimsNeedingCitation: [],
  });
  const legislativeRollup = tryIntelligenceLoad("legislative-video", () => buildLegislativeVideoIntelligenceRollup(), {
    videoCandidatesTotal: 0,
    chunkCount: 0,
    debateUsefulChunks: [],
    tooRiskyToUse: [],
    automationNote: "Legislative video rollup unavailable",
  });

  return { state, briefPack, civicDebate, graphSummary, scenarioPrep, messageIntel, legislativeRollup };
}
