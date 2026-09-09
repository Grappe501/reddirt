import type { AuthorshipConfidence, WritingActorId, WritingSourceType } from "./contracts";

export type SeedWritingUrl = {
  actorId: WritingActorId;
  url: string;
  title?: string;
  publishedAt?: string;
  sourceType: WritingSourceType;
  authorshipConfidence: AuthorshipConfidence;
};

export const JONES_SEED_URLS: SeedWritingUrl[] = [
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/wall-street-is-winning-arkansas-is", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/america-at-250-the-whisper-has-reached-us", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/the-whisper-has-reached-us", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/housing-b-for-congress", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/love-can-look-like-exhaustion", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/the-price-of-chaos", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/its-not-an-accident", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/this-is-how-power-protects-itself", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/the-real-reason-your-money-is-short", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/the-hospital-math-aint-mathing", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/affordability-and-accountability", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/quantum-pearls-2", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/resurrection-and-rocket-science", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/who-watches-the-algorithms", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/a-time-of-fracture", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/why-a-house-isnt-a-home", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/he-built-a-bigger-table", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/part-12-data-is-the-new-power-grid", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/what-we-can-do-rewriting-the-social", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/who-owns-arkansas-the-growing-grip", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/the-moral-arc-bending-toward-justice", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/the-moral-arc-bending-toward-justice-bdc", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://drchrisjones.substack.com/p/defend-the-first-use-it-or-lose-it", sourceType: "SUBSTACK", authorshipConfidence: "DIRECT_AUTHOR" },
  { actorId: "chris-jones-ar02", url: "https://chrisjonesforcongress.com/affordability/", sourceType: "CAMPAIGN_ARTICLE", authorshipConfidence: "ATTRIBUTED" },
];

export const HILL_ARCHIVE_PAGES = [
  "https://hill.house.gov/news/email/",
  "https://hill.house.gov/news/email/default.aspx?Page=2",
  "https://hill.house.gov/news/email/default.aspx?Page=3",
  "https://hill.house.gov/news/email/default.aspx?Page=4",
  "https://hill.house.gov/news/email/default.aspx?Page=5",
  "https://hill.house.gov/news/email/default.aspx?Page=6",
];
