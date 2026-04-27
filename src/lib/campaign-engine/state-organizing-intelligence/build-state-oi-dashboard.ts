/**
 * State Organizing Intelligence — top-level dashboard payload (OIS / demo layer).
 * County counts by campaign region are **derived** from the 75-county registry + campaign taxonomy
 * (no PII, no voter file). Other KPIs are **demo/seed** until statewide pipelines exist.
 */
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import {
  type ArkansasCampaignRegionSlug,
  ARKANSAS_CAMPAIGN_REGIONS,
  getCampaignRegionBySlug,
  getCampaignRegionSlugForCounty,
} from "@/lib/campaign-engine/regions/arkansas-campaign-regions";
import type { CountyDashboardKpiItem, PowerOf5RelationalChartBundle } from "@/lib/campaign-engine/county-dashboards/types";
import { buildPowerOf5RelationalChartDemo } from "@/lib/power-of-5/relational-chart-demos";
import {
  calculateActivation,
  calculateCoverage,
  calculateGrowthRate,
  calculateTeamCompletion,
} from "@/lib/power-of-5/kpi";

export type OiSource = "db" | "derived" | "demo";

export type OiKpi = {
  label: string;
  value: string | number;
  source: OiSource;
  actionHint: string;
  note?: string;
};

export type OiRegionRollup = {
  slug: ArkansasCampaignRegionSlug;
  displayName: string;
  href: string;
  /** Counties in this campaign bucket (registry + FIPS override resolution). */
  countyCount: { value: number; source: "derived" };
  /** Demo: illustrative rollup score. */
  rollupReadiness: { value: number; source: "demo"; note: string };
  /** Demo: illustrative Power Team scale for the region. */
  powerTeamsPlanned: { value: number; source: "demo" };
  /** Short note from CANON-REGION-1 / stakeholder copy. */
  taxonomyNote?: string;
};

export type OiPowerOf5State = {
  totalTeams: { value: number; source: "demo" };
  completeTeams: { value: number; source: "demo" };
  peopleInvited: { value: number; source: "demo" };
  peopleActivated: { value: number; source: "demo" };
  /** Model coverage from `calculateCoverage` on demo team scale vs planning target. */
  coverageTargetPct: { value: number; source: "demo" | "derived"; note?: string };
  weekOverWeekTeams: { value: number; source: "demo" };
  /**
   * Percent metrics from `lib/power-of-5/kpi` on the same demo numerators above.
   * Replace with live inputs when statewide pipelines land.
   */
  kpiEngine: {
    activationRatePct: number;
    teamCompletionRatePct: number;
    teamCountGrowthRatePct: number;
  };
};

export type OiCountyReadinessRow = {
  countyName: string;
  countySlug: string;
  regionSlug: ArkansasCampaignRegionSlug;
  regionDisplay: string;
  readiness: { value: number; source: "demo" };
  notes: string;
};

export type StateOrganizingIntelligencePayload = {
  title: string;
  generatedAt: string;
  dataDisclaimer: string;
  /** Executive + Power of 5 headline metrics in one strip (`CountyKpiStrip`). */
  kpiStripItems: CountyDashboardKpiItem[];
  regionRollups: OiRegionRollup[];
  powerOf5: OiPowerOf5State;
  relationalCharts: PowerOf5RelationalChartBundle;
  countyReadinessSample: OiCountyReadinessRow[];
  strategy: {
    whatThisMeans: string;
    whatToDoNext: string;
  };
};

const DEMO_DISCLAIMER =
  "Statewide field KPIs, Power of 5 totals, readiness scores, and some rollups on this page are demo/seed for layout only. County counts by region are derived from the 75-county registry and the campaign region map (no voter microdata).";

function oiKpiToCountyItem(k: OiKpi): CountyDashboardKpiItem {
  return {
    label: k.label,
    metric: { value: k.value, source: k.source, note: k.note },
    actionHint: k.actionHint,
  };
}

function buildStatePowerOf5StripItems(p5: OiPowerOf5State): CountyDashboardKpiItem[] {
  return [
    {
      label: "P5 — People invited",
      metric: p5.peopleInvited,
      actionHint: "Log invitation context in secure tools; public view stays aggregate-only.",
    },
    {
      label: "P5 — People activated",
      metric: p5.peopleActivated,
      actionHint: "Tie activations to showed-up shifts and relational follow-through.",
    },
    {
      label: "P5 — WoW new teams",
      metric: p5.weekOverWeekTeams,
      actionHint: "Sustain weekly formation cadence before expanding turf claims.",
    },
    {
      label: "P5 — Activation rate (KPI engine %)",
      metric: {
        value: p5.kpiEngine.activationRatePct,
        source: "derived",
        note: "peopleActivated ÷ peopleInvited on demo inputs — `lib/power-of-5/kpi`.",
      },
      actionHint: "Raise invite quality and same-week follow-up before raw volume.",
    },
    {
      label: "P5 — Team completion rate (KPI engine %)",
      metric: {
        value: p5.kpiEngine.teamCompletionRatePct,
        source: "derived",
        note: "completeTeams ÷ formedTeams on demo inputs.",
      },
      actionHint: "Close partial rosters before opening new geographies.",
    },
    {
      label: "P5 — Team count growth (KPI engine %)",
      metric: {
        value: p5.kpiEngine.teamCountGrowthRatePct,
        source: "derived",
        note: "WoW demo baseline on statewide team totals.",
      },
      actionHint: "Pair growth with completion discipline; compare to prior week.",
    },
  ];
}

function countByCampaignRegion(): Record<ArkansasCampaignRegionSlug, number> {
  const acc: Partial<Record<ArkansasCampaignRegionSlug, number>> = {};
  for (const c of ARKANSAS_COUNTY_REGISTRY) {
    const slug = getCampaignRegionSlugForCounty(c.fips, c.regionId);
    acc[slug] = (acc[slug] ?? 0) + 1;
  }
  return acc as Record<ArkansasCampaignRegionSlug, number>;
}

const READINESS_DEMO: Record<ArkansasCampaignRegionSlug, number> = {
  "northwest-arkansas": 78,
  "central-arkansas": 72,
  "river-valley": 68,
  "north-central-ozarks": 64,
  "northeast-arkansas": 59,
  "delta-eastern-arkansas": 55,
  "southeast-arkansas": 52,
  "southwest-arkansas": 57,
};

function sampleCountiesReadiness(): OiCountyReadinessRow[] {
  const picks = [
    { slug: "pope-county", name: "Pope County" },
    { slug: "benton-county", name: "Benton County" },
    { slug: "washington-county", name: "Washington County" },
    { slug: "pulaski-county", name: "Pulaski County" },
    { slug: "garland-county", name: "Garland County" },
    { slug: "craighead-county", name: "Craighead County" },
    { slug: "mississippi-county", name: "Mississippi County" },
    { slug: "sebastian-county", name: "Sebastian County" },
  ] as const;

  return picks.map((p, i) => {
    const reg = ARKANSAS_COUNTY_REGISTRY.find((c) => c.slug === p.slug);
    const fips = reg?.fips ?? "00000";
    const cmd = reg?.regionId ?? "central";
    const slug = getCampaignRegionSlugForCounty(fips, cmd);
    const display = getCampaignRegionBySlug(slug)?.displayName ?? slug;
    return {
      countyName: p.name,
      countySlug: p.slug,
      regionSlug: slug,
      regionDisplay: display,
      readiness: { value: 58 + ((i * 4) % 30), source: "demo" as const },
      notes: i === 0 ? "FIPS 05115 — River Valley display override; registry command remains `central`." : "Illustration only.",
    } satisfies OiCountyReadinessRow;
  });
}

/**
 * Public-safe payload for `/organizing-intelligence` (RSC or static generation later).
 */
export function buildStateOrganizingIntelligenceDashboard(): StateOrganizingIntelligencePayload {
  const byRegion = countByCampaignRegion();
  const regions = [...ARKANSAS_CAMPAIGN_REGIONS].sort((a, b) => a.sort - b.sort);

  const statewideDemoTotalTeams = 420;
  const statewideDemoCompleteTeams = 186;
  const statewideDemoInvited = 12400;
  const statewideDemoActivated = 6100;
  const statewideDemoWowDelta = 18;
  const statewideDemoPrevTeams = statewideDemoTotalTeams - statewideDemoWowDelta;
  /** Illustrative statewide team goal — 75 counties × ~16 teams (fiction for public v1). */
  const statewideDemoTargetTeams = 1200;

  const regionRollups: OiRegionRollup[] = regions.map((r) => {
    const meta = getCampaignRegionBySlug(r.slug);
    return {
      slug: r.slug,
      displayName: r.displayName,
      href: `/organizing-intelligence/regions/${r.slug}`,
      countyCount: { value: byRegion[r.slug] ?? 0, source: "derived" as const },
      rollupReadiness: {
        value: READINESS_DEMO[r.slug] ?? 60,
        source: "demo" as const,
        note: "Illustrative regional health index — not a field audit.",
      },
      powerTeamsPlanned: { value: 12 + (r.sort % 9) * 3, source: "demo" as const },
      taxonomyNote: r.notes,
    };
  });

  const executiveKpis: OiKpi[] = [
    {
      label: "Registered voters (file estimate)",
      value: "1.89M",
      source: "demo",
      actionHint: "When SOS rollups are wired, replace with DB-backed statewide total.",
      note: "Round demo; verify against official public figures before messaging.",
    },
    {
      label: "Counties in movement map",
      value: 75,
      source: "derived",
      actionHint: "Use county command hub to publish coverage goals county-by-county.",
      note: "All Arkansas counties in `ARKANSAS_COUNTY_REGISTRY`.",
    },
    {
      label: "Active Power Teams (est.)",
      value: statewideDemoTotalTeams,
      source: "demo",
      actionHint: "Recruit to complete rosters; incomplete teams are the main drag on coverage.",
    },
    {
      label: "Complete teams (est.)",
      value: statewideDemoCompleteTeams,
      source: "demo",
      actionHint: "Each completion is a local multiplier and feeds regional numbers.",
    },
    {
      label: "Statewide coverage (KPI engine %)",
      value: calculateCoverage({
        activeUnits: statewideDemoTotalTeams,
        targetUnits: statewideDemoTargetTeams,
      }),
      source: "derived",
      actionHint: "Raise coverage in under-built regions first (see grid).",
      note: `Active ${statewideDemoTotalTeams} vs planning target ${statewideDemoTargetTeams} (demo scale).`,
    },
    {
      label: "Organizing readiness (index)",
      value: 64,
      source: "demo",
      actionHint: "Tie to data load + team density, not a voter score in public v1.",
      note: "0–100 index — demo only.",
    },
  ];

  const powerOf5: OiPowerOf5State = {
    totalTeams: { value: statewideDemoTotalTeams, source: "demo" },
    completeTeams: { value: statewideDemoCompleteTeams, source: "demo" },
    peopleInvited: { value: statewideDemoInvited, source: "demo" },
    peopleActivated: { value: statewideDemoActivated, source: "demo" },
    coverageTargetPct: {
      value: calculateCoverage({
        activeUnits: statewideDemoTotalTeams,
        targetUnits: statewideDemoTargetTeams,
      }),
      source: "derived",
      note: `Same formula as KPI strip — target ${statewideDemoTargetTeams} teams (demo).`,
    },
    weekOverWeekTeams: { value: statewideDemoWowDelta, source: "demo" },
    kpiEngine: {
      activationRatePct: calculateActivation({
        activated: statewideDemoActivated,
        invited: statewideDemoInvited,
      }),
      teamCompletionRatePct: calculateTeamCompletion({
        completeTeams: statewideDemoCompleteTeams,
        formedTeams: statewideDemoTotalTeams,
      }),
      teamCountGrowthRatePct: calculateGrowthRate({
        current: statewideDemoTotalTeams,
        previous: statewideDemoPrevTeams,
      }),
    },
  };

  const statewideDemoConversations = 8420;
  const statewideDemoFollowUps = 1960;

  const relationalCharts = buildPowerOf5RelationalChartDemo({
    invited: statewideDemoInvited,
    activated: statewideDemoActivated,
    conversations: statewideDemoConversations,
    followUpsDue: statewideDemoFollowUps,
    teamsLinkedApprox: statewideDemoCompleteTeams,
  });

  const kpiStripItems: CountyDashboardKpiItem[] = [
    ...executiveKpis.map(oiKpiToCountyItem),
    ...buildStatePowerOf5StripItems(powerOf5),
  ];

  return {
    title: "Arkansas — state organizing intelligence",
    generatedAt: new Date().toISOString(),
    dataDisclaimer: DEMO_DISCLAIMER,
    kpiStripItems,
    regionRollups,
    powerOf5,
    relationalCharts,
    countyReadinessSample: sampleCountiesReadiness(),
    strategy: {
      whatThisMeans:
        "A statewide view is a **ladder of places**: the campaign moves when regions close coverage gaps, not when one big number blinks. This page shows the eight **campaign regions** (CANON-REGION-1) and where Pope sits as a sample county. Nothing here is a persuasion or turnout model to individuals.",
      whatToDoNext:
        "Pick a region with low **rollup readiness (demo)**, open its page when built, and assign two organizing outcomes: (1) complete Power Team targets in the largest city county, and (2) one rural anchor town with a host. Use **Pope v2** as the UI template; replicate data packets per county, not new CSS per county.",
    },
  };
}
