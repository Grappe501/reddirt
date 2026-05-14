import "server-only";

import type { CountyWinTargetRow } from "@/lib/election-targets/win-target-types";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";

export type WinTargetToolOutput = {
  statewide: {
    projectedVotes: number;
    target50Plus1: number;
    workingTargetWithCushion: number;
    baselineVotes: number;
    gap: number;
  };
  counties: CountyWinTargetRow[];
  topNeedsData: string[];
  modelWarnings: string[];
};

function aggregateNeedsData(counties: CountyWinTargetRow[], limit: number): string[] {
  const freq = new Map<string, number>();
  for (const c of counties) {
    for (const m of c.missingData) {
      freq.set(m, (freq.get(m) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, n]) => `${k} (${n} counties)`);
}

export function loadWinTargetToolOutput(repoRoot?: string): WinTargetToolOutput | null {
  const scenario = loadKellyWinTargetScenarioFile(repoRoot);
  if (!scenario) return null;
  const { statewide, counties, modelWarnings } = scenario;
  return {
    statewide: {
      projectedVotes: statewide.projectedStatewideVotes,
      target50Plus1: statewide.legalTarget50Plus1,
      workingTargetWithCushion: statewide.workingTargetWithCushion,
      baselineVotes: statewide.statewideBaselineVotes,
      gap: statewide.statewideVoteGap,
    },
    counties,
    topNeedsData: aggregateNeedsData(counties, 12),
    modelWarnings,
  };
}
