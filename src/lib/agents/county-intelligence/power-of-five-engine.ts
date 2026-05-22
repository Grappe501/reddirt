import {
  STATEWIDE_POWER_OF_FIVE_GOAL,
  loadCountyPowerOfFive,
  loadStatewideCountySummary,
  listCountyWorkbenchCounties,
} from "./county-workbench-adapter";
import type { PowerOfFiveCountySummary } from "./county-kpi-types";

export function summarizePowerOfFiveForCounty(slug: string): PowerOfFiveCountySummary | null {
  const p5 = loadCountyPowerOfFive(slug);
  const row = listCountyWorkbenchCounties().find((c) => c.countySlug === slug);
  if (!p5 || !row) return null;

  const gap = p5.goal != null && p5.current != null ? p5.goal - p5.current : p5.goal;
  const progress =
    p5.goal != null && p5.current != null && p5.goal > 0 ? Math.round((p5.current / p5.goal) * 100) : null;

  const priority: PowerOfFiveCountySummary["priority"] =
    gap != null && gap > 5000 ? "high" : gap != null && gap > 1500 ? "medium" : "low";

  return {
    countySlug: row.countySlug,
    countyName: row.countyName,
    goal: p5.goal,
    current: p5.current,
    gap: gap ?? null,
    progressPercent: progress,
    priority,
    recommendations: [
      "After each event: ask attendees to bring five people into the relational network",
      "Log new contacts in hot wash — feeds county memory",
      row.workbenchDepth === "shell" ? "Upgrade county profile before scaling Power of 5 asks" : "Pair with county leader for host recruitment",
    ],
    source: p5.source,
  };
}

export function summarizeStatewidePowerOfFiveGaps(limit = 15): PowerOfFiveCountySummary[] {
  return listCountyWorkbenchCounties()
    .map((c) => summarizePowerOfFiveForCounty(c.countySlug))
    .filter((s): s is PowerOfFiveCountySummary => s != null)
    .sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0))
    .slice(0, limit);
}

export function buildPowerOfFiveBriefing(): {
  statewideGoal: number;
  topGaps: PowerOfFiveCountySummary[];
  narrative: string;
} {
  const statewide = loadStatewideCountySummary();
  const topGaps = summarizeStatewidePowerOfFiveGaps(10);
  return {
    statewideGoal: STATEWIDE_POWER_OF_FIVE_GOAL,
    topGaps,
    narrative: `Power of 5 statewide planning target: ${STATEWIDE_POWER_OF_FIVE_GOAL.toLocaleString()} relational contacts. ${
      statewide.bridgeAvailable ? "County goals derived from planning proxy until governance sheet connects." : "countyWorkbench bridge unavailable — set COUNTY_WORKBENCH_ROOT."
    }`,
  };
}
