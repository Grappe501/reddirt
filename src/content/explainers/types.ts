import type { MediaRef } from "@/content/media/registry";

export type ExplainerEntry = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  category: string;
  image: MediaRef;
  intro: string;
  steps: { title: string; body: string }[];
  faq: { q: string; a: string }[];
  relatedLinks: { label: string; href: string }[];
  relatedSlugs: string[];
  publishedAt: string;
};
