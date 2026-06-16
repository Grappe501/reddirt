/** Executive Book V1 — chapter registry for hub cards and shareable routes. */

export type ExecutiveBookChapterSlug =
  | "doctrine"
  | "ownership"
  | "influence-map"
  | "labor-day"
  | "scorecard"
  | "message"
  | "county-victory-targets"
  | "budget"
  | "power-of-5"
  | "students-for-arkansas"
  | "gotv"
  | "audit";

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
    slug: "doctrine",
    number: 0,
    title: "Campaign Doctrine",
    subtitle: "The Arkansas Way to Win — philosophy before mechanics, for every leader in the movement",
    markdownFile: "00-CAMPAIGN-DOCTRINE-THE-ARKANSAS-WAY-TO-WIN.md",
    href: "/election-plan/executive-book/doctrine",
  },
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
    slug: "county-victory-targets",
    number: 6,
    title: "County Victory Targets",
    subtitle: "Votes, percent increase, weekly pace, and Power of 5 leaders — all 75 counties",
    markdownFile: "06-COUNTY-VICTORY-TARGETS.md",
    href: "/election-plan/executive-book/county-victory-targets",
  },
  {
    slug: "budget",
    number: 7,
    title: "Campaign Budget & Fundraising Targets",
    subtitle: "Projected budget framework — salary floor, travel, materials, fundraising goals",
    markdownFile: "06-CAMPAIGN-BUDGET-AND-FUNDRAISING-TARGETS.md",
    href: "/election-plan/executive-book/budget",
  },
  {
    slug: "power-of-5",
    number: 8,
    title: "Arkansas Conversation Strategy",
    subtitle: "Eyeball-to-eyeball organizing doctrine — trust, the conversation ladder, and Power of 5",
    markdownFile: "07-EYEBALL-TO-EYEBALL-ORGANIZING-AND-POWER-OF-5.md",
    href: "/election-plan/executive-book/power-of-5",
  },
  {
    slug: "students-for-arkansas",
    number: 9,
    title: "Kelly Grappe Students for Arkansas",
    subtitle: "Student-led movement — voters, volunteers, content, future leaders",
    markdownFile: "08-STUDENTS-FOR-ARKANSAS.md",
    href: "/election-plan/executive-book/students-for-arkansas",
  },
  {
    slug: "gotv",
    number: 10,
    title: "Arkansas GOTV Operations Plan",
    subtitle: "Field manual — how we win Election Day",
    markdownFile: "09-ARKANSAS-GOTV-OPERATIONS-PLAN.md",
    href: "/election-plan/executive-book/gotv",
  },
  {
    slug: "audit",
    number: 11,
    title: "Executive Book Audit",
    subtitle: "V1.0 readiness assessment for leadership review",
    markdownFile: "EXECUTIVE-BOOK-COMPLETION-AUDIT.md",
    href: "/election-plan/executive-book/audit",
  },
];

export function getExecutiveBookChapter(slug: string): ExecutiveBookChapterDef | undefined {
  return EXECUTIVE_BOOK_CHAPTERS.find((c) => c.slug === slug);
}

export function isExecutiveBookChapterSlug(slug: string): slug is ExecutiveBookChapterSlug {
  return EXECUTIVE_BOOK_CHAPTERS.some((c) => c.slug === slug);
}
