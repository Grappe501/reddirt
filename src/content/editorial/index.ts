import { media } from "@/content/media/registry";
import type { EditorialPiece } from "./types";

export type { EditorialPiece, EditorialSection } from "./types";

const pieces: EditorialPiece[] = [
  {
    title: "Why people stopped participating—and what that costs all of us",
    slug: "why-people-stopped-showing-up",
    summary:
      "Cynicism didn’t fall from the sky. It was trained—by confusion, disrespect, and processes that treat neighbors like props.",
    category: "Movement",
    featured: true,
    publishedAt: "2026-01-22",
    image: media.editorialDefault,
    tags: ["democracy", "trust", "participation", "movement"],
    relatedSlugs: ["rebuilding-trust-small-things", "how-local-power-works"],
    sections: [
      {
        type: "prose",
        title: "The exit is rational",
        paragraphs: [
          "If you’ve got two jobs and a kid with asthma, a three-hour meeting that speaks in acronyms isn’t civic engagement—it’s an extraction. People didn’t leave democracy because they got lazy. They left because the process started asking for humiliation as the price of entry.",
          "That’s not a partisan sentence. It’s an Arkansas sentence. It’s the convenience store clerk, the line cook, the caregiver—folks who can’t afford to gamble their Tuesday night on being ignored.",
        ],
      },
      {
        type: "list",
        title: "What people name when you listen for real",
        items: [
          "Rules that change without translation.",
          "Leaders who show up for cameras but not for follow-through.",
          "Shame disguised as “citizenship.”",
          "Systems that punish you for needing help.",
        ],
      },
      {
        type: "quote",
        quote: "Participation dies when people learn the lesson that their voice is decorative.",
      },
      {
        type: "prose",
        paragraphs: [
          "Rebuilding participation isn’t a branding problem. It’s a design problem: plain language, real access, predictable timelines, and consequences when power breaks its word.",
        ],
      },
    ],
  },
  {
    title: "Direct democracy, in practice—not in a textbook",
    slug: "direct-democracy-in-practice",
    summary: "Initiatives and referendums are tools. Like any tool, they can build—or bruise—depending on how neighbors hold them.",
    category: "Civic power",
    featured: true,
    publishedAt: "2026-02-08",
    image: media.splitDemocracy,
    tags: ["direct democracy", "ballots", "education", "accountability"],
    relatedSlugs: ["future-of-work-arkansas", "how-local-power-works"],
    sections: [
      {
        type: "callout",
        title: "Start with the human question",
        body: "Who gains when voters can’t act between elections—and who gains when they can?",
      },
      {
        type: "prose",
        paragraphs: [
          "A referendum isn’t a magic wand. It’s pressure—public, measurable, hard to spin if you do the work honestly. The practice includes coalition-building, legal discipline, and a stubborn refusal to treat signatures like props.",
          "In Arkansas, the fight is often less about ideology and more about access: can people read what they’re signing, understand what they’re voting on, and trust the count?",
        ],
      },
      {
        type: "list",
        title: "What “practice” looks like on the ground",
        items: [
          "Neighbor education before neighbor signatures.",
          "Protections against deceptive language.",
          "Volunteers who can explain tradeoffs without bullying.",
          "A plan for governance after the win—because winning is a chapter, not the book.",
        ],
      },
    ],
  },
  {
    title: "The future of work in Arkansas isn’t coming—it’s here",
    slug: "future-of-work-arkansas",
    summary:
      "Automation, consolidation, and caregiving crises aren’t distant clouds. They’re scheduling shifts, closing shops, and rewriting what “a good job” can mean.",
    category: "Labor",
    featured: false,
    publishedAt: "2026-02-26",
    image: media.splitLabor,
    tags: ["labor", "economy", "work", "youth"],
    relatedSlugs: ["direct-democracy-in-practice", "why-people-stopped-showing-up"],
    sections: [
      {
        type: "prose",
        paragraphs: [
          "Arkansas work has always been physical—fields, factories, floors, trucks. What’s changing is who captures the value, who bears the risk, and who gets told to “reskill” as if dignity is a hobby craft.",
        ],
      },
      {
        type: "list",
        title: "Three truths we keep hearing",
        items: [
          "Stability beats slogans: hours you can plan, wages you can live on, safety you can enforce.",
          "Voice is infrastructure: without it, “opportunity” becomes a lottery.",
          "Small towns aren’t leftovers—they’re logistics, care, and culture with real leverage if organized.",
        ],
      },
      {
        type: "quote",
        quote: "An economy that works doesn’t ask workers to be grateful for being alive—it asks institutions to be accountable for the life built inside a shift.",
      },
    ],
  },
  {
    title: "How local power actually works (no superhero required)",
    slug: "how-local-power-works",
    summary:
      "Power isn’t a speech. It’s repetition: reliable people, clear asks, public action, and follow-through that doesn’t embarrass your neighbors.",
    category: "Organizing",
    featured: false,
    publishedAt: "2026-03-16",
    image: media.arkansasPorch,
    tags: ["organizing", "local power", "listening", "community"],
    relatedSlugs: ["rebuilding-trust-small-things", "why-people-stopped-showing-up"],
    sections: [
      {
        type: "prose",
        paragraphs: [
          "Local power starts where folks already trust each other a little: breakrooms, churches, youth sports sidelines, group chats that aren’t poisoned yet.",
          "The mechanics are boring on purpose: agendas, roles, notes, a rhythm. Boring is how you survive the weeks when nobody feels inspired.",
        ],
      },
      {
        type: "list",
        title: "A few habits that separate teams from mobs",
        items: [
          "You listen before you sloganize.",
          "You credit the group, admit mistakes, and fix them publicly.",
          "You train replacements so the work doesn’t die when one person burns out.",
        ],
      },
    ],
  },
  {
    title: "Rebuilding trust looks like doing small things right",
    slug: "rebuilding-trust-small-things",
    summary:
      "Trust isn’t a message campaign. It’s receipts—showing up, keeping time, telling the truth when it costs you.",
    category: "Ethics",
    featured: false,
    publishedAt: "2026-04-02",
    image: media.editorialDefault,
    tags: ["trust", "ethics", "community", "movement"],
    relatedSlugs: ["why-people-stopped-showing-up", "how-local-power-works"],
    sections: [
      {
        type: "quote",
        quote: "People don’t mistrust institutions because they’re cynical. They mistrust them because they’ve been trained by experience.",
      },
      {
        type: "prose",
        paragraphs: [
          "If you want a movement that lasts, build rituals of reliability: start meetings on time, end on time, read names right, return calls even when the answer is no.",
          "Big promises without small competence read like another politician. Small competence without big vision reads like another club. You need both—rooted in place, spoken plainly.",
        ],
      },
      {
        type: "callout",
        title: "Try this next week",
        body: "Make one promise you can keep in seven days. Keep it publicly. Let people see what it feels like when words turn into action.",
      },
    ],
  },
];

export const allEditorial: EditorialPiece[] = pieces;

export function getEditorialBySlug(slug: string): EditorialPiece | undefined {
  return allEditorial.find((p) => p.slug === slug);
}

export function listEditorialSlugs(): string[] {
  return allEditorial.map((p) => p.slug);
}
