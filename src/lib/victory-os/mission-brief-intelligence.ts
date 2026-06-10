/**
 * Victory OS Sprint 3 — Mission Brief UI intelligence for agents.
 */

import { composeMondayBriefViewModel } from "./mission-brief/compose-monday-brief-view-model";
import { buildDecisionEngineAgentContext } from "./decision-engine-intelligence";
import { buildCountyMissionAgentContext } from "./mission-framework-intelligence";

export function composeMondayBriefAgentContext(weekKey?: string) {
  const vm = composeMondayBriefViewModel(weekKey);
  return {
    publicationSafety: "INTERNAL_DRAFT" as const,
    humanReviewRequired: true as const,
    sprint: 3 as const,
    layer: "monday_brief_ui" as const,
    weekKey: vm.weekKey,
    electionCountdown: vm.electionCountdown,
    readiness: vm.readiness,
    deltaSummary: vm.delta?.summaryLines ?? [],
    topThreeDecisions: vm.brief.topDecisions.slice(0, 3).map((d) => ({
      rank: d.rank,
      county: d.county,
      recommendation: d.recommendation,
      status: d.status,
    })),
    statewideSummary: vm.brief.statewideVictory.summary,
    seasonLabel: vm.currentSeasonLabel,
    briefUrl: "/admin/mission-brief",
    printUrl: `/admin/mission-brief/print?week=${vm.weekKey}`,
    decisionContext: buildDecisionEngineAgentContext(vm.weekKey),
    missionContext: buildCountyMissionAgentContext(),
    guardrails: [
      "Monday Brief is the Campaign OS home — not the calendar.",
      "CM must approve decisions before execution.",
      "Print view is INTERNAL_DRAFT only.",
    ],
  };
}

export function mondayBriefExecutiveSummary(weekKey?: string): string {
  const vm = composeMondayBriefViewModel(weekKey);
  const lines = [
    `Monday Brief · week ${vm.weekKey} · ${vm.electionCountdown.label}`,
    vm.brief.statewideVictory.summary,
    `CM approval: ${vm.readiness.approvalPct}% (${vm.readiness.pending} pending)`,
    "Top 3:",
  ];
  for (const d of vm.brief.topDecisions.slice(0, 3)) {
    lines.push(`  ${d.rank}. ${d.county} — ${d.recommendation} [${d.status}]`);
  }
  return lines.join("\n");
}

export { composeMondayBriefViewModel };
