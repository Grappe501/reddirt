import "server-only";

import { listCuratedBillPlaybookNumbers } from "@/lib/intelligence/v4/debateBillOperatorPlaybooks";
import { listAllBillNumbersFromIndex } from "@/lib/intelligence/v4/billActProofDepth";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { buildTrapLaneStepCoverage } from "@/lib/intelligence/v4/trapLaneStepCoverage";
import { KELLY_ATTACK_VECTORS } from "@/lib/intelligence/v4/kellyCandidateResearchDepth";
import { KELLY_OFFENSIVE_MOVES } from "@/lib/intelligence/v4/kellyOffensiveApproachDepth";
import { OPPONENT_TRAP_LANES } from "@/lib/intelligence/v4/kellyOpponentContrastPlaybook";
import {
  INTEGRITY_2021_PACKAGE_DEPTH,
  PETITION_2025_CLUSTER_DEPTH,
} from "@/lib/intelligence/v4/integrityPackageDepth";
import type { OppositionStrategyLayerPacket } from "@/lib/intelligence/v4/oppositionStrategyLayerTypes";
import { computeOppositionOffenseReadinessPct } from "@/lib/intelligence/v4/oppositionStrategyLayerMetrics";

function trapLaneCoveragePct(laneId: string): number {
  const d = getTrapLaneDrillDown(laneId)!;
  const coverage = buildTrapLaneStepCoverage(d);
  const fields = [
    d.rebuttalScripts.length >= 1,
    d.whatToExpectHammerToSay.length >= 3,
    coverage.steps.length >= 6,
    !!d.encounterDepth?.whatToExpectPlain,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export function loadOppositionStrategyLayerPacket(): OppositionStrategyLayerPacket {
  const trapIds = getAllTrapLaneIds();
  const curated = listCuratedBillPlaybookNumbers().length;
  const totalBills = listAllBillNumbersFromIndex().length;
  const curatedBillPct = Math.round((curated / totalBills) * 100);

  const trapLanes = trapIds.map((id, i) => {
    const drill = getTrapLaneDrillDown(id)!;
    const trap = OPPONENT_TRAP_LANES[i] ?? OPPONENT_TRAP_LANES[0];
    return {
      id,
      title: drill.title,
      stepCoveragePct: trapLaneCoveragePct(id),
      href: `/admin/intelligence/trap-lanes/${id}`,
      baitLine: trap.baitLineYouWantFromOpponent,
      kellyPivot: trap.kellyPivotWhenHeBites,
    };
  });

  const crossExamStarters = [
    INTEGRITY_2021_PACKAGE_DEPTH.debateTrap.setupQuestion,
    ...OPPONENT_TRAP_LANES.slice(0, 5).map((t) => t.moderatorOrKellySetupQuestion),
  ].filter(Boolean);

  return {
    version: "6.2-opposition-strategy-layer",
    generatedAt: new Date().toISOString(),
    overallOffenseReadiness: computeOppositionOffenseReadinessPct(),
    curatedBillPct,
    integrity2021BillCount: INTEGRITY_2021_PACKAGE_DEPTH.billAnchors.length,
    petition2025BillCount: PETITION_2025_CLUSTER_DEPTH.billAnchors.length,
    trapLanes,
    offensiveMoves: KELLY_OFFENSIVE_MOVES.map((m) => ({
      id: m.id,
      name: m.name,
      whenToUse: m.whenToUse,
      execution: m.execution,
      secondRound: m.secondRoundKelly,
    })),
    defenseVectors: KELLY_ATTACK_VECTORS.map((v) => ({
      id: v.id,
      title: v.title,
      prepPriority: v.prepPriority,
      verificationStatus: v.verificationStatus,
      href: "/admin/intelligence/kelly-debate-coaching",
    })),
    crossExamStarters,
    debateDayOffenseSequence: [
      {
        phase: "Pre-debate offense lock",
        minutes: 30,
        steps: [
          { label: "2021 package continuity trap", href: "/admin/intelligence/opposition-strategy" },
          { label: "Trap lane speak-order drill", href: "/admin/intelligence/trap-lanes" },
          { label: "Offensive move rehearsal (6 moves)", href: "/admin/intelligence/kelly-debate-coaching" },
        ],
      },
      {
        phase: "Stage offense",
        minutes: 90,
        steps: [
          { label: "Integrity-funding trap on first Hammer act cite", href: "/admin/intelligence/election-funding" },
          { label: "Author vs administrator contrast", href: "/admin/intelligence/kelly-debate-coaching" },
          { label: "Cross-exam bank pivot", href: "/admin/intelligence/film-room" },
        ],
      },
      {
        phase: "Spin room offense",
        minutes: 20,
        steps: [
          { label: "Claims gate new lines", href: "/admin/intelligence/claims" },
          { label: "Build progress gap log", href: "/admin/intelligence/build-progress" },
        ],
      },
    ],
    governanceLabel: "INTERNAL_DRAFT · NON_PUBLISHABLE · OPPOSITION STRATEGY v6.2",
  };
}

export { INTEGRITY_2021_PACKAGE_DEPTH, PETITION_2025_CLUSTER_DEPTH };
