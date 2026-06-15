import {
  EXECUTIVE_BOOK_CHAPTERS,
  type ExecutiveBookChapterDef,
  type ExecutiveBookChapterSlug,
} from "./executiveBookChapters";

export type ExecutiveBookPillar =
  | "governance"
  | "strategy"
  | "resources"
  | "field"
  | "completion";

export const EXECUTIVE_BOOK_PILLAR_LABELS: Record<ExecutiveBookPillar, string> = {
  governance: "Governance & Accountability",
  strategy: "Strategy & Message",
  resources: "Resources & Budget",
  field: "Field Operations & People Power",
  completion: "Readiness & Audit",
};

export const EXECUTIVE_BOOK_EDITION = {
  version: "1.1",
  label: "Executive Book V1.1",
  tagline: "Leadership briefing · shareable chapters · board-ready narrative",
};

export type ExecutiveBookTocEntry = {
  id: string;
  title: string;
  level: 2 | 3;
};

export function getExecutiveBookPillar(slug: ExecutiveBookChapterSlug): ExecutiveBookPillar {
  switch (slug) {
    case "ownership":
    case "scorecard":
      return "governance";
    case "influence-map":
    case "labor-day":
    case "message":
    case "county-victory-targets":
      return "strategy";
    case "budget":
      return "resources";
    case "power-of-5":
    case "students-for-arkansas":
    case "gotv":
      return "field";
    case "audit":
      return "completion";
  }
}

export function getAdjacentExecutiveBookChapters(slug: ExecutiveBookChapterSlug): {
  prev: ExecutiveBookChapterDef | null;
  next: ExecutiveBookChapterDef | null;
} {
  const index = EXECUTIVE_BOOK_CHAPTERS.findIndex((c) => c.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? EXECUTIVE_BOOK_CHAPTERS[index - 1]! : null,
    next: index < EXECUTIVE_BOOK_CHAPTERS.length - 1 ? EXECUTIVE_BOOK_CHAPTERS[index + 1]! : null,
  };
}

export function getRelatedExecutiveBookChapters(slug: ExecutiveBookChapterSlug): ExecutiveBookChapterDef[] {
  const pillar = getExecutiveBookPillar(slug);
  const samePillar = EXECUTIVE_BOOK_CHAPTERS.filter(
    (c) => c.slug !== slug && getExecutiveBookPillar(c.slug) === pillar,
  );

  const crossLinks: Partial<Record<ExecutiveBookChapterSlug, ExecutiveBookChapterSlug[]>> = {
    "power-of-5": ["students-for-arkansas", "gotv", "labor-day"],
    "students-for-arkansas": ["power-of-5", "labor-day", "gotv"],
    gotv: ["power-of-5", "labor-day", "scorecard"],
    budget: ["labor-day", "gotv"],
    "labor-day": ["scorecard", "power-of-5", "budget"],
    message: ["power-of-5", "influence-map", "county-victory-targets"],
    "county-victory-targets": ["power-of-5", "gotv", "scorecard"],
    ownership: ["scorecard", "audit"],
  };

  const linked = (crossLinks[slug] ?? [])
    .map((s) => EXECUTIVE_BOOK_CHAPTERS.find((c) => c.slug === s))
    .filter((c): c is ExecutiveBookChapterDef => Boolean(c));

  const merged = [...linked];
  for (const chapter of samePillar) {
    if (!merged.some((c) => c.slug === chapter.slug) && merged.length < 3) {
      merged.push(chapter);
    }
  }
  return merged.slice(0, 3);
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

/** Match rehype-slug / GitHub-style heading ids. */
function slugifyHeading(text: string): string {
  return stripMarkdown(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function groupChaptersByPillar<T extends { slug: string }>(
  chapters: T[],
): Array<{ pillar: ExecutiveBookPillar; label: string; chapters: T[] }> {
  const order: ExecutiveBookPillar[] = ["governance", "strategy", "resources", "field", "completion"];
  return order
    .map((pillar) => ({
      pillar,
      label: EXECUTIVE_BOOK_PILLAR_LABELS[pillar],
      chapters: chapters.filter((c) => getExecutiveBookPillar(c.slug as ExecutiveBookChapterSlug) === pillar),
    }))
    .filter((g) => g.chapters.length > 0);
}
