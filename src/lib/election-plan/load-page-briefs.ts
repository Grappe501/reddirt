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
  /** When set, matches only when ?tab= matches (e.g. weeklyDashboard on /election-plan). */
  tabPattern?: string;
  searchKeywords?: string[];
};

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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

function pathMatches(entry: BriefEntry, path: string): boolean {
  return entry.exact ? path === entry.pathPattern : path.startsWith(entry.pathPattern);
}

/** Longest matching pathPattern wins; tab-specific briefs beat generic hub briefs. */
export function getPageBriefForPath(pathname: string, tab?: string | null): PageBrief | null {
  const path = pathname.split("?")[0] ?? pathname;
  const pathMatches_ = getAllPageBriefEntries().filter((b) => pathMatches(b, path));

  const tabMatches = tab
    ? pathMatches_.filter((b) => b.tabPattern === tab)
    : [];
  const pool =
    tabMatches.length > 0
      ? tabMatches
      : pathMatches_.filter((b) => !b.tabPattern);

  const hit = [...pool].sort((a, b) => b.pathPattern.length - a.pathPattern.length)[0];
  if (!hit) return null;

  return enrichDynamicBrief(path, stripBrief(hit));
}

/** Inject county/city names from URL slugs without loading the full workbench. */
function enrichDynamicBrief(path: string, brief: PageBrief): PageBrief {
  const countyMatch = path.match(/^\/election-plan\/counties\/([^/]+)/);
  if (countyMatch) {
    const name = slugToTitle(countyMatch[1]!);
    return {
      ...brief,
      title: `${name} County Playbook`,
      answers: `What is ${name} County's vote target, field plan, party contacts, and Kelly outreach plan?`,
      keyMetrics: [...brief.keyMetrics, `${name} County`],
    };
  }

  const cityMatch = path.match(/^\/election-plan\/cities\/([^/]+)/);
  if (cityMatch) {
    const name = slugToTitle(cityMatch[1]!);
    return {
      ...brief,
      title: `${name} · City Brief`,
      answers: `What is the vote target and organizing plan for ${name}?`,
    };
  }

  const campusMatch = path.match(/^\/election-plan\/campuses\/([^/]+)/);
  if (campusMatch && !path.includes("freshman-week") && !path.includes("captains")) {
    const name = slugToTitle(campusMatch[1]!);
    return {
      ...brief,
      title: `${name} Campus`,
      answers: `Who is the campus captain? Is Freshman Week ready at ${name}?`,
    };
  }

  const fmMatch = path.match(/^\/election-plan\/forward-motion\/([^/]+)/);
  if (fmMatch) {
    return {
      ...brief,
      answers:
        "Is this Kelly stop ready? What are the county, coalition, promotion, and Power of 5 goals for this event?",
    };
  }

  return brief;
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
