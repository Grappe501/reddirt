/**
 * “Meet Kelly” multi-page story: slugs, labels, and SEO blurbs for the /about hub and chapter routes.
 */
export type KellyAboutSlug =
  | "story"
  | "business"
  | "forevermost"
  | "stand-up-arkansas"
  | "initiatives-petitions"
  | "why-secretary-of-state"
  | "your-part";

export type KellyAboutChapter = {
  slug: KellyAboutSlug;
  /** Short label for the horizontal subnav */
  navLabel: string;
  eyebrow: string;
  title: string;
  /** Hub card: one or two lines */
  summary: string;
  /** Meta description for the chapter page */
  description: string;
};

export const KELLY_ABOUT_CHAPTERS: readonly KellyAboutChapter[] = [
  {
    slug: "story",
    navLabel: "Trust & story",
    eyebrow: "The story we share",
    title: "Rooted in Arkansas, built in the work",
    summary:
      "Voters don’t follow abstractions—they follow people. Here’s the human case for why Kelly’s life outside politics matters to the Secretary of State’s office.",
    description:
      "Why trust is personal: Kelly Grappe on showing up, telling the truth, and earning a statewide office through presence—not slogans.",
  },
  {
    slug: "business",
    navLabel: "Business & process",
    eyebrow: "Career & operations",
    title: "Alltel, Verizon, and what large-scale discipline teaches",
    summary:
      "Nearly 25 years in telecom operations: managing teams, improving processes, and why that maps to clearer business services for every county.",
    description:
      "Kelly Grappe’s business career—Alltel, Verizon, and small-operator experience—and how it applies to the Secretary of State’s office.",
  },
  {
    slug: "forevermost",
    navLabel: "Forevermost Farms",
    eyebrow: "The land & the work",
    title: "Stewardship, the small market, and truth when the math changes",
    summary:
      "Forevermost Farms, hard seasons, and the small-business learning curve—integrity when costs shift and the work still has to be done.",
    description:
      "Forevermost Farms, Rose Bud, and how farming and a small market shaped Kelly Grappe’s understanding of pressure and public trust.",
  },
  {
    slug: "stand-up-arkansas",
    navLabel: "Stand Up Arkansas",
    eyebrow: "Civic muscle",
    title: "Teaching power back to the people",
    summary:
      "Stand Up Arkansas: recruiting, training, and activating leaders—civics as skill-building, not performance.",
    description:
      "Stand Up Arkansas and how civic education and grassroots leadership connect to a fair, usable Secretary of State’s office.",
  },
  {
    slug: "initiatives-petitions",
    navLabel: "LEARNS & petitions",
    eyebrow: "After LEARNS, 2023",
    title: "Ballot petitions, Sherwood, and organizing Arkansas from the ground up",
    summary:
      "LEARNS referendum work, a duplex office in Sherwood, statewide initiative support, and a philosophy that democracy starts local—plus a clear line on money in the process.",
    description:
      "Kelly Grappe on the LEARNS ballot petition, organizing petitioners in Sherwood and across Arkansas, local initiatives, and keeping citizen-led work volunteer-centered.",
  },
  {
    slug: "why-secretary-of-state",
    navLabel: "Why this office",
    eyebrow: "Why this office, now",
    title: "Where experience meets the job of Secretary of State",
    summary:
      "Discipline, patience, and protectiveness of public trust—how Kelly’s path meets elections, records, and commerce for all 75 counties.",
    description:
      "Why Kelly Grappe is running for Arkansas Secretary of State: business, land, and civic work converging in systems that must serve everyone.",
  },
  {
    slug: "your-part",
    navLabel: "Your part",
    eyebrow: "What we’re asking",
    title: "Not a spectator campaign",
    summary:
      "Movements need relationships. Know the story, show up in your county, and stack hands with people already doing the work.",
    description:
      "How to help Kelly Grappe’s campaign: share the story, claim your county, and connect through Get involved.",
  },
] as const;

const slugSet = new Set<string>(KELLY_ABOUT_CHAPTERS.map((c) => c.slug));

export function isKellyAboutSlug(s: string): s is KellyAboutSlug {
  return slugSet.has(s);
}

export function getKellyAboutChapter(slug: string): KellyAboutChapter | undefined {
  return KELLY_ABOUT_CHAPTERS.find((c) => c.slug === slug);
}

export function kellyAboutChapterIndex(slug: KellyAboutSlug): number {
  return KELLY_ABOUT_CHAPTERS.findIndex((c) => c.slug === slug);
}
