/**
 * Region dashboard (OIS) — shared data shapes. Aligns with county dashboard labeling (`CountyDashboardLabeledMetric`).
 * Rollups are mostly demo/seed until multi-county field pipelines exist; county counts are **derived** from the registry + CANON-REGION-1.
 */
import type { ArkansasCampaignRegionSlug } from "./arkansas-campaign-regions";
import type {
  CountyDashboardKpiItem,
  CountyDashboardLabeledMetric,
  CountyDashboardNextAction,
  CountyDashboardRiskRow,
  PowerOf5RelationalChartBundle,
} from "@/lib/campaign-engine/county-dashboards/types";

export type RegionDashboardKpiItem = CountyDashboardKpiItem;

export type RegionDashboardCountyCard = {
  displayName: string;
  countySlug: string;
  fips: string;
  href: string;
  /** Optional v2-style briefing or command link (non-breaking). */
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Map / grid note; safe for public. */
  cardNote?: string;
  /** River Valley: Pope = live pilot anchor; others may be planning scaffolds. */
  isAnchorCounty?: boolean;
  /** Not yet in FIPS override map for this region — team/coverage are demo. */
  isPlanningScaffold?: boolean;
  /** NWA page: largest regional basins (Benton, Washington) for UI emphasis. */
  isPrimaryNwa?: boolean;
  teamScaleDemo: CountyDashboardLabeledMetric<number>;
  coverageDemo: CountyDashboardLabeledMetric<number>;
};

export type RegionDashboardHighlightCard = {
  displayName: string;
  countySlug: string;
  fips: string;
  href: string;
  roleLabel: string;
  cardNote: string;
  teamScaleDemo: CountyDashboardLabeledMetric<number>;
  coverageDemo: CountyDashboardLabeledMetric<number>;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export type RegionNextCountyBuildItem = {
  id: string;
  displayName: string;
  /** e.g. "County intelligence v2" */
  targetLabel: string;
  hrefCommand: string;
  /** Public OIS county placeholder, e.g. `/organizing-intelligence/counties/pope-county`. */
  hrefOrganizingIntelligence?: string;
  note: string;
};

export type RegionComparisonRow = {
  id: string;
  metric: string;
  /** Demo/seed values for peer vs this region. */
  peerLabel: string;
  peerValue: string;
  regionValue: string;
  notes: string;
  source: "demo" | "derived";
};

export type RegionComparisonTableModel = {
  title: string;
  description?: string;
  overline?: string;
  /** Column headers: peer region name, peer value, this region, notes */
  columnLabels: [string, string, string, string];
  rows: RegionComparisonRow[];
};

export type RegionPowerOf5Block = {
  title?: string;
  overline?: string;
  intro: string;
  items: RegionDashboardKpiItem[];
};

export type RegionStrategyBlock = {
  overline?: string;
  title?: string;
  /** Optional panel description under the title (public gateway copy). */
  panelDescription?: string;
  whatThisMeans: string;
  whereToPress: string;
  whereToBackfill: string;
  whatToDoNext: string;
};

/**
 * One campaign-region shell payload (e.g. River Valley, NWA). No voter microdata; demos labeled.
 */
export type RegionOrganizingGateway = {
  headline: string;
  body: string;
};

export type RegionDashboard = {
  campaignRegionSlug: ArkansasCampaignRegionSlug;
  displayName: string;
  generatedAt: string;
  /** Volunteer-facing intro — pairs with demo badges on the same page. */
  gateway: RegionOrganizingGateway;
  /** Shown in hero / footer — state demo policy. */
  dataDisclaimer: string;
  /**
   * When campaign display name ≠ a single `ArkansasCounty's` registry bucket, document here (e.g. River Valley vs `central` rows).
   */
  taxonomyNote?: string;
  countyCount: { value: number; source: "derived" | "demo"; note?: string };
  kpiItems: RegionDashboardKpiItem[];
  /** Relational demo charts (same shape as county v2) — invite/activate/conversation cadence. */
  relationalCharts: PowerOf5RelationalChartBundle;
  mapCaption: string;
  powerOf5: RegionPowerOf5Block;
  strategy: RegionStrategyBlock;
  counties: RegionDashboardCountyCard[];
  comparison: RegionComparisonTableModel;
  nextActions: CountyDashboardNextAction[];
  risks: CountyDashboardRiskRow[];
  /**
   * Optional side-by-side comparison (e.g. Benton, Washington, Pope reference) — NWA and similar region pages.
   */
  primaryComparisonRow?: {
    overline: string;
    title: string;
    description: string;
    cards: RegionDashboardHighlightCard[];
  };
  /**
   * Optional roadmap: county v2 dashboards not built yet; links to public county command are OK.
   */
  nextCountiesToBuild?: {
    overline: string;
    title: string;
    description: string;
    items: RegionNextCountyBuildItem[];
  };
  /** Shown in RegionCountyGrid; otherwise the view uses slug-based defaults. */
  countyGridDescription?: string;
};
