import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { summarizeDebateScenarioPrep } from "@/lib/intelligence/strategicScenarioSimulation";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { buildDebateFilmRoomState } from "@/lib/opposition/debateFilmRoom";

export type ComputedReadinessScore = {
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
    | "mediaReadiness"
    | "philosophyStrategyWiring";
  label: string;
  score: number;
  trend: "up" | "flat" | "down";
  weakAreas: string[];
  nextModule: string;
  whyThisScore: string;
  scoreConfidence: "LOW" | "MEDIUM" | "HIGH";
  raiseScoreToday: string[];
  computedFrom: string[];
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function confidenceFromInputs(inputCount: number, gapPenalty: number): "LOW" | "MEDIUM" | "HIGH" {
  const base = inputCount >= 5 ? 2 : inputCount >= 3 ? 1 : 0;
  const adj = gapPenalty > 3 ? -1 : gapPenalty > 1 ? 0 : 1;
  const v = base + adj;
  if (v >= 2) return "HIGH";
  if (v >= 1) return "MEDIUM";
  return "LOW";
}

export function computeDebateReadinessScores(): ComputedReadinessScore[] {
  const opposition = loadKimHammerWorkbench();
  const profile = loadKimHammerProfileWorkbench();
  const kh3 = loadKimHammerKh3Workbench();
  const kh2 = kh3.kh2;
  const evidence = loadKimHammerEvidenceIndex();
  const scenarioPrep = summarizeDebateScenarioPrep();
  const countyBriefings = loadCountyBriefingIntelligenceIndex();
  const filmRoom = buildDebateFilmRoomState();

  const exportReady = evidence.metrics.exportReadyClaims;
  const openTasks = evidence.metrics.retrievalTasks;
  const rebuttalCount = kh2.rebuttalPrep.rebuttals.length;
  const directClips = filmRoom.directClipCount + filmRoom.legislativeClipCount;
  const gapCount = filmRoom.coverageGaps.length + opposition.claimBuckets.needsResearch.length;
  const countyOverlays = countyBriefings.counties.length;

  const electionLawBase =
    40 +
    Math.min(30, opposition.enactedActs * 1.5) +
    Math.min(15, exportReady * 4) -
    opposition.claimBuckets.needsResearch.length * 2;

  const scores: Omit<ComputedReadinessScore, "id">[] = [
    {
      label: "Office mastery",
      score: clamp(45 + exportReady * 5 - openTasks * 1.5),
      trend: exportReady >= 2 ? "up" : "flat",
      weakAreas: ["Deep SOS workflow contrasts need more specific examples."],
      nextModule: "Office & mission",
      whyThisScore: `${exportReady} export-ready claims; ${openTasks} open retrieval tasks.`,
      scoreConfidence: confidenceFromInputs(exportReady + 2, openTasks),
      raiseScoreToday: ["Review export-ready claims in evidence command", "Close one retrieval task"],
      computedFrom: ["kimHammerEvidenceIndex", "kimHammerWorkbench"],
    },
    {
      label: "Election-law mastery",
      score: clamp(electionLawBase),
      trend: opposition.enactedActs >= 25 ? "up" : "flat",
      weakAreas: ["Line-by-line act text references still partial in debate cards."],
      nextModule: "Kim Hammer intelligence",
      whyThisScore: `${opposition.enactedActs} enacted acts indexed; ${opposition.claimBuckets.supported.length} supported claims.`,
      scoreConfidence: confidenceFromInputs(opposition.enactedActs / 5, opposition.claimBuckets.needsResearch.length),
      raiseScoreToday: ["Drill top 3 bill anchors from debate prep", "Verify act text for weakest citation"],
      computedFrom: ["kimHammerWorkbench", "kimHammerEvidenceIndex"],
    },
    {
      label: "Message discipline",
      score: clamp(55 + rebuttalCount * 2 - opposition.riskClaims.length * 3),
      trend: rebuttalCount >= 8 ? "up" : "flat",
      weakAreas: ["Overlong answer risk in hostile follow-up rounds."],
      nextModule: "Message discipline",
      whyThisScore: `${rebuttalCount} rebuttal scripts; ${opposition.riskClaims.length} do-not-say warnings.`,
      scoreConfidence: confidenceFromInputs(rebuttalCount / 3, opposition.riskClaims.length),
      raiseScoreToday: ["Run what-not-to-say detector on debate-ai-workbench", "Practice 30s compression"],
      computedFrom: ["kimHammerKh3Workbench", "kimHammerWorkbench"],
    },
    {
      label: "Emotional composure",
      score: clamp(50 + scenarioPrep.bridgeLineGuidance.length * 2 - scenarioPrep.debateTrapWarnings.length * 4),
      trend: scenarioPrep.debateTrapWarnings.length <= 2 ? "up" : "flat",
      weakAreas: ["High-pressure follow-up tone drills needed."],
      nextModule: "Debate mechanics",
      whyThisScore: `${scenarioPrep.debateTrapWarnings.length} debate trap warnings from NSI-14.`,
      scoreConfidence: confidenceFromInputs(scenarioPrep.bridgeLineGuidance.length, scenarioPrep.debateTrapWarnings.length),
      raiseScoreToday: ["Review scenario simulation debate traps", "Run one hostile follow-up drill"],
      computedFrom: ["strategicScenarioSimulation"],
    },
    {
      label: "County/election-worker fluency",
      score: clamp(35 + countyOverlays * 8 - profile.mediaFootprint.openGaps.length * 5),
      trend: countyOverlays >= 5 ? "up" : "down",
      weakAreas: profile.mediaFootprint.openGaps.slice(0, 2),
      nextModule: "Arkansas politics",
      whyThisScore: `${countyOverlays} county narrative overlays; ${profile.mediaFootprint.openGaps.length} media gaps.`,
      scoreConfidence: confidenceFromInputs(countyOverlays, profile.mediaFootprint.openGaps.length),
      raiseScoreToday: ["Review county briefings for Pulaski/Washington", "Add local clerk sourcing task"],
      computedFrom: ["countyBriefingIntelligence", "kimHammerProfileWorkbench"],
    },
    {
      label: "Debate-response confidence",
      score: clamp(40 + rebuttalCount * 2.5 + exportReady * 3),
      trend: rebuttalCount >= 6 ? "up" : "flat",
      weakAreas: ["30-second answer compression under pressure."],
      nextModule: "Rapid response",
      whyThisScore: `${rebuttalCount} rebuttals; ${exportReady} export-ready evidence items.`,
      scoreConfidence: confidenceFromInputs(rebuttalCount, openTasks),
      raiseScoreToday: ["Complete one debate drill queue card", "Review likely-arguments JSON"],
      computedFrom: ["kimHammerKh3Workbench", "kimHammerEvidenceIndex"],
    },
    {
      label: "Rapid rebuttal readiness",
      score: clamp(38 + rebuttalCount * 2 + scenarioPrep.likelyOpponentAttacks.length),
      trend: "flat",
      weakAreas: ["Need sharper bridges from attack lines to values pillars."],
      nextModule: "Rapid response",
      whyThisScore: `${scenarioPrep.likelyOpponentAttacks.length} modeled opponent attacks; ${rebuttalCount} rebuttals.`,
      scoreConfidence: confidenceFromInputs(rebuttalCount + scenarioPrep.likelyOpponentAttacks.length, 1),
      raiseScoreToday: ["Open rapid-response appendix", "Queue LLM draft for rebuttal-builder (review only)"],
      computedFrom: ["strategicScenarioSimulation", "kimHammerKh3Workbench"],
    },
    {
      label: "Arkansas political fluency",
      score: clamp(42 + opposition.totalBills * 1.2 + countyOverlays * 4),
      trend: "flat",
      weakAreas: ["Rural county examples should be expanded for moderator follow-ups."],
      nextModule: "Arkansas politics",
      whyThisScore: `${opposition.totalBills} bills indexed; ${countyOverlays} geographic overlays.`,
      scoreConfidence: confidenceFromInputs(opposition.totalBills / 10, 2),
      raiseScoreToday: ["Review county exposure map gaps", "Add one rural county local validator note"],
      computedFrom: ["kimHammerWorkbench", "countyBriefingIntelligence"],
    },
    {
      label: "Media readiness",
      score: clamp(25 + directClips * 15 + filmRoom.referenceClipCount * 5 - filmRoom.coverageGaps.length * 8),
      trend: directClips >= 1 ? "flat" : "down",
      weakAreas: filmRoom.coverageGaps.slice(0, 2),
      nextModule: "Media training",
      whyThisScore: `${directClips} direct opponent clips; ${filmRoom.referenceClipCount} reference SOS debate assets; ${filmRoom.coverageGaps.length} film room gaps.`,
      scoreConfidence: directClips >= 2 ? "MEDIUM" : "LOW",
      raiseScoreToday: filmRoom.coverageGaps.slice(0, 2).map((g) => `Close gap: ${g}`),
      computedFrom: ["debateFilmRoom", "kim-hammer-debate-archive-index.json"],
    },
  ];

  const mapped = scores.map((s, i) => ({
    ...s,
    id: (
      [
        "officeMastery",
        "electionLawMastery",
        "messageDiscipline",
        "emotionalComposure",
        "countyFluency",
        "debateResponseConfidence",
        "rapidRebuttalReadiness",
        "arkansasPoliticalFluency",
        "mediaReadiness",
      ] as ComputedReadinessScore["id"][]
    )[i],
  }));

  const overallScore = clamp(mapped.reduce((sum, s) => sum + s.score, 0) / mapped.length);
  const overallWeak = [
    opposition.claimBuckets.needsResearch.length > 0 ? "Claim verification gaps" : null,
    profile.electoralHistory.openGaps.length > 0 ? "Election history gaps" : null,
    directClips < 2 ? "Film room clip archive thin" : null,
  ].filter(Boolean) as string[];

  const overall: ComputedReadinessScore = {
    id: "overall",
    label: "Overall debate readiness",
    score: overallScore,
    trend: overallScore >= 55 ? "up" : "flat",
    weakAreas: overallWeak,
    nextModule: mapped.sort((a, b) => a.score - b.score)[0]?.nextModule ?? "Live simulations",
    whyThisScore: `Mean of ${mapped.length} computed dimension scores; not a self-assessment.`,
    scoreConfidence: confidenceFromInputs(mapped.length, gapCount),
    raiseScoreToday: [
      `Lowest dimension: ${mapped.sort((a, b) => a.score - b.score)[0]?.label ?? "—"}`,
      openTasks > 0 ? `Close ${Math.min(openTasks, 3)} retrieval tasks` : "Run debate drill queue",
      filmRoom.directClipCount < 2 ? "Prioritize video archive retrieval task" : "Review film room clips",
    ],
    computedFrom: mapped.flatMap((s) => s.computedFrom).slice(0, 6),
  };

  return [overall, ...mapped];
}
