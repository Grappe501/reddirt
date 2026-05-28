import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { loadExecutiveCommandReadiness, loadExecutiveCommandState } from "./executiveCommandStateBuilder";
import { executiveBriefBuilder } from "./executiveBriefBuilder";

export type ExecutiveCommandRuntime = {
  generatedAt: string;
  countyCount: number;
  statewide: {
    campaignHealth: number;
    readinessAverage: number;
    executiveUrgencyAverage: number;
    blockedAutomationCount: number;
  };
  counties: Array<{
    countySlug: string;
    countyName: string;
    status: "PRESENT" | "MISSING" | "LOW_CONFIDENCE";
    confidence: number;
    executiveBrief: string;
    requiredHumanApprovals: string[];
  }>;
};

export function buildExecutiveCommandRuntime(): ExecutiveCommandRuntime {
  const state = loadExecutiveCommandState();
  const readinessRows = loadExecutiveCommandReadiness().rows;
  const counties = ARKANSAS_COUNTY_REGISTRY.map((county) => {
    const stateRow = state.counties.find((x) => x.countySlug === county.slug);
    const readinessRow = readinessRows.find((x) => x.countySlug === county.slug);
    const brief = executiveBriefBuilder(county.slug);
    const status = stateRow?.status ?? readinessRow?.commandStateReady ?? "MISSING";
    return {
      countySlug: county.slug,
      countyName: county.displayName,
      status,
      confidence: stateRow?.confidence ?? 0,
      executiveBrief: brief.readinessSummary,
      requiredHumanApprovals: brief.requiredHumanApprovals,
    };
  });

  return {
    generatedAt: state.generatedAt,
    countyCount: counties.length,
    statewide: state.statewideSummary,
    counties,
  };
}

