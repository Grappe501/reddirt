/**
 * Victory OS Sprint 4 — compose Victory Board from decisions + map intelligence.
 */

import { ARKANSAS_CAMPAIGN_REGIONS } from "@/lib/campaign-engine/regions/arkansas-campaign-regions";
import { approxCountyCenter } from "@/lib/opportunities/approx-county-center";
import { weekKeyFromDate } from "@/lib/calendar/weekly-time";
import { loadVictoryMapStatewideSummary } from "../load-victory-map";
import { composeMondayBriefViewModel } from "../mission-brief/compose-monday-brief-view-model";
import { computeBriefReadiness } from "../mission-brief/compute-brief-readiness";
import { electionCountdown } from "../mission-brief/election-countdown";
import type { CountyVictoryContext, WeeklyCampaignDecision } from "../types";
import { ELECTORAL_COLOR, OPS_COLOR, pinStyleForLayer, priorityToColor } from "./board-color-maps";
import type {
  VictoryBoardChartSeries,
  VictoryBoardCountyPin,
  VictoryBoardMapLayer,
  VictoryBoardRegionRollup,
  VictoryBoardViewModel,
} from "./types";

function regionLabel(slug: string): string {
  return ARKANSAS_CAMPAIGN_REGIONS.find((r) => r.slug === slug)?.displayName ?? slug.replace(/-/g, " ");
}

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

function countBy<T extends string>(items: T[]): Record<T, number> {
  const out = {} as Record<T, number>;
  for (const item of items) {
    out[item] = (out[item] ?? 0) + 1;
  }
  return out;
}

function buildCharts(
  counties: CountyVictoryContext[],
  decisions: WeeklyCampaignDecision[],
  dimensionCounts: ReturnType<typeof loadVictoryMapStatewideSummary>["dimensionCounts"],
): VictoryBoardChartSeries[] {
  const opsCounts = countBy(counties.map((c) => c.opsStatus));
  const decisionStatusCounts = countBy(decisions.map((d) => d.status));

  const electoralBars = (
    ["critical", "important", "helpful", "maintenance"] as const
  ).map((k) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    value: dimensionCounts.electoral[k],
    color: ELECTORAL_COLOR[k],
    pct: dimensionCounts.total > 0 ? Math.round((dimensionCounts.electoral[k] / dimensionCounts.total) * 100) : 0,
  }));

  const opsBars = (["red", "yellow", "green"] as const).map((k) => ({
    label: k === "red" ? "Red ops" : k === "yellow" ? "Yellow ops" : "Green ops",
    value: opsCounts[k] ?? 0,
    color: OPS_COLOR[k],
    pct: counties.length > 0 ? Math.round(((opsCounts[k] ?? 0) / counties.length) * 100) : 0,
  }));

  const priorityBuckets = [
    { label: "75+", min: 75, max: 100, color: priorityToColor(80) },
    { label: "50–74", min: 50, max: 74, color: priorityToColor(60) },
    { label: "30–49", min: 30, max: 49, color: priorityToColor(40) },
    { label: "<30", min: 0, max: 29, color: priorityToColor(20) },
  ].map((b) => ({
    label: b.label,
    value: counties.filter(
      (c) =>
        c.deploymentPriority.deploymentPriority >= b.min &&
        c.deploymentPriority.deploymentPriority <= b.max,
    ).length,
    color: b.color,
  }));

  const statusColors: Record<WeeklyCampaignDecision["status"], string> = {
    approved: "#16a34a",
    pending: "#ca8a04",
    declined: "#71717a",
    modified: "#1d4ed8",
  };
  const decisionBars = (["approved", "pending", "declined", "modified"] as const)
    .filter((k) => (decisionStatusCounts[k] ?? 0) > 0)
    .map((k) => ({
      label: k.charAt(0).toUpperCase() + k.slice(1),
      value: decisionStatusCounts[k] ?? 0,
      color: statusColors[k],
      pct: decisions.length > 0 ? Math.round(((decisionStatusCounts[k] ?? 0) / decisions.length) * 100) : 0,
    }));

  const topCountyBars = decisions.slice(0, 10).map((d) => ({
    label: d.county,
    value: d.deploymentPriority,
    color: priorityToColor(d.deploymentPriority),
  }));

  return [
    { id: "electoral", title: "Electoral importance", subtitle: "75 counties", bars: electoralBars },
    { id: "ops", title: "Ops status", subtitle: "Field readiness signal", bars: opsBars },
    { id: "priority", title: "Deployment priority", subtitle: "Score distribution", bars: priorityBuckets },
    { id: "decisions", title: "Top 10 CM status", subtitle: "This week's decisions", bars: decisionBars },
    { id: "top10", title: "Top 10 priority scores", subtitle: "Decision-ranked counties", bars: topCountyBars },
  ];
}

function buildRegionRollups(
  counties: CountyVictoryContext[],
  decisionByCounty: Map<string, WeeklyCampaignDecision>,
): VictoryBoardRegionRollup[] {
  const byRegion = new Map<string, CountyVictoryContext[]>();
  for (const c of counties) {
    const list = byRegion.get(c.regionSlug) ?? [];
    list.push(c);
    byRegion.set(c.regionSlug, list);
  }

  return [...byRegion.entries()]
    .map(([regionSlug, list]) => {
      const avg =
        list.reduce((s, c) => s + c.deploymentPriority.deploymentPriority, 0) / Math.max(list.length, 1);
      return {
        regionSlug,
        regionLabel: regionLabel(regionSlug),
        countyCount: list.length,
        avgDeploymentPriority: Math.round(avg),
        criticalCount: list.filter((c) => c.electoralImportance === "critical").length,
        redOpsCount: list.filter((c) => c.opsStatus === "red").length,
        topDecisionCount: list.filter((c) => decisionByCounty.has(c.countySlug)).length,
      };
    })
    .sort((a, b) => b.avgDeploymentPriority - a.avgDeploymentPriority);
}

function buildIntelligenceNarrative(input: {
  weekKey: string;
  pace: string;
  pendingDecisions: number;
  approvalPct: number;
  topThree: WeeklyCampaignDecision[];
  criticalAtRisk: number;
  redOps: number;
  seasonLabel: string | null;
}): string {
  const lines = [
    `Victory Board · week ${input.weekKey}${input.seasonLabel ? ` · ${input.seasonLabel}` : ""}`,
    `Statewide pace: ${input.pace}. CM approval ${input.approvalPct}% (${input.pendingDecisions} pending).`,
  ];
  if (input.criticalAtRisk > 0) {
    lines.push(`${input.criticalAtRisk} critical counties in red/yellow ops — prioritize field infrastructure.`);
  }
  if (input.redOps > 0) {
    lines.push(`${input.redOps} counties flagged red ops statewide.`);
  }
  if (input.topThree.length > 0) {
    lines.push(
      `Top decisions: ${input.topThree.map((d) => `${d.rank}. ${d.county} (${d.status})`).join("; ")}.`,
    );
  }
  lines.push("Map layers reflect decision intelligence — not raw calendar or CRM dumps.");
  return lines.join(" ");
}

export function composeVictoryBoardViewModel(weekKey?: string, asOf = new Date()): VictoryBoardViewModel {
  const wk = weekKey ?? weekKeyFromDate(asOf);
  const mondayVm = composeMondayBriefViewModel(wk, asOf);
  const mapSummary = loadVictoryMapStatewideSummary({ asOf });
  const brief = mondayVm.brief;
  const readiness = computeBriefReadiness(brief, mondayVm.missionRegistry);
  const decisionByCounty = buildDecisionIndex(brief.topDecisions);
  const layer: VictoryBoardMapLayer = "deployment_priority";
  const pins = buildPins(mapSummary.counties, decisionByCounty, layer);
  const charts = buildCharts(mapSummary.counties, brief.topDecisions, mapSummary.dimensionCounts);
  const regionRollups = buildRegionRollups(mapSummary.counties, decisionByCounty);
  const countdown = electionCountdown(asOf);
  const criticalAtRisk = mapSummary.criticalCountiesAtRisk.length;
  const redOps = mapSummary.counties.filter((c) => c.opsStatus === "red").length;

  return {
    version: 1,
    weekKey: wk,
    generatedAt: new Date().toISOString(),
    publicationSafety: "INTERNAL_DRAFT",
    mapLayerDefault: layer,
    pins,
    charts,
    regionRollups,
    topDecisions: brief.topDecisions,
    countiesAtRisk: brief.countiesAtRisk,
    strategicOpportunities: brief.strategicOpportunities,
    intelligenceNarrative: buildIntelligenceNarrative({
      weekKey: wk,
      pace: brief.statewideVictory.pace,
      pendingDecisions: readiness.pending,
      approvalPct: readiness.approvalPct,
      topThree: brief.topDecisions.slice(0, 3),
      criticalAtRisk,
      redOps,
      seasonLabel: mondayVm.currentSeasonLabel,
    }),
    statewide: {
      pace: brief.statewideVictory.pace,
      statewideVoteGap: brief.statewideVictory.statewideVoteGap,
      workingTargetWithCushion: brief.statewideVictory.workingTargetWithCushion,
      seasonLabel: mondayVm.currentSeasonLabel ?? brief.seasonLabel,
      approvalPct: readiness.approvalPct,
      pendingDecisions: readiness.pending,
    },
    electionDaysRemaining: countdown.daysRemaining,
  };
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

export { regionLabel };
