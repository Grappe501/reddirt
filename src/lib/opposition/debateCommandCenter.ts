import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { computeDebateReadinessScores, type ComputedReadinessScore } from "@/lib/opposition/debateReadinessSignals";
import { buildDebateFilmRoomState } from "@/lib/opposition/debateFilmRoom";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { loadOppositionArchiveRollup } from "@/lib/opposition/oppositionBriefConfidence";

export type ReadinessScore = ComputedReadinessScore;

export function buildDebateCommandCenterState() {
  const opposition = loadKimHammerWorkbench();
  const profile = loadKimHammerProfileWorkbench();
  const filmRoom = buildDebateFilmRoomState();
  const readinessScores = computeDebateReadinessScores();
  const oppositionArchive = loadOppositionArchiveRollup();
  const legislativeVideo = buildLegislativeVideoIntelligenceRollup();

  const weakConfidenceAreas = [
    opposition.claimBuckets.needsResearch.length > 0 ? "Claim verification gaps" : null,
    profile.electoralHistory.openGaps.length > 0 ? "Election history gaps" : null,
    profile.mediaFootprint.openGaps.length > 0 ? "Media archive gaps" : null,
    filmRoom.directClipCount < 2 ? "Film room clip archive thin" : null,
  ].filter(Boolean) as string[];

  const lowest = [...readinessScores].sort((a, b) => a.score - b.score)[0];

  const todayPriorities = [
    {
      title: "Topics needing practice",
      value: `${opposition.topQuestions.length} high-probability prompts`,
      detail: "Prioritize county burden, integrity/access balance, and SOS philosophy.",
    },
    {
      title: "Weak confidence areas",
      value: `${weakConfidenceAreas.length} flagged`,
      detail: weakConfidenceAreas.join("; "),
    },
    {
      title: "Likely attack lines",
      value: `${opposition.topContrastThemes.length} active contrast lanes`,
      detail: "Control vs trust, regulation vs service, conflict vs neutral administration.",
    },
    {
      title: "Highest-risk claims",
      value: `${opposition.riskClaims.length} do-not-say warnings`,
      detail: opposition.riskClaims.slice(0, 1).join(" "),
    },
    {
      title: "Film room status",
      value: `${filmRoom.directClipCount} media + ${filmRoom.legislativeClipCount} legislative`,
      detail: filmRoom.archiveHonestyNote,
    },
    {
      title: "Legislative video intelligence",
      value: `${legislativeVideo.videoCandidatesTotal} candidates · ${legislativeVideo.chunkCount} chunks`,
      detail: legislativeVideo.automationNote,
    },
    {
      title: "Top committee quotes",
      value: `${legislativeVideo.topHammerCommitteeQuotes.length} indexed`,
      detail: legislativeVideo.topHammerCommitteeQuotes[0] ?? "Run legislature:intelligence:run",
    },
    {
      title: "Next drill module",
      value: lowest?.nextModule ?? "Live simulations",
      detail: lowest ? `${lowest.label} score ${lowest.score}/100 (${lowest.scoreConfidence} confidence)` : "Run debate drill queue",
    },
    {
      title: "Raise score today",
      value: lowest?.raiseScoreToday[0] ?? "Review evidence command",
      detail: lowest?.whyThisScore ?? "Computed from opposition corpus + scenario engine.",
    },
  ];

  const opponentIntelligence = {
    repeatedPhrases: [
      "#1 in the nation for election integrity",
      "most secure place to vote in the country",
      "standing strong",
    ],
    emergingAngles: opposition.topQuestions,
    newestResearch: opposition.strongestDebateAnchors.map((row) => `${row.billNumber} / Act ${row.actNumber ?? "MISSING"}`),
  };

  const academyTracks = [
    "Office & mission",
    "Arkansas politics",
    "Kim Hammer intelligence",
    "Message discipline",
    "Debate mechanics",
    "Rapid response",
    "Live simulations",
    "Media training",
    "Election week war room",
  ];

  return {
    opposition,
    profile,
    readinessScores,
    todayPriorities,
    opponentIntelligence,
    academyTracks,
    messagePillars: [
      "Trust & Transparency",
      "Support Counties & Election Workers",
      "Participation + Integrity Together",
    ],
    filmRoom,
    oppositionArchive,
    legislativeVideo,
  };
}
