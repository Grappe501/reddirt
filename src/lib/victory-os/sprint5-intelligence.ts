/**
 * Victory OS Sprint 5 — unified intelligence for agents.
 */

import { composeDailyBriefViewModel } from "./daily-decisions/load-daily-brief";
import { composeElectionDayViewModel } from "./election-day/compose-election-day-view-model";
import { composeTacticLinkageViewModel } from "./tactic-linkage/load-tactic-linkage";
import { composeVictoryBoardAgentContext } from "./victory-board-intelligence";
import { composeMondayBriefAgentContext } from "./mission-brief-intelligence";

export function composeVictoryOsFullAgentContext(weekKey?: string) {
  const wk = weekKey ?? composeMondayBriefAgentContext(weekKey).weekKey;
  return {
    publicationSafety: "INTERNAL_DRAFT" as const,
    humanReviewRequired: true as const,
    sprint: 5 as const,
    layer: "victory_os_complete" as const,
    mondayBrief: composeMondayBriefAgentContext(wk),
    victoryBoard: composeVictoryBoardAgentContext(wk),
    dailyBrief: composeDailyBriefViewModel(),
    tacticLinkage: composeTacticLinkageViewModel(wk),
    electionDay: composeElectionDayViewModel(),
    guardrails: [
      "Victory OS complete stack — decisions first, calendar downstream.",
      "Election Day ops is separate from calendar.",
      "All turnout numbers advisory until live feed connects.",
    ],
  };
}

export function victoryOsExecutiveSummary(weekKey?: string): string {
  const monday = composeMondayBriefAgentContext(weekKey);
  const board = composeVictoryBoardAgentContext(weekKey);
  const tactics = composeTacticLinkageViewModel(monday.weekKey);
  const daily = composeDailyBriefViewModel();
  const ed = composeElectionDayViewModel();

  return [
    `Victory OS · week ${monday.weekKey}`,
    monday.readiness ? `CM approval ${monday.readiness.approvalPct}%` : "",
    board.intelligenceNarrative,
    tactics.intelligenceNarrative,
    daily.intelligenceNarrative,
    ed.intelligenceNarrative,
  ]
    .filter(Boolean)
    .join("\n");
}
