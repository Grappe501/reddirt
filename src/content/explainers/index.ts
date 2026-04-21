import { media } from "@/content/media/registry";
import type { ExplainerEntry } from "./types";

export type { ExplainerEntry } from "./types";

const explainers: ExplainerEntry[] = [
  {
    title: "What is a referendum?",
    slug: "what-is-a-referendum",
    summary: "A direct vote by the people—usually yes/no—on a specific question of law or policy.",
    category: "Ballots",
    publishedAt: "2026-01-10",
    image: media.splitDemocracy,
    tags: ["referendum", "voting", "direct democracy", "basics"],
    intro:
      "Think of a referendum as a checkpoint. Instead of only choosing representatives, voters decide a concrete question—often after a long public debate.",
    steps: [
      {
        title: "A question becomes official",
        body: "Depending on state rules, legislatures or citizen petitions can place a measure on the ballot. The wording matters—confusing language is a known way to tilt outcomes.",
      },
      {
        title: "Neighbors campaign like humans",
        body: "You’ll hear ads, sure—but also kitchen tables, faith halls, and union halls. The best campaigns train volunteers to explain tradeoffs without bullying.",
      },
      {
        title: "Election day is counting day",
        body: "Votes are tallied like other races. Close margins can trigger recounts. Transparency in counting is as important as transparency in fundraising.",
      },
      {
        title: "After the vote, governance continues",
        body: "Passing a measure isn’t the end—implementation, funding, and defense against rollback become the next front.",
      },
    ],
    faq: [
      {
        q: "Is a referendum the same as an initiative?",
        a: "Close cousins, not twins. The words shift by state. In Arkansas, details matter—always read the actual ballot language and source.",
      },
      {
        q: "Why do people fear referendums?",
        a: "Because majorities can be wrong—and because money can flood the airwaves. That’s why education, transparency, and fair rules matter as much as the vote itself.",
      },
    ],
    relatedLinks: [
      { label: "Direct democracy pillar", href: "/direct-democracy" },
      { label: "Editorial: democracy in practice", href: "/editorial/direct-democracy-in-practice" },
    ],
    relatedSlugs: ["how-ballot-initiatives-work", "how-local-organizing-works"],
  },
  {
    title: "How ballot initiatives work (the human version)",
    slug: "how-ballot-initiatives-work",
    summary: "From idea to signature pages to election—what you’re actually signing, and why patience beats panic.",
    category: "Ballots",
    publishedAt: "2026-01-24",
    image: media.explainerSteps,
    tags: ["initiative", "petitions", "signatures", "democracy"],
    intro:
      "An initiative is a citizen-originated proposal that can become law or constitutional language—if it survives legal review, signature thresholds, and the vote.",
    steps: [
      {
        title: "Drafting isn’t vibes—it’s language",
        body: "Lawyers aren’t the enemy here; unclear text is. Good initiatives are readable on paper and defensible in court.",
      },
      {
        title: "Signatures prove seriousness",
        body: "States require valid signatures from registered voters. That means training volunteers to avoid common errors—wrong county, wrong date, illegible prints.",
      },
      {
        title: "Challenges are part of the process",
        body: "Expect attempts to remove measures or confuse voters. Coalitions prepare legal defense and plain-language education in parallel.",
      },
      {
        title: "Winning is a season, not a night",
        body: "If it passes, implementation begins. If it fails, the coalition’s relationships can still become local power—if you treated people with respect along the way.",
      },
    ],
    faq: [
      {
        q: "Should I sign something at a gas station?",
        a: "Only if you understand it. Ask for a one-pager, read who paid for the campaign, and verify the group’s contact info. Legitimate organizers welcome questions.",
      },
    ],
    relatedLinks: [
      { label: "What is a referendum?", href: "/explainers/what-is-a-referendum" },
      { label: "Resources library", href: "/resources#toolkit" },
    ],
    relatedSlugs: ["what-is-a-referendum", "what-collective-bargaining-means"],
  },
  {
    title: "What collective bargaining means—in plain Arkansas English",
    slug: "what-collective-bargaining-means",
    summary: "Workers negotiating as a group, with legal weight—so a boss can’t pretend each person is alone.",
    category: "Labor",
    publishedAt: "2026-02-12",
    image: media.splitLabor,
    tags: ["labor", "unions", "work", "rights"],
    intro:
      "Collective bargaining is a formal process where employees, usually through a union, negotiate wages, benefits, and working conditions with management.",
    steps: [
      {
        title: "A workplace chooses representation",
        body: "Workers organize, often through an election. The goal is a recognized bargaining agent—so power isn’t just individual pleading.",
      },
      {
        title: "Both sides bring proposals",
        body: "Like any negotiation, there’s back-and-forth. The difference is scale: outcomes apply to a group, not just whoever spoke loudest.",
      },
      {
        title: "A contract locks terms",
        body: "When agreed, a contract sets rules for a period—raises, grievance steps, safety language. Enforcement is its own fight, but you start with paper you can cite.",
      },
    ],
    faq: [
      {
        q: "Is this only for factories?",
        a: "No—nurses, teachers, logistics workers, and more have used bargaining where law allows. What’s possible depends on sector and state rules.",
      },
    ],
    relatedLinks: [
      { label: "Office priorities", href: "/priorities" },
      { label: "Future of work (editorial)", href: "/editorial/future-of-work-arkansas" },
    ],
    relatedSlugs: ["how-local-organizing-works", "how-ballot-initiatives-work"],
  },
  {
    title: "How local organizing works (without the TED talk)",
    slug: "how-local-organizing-works",
    summary: "Listening, repetition, public action—and the boring magic of keeping promises small enough to keep.",
    category: "Organizing",
    publishedAt: "2026-03-01",
    image: media.storyOrganizer,
    tags: ["organizing", "local", "listening", "community"],
    intro:
      "Local organizing is the practice of turning shared problems into shared action—usually starting with relationships, not slogans.",
    steps: [
      {
        title: "Map what’s already there",
        body: "Institutions, clubs, faith communities, workplaces. You’re not inventing people from scratch—you’re connecting them with intention.",
      },
      {
        title: "Listen in structured ways",
        body: "One-on-ones, house meetings, surveys that don’t feel like surveillance. The goal is themes you can repeat without exaggerating.",
      },
      {
        title: "Go public with a winnable step",
        body: "Not theater—a real ask with a deadline: a meeting, a petition delivery, a training, a solidarity action.",
      },
      {
        title: "Train and rotate leadership",
        body: "If only one person holds the keys, you’ve built a fan club, not power. Document, teach, share credit.",
      },
    ],
    faq: [
      {
        q: "Do I have to be extroverted?",
        a: "No. Some of the best organizers are quiet folks who remember names and follow up. Consistency beats charisma.",
      },
    ],
    relatedLinks: [
      { label: "Local organizing hub", href: "/local-organizing" },
      { label: "Editorial: local power", href: "/editorial/how-local-power-works" },
    ],
    relatedSlugs: ["what-happens-after-you-sign", "how-ballot-initiatives-work"],
  },
  {
    title: "What happens after you sign?",
    slug: "what-happens-after-you-sign",
    summary: "Signatures, verification, ballot access, and the part nobody puts on a flyer: protecting the win.",
    category: "Ballots",
    publishedAt: "2026-03-18",
    image: media.splitDemocracy,
    tags: ["petitions", "process", "democracy", "accountability"],
    intro:
      "Signing isn’t a personality test—it’s a procedural step. Understanding the pipeline helps you spot manipulation and support legitimate campaigns.",
    steps: [
      {
        title: "Your signature enters verification",
        body: "Election officials check eligibility and validity. Bad batches get thrown out—that’s why quality training matters more than rushing.",
      },
      {
        title: "Legal thresholds decide placement",
        body: "If enough valid signatures survive, the measure may proceed—unless challenged in court. This is normal, not necessarily nefarious.",
      },
      {
        title: "Voters decide",
        body: "Campaigns shift to persuasion: forums, literature, neighbor conversations. Money matters, but organized people still punch above their weight.",
      },
      {
        title: "Implementation is the next battlefield",
        body: "Statutes can be underfunded or “interpreted” away. The same coalition often has to watchdog what they won.",
      },
    ],
    faq: [
      {
        q: "Can I remove my signature?",
        a: "Rules vary. If you’re unsure, contact your county clerk or the campaign with concerns. Legit campaigns don’t trap people.",
      },
    ],
    relatedLinks: [
      { label: "How initiatives work", href: "/explainers/how-ballot-initiatives-work" },
      { label: "Get involved", href: "/get-involved" },
    ],
    relatedSlugs: ["how-ballot-initiatives-work", "what-is-a-referendum"],
  },
];

export const allExplainers: ExplainerEntry[] = explainers;

export function getExplainerBySlug(slug: string): ExplainerEntry | undefined {
  return allExplainers.find((e) => e.slug === slug);
}

export function listExplainerSlugs(): string[] {
  return allExplainers.map((e) => e.slug);
}
