/**
 * Victory OS Sprint 4 — Victory Board intelligence for agents and CM copilot.
 */

import { composeVictoryBoardViewModel } from "./victory-board/compose-victory-board-view-model";
import { loadVictoryBoardSnapshot } from "./victory-board/load-victory-board-snapshot";
import { composeMondayBriefAgentContext } from "./mission-brief-intelligence";

export function composeVictoryBoardAgentContext(weekKey?: string) {
  const vm = composeVictoryBoardViewModel(weekKey);
  const snapshot = loadVictoryBoardSnapshot();
  return {
    publicationSafety: "INTERNAL_DRAFT" as const,
    humanReviewRequired: true as const,
    sprint: 4 as const,
    layer: "victory_board" as const,
    weekKey: vm.weekKey,
    intelligenceNarrative: vm.intelligenceNarrative,
    statewide: vm.statewide,
    electionDaysRemaining: vm.electionDaysRemaining,
    topDecisionsSummary: vm.topDecisions.slice(0, 5).map((d) => ({
      rank: d.rank,
      county: d.county,
      recommendation: d.recommendation,
      status: d.status,
      deploymentPriority: d.deploymentPriority,
    })),
    regionRollups: vm.regionRollups.slice(0, 8),
    countiesAtRisk: vm.countiesAtRisk.slice(0, 6).map((c) => ({
      county: c.county,
      opsStatus: c.opsStatus,
      electoralImportance: c.electoralImportance,
      deploymentPriority: c.deploymentPriority.deploymentPriority,
    })),
    strategicOpportunities: vm.strategicOpportunities.slice(0, 6).map((c) => ({
      county: c.county,
      opportunityLevel: c.opportunityLevel,
      deploymentPriority: c.deploymentPriority.deploymentPriority,
    })),
    chartIds: vm.charts.map((c) => c.id),
    mapLayerDefault: vm.mapLayerDefault,
    boardUrl: "/admin/victory-board",
    mondayBriefUrl: `/admin/mission-brief?week=${vm.weekKey}`,
    snapshotAge: snapshot?.generatedAt ?? null,
    mondayBriefContext: composeMondayBriefAgentContext(vm.weekKey),
    guardrails: [
      "Victory Board displays intelligence derived from Top 10 decisions — not raw CRM or calendar.",
      "Map layers are advisory until CM approves decisions.",
      "INTERNAL_DRAFT — leadership review required for deployment.",
    ],
  };
}

export function victoryBoardExecutiveSummary(weekKey?: string): string {
  const vm = composeVictoryBoardViewModel(weekKey);
  const lines = [
    vm.intelligenceNarrative,
    "",
    "Regional priority (avg deployment score):",
  ];
  for (const r of vm.regionRollups.slice(0, 5)) {
    lines.push(`  ${r.regionLabel}: ${r.avgDeploymentPriority} · ${r.topDecisionCount} in Top 10 · ${r.redOpsCount} red ops`);
  }
  lines.push("", `Board: /admin/victory-board?week=${vm.weekKey}`);
  return lines.join("\n");
}

export { composeVictoryBoardViewModel };
