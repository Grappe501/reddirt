import type { CountyHotWashImpactAnalysis } from "./county-hotwash-impact";

/** Advisory lines to merge into county memory — human approval required before persist. */
export function enrichCountyMemoryFromWorkbench(impact: CountyHotWashImpactAnalysis): string[] {
  return [
    `[countyWorkbench] ${impact.countyName}: momentum ${impact.momentumDelta}`,
    ...impact.memoryEnrichmentLines,
    impact.scheduleAnotherEvent ? "Recommendation: schedule follow-up event (low readiness / high turnout risk)" : "County on track — maintain cadence",
  ];
}
