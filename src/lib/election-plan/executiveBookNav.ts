import {
  EXECUTIVE_BOOK_CHAPTERS,
  EXECUTIVE_BOOK_PARTS,
  type ExecutiveBookChapterDef,
} from "./executiveBookChapters";

export type ExecutiveBookPartId = (typeof EXECUTIVE_BOOK_PARTS)[number]["id"];

export const EXECUTIVE_BOOK_PILLAR_LABELS: Record<string, string> = Object.fromEntries(
  EXECUTIVE_BOOK_PARTS.map((p) => [p.id, p.label]),
);

export const EXECUTIVE_BOOK_EDITION = {
  version: "2.0",
  label: "Executive Book 2.0",
  tagline: "Campaign Operating System manual · shareable chapters · board-ready doctrine",
};

export type ExecutiveBookTocEntry = {
  id: string;
  title: string;
  level: 2 | 3;
};

export function getExecutiveBookPillar(slug: string): string {
  const chapter = EXECUTIVE_BOOK_CHAPTERS.find((c) => c.slug === slug);
  return chapter?.partId ?? "part-i-victory-strategy";
}

export function getAdjacentExecutiveBookChapters(slug: string): {
  prev: ExecutiveBookChapterDef | null;
  next: ExecutiveBookChapterDef | null;
} {
  const canonical = EXECUTIVE_BOOK_CHAPTERS;
  const index = canonical.findIndex((c) => c.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? canonical[index - 1]! : null,
    next: index < canonical.length - 1 ? canonical[index + 1]! : null,
  };
}

export function getRelatedExecutiveBookChapters(slug: string): ExecutiveBookChapterDef[] {
  const chapter = EXECUTIVE_BOOK_CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) return [];

  const crossLinks: Partial<Record<string, string[]>> = {
    doctrine: ["path-to-victory", "ppen", "leadership-development"],
    "path-to-victory": ["county-strategy", "ppen", "fundraising-operating-system"],
    "county-strategy": ["county-workbench-system", "path-to-victory", "immersion-county-missions"],
    "community-strategy": ["community-workbench-system", "event-operations", "ppen"],
    "coalition-strategy": ["leadership-development", "campaign-communications-hub", "fundraising-opportunities"],
    ppen: ["leadership-development", "voter-engagement", "volunteer-onboarding"],
    "leadership-development": ["ppen", "accountability-reporting", "volunteer-onboarding"],
    "county-workbench-system": ["county-strategy", "community-workbench-system", "fundraising-operating-system"],
    "community-workbench-system": ["event-operations", "fundraising-opportunities", "ppen"],
    "event-operations": ["fundraising-opportunities", "community-workbench-system", "communications-calendar"],
    "fundraising-operating-system": ["fundraising-opportunities", "path-to-victory", "county-workbench-system"],
    "labor-day-readiness": ["campaign-calendar", "accountability-reporting", "leadership-development"],
    "election-day-operations": ["voter-engagement", "ppen", "campaign-calendar"],
    "technology-data-systems": ["appendix-workbench-architecture", "accountability-reporting", "volunteer-onboarding"],
  };

  const linked = (crossLinks[slug] ?? [])
    .map((s) => EXECUTIVE_BOOK_CHAPTERS.find((c) => c.slug === s))
    .filter((c): c is ExecutiveBookChapterDef => Boolean(c));

  const samePart = EXECUTIVE_BOOK_CHAPTERS.filter(
    (c) => c.slug !== slug && c.partId === chapter.partId,
  );

  const merged = [...linked];
  for (const c of samePart) {
    if (!merged.some((m) => m.slug === c.slug) && merged.length < 4) merged.push(c);
  }
  return merged.slice(0, 4);
}

/** Extract h2/h3 headings for on-page table of contents. */
export function extractExecutiveBookToc(markdown: string): ExecutiveBookTocEntry[] {
  const entries: ExecutiveBookTocEntry[] = [];
  for (const line of markdown.split("\n")) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      entries.push({ id: slugifyHeading(h2[1]!), title: stripMarkdown(h2[1]!), level: 2 });
      continue;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      entries.push({ id: slugifyHeading(h3[1]!), title: stripMarkdown(h3[1]!), level: 3 });
    }
  }
  return entries.slice(0, 24);
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function slugifyHeading(text: string): string {
  return stripMarkdown(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function groupChaptersByPillar<T extends { slug: string; partId?: string }>(
  chapters: T[],
): Array<{ pillar: string; label: string; chapters: T[] }> {
  return EXECUTIVE_BOOK_PARTS.map((part) => ({
    pillar: part.id,
    label: part.label,
    chapters: chapters.filter((c) => c.partId === part.id),
  })).filter((g) => g.chapters.length > 0);
}

/** @deprecated use groupChaptersByPillar — alias for hub snapshot builder. */
export { groupChaptersByPillar as groupChaptersByPart };
