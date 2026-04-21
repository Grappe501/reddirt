import type { ContentCollection, ContentItemOverride, MediaAsset } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { EditorialPiece } from "@/content/editorial/types";
import type { ExplainerEntry } from "@/content/explainers/types";
import type { StoryEntry } from "@/content/stories/types";
import { mediaRefFromAsset } from "./media-from-asset";

export type OverrideRow = ContentItemOverride & { heroMedia: MediaAsset | null };

type OverrideMap = Map<string, OverrideRow>;

function key(collection: ContentCollection, slug: string) {
  return `${collection}:${slug}`;
}

let cached: { at: number; map: OverrideMap } | null = null;
const TTL_MS = 15_000;

async function loadOverrideMap(): Promise<OverrideMap> {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) return cached.map;

  try {
    const rows = await prisma.contentItemOverride.findMany({
      include: { heroMedia: true },
    });
    const map: OverrideMap = new Map();
    for (const r of rows) {
      map.set(key(r.collection, r.slug), r);
    }
    cached = { at: now, map };
    return map;
  } catch {
    const map: OverrideMap = new Map();
    cached = { at: now, map };
    return map;
  }
}

export function invalidateContentOverridesCache() {
  cached = null;
}

export async function getOverride(collection: ContentCollection, slug: string): Promise<OverrideRow | undefined> {
  const map = await loadOverrideMap();
  return map.get(key(collection, slug));
}

/** Full override map for batch merges (e.g. homepage story cards). */
export async function getAllContentOverrides(): Promise<OverrideMap> {
  return loadOverrideMap();
}

export function applyStoryOverride(base: StoryEntry, o?: OverrideRow): StoryEntry {
  if (!o) return base;
  return {
    ...base,
    featured: o.featured || base.featured,
    summary: o.summaryOverride?.trim() || o.teaserOverride?.trim() || base.summary,
    image: o.heroMedia ? mediaRefFromAsset(o.heroMedia) : base.image,
  };
}

export function applyEditorialOverride(base: EditorialPiece, o?: OverrideRow): EditorialPiece {
  if (!o) return base;
  return {
    ...base,
    featured: o.featured || base.featured,
    summary: o.summaryOverride?.trim() || o.teaserOverride?.trim() || base.summary,
    image: o.heroMedia ? mediaRefFromAsset(o.heroMedia) : base.image,
  };
}

export function applyExplainerOverride(base: ExplainerEntry, o?: OverrideRow): ExplainerEntry {
  if (!o) return base;
  return {
    ...base,
    summary: o.summaryOverride?.trim() || o.teaserOverride?.trim() || base.summary,
    intro: o.teaserOverride?.trim() || base.intro,
    image: o.heroMedia ? mediaRefFromAsset(o.heroMedia) : base.image,
  };
}

export async function isHidden(collection: ContentCollection, slug: string): Promise<boolean> {
  const o = await getOverride(collection, slug);
  return Boolean(o?.hidden);
}
