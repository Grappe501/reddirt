/**
 * Region dashboard builder — **sample** rollups for one campaign slug at a time.
 * County list / count: **derived** from `ARKANSAS_COUNTY_REGISTRY` + `getCampaignRegionSlugForCounty`.
 * Power-of-5, coverage, peer comparison, and executive-style KPIs: **demo/seed** (clearly labeled in types/UI).
 */
import { ARKANSAS_COUNTY_REGISTRY, type ArCommandRegionId } from "@/lib/county/arkansas-county-registry";
import { getCampaignRegionBySlug, getCampaignRegionSlugForCounty, type ArkansasCampaignRegionSlug } from "./arkansas-campaign-regions";
import { getRegionGatewayCopy } from "./region-gateway-copy";
import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import type {
  RegionDashboard,
  RegionDashboardCountyCard,
  RegionDashboardHighlightCard,
  RegionNextCountyBuildItem,
} from "./types";
import { buildPowerOf5RelationalChartDemo } from "@/lib/power-of-5/relational-chart-demos";
import {
  calculateActivation,
  calculateCoverage,
  calculateGrowthRate,
  calculateTeamCompletion,
} from "@/lib/power-of-5/kpi";

const DEMO_NOTE = "Illustrative rollup for layout; not a file export." as const;
const SHELL_VERSION = "REGION-DASHBOARD-1" as const;

function countiesInCampaignRegion(slug: ArkansasCampaignRegionSlug) {
  return ARKANSAS_COUNTY_REGISTRY.filter(
    (c) => getCampaignRegionSlugForCounty(c.fips, c.regionId as ArCommandRegionId) === slug,
  );
}

/**
 * Stakeholder “River Valley” often spans more I-40 / I-30 corridor counties than the single FIPS override.
 * This **planning** list (registry keys) adds scaffolds for the dashboard; only Pope (05115) is in
 * `CAMPAIGN_REGION_FIPS_OVERRIDES` for `river-valley` today — other rows are **demo/placeholder** cards.
 * Order: Pope first, then FIPS sort.
 */
const RIVER_VALLEY_SCAFFOLD_FIPS: readonly string[] = [
  "05029", // Conway
  "05045", // Faulkner
  "05071", // Johnson
  "05105", // Perry
  "05115", // Pope
  "05125", // Saline
  "05149", // Yell
] as const;

type RegistryCounty = (typeof ARKANSAS_COUNTY_REGISTRY)[number];

function regionCountyListForBuild(slug: ArkansasCampaignRegionSlug): {
  ordered: RegistryCounty[];
  fipsMapCount: number;
  hasRiverValleyScaffolds: boolean;
} {
  const inMap = countiesInCampaignRegion(slug);
  if (slug !== "river-valley") {
    return { ordered: inMap, fipsMapCount: inMap.length, hasRiverValleyScaffolds: false };
  }
  const byFips = new Map<string, RegistryCounty>();
  for (const c of inMap) {
    byFips.set(c.fips, c);
  }
  for (const f of RIVER_VALLEY_SCAFFOLD_FIPS) {
    const row = ARKANSAS_COUNTY_REGISTRY.find((c) => c.fips === f);
    if (row) byFips.set(row.fips, row);
  }
  const ordered: RegistryCounty[] = [];
  const pope = byFips.get("05115");
  if (pope) {
    ordered.push(pope);
    byFips.delete("05115");
  }
  ordered.push(...[...byFips.values()].sort((a, b) => a.fips.localeCompare(b.fips)));
  return { ordered, fipsMapCount: inMap.length, hasRiverValleyScaffolds: ordered.length > inMap.length };
}

/**
 * Roadmap tiles for every region except NWA (custom list in `buildNorthwestArkansasRegionDashboard`).
 * River Valley prioritizes planning scaffolds; other regions prioritize anchors then alphabetical depth.
 */
function buildDefaultNextCountyBuilds(
  slug: ArkansasCampaignRegionSlug,
  cards: RegionDashboardCountyCard[],
): RegionDashboard["nextCountiesToBuild"] | undefined {
  if (slug === "northwest-arkansas") return undefined;
  const valid = cards.filter((c) => c.countySlug !== "—");
  let picks: RegionDashboardCountyCard[];
  if (slug === "river-valley") {
    const scaffolds = valid.filter((c) => c.isPlanningScaffold);
    picks =
      scaffolds.length > 0
        ? scaffolds.slice(0, 6)
        : valid.filter((c) => !c.isAnchorCounty).slice(0, 4);
  } else {
    const anchors = valid.filter((c) => c.isAnchorCounty);
    const rest = valid.filter((c) => !c.isAnchorCounty).sort((a, b) => a.displayName.localeCompare(b.displayName));
    picks = [...anchors, ...rest].slice(0, 4);
  }
  if (picks.length === 0) return undefined;
  return {
    overline: "Roadmap",
    title: "Next county dashboards to build",
    description:
      "Public **county command** is live today. Full county intelligence (v2-style, like Pope) ships as field + comms approve. OIS county routes are **placeholders** until each rollup is built.",
    items: picks.map((c, i) => ({
      id: `roadmap-${slug}-${c.fips}-${i}`,
      displayName: c.displayName,
      targetLabel: c.secondaryHref ? "Published intel — expand pattern" : "County intelligence v2 (planned)",
      hrefCommand: c.href,
      hrefOrganizingIntelligence: `/organizing-intelligence/counties/${c.countySlug}`,
      note: c.isPlanningScaffold
        ? "Planning scaffold on this page — validate FIPS map + captain before v2 build."
        : c.secondaryHref
          ? "Gold-sample dashboard exists — reuse the shell for neighbors in this region."
          : "Will mirror the shared county dashboard shell (Pope v2 pattern). Per-county figures here stay demo until field sync.",
    })),
  };
}

function demoKpi(
  label: string,
  value: number | string,
  actionHint: string,
  source: "demo" | "derived" = "demo",
  note?: string,
): CountyDashboardKpiItem {
  return {
    label,
    metric: {
      value: typeof value === "string" ? value : value,
      source: source === "derived" ? "derived" : "demo",
      note: note ?? (source === "demo" ? DEMO_NOTE : undefined),
    },
    actionHint,
  };
}

/**
 * Returns a full region dashboard for **any** of the eight `ArkansasCampaignRegionSlug` values.
 * Use `buildSampleRegionDashboard()` for the canonical doc sample (River Valley).
 */
export function buildRegionDashboard(campaignRegionSlug: ArkansasCampaignRegionSlug): RegionDashboard {
  const meta = getCampaignRegionBySlug(campaignRegionSlug);
  if (!meta) {
    throw new Error(`Unknown campaign region slug: ${campaignRegionSlug}`);
  }

  const { ordered: inBucket, fipsMapCount, hasRiverValleyScaffolds } = regionCountyListForBuild(campaignRegionSlug);
  const countyCount = inBucket.length;

  const demoRegionalActiveTeams = 12 + countyCount * 3;
  const demoRegionalCompleteTeams = 5 + countyCount;
  const demoRegionalTargetTeams = Math.max(demoRegionalActiveTeams + 1, Math.round(demoRegionalActiveTeams * 1.45));
  const demoRegionalModeledCoverage = calculateCoverage({
    activeUnits: demoRegionalActiveTeams,
    targetUnits: demoRegionalTargetTeams,
  });
  const demoRegionalInvites = 220 + countyCount * 15;
  const demoRegionalActivations = 110 + countyCount * 7;
  const demoRegionalTotalTeams = 18 + countyCount * 2;
  const demoRegionalCompleteRollup = 6 + Math.floor(countyCount / 2);
  const demoRegionalPrevWeekTeams = Math.max(0, demoRegionalTotalTeams - 8);
  const demoRegionalTeamGrowthPct = calculateGrowthRate({
    current: demoRegionalTotalTeams,
    previous: demoRegionalPrevWeekTeams,
  });

  const kpiLabelCounties =
    campaignRegionSlug === "river-valley" && hasRiverValleyScaffolds
      ? "Counties on this view (1 anchor + scaffolds)"
      : "Counties in region (registry map)";

  const kpiItems: CountyDashboardKpiItem[] = [
    demoKpi(
      kpiLabelCounties,
      countyCount,
      "Hire/assign a regional point person per county at minimum. Scaffolds are not yet in the FIPS override map—planning only.",
      campaignRegionSlug === "river-valley" && hasRiverValleyScaffolds ? "demo" : "derived",
      campaignRegionSlug === "river-valley" && hasRiverValleyScaffolds
        ? `FIPS map lists ${fipsMapCount} for river-valley; this page adds ${countyCount - fipsMapCount} registry scaffolds (demo cards).`
        : undefined,
    ),
    demoKpi("Est. population (demo rollup)", roundDemo(42_000 * Math.max(1, countyCount)), "Register & chase turnout where density meets demand.", "demo"),
    demoKpi("Active Power Teams (demo, regional roll-up)", demoRegionalActiveTeams, "Add teams in largest counties first, then backfill rurals.", "demo"),
    demoKpi("Complete teams (demo)", demoRegionalCompleteTeams, "Each completion should lift a measurable coverage point.", "demo"),
    demoKpi(
      "Modeled coverage (KPI engine %)",
      demoRegionalModeledCoverage,
      "Close gaps in weak counties with captains, not blasts.",
      "derived",
      `active ${demoRegionalActiveTeams} vs target ${demoRegionalTargetTeams} (demo scale) — ${DEMO_NOTE}`,
    ),
    demoKpi(
      "WoW team growth (KPI engine %)",
      demoRegionalTeamGrowthPct,
      "Sustain cadence; compare to prior-week demo baseline.",
      "derived",
      `current ${demoRegionalTotalTeams} teams vs prior-week placeholder ${demoRegionalPrevWeekTeams}. ${DEMO_NOTE}`,
    ),
    demoKpi("P5 — People invited (demo)", demoRegionalInvites, "Relational invites roll up to activation rate.", "demo"),
    demoKpi("P5 — People activated (demo)", demoRegionalActivations, "Shift attendance and meaningful volunteer touchpoints.", "demo"),
    demoKpi(
      "P5 — Activation rate (KPI engine %)",
      calculateActivation({ activated: demoRegionalActivations, invited: demoRegionalInvites }),
      "Invite quality + follow-up rhythm; aggregate-only on the web.",
      "derived",
      DEMO_NOTE,
    ),
  ];

  const fipsInCampaignMap = new Set(countiesInCampaignRegion(campaignRegionSlug).map((c) => c.fips));

  const countyCards: RegionDashboardCountyCard[] = inBucket.map((c, i) => {
    const isPope = c.fips === "05115";
    const inFipsMapOnly = fipsInCampaignMap.has(c.fips);
    const isScaffold = campaignRegionSlug === "river-valley" && !inFipsMapOnly;

    return {
      displayName: c.displayName,
      countySlug: c.slug,
      fips: c.fips,
      href: `/counties/${c.slug}`,
      secondaryHref: isPope ? "/county-briefings/pope/v2" : undefined,
      secondaryLabel: isPope ? "Pope v2 intel →" : undefined,
      isAnchorCounty: isPope && campaignRegionSlug === "river-valley",
      isPlanningScaffold: isScaffold,
      cardNote: isPope
        ? "Anchor county (CANON-REGION-1): FIPS 05115 → River Valley. Live v2 + political profile; team/coverage still partly demo in places."
        : isScaffold
          ? "Planning scaffold — registry row; not in river-valley FIPS map yet. Team/coverage are demo/seed for layout only."
          : "Demo team/coverage = seed until county hydrates.",
      teamScaleDemo: { value: 4 + (i % 5), source: "demo", note: isPope ? (isScaffold ? DEMO_NOTE : "Pilot anchor — some metrics still illustrative.") : DEMO_NOTE },
      coverageDemo: { value: 22 + (i % 7) * 5, source: "demo", note: isScaffold || !isPope ? DEMO_NOTE : "Pilot anchor — % is modeled demo until field sync." },
    };
  });

  if (countyCards.length === 0) {
    countyCards.push({
      displayName: "(No counties resolved)",
      countySlug: "—",
      fips: "—",
      href: "/organizing-intelligence",
      cardNote: "No registry rows in this campaign bucket with current FIPS map — check taxonomy.",
      teamScaleDemo: { value: 0, source: "demo" },
      coverageDemo: { value: 0, source: "demo" },
    });
  }

  const relationalCharts = buildPowerOf5RelationalChartDemo({
    invited: demoRegionalInvites,
    activated: demoRegionalActivations,
    conversations: 340 + countyCount * 20,
    followUpsDue: 48 + countyCount * 2,
    teamsLinkedApprox: demoRegionalCompleteRollup,
  });

  return {
    campaignRegionSlug,
    displayName: meta.displayName,
    generatedAt: new Date().toISOString(),
    gateway: getRegionGatewayCopy(campaignRegionSlug),
    dataDisclaimer: `${SHELL_VERSION}: County count and list are registry-derived. KPIs, Power of 5, peer cells, and coverage are demo/seed for shell validation — not competitive intelligence. No voter PII.`,
    taxonomyNote: meta.notes,
    countyCount: {
      value: countyCount,
      source: campaignRegionSlug === "river-valley" && hasRiverValleyScaffolds ? "demo" : "derived",
      note:
        campaignRegionSlug === "river-valley" && hasRiverValleyScaffolds
          ? `Display count ${countyCount} includes ${fipsMapCount} FIPS-map + ${countyCount - fipsMapCount} scaffolds.`
          : undefined,
    },
    kpiItems,
    relationalCharts,
    mapCaption: "Region outline + county dots (placeholder). No tile server; wire GeoJSON or static art later.",
    powerOf5: {
      overline: "Power of 5 — status & roll-up (demo / preview)",
      title: "Power of 5 — regional roll-up (demo)",
      intro:
        "Headline **invites, activations, and activation rate** are in the KPI strip above. This panel carries team scale, completion, conversations, and follow-ups — same demo numerators as the relational charts. KPI engine: `lib/power-of-5/kpi`.",
      items: [
        demoKpi("Regional teams (demo)", demoRegionalTotalTeams, "Recruit in anchor counties, then light-touch support in rurals."),
        demoKpi("Complete teams (demo)", demoRegionalCompleteRollup, "Target completions where population × gap is largest."),
        demoKpi(
          "Team completion (KPI engine %)",
          calculateTeamCompletion({
            completeTeams: demoRegionalCompleteRollup,
            formedTeams: demoRegionalTotalTeams,
          }),
          "Complete rosters before opening new turf.",
          "derived",
          DEMO_NOTE,
        ),
        demoKpi("Conversations (demo)", 340 + countyCount * 20, "Depth → durable turnout behavior."),
        demoKpi("Follow-ups due (demo)", 48 + countyCount * 2, "Clear the queue before new acquisition."),
      ],
    },
    strategy: {
      overline: "Theory of the turf",
      title: "Strategy — what this region moves",
      panelDescription:
        "Top organizing view for this region on the public site — aggregate only; county and secure tools carry targeting detail.",
      whatThisMeans:
        campaignRegionSlug === "river-valley"
          ? `**River Valley** is shown here with **Pope County (05115)** as the anchor — the only county in the FIPS override today — plus **planning scaffolds** (Faulkner, Conway, Johnson, Perry, Saline, Yell) from the 75-county registry for peer context. All scaffolds are **demo-labeled** until overrides or field sync back them.`
          : `The ${meta.displayName} story is a **stakeholder-facing** lens on ${countyCount} county row(s) in the 75-county map. Momentum is shown as aggregate, not a persuasion list.`,
      whereToPress:
        campaignRegionSlug === "river-valley"
          ? "Start from **Pope**: open `/county-briefings/pope/v2` for the densest public intel, then mirror Power-of-5 discipline in scaffolds as captains stand up. Larger basins (Saline, Faulkner) deserve parallel attention when resourcing allows — still aggregate-only on the web."
          : "Anchor counties (largest registered-voter basins) should own relational cadence; smaller counties borrow templates from pilots like Pope v2 when ready.",
      whereToBackfill:
        campaignRegionSlug === "river-valley"
          ? "Do not over-index on placeholder % on scaffold cards; use them to **assign** organizers, not to imply file-backed coverage. Rural tiles (e.g. Perry, Yell) get one reliable captain before dot-density goals."
          : "Rural and low-density slices get one strong captain each before expanding dot density — avoid spreading thin across micro-units in public view.",
      whatToDoNext:
        campaignRegionSlug === "river-valley"
          ? "Drill **Pope v2** → export the relational cadence checklist to staff → reconcile FIPS map in CANON-REGION-1 when stakeholders sign off on the full River Valley list. Then roll peer rows into statewide OIS."
          : "Open county command → encourage Power Team completion → list-mode precincts until maps clear ethics review. Roll to state OIS for peer tables.",
    },
    counties: countyCards,
    comparison: {
      overline: "Peer sense-check",
      title: "Regional comparison (demo peer column)",
      description:
        "NWA (Northwest) is a high-organizing-density **peer label** in this table — all numeric cells are **demo/seed** for layout, not a certified head-to-head.",
      columnLabels: ["Metric", "NWA (demo peer)", meta.displayName + " (demo)", "Notes"],
      rows: [
        {
          id: "c1",
          metric: "Modeled team coverage (%)",
          peerLabel: "NWA (peer label)",
          peerValue: "62",
          regionValue: String(Math.min(70, 44 + countyCount * 2)),
          notes: "Seeded gap vs peer; replace with file-backed aggregates when safe.",
          source: "demo",
        },
        {
          id: "c2",
          metric: "Listening sessions / 60d (demo count)",
          peerLabel: "NWA (peer label)",
          peerValue: "14",
          regionValue: String(3 + countyCount),
          notes: "Events layer not wired; placeholder counts.",
          source: "demo",
        },
        {
          id: "c3",
          metric: "Leader bench depth (1–5 score)",
          peerLabel: "NWA (peer label)",
          peerValue: "4.2",
          regionValue: (3.1 + countyCount * 0.05).toFixed(1),
          notes: "Subjective program score; staff-only interpretation.",
          source: "demo",
        },
      ],
    },
    nextActions: buildDemoActions(meta.displayName, countyCount),
    risks: buildDemoRisks(meta.displayName),
    nextCountiesToBuild: buildDefaultNextCountyBuilds(campaignRegionSlug, countyCards),
  };
}

function roundDemo(n: number) {
  return Math.round(n / 1000) * 1000;
}

function buildDemoActions(regionName: string, countyCount: number) {
  return [
    {
      id: "ra1",
      title: `Publish a one-page ${regionName} field narrative (aggregate-only).`,
      ownerRole: "Regional director + comms",
      urgency: "high" as const,
      expectedImpact: "Aligns captains and donors on the same **non-PII** story before maps ship.",
      kpiAffected: "Coverage (demo) · Team completion (demo)",
      nextStep: `Draft outline referencing ${countyCount} county anchor(s) by public name only; no voter segments on the web page.`,
    },
    {
      id: "ra2",
      title: "Pair every county in-bucket with a point cadence in the workbench (staff).",
      ownerRole: "Field operations",
      urgency: "medium" as const,
      expectedImpact: "Prevents orphan counties when regional story gets attention.",
      kpiAffected: "Follow-ups due · Activations (demo)",
      nextStep: "Checklist in secure tools; this dashboard stays high-level only.",
    },
  ];
}

function buildDemoRisks(regionName: string) {
  return [
    {
      id: "rr1",
      category: "Over-interpreting demo scores",
      severity: "high" as const,
      mitigation: "Keep demo labels; route competitive detail to private sheets.",
      ownerRole: "Data steward",
    },
    {
      id: "rr2",
      category: "Taxonomy drift (registry vs campaign)",
      severity: "medium" as const,
      mitigation: `When ${regionName} copy disagrees with a county’s registry label, use CANON-REGION-1 FIPS override pattern — do not re-key counties casually.`,
      ownerRole: "Product + field policy",
    },
  ];
}

/** Default sample: **River Valley** (FIPS 05115 override; often 1 county in-bucket with current map). */
export const SAMPLE_REGION_DASHBOARD_SLUG: ArkansasCampaignRegionSlug = "river-valley";

export function buildSampleRegionDashboard(): RegionDashboard {
  return buildRegionDashboard(SAMPLE_REGION_DASHBOARD_SLUG);
}

/** Public River Valley page — same as `buildRegionDashboard("river-valley")` with scaffolds + Pope anchor. */
export function buildRiverValleyRegionDashboard(): RegionDashboard {
  return buildRegionDashboard("river-valley");
}

const NWA_FIPS_ORDER: readonly string[] = ["05007", "05143", "05015", "05087"] as const;

/**
 * Central Arkansas: campaign slug `central-arkansas` — registry `central` + `west_central` (CANON-REGION-1);
 * FIPS overrides (e.g. Pope → River Valley) **exclude** those counties from this list in the 75-row map.
 */
export function buildCentralArkansasRegionDashboard(): RegionDashboard {
  const base = buildRegionDashboard("central-arkansas");
  const n = base.countyCount.value;
  return {
    ...base,
    countyGridDescription:
      "CANON-REGION-1: **Central Arkansas** on this page lists counties whose **campaign** slug is `central-arkansas` (includes the **west_central** command fold-in: Little Rock, Hot Springs, Fort Smith / Ouachita corridor, etc.). **Pope (05115)** is **not** here — it is mapped to **River Valley** in the FIPS override table. Per-county team/coverage: demo/seed. Drill: `/counties/[slug]`; county v2 when published (Pope v2 is the public sample, outside this bucket).",
    dataDisclaimer: `${SHELL_VERSION}: County list/length are derived from 75-row registry + campaign slug. Central = central + west_central command IDs, minus FIPS override counties (Pope → River Valley). Power of 5, peer column, and KPI rollups: demo/seed. No voter PII.`,
    strategy: {
      ...base.strategy,
      overline: "Theory of the turf",
      title: "Strategy — Central Arkansas in OIS",
      whatThisMeans: `**Central Arkansas** in this build is **${n}** counties in the 75-row map with campaign slug \`central-arkansas\` — a capital / I-30 and folded west_central field lens, **not** a single MSA. Use the shell for **aggregate** alignment; detailed targeting uses secure tools only.`,
      whereToPress:
        "Press Power of 5 and relational work in the largest registered-voter basins in-bucket (e.g. Pulaski and other population centers) while this page shows **only** high-level, labeled demo numbers.",
      whereToBackfill:
        "Rural and smaller in-bucket counties: one strong captain, list-mode precincts, and honest gaps — avoid implying file-backed micro-maps on the public view.",
      whatToDoNext:
        "Keep CANON-REGION-1 in sync: if a county’s stakeholder name drifts (e.g. “River Valley” in copy) use `resolveRegionPresentationForCounty` in product — do not re-key the registry. Roll the same row pattern to the state OIS index.",
    },
    comparison: {
      ...base.comparison,
      description:
        "NWA and River Valley columns are **planning** peer labels; all cells are **demo/seed** for this Central Arkansas view — not a certified head-to-head.",
    },
  };
}

/**
 * North Central / Ozarks: campaign slug `north-central-ozarks` — registry **`north_central`** command bucket
 * (CANON-REGION-1). **Pope (05115)** is not in this bucket — it overrides to **River Valley** in the FIPS table.
 */
export function buildNorthCentralOzarksRegionDashboard(): RegionDashboard {
  const base = buildRegionDashboard("north-central-ozarks");
  const n = base.countyCount.value;
  return {
    ...base,
    countyGridDescription:
      "CANON-REGION-1: **North Central / Ozarks** lists counties with campaign slug `north-central-ozarks` (default from registry **north_central**). Stakeholder copy may use “North Central,” “Boston Mountains,” or “Ozarks gateway” — the slug is the OIS key. **Pope (FIPS 05115)** is **not** in this grid (override → `river-valley`). Per-county team/coverage: demo/seed. County command: `/counties/[slug]`.",
    dataDisclaimer: `${SHELL_VERSION}: County list/length = registry + campaign slug \`north-central-ozarks\` (north_central map). KPIs, Power of 5, and peer table: **demo/seed** — not a voter file. No PII on this public page.`,
    strategy: {
      ...base.strategy,
      overline: "Theory of the turf",
      title: "Strategy — North Central / Ozarks in OIS",
      whatThisMeans: `**North Central / Ozarks** here = **${n}** counties in the \`north-central-ozarks\` campaign bucket. This is a **single regional strip** for the north_central command row, not a substitute for the county command hub or the secure voter file.`,
      whereToPress:
        "Press relational and Power of 5 work in the largest registered-voter basins in-bucket; use **Pope v2** only as a **UI + honesty pattern** to copy (different campaign bucket) — not as merged rollups in this row.",
      whereToBackfill:
        "Rural in-bucket counties: one strong captain, list-mode turf, and data-gap callouts in county command before public density claims.",
      whatToDoNext:
        "Return to **state** OIS ( `/organizing-intelligence` ) for peer tables; add county v2 when each county is ready. If marketing names split the Ozarks from “North Central,” log in CANON-REGION-1 — do not re-key counties casually.",
    },
    comparison: {
      ...base.comparison,
      description:
        "NWA and River Valley columns are **planning** peer labels; all cells are **demo/seed** for North Central / Ozarks, not a certified head-to-head.",
    },
  };
}

/**
 * Northeast Arkansas: campaign slug `northeast-arkansas` — registry `northeast` command bucket.
 */
export function buildNortheastArkansasRegionDashboard(): RegionDashboard {
  const base = buildRegionDashboard("northeast-arkansas");
  const n = base.countyCount.value;
  return {
    ...base,
    countyGridDescription:
      "Registry **northeast** command bucket (Upper Delta / Crowley’s Ridge in legacy ARK list language): all counties in this 75-row map with campaign slug `northeast-arkansas` (e.g. Jonesboro and surrounding). Per-county team/coverage are demo/seed. Drill: county command first; add county v2 when ready.",
    dataDisclaimer: `${SHELL_VERSION}: County list/length = registry + campaign region slug \`northeast-arkansas\`. KPIs, Power of 5, and peer table: **demo/seed** for OIS — not a voter file. No PII on this public page.`,
    strategy: {
      ...base.strategy,
      overline: "Theory of the turf",
      title: "Strategy — Northeast Arkansas in OIS",
      whatThisMeans: `**Northeast Arkansas** here = **${n}** counties with campaign slug \`northeast-arkansas\` — a single **rollup** bar for the Upper Delta and ridge counties. Use for regional narrative and team discipline; not for individual voter scores on the web.`,
      whereToPress:
        "Build relational layers where campuses, care systems, and ag employers connect to volunteers; keep public metrics aggregate and **demo**-tagged while field teams use the workbench in private systems.",
      whereToBackfill:
        "Rural, lower-density in-bucket counties: prioritize one complete Power Team and one listening cadence per county over scatter-shot public events.",
      whatToDoNext:
        "Tie to statewide OIS; when a county gets a v2-style intel page, add a secondary link the same as other regions. If stakeholders split “Northeast” into smaller marketing names, log it in the taxonomy note — do not fork this route without a CANON-REGION-1 pass.",
    },
    comparison: {
      ...base.comparison,
      description:
        "NWA and River Valley peer labels in this table are for **layout and planning**; numeric cells are demo/seed for Northeast Arkansas, not a certified comparison to those regions.",
    },
  };
}

/**
 * Delta / Eastern Arkansas: campaign slug `delta-eastern-arkansas` — default maps from registry **`southeast`** (CANON-REGION-1).
 */
export function buildDeltaEasternArkansasRegionDashboard(): RegionDashboard {
  const base = buildRegionDashboard("delta-eastern-arkansas");
  const n = base.countyCount.value;
  return {
    ...base,
    countyGridDescription:
      "CANON-REGION-1: **Delta / Eastern** lists counties with campaign slug `delta-eastern-arkansas` (default from registry **southeast** command ID). Stakeholder language may say “Delta” or “eastern” — the 75-row map and slug are the source of truth for this page. Per-county team/coverage: demo/seed. Drill: `/counties/[slug]`.",
    dataDisclaimer: `${SHELL_VERSION}: County list/length = registry + campaign slug \`delta-eastern-arkansas\` (southeast default map). KPIs, Power of 5, actions, and risks: **demo/seed** for OIS layout — not a voter file. No PII.`,
    strategy: {
      ...base.strategy,
      overline: "Theory of the turf",
      title: "Strategy — Delta / Eastern Arkansas in OIS",
      whatThisMeans: `**Delta / Eastern Arkansas** here = **${n}** counties under campaign slug \`delta-eastern-arkansas\` — a single rollup bar for the eastern and Delta-leaning registry bucket. Use for **aggregate** field planning and public narrative; detailed voter work stays in secure tools.`,
      whereToPress:
        "Run relational and registration-support work where population, institutions, and transport corridors create natural listening density; keep this dashboard’s numbers labeled demo until multi-county pipelines back them.",
      whereToBackfill:
        "Smaller in-bucket counties: one accountable captain, list-mode coverage, and honest data-gap notes on county command before scaling public event density targets.",
      whatToDoNext:
        "Align on county command pages first; return to state OIS for cross-region peer view. If stakeholders rename sub-belts (e.g. “Grand Prairie”), document in the taxonomy note — do not fork routes without a CANON-REGION-1 pass.",
    },
    comparison: {
      ...base.comparison,
      description:
        "NWA and River Valley columns are **planning** peer labels; all cells are **demo/seed** for this Delta / Eastern view — not a certified head-to-head.",
    },
  };
}

/**
 * Southeast Arkansas: campaign slug `southeast-arkansas` — registry **`south`** command bucket.
 */
export function buildSoutheastArkansasRegionDashboard(): RegionDashboard {
  const base = buildRegionDashboard("southeast-arkansas");
  const n = base.countyCount.value;
  return {
    ...base,
    countyGridDescription:
      "Registry **south** command bucket maps here as **Southeast Arkansas** in campaign taxonomy (southern tier / lower-south in legacy ARK list language). All counties in this 75-row map with slug `southeast-arkansas`. Per-county team/coverage: demo/seed. Drill: county command; county v2 when published.",
    dataDisclaimer: `${SHELL_VERSION}: County list/length = registry + \`southeast-arkansas\`. KPIs, Power of 5, peer table, actions, and risks: **demo/seed** — operational layout only. No PII.`,
    strategy: {
      ...base.strategy,
      overline: "Theory of the turf",
      title: "Strategy — Southeast Arkansas in OIS",
      whatThisMeans: `**Southeast Arkansas** = **${n}** counties with campaign slug \`southeast-arkansas\` — one regional strip for the southern registry bucket. Treat this page as a **roll-up** for resourcing; not a substitute for file-backed turnout modeling on the public web.`,
      whereToPress:
        "Where county seats and main corridors anchor volunteers, run repeatable relational cadence (Power of 5 discipline); pair low-density rows with one listening loop before expanding asks.",
      whereToBackfill:
        "Emphasize sustainable captain coverage in rural tiles; avoid public micro-maps until ethics + data intake clear.",
      whatToDoNext:
        "Feed insights back to statewide OIS; when a county gets a v2-style intel page, add a secondary link in that county’s pattern. Keep registry→campaign labels documented when copy uses different marketing names.",
    },
    comparison: {
      ...base.comparison,
      description:
        "Peer column labels (NWA, etc.) are for **layout**; numbers are **demo/seed** for Southeast Arkansas, not a certified region-vs-region fact sheet.",
    },
  };
}

/**
 * Southwest Arkansas: campaign slug `southwest-arkansas` — registry **`southwest`** command bucket.
 */
export function buildSouthwestArkansasRegionDashboard(): RegionDashboard {
  const base = buildRegionDashboard("southwest-arkansas");
  const n = base.countyCount.value;
  return {
    ...base,
    countyGridDescription:
      "Registry **southwest** command bucket: Texarkana-adjacent, timber, and hill-country rows in the 75-county map with campaign slug `southwest-arkansas`. Per-county team/coverage: demo/seed. Drill: `/counties/[slug]`.",
    dataDisclaimer: `${SHELL_VERSION}: County list/length = registry + \`southwest-arkansas\`. KPIs, Power of 5, and peer table: **demo/seed** for OIS — not competitive intelligence. No PII on this public page.`,
    strategy: {
      ...base.strategy,
      overline: "Theory of the turf",
      title: "Strategy — Southwest Arkansas in OIS",
      whatThisMeans: `**Southwest Arkansas** = **${n}** counties in the campaign slug \`southwest-arkansas\` — a single OIS bar for the southwest command bucket. Use for **operational** alignment across county lines; all numeric rollups on this view remain **demo** until pipelines land.`,
      whereToPress:
        "Concentrate organizer time where cross-border and corridor economics produce durable volunteer basins; document aggregate wins in staff tools, not individual scores on the web.",
      whereToBackfill:
        "Rural and lower-density in-bucket counties: one complete Power Team per county as a floor, then expand — keep demo tags visible on public %.",
      whatToDoNext:
        "Link upward to **state** organizing intelligence for peer context; open county command for ground truth. Reconcile any stakeholder “Southwest” name drift with `resolveRegionPresentationForCounty` in product, not ad hoc county re-keys.",
    },
    comparison: {
      ...base.comparison,
      description:
        "NWA / River Valley peer labels: **planning** only. Numeric cells: **demo/seed** for Southwest Arkansas; not a certified cross-region scorecard.",
    },
  };
}

/**
 * NWA: registry `northwest` command bucket (Benton, Washington, Carroll, Madison).
 * Benton + Washington are primary; Carroll + Madison are nearby; Pope is a non-bucket OIS prototype reference.
 */
export function buildNorthwestArkansasRegionDashboard(): RegionDashboard {
  const base = buildRegionDashboard("northwest-arkansas");
  const byFips = new Map(base.counties.map((c) => [c.fips, c]));
  const reordered: RegionDashboardCountyCard[] = [];
  const used = new Set<string>();
  for (const f of NWA_FIPS_ORDER) {
    const row = byFips.get(f);
    if (row) {
      reordered.push({ ...row });
      used.add(f);
    }
  }
  for (const c of base.counties) {
    if (!used.has(c.fips)) reordered.push({ ...c });
  }
  const nwaCounties: RegionDashboardCountyCard[] = reordered.map((c) => {
    const isBenton = c.fips === "05007";
    const isWashington = c.fips === "05143";
    return {
      ...c,
      isPrimaryNwa: isBenton || isWashington,
      cardNote: isBenton
        ? "NWA primary — Rogers / Bentonville core. Demo team/coverage; county intelligence v2 not live yet."
        : isWashington
          ? "NWA primary — Fayetteville / Springdale / Johnson. Demo on this page only."
          : c.fips === "05015"
            ? "Nearby NWA in registry: Carroll (Eureka / tourism + rural mix). Demo/seed for layout."
            : c.fips === "05087"
              ? "Nearby NWA in registry: Madison. Rural; one strong captain before density goals in public view."
              : c.cardNote,
    };
  });

  const highlightCards: RegionDashboardHighlightCard[] = [
    {
      displayName: "Benton County",
      countySlug: "benton-county",
      fips: "05007",
      href: "/counties/benton-county",
      roleLabel: "Primary (NWA core)",
      cardNote: "Largest NWA commercial / commute basin in this comparison row. All figures demo/seed.",
      teamScaleDemo: { value: 12, source: "demo", note: DEMO_NOTE },
      coverageDemo: { value: 38, source: "demo", note: DEMO_NOTE },
    },
    {
      displayName: "Washington County",
      countySlug: "washington-county",
      fips: "05143",
      href: "/counties/washington-county",
      roleLabel: "Primary (NWA core)",
      cardNote: "University + employer cluster; public page stays aggregate and labeled demo.",
      teamScaleDemo: { value: 16, source: "demo", note: DEMO_NOTE },
      coverageDemo: { value: 45, source: "demo", note: DEMO_NOTE },
    },
    {
      displayName: "Pope County",
      countySlug: "pope-county",
      fips: "05115",
      href: "/counties/pope-county",
      roleLabel: "Prototype reference (OIS sample)",
      cardNote: "Not in the NWA command registry row — used here as the gold-standard county v2 shell to copy from.",
      teamScaleDemo: { value: 9, source: "demo", note: "Illustrative; open v2 for the real public shell." },
      coverageDemo: { value: 47, source: "demo", note: "Illustrative; compare to Pope v2, not a cross-file fact." },
      secondaryHref: "/county-briefings/pope/v2",
      secondaryLabel: "Open Pope v2 →",
    },
  ];

  const nextItems: RegionNextCountyBuildItem[] = [
    {
      id: "nwa-benton",
      displayName: "Benton County",
      targetLabel: "County intelligence dashboard v2 (planned)",
      hrefCommand: "/counties/benton-county",
      hrefOrganizingIntelligence: "/organizing-intelligence/counties/benton-county",
      note: "Will mirror the Pope v2 / shared county shell. Not a separate route in this build.",
    },
    {
      id: "nwa-washington",
      displayName: "Washington County",
      targetLabel: "County intelligence dashboard v2 (planned)",
      hrefCommand: "/counties/washington-county",
      hrefOrganizingIntelligence: "/organizing-intelligence/counties/washington-county",
      note: "Same OIS pattern as Pope v2; field data and ethics review first.",
    },
  ];

  return {
    ...base,
    counties: nwaCounties,
    dataDisclaimer: `${SHELL_VERSION}: County list and order follow registry (northwest). Benton and Washington = primary. Carroll and Madison = nearby. KPIs, Power of 5, peer cells, and per-card % are demo/seed — not competitive intelligence. No voter PII. Pope in the comparison row is a cross-bucket OIS training reference only.`,
    strategy: {
      overline: "Theory of the turf",
      title: "Strategy — NWA in this build",
      panelDescription:
        "NWA priorities on the public site — lead with Benton and Washington; use Pope v2 only as a layout checklist (different campaign bucket).",
      whatThisMeans:
        "NWA, here, is the four counties in the 75-county “northwest” command bucket: Benton, Washington, Carroll, and Madison. Benton and Washington carry the most registered voters and employer density. Pope is not in that bucket; the comparison row uses Pope only as a published OIS county shell to emulate — not to merge voter data across regions on this page.",
      whereToPress:
        "Build relational and Power of 5 capacity in Benton and Washington first, then use Carroll and Madison for satellite listening and backfill. Use Pope v2 as a checklist for layout and honest gaps, not as a data merge against NWA file exports.",
      whereToBackfill:
        "Rural and lower-density cards (e.g. Madison) should not chase dot density in public view: one strong captain, then precinct list mode. Keep demo tags obvious until the multi-county pipeline is live.",
      whatToDoNext:
        "Open Pope v2 for a full public drill pattern, return here for regional rollup, and when approved add Benton and Washington v2 under the same shared shell. Roll peer rows to statewide OIS when the state index is wired.",
    },
    comparison: {
      ...base.comparison,
      description:
        "The “River Valley” peer in this table is a planning label, not a certified head-to-head. NWA on this page = Benton + Washington primary + nearby registry counties. Pope in the top cards is a prototype reference, not a fourth in-bucket NWA row.",
    },
    primaryComparisonRow: {
      overline: "Primary + reference",
      title: "NWA — comparison (Benton · Washington · Pope sample)",
      description:
        "Benton and Washington: primary NWA basins. Pope: OIS end-to-end sample (different registry campaign bucket). All metrics demo/seed on this public page.",
      cards: highlightCards,
    },
    nextCountiesToBuild: {
      overline: "Roadmap",
      title: "Next county dashboards to build",
      description: "Benton and Washington will use the same shared county shell as Pope; routes are not created in this pass. Use public county command until then.",
      items: nextItems,
    },
  };
}
