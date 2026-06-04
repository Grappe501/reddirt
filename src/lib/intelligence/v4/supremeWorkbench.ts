import "server-only";

import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { computeIntelligenceBuildProgress } from "@/lib/intelligence/v4/intelligenceBuildProgress";
import { computeLiveReadinessFromHub } from "@/lib/intelligence/v4/liveReadinessScores";
import { enrichFilmRoomWithMediaCatalog } from "@/lib/intelligence/v4/debateFilmRoomEnrichment";
import { buildLaunchFilmRoomState } from "@/lib/intelligence/v4/debateWarRoomP4";
import { OPPONENT_TRAP_LANES } from "@/lib/intelligence/v4/kellyOpponentContrastPlaybook";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { KELLY_OFFENSIVE_MOVES } from "@/lib/intelligence/v4/kellyOffensiveApproachDepth";
import type {
  SupremeWorkbenchDimension,
  SupremeWorkbenchOperatorSequence,
  SupremeWorkbenchOppositionLane,
  SupremeWorkbenchPacket,
  SupremeWorkbenchPriorityAction,
} from "@/lib/intelligence/v4/supremeWorkbenchTypes";

const OPERATOR_SEQUENCES: SupremeWorkbenchOperatorSequence[] = [
  {
    sequenceId: "t-minus-24h",
    label: "T-24 hours — full stack rehearsal",
    phase: "Day before debate",
    estimatedMinutes: 90,
    steps: [
      {
        label: "Opposition strategy layer (v6.2)",
        href: "/admin/intelligence/opposition-strategy",
        why: "2021 package + 2025 petition cluster + trap lane offense map before deep drills.",
      },
      {
        label: "Supreme workbench orientation",
        href: "/admin/intelligence/supreme-workbench",
        why: "Read overall readiness + fix lowest dimension before deep drills.",
      },
      {
        label: "Executive brief + theme matrix",
        href: "/admin/intelligence",
        why: "Lock tonight's focus lines and do-not-say list.",
      },
      {
        label: "28-section debate prep skim",
        href: "/admin/intelligence/kim-hammer/debate-prep",
        why: "Sections 4, 6–8, 19, 28 are highest trap density.",
      },
      {
        label: "Trap lanes + SOS questions",
        href: "/admin/intelligence/trap-lanes",
        why: "Run speak-order drills — never end on agree alone.",
      },
      {
        label: "Film room cross-exam",
        href: "/admin/intelligence/film-room",
        why: "Rehearse pivots with clip honesty labels.",
      },
      {
        label: "Claims gate",
        href: "/admin/intelligence/claims",
        why: "Cut NEEDS_RESEARCH lines before any public adaptation.",
      },
    ],
  },
  {
    sequenceId: "t-minus-2h",
    label: "T-2 hours — stage-ready pass",
    phase: "Pre-arrival",
    estimatedMinutes: 45,
    steps: [
      {
        label: "Debate command scores",
        href: "/admin/intelligence/debate-command",
        why: "Validate live readiness dimensions — no BLOCKED lanes on TV.",
      },
      {
        label: "Kelly debate coaching",
        href: "/admin/intelligence/kelly-debate-coaching",
        why: "Openings, closings, three-way strategy, stage presence.",
      },
      {
        label: "Election funding (clerk week)",
        href: "/admin/intelligence/election-funding",
        why: "CVSGF + HAVA statutory anchors for county audience questions.",
      },
      {
        label: "Anchor bill act-proof",
        href: "/admin/intelligence/kim-hammer/bills/SB250/act-proof",
        why: "Verify Act 350 language before Hammer cites integrity package.",
      },
    ],
  },
  {
    sequenceId: "pre-stage",
    label: "Pre-stage — 15-minute lock",
    phase: "Backstage",
    estimatedMinutes: 15,
    steps: [
      {
        label: "Rehearsal deck (hub)",
        href: "/admin/intelligence",
        why: "One mock question + one rebuttal bridge aloud.",
      },
      {
        label: "Do-not-say + claims",
        href: "/admin/intelligence/claims",
        why: "Final gate — staff headset confirms no NEEDS_RESEARCH lines.",
      },
      {
        label: "Scenario simulation traps",
        href: "/admin/intelligence/scenario-simulation",
        why: "Review trap warnings one last time.",
      },
    ],
  },
  {
    sequenceId: "spin-room",
    label: "Spin room — post-debate",
    phase: "After stage",
    estimatedMinutes: 30,
    steps: [
      {
        label: "Claims ledger review",
        href: "/admin/intelligence/claims",
        why: "Log any new lines spoken — verify before press amplification.",
      },
      {
        label: "Evidence command",
        href: "/admin/intelligence/kim-hammer/evidence-command",
        why: "Staff citation locker for press follow-ups.",
      },
      {
        label: "Build progress flags",
        href: "/admin/intelligence/build-progress",
        why: "Document gaps discovered on stage for next intelligence pass.",
      },
    ],
  },
];

function buildPriorityActions(
  dimensions: SupremeWorkbenchDimension[],
  buildFlags: string[],
): SupremeWorkbenchPriorityAction[] {
  const actions: SupremeWorkbenchPriorityAction[] = [];
  const sorted = [...dimensions].filter((d) => d.id !== "overall").sort((a, b) => a.score - b.score);

  sorted.slice(0, 4).forEach((dim, i) => {
    actions.push({
      rank: i + 1,
      title: `Raise ${dim.label} (${dim.score}/100)`,
      detail: dim.raiseToday[0] ?? dim.weakAreas[0] ?? "Open module and rehearse",
      href: dim.href,
      urgency: dim.score < 60 ? "critical" : dim.score < 75 ? "high" : "medium",
    });
  });

  buildFlags.slice(0, 2).forEach((flag, i) => {
    actions.push({
      rank: actions.length + 1,
      title: "Build gap",
      detail: flag,
      href: "/admin/intelligence/build-progress",
      urgency: i === 0 ? "high" : "medium",
    });
  });

  return actions.slice(0, 6);
}

export function loadSupremeWorkbenchPacket(): SupremeWorkbenchPacket {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const build = computeIntelligenceBuildProgress();
  const filmRoom = enrichFilmRoomWithMediaCatalog(buildLaunchFilmRoomState());
  const liveScores = computeLiveReadinessFromHub(filmRoom);

  const dimensions: SupremeWorkbenchDimension[] = liveScores.map((s) => ({
    id: s.id,
    label: s.label,
    score: s.score,
    trend: s.trend,
    href: s.nextModule.startsWith("/") ? s.nextModule : `/admin/intelligence/${s.nextModule}`,
    raiseToday: s.raiseScoreToday[0] ?? "Rehearse this dimension today",
    weakAreas: s.weakAreas,
    scoreConfidence: s.scoreConfidence,
  }));

  const overall =
    dimensions.find((d) => d.id === "overall")?.score ??
    Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / Math.max(1, dimensions.length));

  const oppositionLanes: SupremeWorkbenchOppositionLane[] = getAllTrapLaneIds().map((laneId, i) => {
    const drill = getTrapLaneDrillDown(laneId)!;
    const trap = OPPONENT_TRAP_LANES[i] ?? OPPONENT_TRAP_LANES[0];
    return {
      id: laneId,
      label: drill.title,
      baitLine: trap.baitLineYouWantFromOpponent,
      kellyPivot: trap.kellyPivotWhenHeBites,
      href: `/admin/intelligence/trap-lanes/${laneId}`,
    };
  });

  const offensiveSummary = KELLY_OFFENSIVE_MOVES.slice(0, 3).map((m) => m.name).join(" · ");

  return {
    version: "6.2-supreme-workbench",
    generatedAt: new Date().toISOString(),
    overallReadiness: overall,
    buildProgressPct: build.overallCompletionPct,
    dimensions,
    operatorSequences: OPERATOR_SEQUENCES,
    priorityActions: buildPriorityActions(dimensions, build.flaggedForMasterBuild.slice(0, 3)),
    oppositionLanes,
    tonightFocus: [
      ...v4.executiveBrief.tonightFocus.slice(0, 3),
      `Offensive lane: ${offensiveSummary}`,
    ],
    doNotSay: [
      ...v4.hub.riskClaims.slice(0, 5),
      "Fraud without sourced proof",
      "Stolen election framing",
    ],
    governanceLabel: "INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED · SUPREME WORKBENCH v6",
  };
}
