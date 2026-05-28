import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";

export type ReadinessScore = {
  id:
    | "overall"
    | "officeMastery"
    | "electionLawMastery"
    | "messageDiscipline"
    | "emotionalComposure"
    | "countyFluency"
    | "debateResponseConfidence"
    | "rapidRebuttalReadiness"
    | "arkansasPoliticalFluency"
    | "mediaReadiness";
  label: string;
  score: number;
  trend: "up" | "flat" | "down";
  weakAreas: string[];
  nextModule: string;
};

export function buildDebateCommandCenterState() {
  const opposition = loadKimHammerWorkbench();
  const profile = loadKimHammerProfileWorkbench();

  const weakConfidenceAreas = [
    opposition.claimBuckets.needsResearch.length > 0 ? "Claim verification gaps" : null,
    profile.electoralHistory.openGaps.length > 0 ? "Election history gaps" : null,
    profile.mediaFootprint.openGaps.length > 0 ? "Media archive gaps" : null,
  ].filter(Boolean) as string[];

  const readinessScores: ReadinessScore[] = [
    {
      id: "overall",
      label: "Overall debate readiness",
      score: 71,
      trend: "up",
      weakAreas: weakConfidenceAreas,
      nextModule: "Live simulations",
    },
    {
      id: "officeMastery",
      label: "Office mastery",
      score: 74,
      trend: "flat",
      weakAreas: ["Deep SOS workflow contrasts need more specific examples."],
      nextModule: "Office & mission",
    },
    {
      id: "electionLawMastery",
      label: "Election-law mastery",
      score: 80,
      trend: "up",
      weakAreas: ["Line-by-line act text references still partial in debate cards."],
      nextModule: "Kim Hammer intelligence",
    },
    {
      id: "messageDiscipline",
      label: "Message discipline",
      score: 76,
      trend: "up",
      weakAreas: ["Overlong answer risk in hostile follow-up rounds."],
      nextModule: "Message discipline",
    },
    {
      id: "emotionalComposure",
      label: "Emotional composure",
      score: 69,
      trend: "flat",
      weakAreas: ["High-pressure follow-up tone drills needed."],
      nextModule: "Debate mechanics",
    },
    {
      id: "countyFluency",
      label: "County/election-worker fluency",
      score: 67,
      trend: "down",
      weakAreas: profile.mediaFootprint.openGaps.slice(0, 1),
      nextModule: "Arkansas politics",
    },
    {
      id: "debateResponseConfidence",
      label: "Debate-response confidence",
      score: 73,
      trend: "flat",
      weakAreas: ["30-second answer compression under pressure."],
      nextModule: "Rapid response",
    },
    {
      id: "rapidRebuttalReadiness",
      label: "Rapid rebuttal readiness",
      score: 70,
      trend: "up",
      weakAreas: ["Need sharper bridges from attack lines to values pillars."],
      nextModule: "Rapid response",
    },
    {
      id: "arkansasPoliticalFluency",
      label: "Arkansas political fluency",
      score: 72,
      trend: "flat",
      weakAreas: ["Rural county examples should be expanded for moderator follow-ups."],
      nextModule: "Arkansas politics",
    },
    {
      id: "mediaReadiness",
      label: "Media readiness",
      score: 66,
      trend: "down",
      weakAreas: ["Film-room coverage is growing but still missing a full clip archive."],
      nextModule: "Media training",
    },
  ];

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
      title: "New opposition signal",
      value: `${profile.mediaFootprint.counts.newsItemsIndexed} recent media records`,
      detail: "Track runoff framing and latest election-integrity messaging language.",
    },
    {
      title: "Next mock module",
      value: readinessScores.find((s) => s.score === Math.min(...readinessScores.map((x) => x.score)))?.nextModule ?? "Live simulations",
      detail: "Launch today's drill to reinforce calm, trust, and disciplined answers.",
    },
    {
      title: "Upcoming interview/debate schedule",
      value: "NEEDS_REVIEW",
      detail: "No calendar-linked debate schedule feed integrated yet.",
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
  };
}

