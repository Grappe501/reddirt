/**
 * Debate Prep v8 — world-class readiness engine.
 * Unifies intensive progress, forum intel, scenarios, trap/SOS depth, and prep modes.
 */
import "server-only";

import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_DEBATE_PREP_WAR_ROOM_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_TRAP_LANES_HREF,
  epDebateTechniqueHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-route-map";
import { pickSmartTrapLane } from "@/lib/election-plan/debatePrepSmartTrapLane";
import { DEBATE_DATE, DEBATE_WEEK_INTENSIVE_DAYS } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import {
  computeDebateIntensiveReadiness,
  listAllDrillDownLanes,
} from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { loadKellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";
import { loadKellyDebatePackageProgress } from "@/lib/intelligence/v4/kellyDebatePackageProgress";
import type { ForumTranscriptIntelSlice } from "@/lib/intelligence/v4/forumTranscriptIntel";
import { countForumDrillQueueCards } from "@/lib/intelligence/v4/forumTranscriptRehearsalCards";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { summarizeDebateScenarioPrep } from "@/lib/intelligence/strategicScenarioSimulation";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";

export type DebatePrepReadinessDimensionId =
  | "intensive-progress"
  | "forum-intel"
  | "trap-lanes"
  | "sos-speak-order"
  | "tutor-rehearsal"
  | "techniques"
  | "stage-psychology"
  | "scenario-traps";

export type DebatePrepReadinessDimension = {
  id: DebatePrepReadinessDimensionId;
  label: string;
  score: number;
  target: number;
  status: "green" | "amber" | "red";
  fixHref: string;
  fixLabel: string;
};

export type DebatePrepModeId =
  | "full-dress-90"
  | "t24h-war-room"
  | "t1h-backstage"
  | "panic-5"
  | "opening-closing"
  | "pile-on-survival"
  | "clerk-audience"
  | "moot-court";

export type DebatePrepModeCard = {
  modeId: DebatePrepModeId;
  label: string;
  tagline: string;
  minutes: number;
  href: string;
  whenToUse: string;
  accent: "navy" | "gold" | "rose" | "violet" | "cyan";
};

export type PileOnScenario = {
  scenarioId: string;
  title: string;
  beats: Array<{ speaker: string; line: string; kellyBeat: string }>;
  href: string;
  durationMinutes: number;
};

export type QuotableLine = {
  lineId: string;
  text: string;
  source: string;
  stageSafe: boolean;
  topic: string;
};

export type WeakSpot = {
  spotId: string;
  label: string;
  severity: "high" | "medium" | "low";
  fixHref: string;
  fixAction: string;
};

export type StagePsychologyCue = {
  cueId: string;
  title: string;
  trigger: string;
  protocol: string;
  seconds: number;
};

export type DebatePrepScenarioPrepSlice = {
  debateTrapWarnings: string[];
  likelyOpponentAttacks: string[];
  whatNotToSay: string[];
  bridgeLineGuidance: string[];
};

export type DebatePrepWorldClassEngineSlice = {
  daysUntilDebate: number;
  countdownLabel: string;
  compositeReadinessScore: number;
  compositeReadinessLabel: string;
  readinessRadar: DebatePrepReadinessDimension[];
  prepModes: DebatePrepModeCard[];
  pileOnScenarios: PileOnScenario[];
  quotableBank: QuotableLine[];
  weakSpots: WeakSpot[];
  stagePsychology: StagePsychologyCue[];
  scenarioPrep: DebatePrepScenarioPrepSlice;
  smartTrapLaneId: string;
  tonightStepsCompleted: number;
  tonightStepsTotal: number;
  worldClassDressCardCount: number;
};

function parseReferenceDate(referenceDate?: string): Date {
  const raw = referenceDate ?? process.env.DEBATE_WEEK_TODAY ?? "2026-06-19";
  return new Date(`${raw}T12:00:00`);
}

export { pickSmartTrapLane } from "@/lib/election-plan/debatePrepSmartTrapLane";

export function computeDaysUntilDebate(referenceDate?: string): number {
  const ref = parseReferenceDate(referenceDate);
  const debate = new Date(`${DEBATE_DATE}T12:00:00`);
  const ms = debate.getTime() - ref.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function dimensionStatus(score: number, target: number): "green" | "amber" | "red" {
  if (score >= target) return "green";
  if (score >= target - 15) return "amber";
  return "red";
}

export function buildDebatePrepReadinessRadar(
  forumIntel: ForumTranscriptIntelSlice,
  referenceDate?: string,
): DebatePrepReadinessDimension[] {
  const progress = loadKellyDebateIntensiveProgress();
  const intensive = computeDebateIntensiveReadiness(progress);
  const packageProgress = loadKellyDebatePackageProgress();
  const forumCards = countForumDrillQueueCards();
  const trapCount = getAllTrapLaneIds().length;
  const sosCount = getAllSosDebateQuestionIds().length;
  const lanesTotal = listAllDrillDownLanes().length;
  const lanesDone = progress.completedLanes.length;

  const scenario = tryIntelligenceLoad("debate-scenario-prep", () => summarizeDebateScenarioPrep(), {
    debateTrapWarnings: [],
    likelyOpponentAttacks: [],
    whatNotToSay: [],
    bridgeLineGuidance: [],
    countySensitiveNotes: [],
    doctrineSafeResponseNotes: [],
    evidenceDependencies: [],
    weakCitationWarnings: [],
  });

  const forumScore = forumIntel.ready ? 95 : forumIntel.transcriptReady ? 45 : 10;
  const trapScore = Math.min(100, Math.round((trapCount / 6) * 70 + (intensive.percent > 50 ? 30 : 10)));
  const sosScore = Math.min(100, Math.round((sosCount / 35) * 80 + 10));
  const tutorScore = forumCards > 0 ? 88 : 55;
  const techniquesScore = forumIntel.ready ? 85 : 60;
  const stageScore = packageProgress.completedStepIds.length >= 3 ? 80 : 45;
  const scenarioScore = scenario.debateTrapWarnings.length > 0 ? 75 : 50;

  return [
    {
      id: "intensive-progress" as const,
      label: "7-day intensive",
      score: intensive.percent,
      target: 70,
      status: dimensionStatus(intensive.percent, 70),
      fixHref: epDebatePrepDayHref("day-6-full-simulation"),
      fixLabel: "Open Day 6 simulation",
    },
    {
      id: "forum-intel" as const,
      label: "Forum intel",
      score: forumScore,
      target: 80,
      status: dimensionStatus(forumScore, 80),
      fixHref: EP_FORUM_TRANSCRIPT_LAB_HREF,
      fixLabel: forumIntel.ready ? "Review forum lab" : "Run forum analysis",
    },
    {
      id: "trap-lanes" as const,
      label: "Trap lanes",
      score: trapScore,
      target: 75,
      status: dimensionStatus(trapScore, 75),
      fixHref: EP_TRAP_LANES_HREF,
      fixLabel: "Rehearse trap lanes",
    },
    {
      id: "sos-speak-order" as const,
      label: "SOS speak-order",
      score: sosScore,
      target: 70,
      status: dimensionStatus(sosScore, 70),
      fixHref: `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=sos-speak-order&card=1`,
      fixLabel: "Run SOS queue",
    },
    {
      id: "tutor-rehearsal" as const,
      label: "Tutor + rehearsal",
      score: tutorScore,
      target: 75,
      status: dimensionStatus(tutorScore, 75),
      fixHref: `${EP_DEBATE_PREP_TUTOR_HREF}?mode=three-way-panel`,
      fixLabel: "Start tutor session",
    },
    {
      id: "techniques" as const,
      label: "Techniques library",
      score: techniquesScore,
      target: 65,
      status: dimensionStatus(techniquesScore, 65),
      fixHref: EP_DEBATE_TECHNIQUES_HREF,
      fixLabel: "Refresh techniques",
    },
    {
      id: "stage-psychology" as const,
      label: "Stage psychology",
      score: stageScore,
      target: 70,
      status: dimensionStatus(stageScore, 70),
      fixHref: EP_DEBATE_PREP_WAR_ROOM_HREF,
      fixLabel: "Run psychology stack",
    },
    {
      id: "scenario-traps" as const,
      label: "Scenario traps",
      score: scenarioScore,
      target: 65,
      status: dimensionStatus(scenarioScore, 65),
      fixHref: EP_DEBATE_PREP_WAR_ROOM_HREF,
      fixLabel: "Review scenario traps",
    },
  ].map((d) =>
    d.id === "intensive-progress" && lanesTotal > 0
      ? {
          ...d,
          score: Math.round((intensive.percent + (lanesDone / lanesTotal) * 100) / 2),
        }
      : d,
  );
}

export function buildDebatePrepModeCatalog(forumIntel: ForumTranscriptIntelSlice): DebatePrepModeCard[] {
  const forumQueue = `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=forum-acca-tonight&card=1`;
  const dressQueue = `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=world-class-dress&card=1`;

  return [
    {
      modeId: "full-dress-90",
      label: "Full dress · 90 min",
      tagline: "Opening, three trap lanes, five SOS questions, forum capitalize, closing — staff plays Hammer and Pakko.",
      minutes: 90,
      href: dressQueue,
      whenToUse: "Day 6 simulation block or T-48h — stress inoculation before travel.",
      accent: "navy",
    },
    {
      modeId: "t24h-war-room",
      label: "T-24h war room",
      tagline: "Readiness radar, tonight package, quotable bank, scenario traps — no new material.",
      minutes: 45,
      href: EP_DEBATE_PREP_WAR_ROOM_HREF,
      whenToUse: "Night before debate — verify safe lines only.",
      accent: "gold",
    },
    {
      modeId: "t1h-backstage",
      label: "T-1h backstage",
      tagline: "Opening once, one trap pivot, reset line, water protocol — voice preservation.",
      minutes: 15,
      href: `${EP_DEBATE_PREP_TUTOR_HREF}?mode=panic-5`,
      whenToUse: "Backstage — calm composure, not content cramming.",
      accent: "cyan",
    },
    {
      modeId: "panic-5",
      label: "Panic · 5 min",
      tagline: "One decision: trap lane or SOS question. Say it twice. Walk on stage.",
      minutes: 5,
      href: `${EP_DEBATE_PREP_TUTOR_HREF}?mode=panic-5`,
      whenToUse: "Under 10 minutes to stage — adrenaline spike.",
      accent: "rose",
    },
    {
      modeId: "opening-closing",
      label: "Opening + closing only",
      tagline: "Three reps each — unity spine, county bridge, quotable close. No mid-debate drills.",
      minutes: 20,
      href: `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=sos-speak-order&card=1`,
      whenToUse: "Day 7 refine — steal the show with calm competence.",
      accent: "violet",
    },
    {
      modeId: "pile-on-survival",
      label: "Pile-on survival",
      tagline: "Hammer bites → Pakko agrees → moderator asks Kelly — speak-order under pressure.",
      minutes: 25,
      href: `${EP_DEBATE_PREP_WAR_ROOM_HREF}#pile-on`,
      whenToUse: "Three-way dynamics when both opponents align on a trap.",
      accent: "violet",
    },
    {
      modeId: "clerk-audience",
      label: "Clerk audience mode",
      tagline: "ACCA panel tone — clerks in the room, not partisan crowd. County harm first.",
      minutes: 30,
      href: forumIntel.ready ? forumQueue : EP_FORUM_TRANSCRIPT_LAB_HREF,
      whenToUse: "County forums, ACCA panels, clerk-heavy audiences.",
      accent: "cyan",
    },
    {
      modeId: "moot-court",
      label: "Moot court · 45 min",
      tagline: "Professor cross-exam after every answer — forensic rubric on claims.",
      minutes: 45,
      href: `${EP_DEBATE_PREP_TUTOR_HREF}?mode=moot-court`,
      whenToUse: "Major prep day — adversarial follow-up after full queue.",
      accent: "navy",
    },
  ];
}

export function buildPileOnScenarios(forumIntel: ForumTranscriptIntelSlice): PileOnScenario[] {
  const q1 = forumIntel.predictedQuestions[0] ?? "Secretary of State is about implementation — who pays when mandates hit clerks?";
  const hammer = forumIntel.hammerThemes[0] ?? "2021 integrity package";
  const pakko = forumIntel.pakkoThemes[0] ?? "reform from outside the duopoly";

  return [
    {
      scenarioId: "pile-on-integrity",
      title: "Both agree on integrity — Kelly adds county burden",
      durationMinutes: 8,
      href: epTrapLaneHref("integrity-without-participation"),
      beats: [
        { speaker: "Hammer", line: `"Integrity is the job — I've delivered on ${hammer}."`, kellyBeat: "Listen — do not interrupt. Eyes on moderator." },
        { speaker: "Pakko", line: `"I agree we need clean elections and ${pakko}."`, kellyBeat: "Expected — prepare fresh add, not repeat." },
        { speaker: "Moderator", line: `"Ms. Grappe, same question — unfunded mandates?"`, kellyBeat: "Answer moderator only. One clerk example + SOS pledge." },
      ],
    },
    {
      scenarioId: "pile-on-experience",
      title: "Experience stack — Kelly contrasts means not motive",
      durationMinutes: 7,
      href: epTrapLaneHref("experience-equals-sos-ready"),
      beats: [
        { speaker: "Hammer", line: '"Decades of service mean I know the building."', kellyBeat: "Acknowledge service — pivot to clerk training funding." },
        { speaker: "Pakko", line: '"Experience in Little Rock is not the same as fresh eyes."', kellyBeat: "Do not attack Pakko — add administrator readiness line." },
        { speaker: "Moderator", line: q1.slice(0, 120), kellyBeat: "Direct answer first — 45 seconds max." },
      ],
    },
    {
      scenarioId: "pile-on-culture-war",
      title: "Culture-war bait — 15-second decline then pivot",
      durationMinutes: 6,
      href: epDebateTechniqueHref("culture-war"),
      beats: [
        { speaker: "Hammer", line: '"Will you disavow the radical agenda in your party?"', kellyBeat: "15-second decline — no hot words repeated." },
        { speaker: "Moderator", line: '"Dr. Pakko, same topic?"', kellyBeat: "Let Pakko talk — breathe." },
        { speaker: "Moderator", line: '"Ms. Grappe — SOS job, not culture war."', kellyBeat: "Bill, county, transparency pledge within 10 seconds." },
      ],
    },
  ];
}

export function buildQuotableLineBank(forumIntel: ForumTranscriptIntelSlice): QuotableLine[] {
  const lines: QuotableLine[] = [];

  for (const [i, move] of forumIntel.capitalizeMoves.slice(0, 5).entries()) {
    lines.push({
      lineId: `forum-cap-${i}`,
      text: move.kellyLine,
      source: "ACCA forum capitalize",
      stageSafe: true,
      topic: move.trigger.slice(0, 60),
    });
  }

  for (const laneId of getAllTrapLaneIds().slice(0, 3)) {
    const lane = getTrapLaneDrillDown(laneId);
    if (!lane) continue;
    const pivot = lane.kellyPivotDeep || lane.rebuttalScripts[0]?.contrast;
    if (pivot) {
      lines.push({
        lineId: `trap-${laneId}`,
        text: pivot.slice(0, 220),
        source: lane.title,
        stageSafe: !lane.claimsGate.includes("NEEDS_REVIEW"),
        topic: "Trap pivot",
      });
    }
  }

  lines.push({
    lineId: "unity-spine",
    text: "I'm running to run the office — a service desk for seventy-five counties that educates and unites, not a culture-war pulpit.",
    source: "Master frame",
    stageSafe: true,
    topic: "Unity bridge",
  });

  return lines.slice(0, 12);
}

export function buildWeakSpotRadar(
  radar: DebatePrepReadinessDimension[],
  forumIntel: ForumTranscriptIntelSlice,
): WeakSpot[] {
  const spots: WeakSpot[] = [];

  for (const dim of radar.filter((d) => d.status === "red")) {
    spots.push({
      spotId: dim.id,
      label: `${dim.label} below target (${dim.score}% / ${dim.target}%)`,
      severity: "high",
      fixHref: dim.fixHref,
      fixAction: dim.fixLabel,
    });
  }

  for (const dim of radar.filter((d) => d.status === "amber")) {
    spots.push({
      spotId: dim.id,
      label: `${dim.label} needs one more pass`,
      severity: "medium",
      fixHref: dim.fixHref,
      fixAction: dim.fixLabel,
    });
  }

  if (!forumIntel.ready && forumIntel.transcriptReady) {
    spots.push({
      spotId: "forum-analysis",
      label: "Forum transcript ready — analysis not run",
      severity: "high",
      fixHref: EP_FORUM_TRANSCRIPT_LAB_HREF,
      fixAction: "Run deep analysis",
    });
  }

  const progress = loadKellyDebateIntensiveProgress();
  if (!progress.completedDays.includes("day-6-full-simulation")) {
    spots.push({
      spotId: "day-6-sim",
      label: "Day 6 full simulation not marked complete",
      severity: "medium",
      fixHref: epDebatePrepDayHref("day-6-full-simulation"),
      fixAction: "Schedule 90-min dress rehearsal",
    });
  }

  return spots.slice(0, 8);
}

export function buildStagePsychologyStack(): StagePsychologyCue[] {
  return [
    {
      cueId: "pre-walk-breath",
      title: "4-4-6 breath before first word",
      trigger: "Standing at podium / mic check",
      protocol: "Inhale 4 · hold 4 · exhale 6. Feet planted. First sentence under twelve words.",
      seconds: 14,
    },
    {
      cueId: "volume-drop",
      title: "Voice drop on bait",
      trigger: "Hammer raises volume or interrupts",
      protocol: "Lower half a level. Eyes on moderator. 'I'll finish the question you asked.'",
      seconds: 5,
    },
    {
      cueId: "water-reset",
      title: "Water / reset signal",
      trigger: "Staff pre-briefed hand signal or time pressure",
      protocol: "One sip. One breath. One sentence shorter than last answer.",
      seconds: 8,
    },
    {
      cueId: "if-stuck-reset",
      title: "If-stuck reset line",
      trigger: "Brain freeze or lost thread",
      protocol: "'Let me answer directly.' + safe fact (non-partisan SOS · 75 counties) + bridge.",
      seconds: 10,
    },
    {
      cueId: "post-pivot-stop",
      title: "Stop talking after pivot",
      trigger: "Trap pivot delivered",
      protocol: "One pivot sentence. Half-beat pause. Hands still. Do not explain the pivot.",
      seconds: 3,
    },
    {
      cueId: "backstage-opening",
      title: "Backstage opening rep",
      trigger: "T-60 min in green room",
      protocol: "Opening once only — not twice. Save voice for stage.",
      seconds: 45,
    },
  ];
}

export function buildScenarioPrepSlice(): DebatePrepScenarioPrepSlice {
  const scenario = tryIntelligenceLoad("debate-scenario-prep-v8", () => summarizeDebateScenarioPrep(), {
    debateTrapWarnings: [],
    likelyOpponentAttacks: [],
    whatNotToSay: [],
    bridgeLineGuidance: [],
    countySensitiveNotes: [],
    doctrineSafeResponseNotes: [],
    evidenceDependencies: [],
    weakCitationWarnings: [],
  });
  return {
    debateTrapWarnings: scenario.debateTrapWarnings.slice(0, 6),
    likelyOpponentAttacks: scenario.likelyOpponentAttacks.slice(0, 5),
    whatNotToSay: scenario.whatNotToSay.slice(0, 6),
    bridgeLineGuidance: scenario.bridgeLineGuidance.slice(0, 4),
  };
}

export function buildDebatePrepWorldClassEngine(
  forumIntel: ForumTranscriptIntelSlice,
  referenceDate?: string,
): DebatePrepWorldClassEngineSlice {
  const daysUntilDebate = computeDaysUntilDebate(referenceDate);
  const radar = buildDebatePrepReadinessRadar(forumIntel, referenceDate);
  const compositeReadinessScore = Math.round(
    radar.reduce((s, d) => s + d.score, 0) / Math.max(1, radar.length),
  );

  let compositeReadinessLabel = "Building foundation";
  if (compositeReadinessScore >= 85) compositeReadinessLabel = "World-class · stage ready";
  else if (compositeReadinessScore >= 72) compositeReadinessLabel = "Debate ready · polish weak spots";
  else if (compositeReadinessScore >= 55) compositeReadinessLabel = "On track · run tonight package";

  const countdownLabel =
    daysUntilDebate === 0
      ? "Debate day"
      : daysUntilDebate === 1
        ? "T-1 day"
        : `T-${daysUntilDebate} days`;

  const packageProgress = loadKellyDebatePackageProgress();
  const prepModes = buildDebatePrepModeCatalog(forumIntel);

  return {
    daysUntilDebate,
    countdownLabel,
    compositeReadinessScore,
    compositeReadinessLabel,
    readinessRadar: radar,
    prepModes,
    pileOnScenarios: buildPileOnScenarios(forumIntel),
    quotableBank: buildQuotableLineBank(forumIntel),
    weakSpots: buildWeakSpotRadar(radar, forumIntel),
    stagePsychology: buildStagePsychologyStack(),
    scenarioPrep: buildScenarioPrepSlice(),
    smartTrapLaneId: pickSmartTrapLane(forumIntel),
    tonightStepsCompleted: packageProgress.completedStepIds.length,
    tonightStepsTotal: 0,
    worldClassDressCardCount: 0,
  };
}
