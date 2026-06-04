import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import { generateOppositionDebateBriefPack } from "@/lib/intelligence/briefs/oppositionDebateBriefGenerator";
import { summarizeDebateCommandMessaging } from "@/lib/intelligence/campaignMessagingIntelligence";
import { summarizeCampaignIntelligenceGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import { summarizeDebateScenarioPrep } from "@/lib/intelligence/strategicScenarioSimulation";
import { buildMessageIntelligenceEngine } from "@/lib/intelligence/messageIntelligence/messageIntelligenceEngine";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { loadDebateWarRoomP4Packet } from "@/lib/intelligence/v4/debateWarRoomP4";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";

type DebateCommandState = ReturnType<typeof buildDebateCommandCenterState>;
type OppositionDebateBriefPack = ReturnType<typeof generateOppositionDebateBriefPack>;
type DebateCommandMessaging = ReturnType<typeof summarizeDebateCommandMessaging>;
type CampaignGraphSummary = ReturnType<typeof summarizeCampaignIntelligenceGraph>;
type DebateScenarioPrep = ReturnType<typeof summarizeDebateScenarioPrep>;
type MessageIntelligenceRollup = ReturnType<typeof buildMessageIntelligenceEngine>;
type LegislativeVideoRollup = ReturnType<typeof buildLegislativeVideoIntelligenceRollup>;

const EMPTY_DEBATE_COMMAND_STATE = {
  todayPriorities: [],
  readinessScores: [],
  opponentIntelligence: { repeatedPhrases: [], emergingAngles: [], newestResearch: [] },
  academyTracks: [],
  messagePillars: [],
  filmRoom: {
    generatedAt: new Date().toISOString(),
    directClipCount: 0,
    referenceClipCount: 0,
    legislativeClipCount: 0,
    coverageGaps: ["Film room data unavailable — check opposition JSON on deploy"],
    archiveHonestyNote: "Archive not loaded",
    items: [],
    topHammerCommitteeQuotes: [],
    billsWithTranscriptCoverage: [],
    speakerVerificationWarnings: [],
  },
} as unknown as DebateCommandState;

const EMPTY_BRIEF_PACK = {
  debatePrep: {
    confidenceScore: 0,
    status: "BLOCKED",
    recommendedMessaging: [],
    researchGaps: ["Debate brief unavailable"],
    riskWarnings: [],
    briefId: "debate-prep-fallback",
  },
  opposition: { confidenceScore: 0, researchGaps: [], riskWarnings: [] },
  rapidResponse: { confidenceScore: 0, publishabilityStatus: "NOT_PUBLISHABLE" },
} as unknown as OppositionDebateBriefPack;

const EMPTY_DEBATE_MESSAGING = {
  flaggedBills: [],
  philosophyConsistency: [],
  strategicRiskWarnings: [],
} as unknown as DebateCommandMessaging;

const EMPTY_GRAPH_SUMMARY = {
  entityCount: 0,
  entityTypeCounts: {},
  billCount: 0,
  narrativeCount: 0,
  doctrineCount: 0,
  philosophyCount: 0,
} as unknown as CampaignGraphSummary;

const EMPTY_SCENARIO_PREP = {
  likelyOpponentAttacks: [],
  debateTrapWarnings: [],
  evidenceDependencies: [],
  weakCitationWarnings: [],
  whatNotToSay: [],
  bridgeLineGuidance: [],
  countySensitiveNotes: [],
  doctrineSafeResponseNotes: [],
} as unknown as DebateScenarioPrep;

const EMPTY_MESSAGE_INTEL = {
  readinessScore: 0,
  debateMessageLanes: [],
  phrasesToAvoid: [],
  claimsNeedingCitation: [],
  strongestQuotes: [],
} as unknown as MessageIntelligenceRollup;

const EMPTY_LEGISLATIVE_ROLLUP = {
  videoCandidatesTotal: 0,
  chunkCount: 0,
  debateUsefulChunks: [],
  tooRiskyToUse: [],
  strongestQuotes: [],
  automationNote: "Legislative video rollup unavailable",
} as unknown as LegislativeVideoRollup;

const LAUNCH_MODE_DEBATE_COMMAND_DATA = {
  state: EMPTY_DEBATE_COMMAND_STATE,
  briefPack: EMPTY_BRIEF_PACK,
  civicDebate: EMPTY_DEBATE_MESSAGING,
  graphSummary: EMPTY_GRAPH_SUMMARY,
  scenarioPrep: EMPTY_SCENARIO_PREP,
  messageIntel: EMPTY_MESSAGE_INTEL,
  legislativeRollup: EMPTY_LEGISLATIVE_ROLLUP,
};

function buildLaunchDebateCommandFromP4() {
  const p4 = loadDebateWarRoomP4Packet();
  const lowest = [...p4.readinessScores].sort((a, b) => a.score - b.score)[0];
  return {
    state: {
      ...EMPTY_DEBATE_COMMAND_STATE,
      filmRoom: p4.filmRoom,
      readinessScores: p4.readinessScores,
      todayPriorities: p4.todayPriorities,
      opponentIntelligence: {
        repeatedPhrases: ["#1 in the nation for election integrity", "most secure place to vote"],
        emergingAngles: p4.crossExamBank.slice(0, 3).map((r) => r.question),
        newestResearch: p4.argumentLibrary.slice(0, 3).map((a) => a.hammerLine.slice(0, 80)),
      },
      messagePillars: [],
      academyTracks: ["Debate prep", "Film room drills", "Claims gate", "Scenario traps"],
    } as DebateCommandState,
    briefPack: {
      debatePrep: {
        confidenceScore: p4.readinessScores.find((r) => r.id === "debateResponseConfidence")?.score ?? 55,
        status: "INTERNAL_DRAFT",
        recommendedMessaging: p4.argumentLibrary.slice(0, 4).map((a) => a.kellyBridge),
        researchGaps: p4.filmRoom.coverageGaps,
        riskWarnings: p4.whatNotToSay,
        briefId: "debate-p4-launch",
      },
      opposition: {
        confidenceScore: p4.readinessScores.find((r) => r.id === "overall")?.score ?? 62,
        researchGaps: p4.filmRoom.coverageGaps,
        riskWarnings: [],
      },
      rapidResponse: { confidenceScore: 0, publishabilityStatus: "NOT_PUBLISHABLE" },
    } as unknown as OppositionDebateBriefPack,
    civicDebate: EMPTY_DEBATE_MESSAGING,
    graphSummary: EMPTY_GRAPH_SUMMARY,
    scenarioPrep: {
      ...EMPTY_SCENARIO_PREP,
      likelyOpponentAttacks: p4.argumentLibrary.map((a) => a.hammerLine).slice(0, 6),
      debateTrapWarnings: p4.scenarioTraps,
      whatNotToSay: p4.whatNotToSay,
      bridgeLineGuidance: p4.argumentLibrary.map((a) => a.kellyBridge).slice(0, 5),
    } as DebateScenarioPrep,
    messageIntel: EMPTY_MESSAGE_INTEL,
    legislativeRollup: {
      ...EMPTY_LEGISLATIVE_ROLLUP,
      chunkCount: p4.filmRoom.legislativeClipCount,
      strongestQuotes: p4.filmRoom.topHammerCommitteeQuotes,
      automationNote: p4.legislativeNote,
    } as LegislativeVideoRollup,
    p4,
    lowestScoreHint: lowest?.raiseScoreToday[0],
  };
}

export function loadSafeDebateCommandPageData() {
  if (isIntelligenceOppositionDebateLaunchMode()) {
    return buildLaunchDebateCommandFromP4();
  }

  const state = tryIntelligenceLoad("debate-command-state", () => buildDebateCommandCenterState(), EMPTY_DEBATE_COMMAND_STATE);
  const briefPack = tryIntelligenceLoad("debate-brief-pack", () => generateOppositionDebateBriefPack(), EMPTY_BRIEF_PACK);
  const civicDebate = tryIntelligenceLoad("debate-messaging", () => summarizeDebateCommandMessaging(), EMPTY_DEBATE_MESSAGING);
  const graphSummary = tryIntelligenceLoad("intel-graph", () => summarizeCampaignIntelligenceGraph(), EMPTY_GRAPH_SUMMARY);
  const scenarioPrep = tryIntelligenceLoad("scenario-prep", () => summarizeDebateScenarioPrep(), EMPTY_SCENARIO_PREP);
  const messageIntel = tryIntelligenceLoad("message-intel", () => buildMessageIntelligenceEngine(), EMPTY_MESSAGE_INTEL);
  const legislativeRollup = tryIntelligenceLoad(
    "legislative-video",
    () => buildLegislativeVideoIntelligenceRollup(),
    EMPTY_LEGISLATIVE_ROLLUP,
  );

  return { state, briefPack, civicDebate, graphSummary, scenarioPrep, messageIntel, legislativeRollup };
}
