/**
 * CANON-REGION-1 — Stakeholder-facing campaign region taxonomy (display layer only).
 * Does not replace `ArCommandRegionId` in `arkansas-county-registry.ts`; that remains the
 * stable command/workbench ID for each county. This module adds names + slugs for
 * public narrative, dashboards, and rollups.
 */

import { type ArCommandRegionId, regionLabelForId } from "@/lib/county/arkansas-county-registry";

/** Stable public slug for campaign URLs, filters, and peer tables. */
export type ArkansasCampaignRegionSlug =
  | "northwest-arkansas"
  | "central-arkansas"
  | "river-valley"
  | "north-central-ozarks"
  | "northeast-arkansas"
  | "delta-eastern-arkansas"
  | "southeast-arkansas"
  | "southwest-arkansas";

export type ArkansasCampaignRegion = {
  slug: ArkansasCampaignRegionSlug;
  /** Human-facing name for copy, H1s, and tables */
  displayName: string;
  /** Sort for statewide lists (1 = NWA first in anchor stack) */
  sort: number;
  /** How this relates to the registry command ID layer */
  notes?: string;
};

/**
 * The eight campaign regions. Order = stakeholder “anchor” order for statewide UI.
 * (Not a 1:1 to the eight `ArCommandRegionId` values; see `COMMAND_REGION_ID_TO_DEFAULT_CAMPAIGN_SLUG`.)
 */
export const ARKANSAS_CAMPAIGN_REGIONS: readonly ArkansasCampaignRegion[] = [
  { slug: "northwest-arkansas", displayName: "Northwest Arkansas", sort: 1 },
  {
    slug: "central-arkansas",
    displayName: "Central Arkansas",
    sort: 2,
    notes: "I-30 / capital metro belt; many registry `central` and merged `west_central` display rows in mixed briefings.",
  },
  {
    slug: "river-valley",
    displayName: "River Valley",
    sort: 3,
    notes: "Not a registry ID — use FIPS overrides (e.g. Pope 05115) for stakeholder story while keeping `regionId: central` in data.",
  },
  { slug: "north-central-ozarks", displayName: "North Central / Ozarks", sort: 4 },
  { slug: "northeast-arkansas", displayName: "Northeast Arkansas", sort: 5 },
  {
    slug: "delta-eastern-arkansas",
    displayName: "Delta / Eastern Arkansas",
    sort: 6,
    notes: "Often aligns with registry `southeast` (Delta-leaning language in the old command list).",
  },
  {
    slug: "southeast-arkansas",
    displayName: "Southeast Arkansas",
    sort: 7,
    notes: "Often aligns with registry `south` (timber / lower-south in the old list).",
  },
  { slug: "southwest-arkansas", displayName: "Southwest Arkansas", sort: 8 },
] as const;

const BY_SLUG: ReadonlyMap<ArkansasCampaignRegionSlug, ArkansasCampaignRegion> = new Map(
  ARKANSAS_CAMPAIGN_REGIONS.map((r) => [r.slug, r]),
);

/**
 * Default mapping: each `ArCommandRegionId` (unchanged in DB/registry) → one campaign region slug.
 * **Reconciliation, not a migration:** some distinct command IDs map to the same campaign label for narrative simplicity.
 */
export const COMMAND_REGION_ID_TO_DEFAULT_CAMPAIGN_SLUG: Readonly<
  Record<ArCommandRegionId, ArkansasCampaignRegionSlug>
> = {
  northwest: "northwest-arkansas",
  north_central: "north-central-ozarks",
  northeast: "northeast-arkansas",
  central: "central-arkansas",
  /**
   * CONFLICT: registry `west_central` has no separate stakeholder name. Folded into `central-arkansas`
   * for default campaign tables (Ouachitas / Hot Springs / Fort Smith area). Override per county if needed.
   */
  west_central: "central-arkansas",
  southwest: "southwest-arkansas",
  southeast: "delta-eastern-arkansas",
  south: "southeast-arkansas",
} as const;

/**
 * FIPS (5 digits) → campaign slug when stakeholder geography differs from the default command mapping.
 * **Pope (05115):** registry has `regionId: "central"`, but public strategy and many briefs use **River Valley**.
 * We do not change the county’s `regionId` in `arkansas-county-registry` — this map is display/rollup only.
 */
export const CAMPAIGN_REGION_FIPS_OVERRIDES: Readonly<Partial<Record<string, ArkansasCampaignRegionSlug>>> = {
  "05115": "river-valley", // Pope County
} as const;

export function getCampaignRegionBySlug(slug: ArkansasCampaignRegionSlug): ArkansasCampaignRegion | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Resolves the campaign region slug: FIPS override wins, else default from `commandRegionId`.
 */
export function getCampaignRegionSlugForCounty(fips: string, commandRegionId: ArCommandRegionId): ArkansasCampaignRegionSlug {
  const o = CAMPAIGN_REGION_FIPS_OVERRIDES[fips];
  if (o) return o;
  return COMMAND_REGION_ID_TO_DEFAULT_CAMPAIGN_SLUG[commandRegionId];
}

/**
 * Stakeholder display name (e.g. "River Valley" for Pope) for dashboards and public copy.
 */
export function getCampaignRegionDisplayNameForCounty(fips: string, commandRegionId: ArCommandRegionId): string {
  const slug = getCampaignRegionSlugForCounty(fips, commandRegionId);
  return getCampaignRegionBySlug(slug)?.displayName ?? slug;
}

/**
 * For transparency when campaign label ≠ registry: long label from `regionMeta` / `regionLabelForId`.
 */
export function getRegistryCommandRegionLabel(commandRegionId: ArCommandRegionId): string {
  return regionLabelForId(commandRegionId);
}

/**
 * One object for UIs: never drops `commandRegionId`; adds campaign name + slug.
 */
export function resolveRegionPresentationForCounty(fips: string, commandRegionId: ArCommandRegionId) {
  const campaignSlug = getCampaignRegionSlugForCounty(fips, commandRegionId);
  const campaignDisplayName = getCampaignRegionBySlug(campaignSlug)?.displayName ?? campaignSlug;
  const registryCommandLabel = getRegistryCommandRegionLabel(commandRegionId);
  return {
    /** Unchanged from `getRegistryCountyBySlug` / `County.region` logic — do not rewrite in migrations. */
    commandRegionId,
    /** Long ARK command string (legacy list in registry). */
    registryCommandLabel,
    campaignRegionSlug: campaignSlug,
    /** Preferred story name for this county (FIPS override applied). */
    campaignRegionDisplayName: campaignDisplayName,
    /**
     * True when FIPS list overrides the default from `commandRegionId` (e.g. Pope → River Valley).
     */
    isCampaignOverride: CAMPAIGN_REGION_FIPS_OVERRIDES[fips] != null,
  };
}
