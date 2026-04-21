import { ContentCollection } from "@prisma/client";
import { allEditorial, getEditorialBySlug } from "@/content/editorial";
import type { EditorialPiece } from "@/content/editorial/types";
import { allExplainers, getExplainerBySlug } from "@/content/explainers";
import type { ExplainerEntry } from "@/content/explainers/types";
import { allStories, getStoryBySlug } from "@/content/stories";
import type { StoryEntry } from "@/content/stories/types";
import {
  applyEditorialOverride,
  applyExplainerOverride,
  applyStoryOverride,
  getAllContentOverrides,
  getOverride,
} from "./public-overrides";

export async function getPublicStoryBySlug(slug: string): Promise<StoryEntry | undefined> {
  const base = getStoryBySlug(slug);
  if (!base) return undefined;
  const o = await getOverride(ContentCollection.STORY, slug);
  if (o?.hidden) return undefined;
  return applyStoryOverride(base, o);
}

export async function getPublicEditorialBySlug(slug: string): Promise<EditorialPiece | undefined> {
  const base = getEditorialBySlug(slug);
  if (!base) return undefined;
  const o = await getOverride(ContentCollection.EDITORIAL, slug);
  if (o?.hidden) return undefined;
  return applyEditorialOverride(base, o);
}

export async function getPublicExplainerBySlug(slug: string): Promise<ExplainerEntry | undefined> {
  const base = getExplainerBySlug(slug);
  if (!base) return undefined;
  const o = await getOverride(ContentCollection.EXPLAINER, slug);
  if (o?.hidden) return undefined;
  return applyExplainerOverride(base, o);
}

export async function listPublicStoriesMerged(): Promise<StoryEntry[]> {
  const map = await getAllContentOverrides();
  return allStories
    .filter((s) => !map.get(`${ContentCollection.STORY}:${s.slug}`)?.hidden)
    .map((s) => applyStoryOverride(s, map.get(`${ContentCollection.STORY}:${s.slug}`)));
}

export async function featuredPublicStories(limit = 2): Promise<StoryEntry[]> {
  const list = await listPublicStoriesMerged();
  const featured = list.filter((s) => s.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  return [...featured, ...list.filter((s) => !s.featured)].slice(0, limit);
}

export async function listPublicEditorialMerged(): Promise<EditorialPiece[]> {
  const map = await getAllContentOverrides();
  return allEditorial
    .filter((p) => !map.get(`${ContentCollection.EDITORIAL}:${p.slug}`)?.hidden)
    .map((p) => applyEditorialOverride(p, map.get(`${ContentCollection.EDITORIAL}:${p.slug}`)));
}

export async function listPublicExplainersMerged(): Promise<ExplainerEntry[]> {
  const map = await getAllContentOverrides();
  return allExplainers
    .filter((e) => !map.get(`${ContentCollection.EXPLAINER}:${e.slug}`)?.hidden)
    .map((e) => applyExplainerOverride(e, map.get(`${ContentCollection.EXPLAINER}:${e.slug}`)));
}
