import { prisma } from "@/lib/db";
import { getJoinCampaignHref } from "@/config/external-campaign";
import {
  heardItems as defaultHeard,
  movementBeliefs as defaultMovement,
  pathwayCards as defaultPathways,
} from "@/content/homepage";

export type HomepageHeroMerged = {
  eyebrow: string;
  titleBefore: string;
  titleAccent: string;
  titleAfter: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

export type HomepageSectionToggle = { id: string; enabled: boolean };

export const HOMEPAGE_SECTION_IDS = [
  "hero",
  "heard",
  "movement",
  "pathways",
  "democracy",
  "labor",
  "arkansas",
  "stories",
  "editorial",
  "blog",
  "updates",
  "quote",
  "finalCta",
] as const;

export type HomepageSectionId = (typeof HOMEPAGE_SECTION_IDS)[number];

const DEFAULT_HERO: HomepageHeroMerged = {
  eyebrow: "Kelly Grappe · Secretary of State",
  titleBefore: "The People",
  titleAccent: "Rule.",
  titleAfter: "",
  subtitle:
    "Arkansas deserves a Secretary of State’s office that is transparent, secure, and accountable to the people in all 75 counties.",
  ctaPrimaryLabel: "Join the Campaign",
  ctaPrimaryHref: getJoinCampaignHref(),
  ctaSecondaryLabel: "Watch Kelly Speak",
  ctaSecondaryHref: "#hear-kelly",
};

/** All narrative sections on by default; disable in admin if you need a shorter page. */
const DEFAULT_SECTION_ORDER: HomepageSectionToggle[] = HOMEPAGE_SECTION_IDS.map((id) => ({
  id,
  enabled: true,
}));

const DEFAULT_QUOTE = {
  quote: "Leadership in this role isn’t about headlines or ideology—it’s about steady, transparent administration and respect for the law.",
  attribution: "Campaign principle",
};

/** Rich homepage splits (formerly “Red Dirt” narrative blocks) — editable in admin; these are the public defaults. */
const DEFAULT_SPLIT_DEMOCRACY: HomepageSplitCopy = {
  kicker: "Direct democracy",
  title: "Ballot access is public infrastructure",
  body: "Initiatives and referenda are one way Arkansans keep power close to home. The Secretary of State’s office sits at the center of fair notice, timelines, and clarity.",
  bullets: [
    "Clear instructions for signature gatherers and voters",
    "Defensible timelines that don’t move in the shadows",
    "Plain-language answers when people ask what happens next",
  ],
};

const DEFAULT_SPLIT_LABOR: HomepageSplitCopy = {
  kicker: "Filings & public records",
  title: "When systems are confusing, local people pay the cost",
  body: "Businesses, nonprofits, and neighbors rely on the Secretary of State’s office for filings, registrations, and access. Confusion isn’t neutral—it hits small operators first.",
  bullets: [
    "Predictable processes and reachable help",
    "Public records that are actually easy to use",
    "Support for clerks and counties who field the calls",
  ],
};

const DEFAULT_ARKANSAS_BAND = {
  intro:
    "Arkansas is 75 counties of patchwork economies and shared pride. The front office of state government should feel as close as the courthouse square—even when the work is technical.",
  quote: "Showing up isn’t a stunt. It’s how trust starts.",
  attribution: "Field principle",
};

function mergeSplit(raw: unknown, fallback: HomepageSplitCopy): HomepageSplitCopy {
  if (raw && typeof raw === "object") {
    return { ...fallback, ...(raw as HomepageSplitCopy) };
  }
  return fallback;
}

function mergeArkansasBand(
  raw: unknown,
  fallback: typeof DEFAULT_ARKANSAS_BAND,
): typeof DEFAULT_ARKANSAS_BAND {
  if (raw && typeof raw === "object") {
    return { ...fallback, ...(raw as typeof DEFAULT_ARKANSAS_BAND) };
  }
  return fallback;
}

const DEFAULT_FINAL_CTA = {
  eyebrow: "Regnat Populus",
  title: "The People Rule.",
  description:
    "This campaign is about restoring trust, protecting the people’s voice, and building a Secretary of State’s office that answers to Arkansas. Not the insiders. Not the noise. The people.",
  primaryLabel: "Join the Campaign",
  primaryHref: getJoinCampaignHref(),
  secondaryLabel: "Donate Today",
  secondaryHref: "/donate",
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "object") return fallback;
  return { ...fallback, ...(value as T) };
}

function mergeSectionOrder(raw: unknown): HomepageSectionToggle[] {
  if (!Array.isArray(raw)) return DEFAULT_SECTION_ORDER;
  const byId = new Map<string, boolean>();
  for (const row of raw) {
    if (row && typeof row === "object" && "id" in row && typeof (row as { id: unknown }).id === "string") {
      const id = (row as { id: string }).id;
      const enabled = "enabled" in row ? Boolean((row as { enabled: unknown }).enabled) : true;
      byId.set(id, enabled);
    }
  }
  const ordered: HomepageSectionToggle[] = [];
  for (const row of raw) {
    if (row && typeof row === "object" && "id" in row && typeof (row as { id: unknown }).id === "string") {
      const id = (row as { id: string }).id;
      const enabled = "enabled" in row ? Boolean((row as { enabled: unknown }).enabled) : true;
      ordered.push({ id, enabled });
    }
  }
  if (ordered.length === 0) return DEFAULT_SECTION_ORDER;
  for (const id of HOMEPAGE_SECTION_IDS) {
    if (!ordered.some((o) => o.id === id)) {
      ordered.push({ id, enabled: byId.get(id) ?? true });
    }
  }
  const rank = (id: string) => {
    const i = HOMEPAGE_SECTION_IDS.indexOf(id as HomepageSectionId);
    return i >= 0 ? i : 1000;
  };
  ordered.sort((a, b) => rank(a.id) - rank(b.id));
  return ordered;
}

export type HomepageSplitCopy = {
  kicker?: string;
  title?: string;
  body?: string;
  bullets?: string[];
};

export type MergedHomepageConfig = {
  hero: HomepageHeroMerged;
  sectionOrder: HomepageSectionToggle[];
  heardItems: (typeof defaultHeard)[number][];
  movementBeliefs: (typeof defaultMovement)[number][];
  pathwayCards: (typeof defaultPathways)[number][];
  splitDemocracy: HomepageSplitCopy;
  splitLabor: HomepageSplitCopy;
  arkansasBand: { intro?: string; quote?: string; attribution?: string };
  quoteBand: typeof DEFAULT_QUOTE;
  finalCta: typeof DEFAULT_FINAL_CTA;
  featuredStorySlugs: string[];
  featuredEditorialSlugs: string[];
  featuredSyncedPostSlugs: string[];
  featuredExplainerSlugs: string[];
  /** Optional `InboundContentItem.id` (YouTube row) for homepage featured lazy player */
  featuredHomepageVideoInboundId: string | null;
};

const defaultStorySlugs = ["first-time-voter-line", "porch-list-organizer", "flood-fema-loop"] as const;

const defaultEditorialSlugs = [
  "why-people-stopped-showing-up",
  "direct-democracy-in-practice",
  "future-of-work-arkansas",
] as const;

export async function getMergedHomepageConfig(): Promise<MergedHomepageConfig> {
  try {
    const row = await prisma.homepageConfig.findUnique({ where: { id: "default" } });

    const heroRaw = row?.hero as Partial<HomepageHeroMerged> | null | undefined;
    let hero: HomepageHeroMerged = { ...DEFAULT_HERO, ...heroRaw };
    if (hero.ctaPrimaryHref === "/get-involved") {
      hero = { ...hero, ctaPrimaryHref: getJoinCampaignHref() };
    }

    const heardRaw = row?.heardItems as unknown;
    const heardItems =
      Array.isArray(heardRaw) && heardRaw.length > 0
        ? (heardRaw as (typeof defaultHeard)[number][])
        : [...defaultHeard];

    const movementRaw = row?.movementBeliefs as unknown;
    const movementBeliefs =
      Array.isArray(movementRaw) && movementRaw.length > 0
        ? (movementRaw as (typeof defaultMovement)[number][])
        : [...defaultMovement];

    const pathwayRaw = row?.pathwayCards as unknown;
    const pathwayCards =
      Array.isArray(pathwayRaw) && pathwayRaw.length > 0
        ? (pathwayRaw as (typeof defaultPathways)[number][])
        : [...defaultPathways];

    return {
      hero,
      sectionOrder: mergeSectionOrder(row?.sectionOrder),
      heardItems,
      movementBeliefs,
      pathwayCards,
      splitDemocracy: mergeSplit(row?.splitDemocracy, DEFAULT_SPLIT_DEMOCRACY),
      splitLabor: mergeSplit(row?.splitLabor, DEFAULT_SPLIT_LABOR),
      arkansasBand: mergeArkansasBand(row?.arkansasBand, DEFAULT_ARKANSAS_BAND),
      quoteBand: parseJson(row?.quoteBand, DEFAULT_QUOTE),
      finalCta: (() => {
        let fc = parseJson(row?.finalCta, DEFAULT_FINAL_CTA);
        if (fc.primaryHref === "/get-involved") {
          fc = { ...fc, primaryHref: getJoinCampaignHref() };
        }
        return fc;
      })(),
      featuredStorySlugs:
        row?.featuredStorySlugs?.length ? row.featuredStorySlugs : [...defaultStorySlugs],
      featuredEditorialSlugs:
        row?.featuredEditorialSlugs?.length ? row.featuredEditorialSlugs : [...defaultEditorialSlugs],
      featuredSyncedPostSlugs: row?.featuredSyncedPostSlugs ?? [],
      featuredExplainerSlugs: row?.featuredExplainerSlugs ?? [],
      featuredHomepageVideoInboundId: row?.featuredHomepageVideoInboundId?.trim() || null,
    };
  } catch {
    return {
      hero: DEFAULT_HERO,
      sectionOrder: DEFAULT_SECTION_ORDER,
      heardItems: [...defaultHeard],
      movementBeliefs: [...defaultMovement],
      pathwayCards: [...defaultPathways],
      splitDemocracy: { ...DEFAULT_SPLIT_DEMOCRACY },
      splitLabor: { ...DEFAULT_SPLIT_LABOR },
      arkansasBand: { ...DEFAULT_ARKANSAS_BAND },
      quoteBand: DEFAULT_QUOTE,
      finalCta: DEFAULT_FINAL_CTA,
      featuredStorySlugs: [...defaultStorySlugs],
      featuredEditorialSlugs: [...defaultEditorialSlugs],
      featuredSyncedPostSlugs: [],
      featuredExplainerSlugs: [],
      featuredHomepageVideoInboundId: null,
    };
  }
}

export function isHomepageSectionEnabled(
  order: HomepageSectionToggle[],
  id: HomepageSectionId,
): boolean {
  const hit = order.find((s) => s.id === id);
  return hit ? hit.enabled : true;
}
