import type { DocumentBlock } from "@/content/shared/document";
import type { MediaRef } from "@/content/media/registry";

export type StoryCategory =
  | "work"
  | "family"
  | "community"
  | "youth"
  | "rural"
  | "healthcare"
  | "organizing";

/** `real` = verified person; `example` = illustrative composite — always show readers which applies. */
export type StoryNarrativeSource = "real" | "example";

export type StoryEntry = {
  title: string;
  slug: string;
  summary: string;
  body: DocumentBlock[];
  tags: string[];
  category: StoryCategory;
  categoryLabel: string;
  featured: boolean;
  image: MediaRef;
  quotePullouts?: { quote: string; attribution?: string }[];
  relatedSlugs: string[];
  publishedAt: string;
  dek?: string;
  /** Defaults to `example` in UI if omitted (legacy content). */
  narrativeSource?: StoryNarrativeSource;
};
