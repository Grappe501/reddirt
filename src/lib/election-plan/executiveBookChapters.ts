/** Executive Book V1 — chapter registry for hub cards and shareable routes. */

export type ExecutiveBookChapterSlug =
  | "ownership"
  | "influence-map"
  | "labor-day"
  | "scorecard"
  | "message"
  | "audit"
  | "budget";

export type ExecutiveBookChapterDef = {
  slug: ExecutiveBookChapterSlug;
  number: number;
  title: string;
  subtitle: string;
  markdownFile: string;
  href: string;
};

export const EXECUTIVE_BOOK_CHAPTERS: ExecutiveBookChapterDef[] = [
  {
    slug: "ownership",
    number: 1,
    title: "Who Owns What",
    subtitle: "Leadership ownership matrix — names, not committees",
    markdownFile: "01-WHO-OWNS-WHAT.md",
    href: "/election-plan/executive-book/ownership",
  },
  {
    slug: "influence-map",
    number: 2,
    title: "Arkansas Influence Map",
    subtitle: "Executive contact plan — statewide relationship targets",
    markdownFile: "02-EXECUTIVE-CONTACT-PLAN.md",
    href: "/election-plan/executive-book/influence-map",
  },
  {
    slug: "labor-day",
    number: 3,
    title: "Labor Day Readiness",
    subtitle: "September readiness gate — first major campaign checkpoint",
    markdownFile: "03-SEPTEMBER-READINESS-LABOR-DAY.md",
    href: "/election-plan/executive-book/labor-day",
  },
  {
    slug: "scorecard",
    number: 4,
    title: "Weekly Success Scorecard",
    subtitle: "Monday leadership review — live campaign metrics",
    markdownFile: "04-WEEKLY-SUCCESS-SCORECARD.md",
    href: "/election-plan/executive-book/scorecard",
  },
  {
    slug: "message",
    number: 5,
    title: "The Kelly Grappe Message",
    subtitle: "Eight-pillar candidate doctrine for every room",
    markdownFile: "05-THE-KELLY-GRAPPE-MESSAGE.md",
    href: "/election-plan/executive-book/message",
  },
  {
    slug: "audit",
    number: 6,
    title: "Executive Book Audit",
    subtitle: "V1.0 readiness assessment for leadership review",
    markdownFile: "EXECUTIVE-BOOK-COMPLETION-AUDIT.md",
    href: "/election-plan/executive-book/audit",
  },
  {
    slug: "budget",
    number: 7,
    title: "Campaign Budget & Fundraising Targets",
    subtitle: "Projected budget framework — salary floor, travel, materials, fundraising goals",
    markdownFile: "06-CAMPAIGN-BUDGET-AND-FUNDRAISING-TARGETS.md",
    href: "/election-plan/executive-book/budget",
  },
];

export function getExecutiveBookChapter(slug: string): ExecutiveBookChapterDef | undefined {
  return EXECUTIVE_BOOK_CHAPTERS.find((c) => c.slug === slug);
}

export function isExecutiveBookChapterSlug(slug: string): slug is ExecutiveBookChapterSlug {
  return EXECUTIVE_BOOK_CHAPTERS.some((c) => c.slug === slug);
}
