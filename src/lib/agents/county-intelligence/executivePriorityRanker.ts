import { loadExecutivePriorityRanking } from "./executiveCommandStateBuilder";

export function executivePriorityRanker() {
  const rows = loadExecutivePriorityRanking().rows
    .slice()
    .sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);
  return { rows };
}

