import briefsSource from "../../../data/campaign-brain/election-plan/page-briefs.source.json";

export type PageBriefLink = {
  label: string;
  href: string;
};

export type PageBrief = {
  id: string;
  title: string;
  answers: string;
  keyMetrics: string[];
  bestFor: string[];
  relatedLinks: PageBriefLink[];
};

type BriefEntry = PageBrief & {
  pathPattern: string;
  exact: boolean;
  searchKeywords?: string[];
};

export function getAllPageBriefEntries(): BriefEntry[] {
  return briefsSource.briefs as BriefEntry[];
}

export function getPageBriefById(id: string): PageBrief | null {
  const entry = getAllPageBriefEntries().find((b) => b.id === id);
  if (!entry) return null;
  return stripBrief(entry);
}

function stripBrief(entry: BriefEntry): PageBrief {
  return {
    id: entry.id,
    title: entry.title,
    answers: entry.answers,
    keyMetrics: entry.keyMetrics,
    bestFor: entry.bestFor,
    relatedLinks: entry.relatedLinks,
  };
}

/** Longest matching pathPattern wins (most specific drill-down). */
export function getPageBriefForPath(pathname: string): PageBrief | null {
  const path = pathname.split("?")[0] ?? pathname;
  const entries = getAllPageBriefEntries()
    .filter((b) => {
      if (b.exact) return path === b.pathPattern;
      return path.startsWith(b.pathPattern);
    })
    .sort((a, b) => b.pathPattern.length - a.pathPattern.length);
  const hit = entries[0];
  return hit ? stripBrief(hit) : null;
}

export function mergePageBrief(base: PageBrief, overrides: Partial<PageBrief>): PageBrief {
  return {
    ...base,
    ...overrides,
    keyMetrics: overrides.keyMetrics ?? base.keyMetrics,
    bestFor: overrides.bestFor ?? base.bestFor,
    relatedLinks: overrides.relatedLinks ?? base.relatedLinks,
  };
}
