/**
 * Client-safe Victory Board pin helpers — no server-only or fs imports.
 */

import { approxCountyCenter } from "@/lib/opportunities/approx-county-center";
import type { CountyVictoryContext, WeeklyCampaignDecision } from "../types";
import { pinStyleForLayer } from "./board-color-maps";
import type { VictoryBoardCountyPin, VictoryBoardMapLayer, VictoryBoardViewModel } from "./types";

function buildDecisionIndex(decisions: WeeklyCampaignDecision[]): Map<string, WeeklyCampaignDecision> {
  return new Map(decisions.map((d) => [d.countySlug, d]));
}

function buildPins(
  counties: CountyVictoryContext[],
  decisionByCounty: Map<string, WeeklyCampaignDecision>,
  layer: VictoryBoardMapLayer,
): VictoryBoardCountyPin[] {
  return counties.map((c) => {
    const decision = decisionByCounty.get(c.countySlug);
    const inTop10 = decision != null;
    const decisionRank = decision?.rank ?? null;
    const center = approxCountyCenter(c.county);
    const style = pinStyleForLayer(layer, {
      deploymentPriority: c.deploymentPriority.deploymentPriority,
      opsStatus: c.opsStatus,
      electoralImportance: c.electoralImportance,
      decisionRank,
      inTop10,
    });
    const tooltipParts = [
      c.displayName,
      `Priority ${c.deploymentPriority.deploymentPriority}`,
      c.opsStatus.toUpperCase(),
      inTop10 ? `#${decisionRank} decision` : "Not in Top 10",
    ];
    return {
      countySlug: c.countySlug,
      county: c.county,
      displayName: c.displayName,
      regionSlug: c.regionSlug,
      lat: center.lat,
      lng: center.lng,
      deploymentPriority: c.deploymentPriority.deploymentPriority,
      opsStatus: c.opsStatus,
      electoralImportance: c.electoralImportance,
      opportunityLevel: c.opportunityLevel,
      organizationalReadiness: c.organizationalReadiness,
      decisionRank,
      inTop10,
      decisionStatus: decision?.status ?? null,
      fillColor: style.fillColor,
      strokeColor: style.strokeColor,
      pinSize: style.pinSize,
      tooltipLine: tooltipParts.join(" · "),
    };
  });
}

/** Rebuild pins when client switches map layer without refetching full VM. */
export function rebuildVictoryBoardPinsForLayer(
  vm: VictoryBoardViewModel,
  layer: VictoryBoardMapLayer,
  counties: CountyVictoryContext[],
): VictoryBoardCountyPin[] {
  const decisionByCounty = buildDecisionIndex(vm.topDecisions);
  return buildPins(counties, decisionByCounty, layer);
}

export { buildDecisionIndex, buildPins };
