/**
 * Meet Kelly hub — six voter questions (non-chronological).
 * Two-level public architecture: overview summaries → journey / community / why-im-running drill-downs.
 */

import { directDemocracyHubHref, kellyInitiativesChapterHref } from "@/config/direct-democracy-links";

export type MeetKellyQuestionId =
  | "who"
  | "done"
  | "why-running"
  | "learned"
  | "office"
  | "trust";

export type MeetKellyQuestion = {
  id: MeetKellyQuestionId;
  title: string;
  summary: string;
  href: string;
  hrefLabel: string;
};

export const MEET_KELLY_QUESTIONS: readonly MeetKellyQuestion[] = [
  {
    id: "who",
    title: "Who is Kelly?",
    summary:
      "Arkansas roots, family, faith as practice, and a life built in community—not performance. Personal background and values in the trust & story chapter.",
    href: "/about/story",
    hrefLabel: "Read her story",
  },
  {
    id: "done",
    title: "What has she done?",
    summary:
      "Telecom operations career, small-business and farm work, civic nonprofit leadership, and grassroots petition organizing. Detailed résumé claims link to external sources where available.",
    href: "/about/business",
    hrefLabel: "Business & career",
  },
  {
    id: "why-running",
    title: "Why is she running?",
    summary:
      "Why Secretary of State, why now, and why Arkansas elections should stay under state law and accountable administration—not national noise.",
    href: "/about/why-im-running",
    hrefLabel: "Why I'm running",
  },
  {
    id: "learned",
    title: "What has she learned?",
    summary:
      "Systems must respect people; small businesses feel every friction in paperwork; democracy is a skill neighbors will practice when the process is intelligible.",
    href: "/about/forevermost",
    hrefLabel: "Stewardship & lessons",
  },
  {
    id: "office",
    title: "What does she believe this office should do?",
    summary:
      "Office-focused expectations—fair elections, clear filings, open records, and steady Capitol stewardship.",
    href: "/understand",
    hrefLabel: "Understand the office",
  },
  {
    id: "trust",
    title: "Why should voters trust her?",
    summary:
      "Credentials you can check: public career record, organizations she helps lead, and civic work in plain sight—not testimonials or invented endorsements.",
    href: "#trust-indicators",
    hrefLabel: "Trust indicators",
  },
] as const;

export const MEET_KELLY_SUBNAV = [
  { href: "/about", label: "Overview" },
  { href: "/about/experience", label: "Experience" },
  { href: "/about/why-im-running", label: "Why I'm running" },
  { href: "/about/journey", label: "Journey" },
  { href: kellyInitiativesChapterHref, label: "Initiatives & petitions" },
  { href: directDemocracyHubHref, label: "Direct democracy" },
] as const;

export const meetKellyExecutiveSummary = {
  eyebrow: "Meet Kelly",
  title: "Kelly Grappe",
  subtitle:
    "Candidate for Arkansas Secretary of State. Before systems and statutes, you deserve to know the person asking for your trust—where she comes from, what she has built, and why she entered this race.",
} as const;
