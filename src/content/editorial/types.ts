import type { MediaRef } from "@/content/media/registry";

export type EditorialSection =
  | { type: "prose"; title?: string; paragraphs: string[] }
  | { type: "list"; title?: string; items: string[] }
  | { type: "quote"; quote: string; attribution?: string }
  | { type: "callout"; title: string; body: string };

export type EditorialPiece = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  category: string;
  featured: boolean;
  image: MediaRef;
  sections: EditorialSection[];
  relatedSlugs: string[];
  publishedAt: string;
};
