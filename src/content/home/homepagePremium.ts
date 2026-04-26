/**
 * Homepage premium layer — static copy + CMS injection points.
 * Replace or extend via admin/API later; merge helpers combine live + placeholder.
 */
import type { EditorialPiece } from "@/content/editorial/types";
import type { StoryEntry } from "@/content/stories";
import type { HomepageBlogCard } from "@/lib/content/blog-public";
import type { PublicFeedCardVM } from "@/lib/orchestrator/public-feed";

export const TRUST_RIBBON_ITEMS = [
  {
    label: "Election Transparency",
    detail: "Plain answers on how systems work, how they’re tested, and how problems get fixed—without spin.",
  },
  {
    label: "Ballot Initiative Rights",
    detail: "Arkansas’s direct democracy path deserves clarity, fairness, and respect—not buried process.",
  },
  {
    label: "Service to All 75 Counties",
    detail: "Rural towns, small cities, and growing regions get the same seriousness from the state’s front office.",
  },
  {
    label: "Secure and Accountable Systems",
    detail: "Modern infrastructure with culture and reporting that earns confidence after Election Day.",
  },
] as const;

export const FIGHT_FOR = [
  {
    title: "Transparency people can see",
    body: "Arkansans deserve clear answers about how election systems work, how they are tested, and what happens when something needs to be fixed.",
  },
  {
    title: "Respect for the Ballot Initiative Process",
    body: "Arkansas is one of the few states where the people still have meaningful direct democracy rights. That process must be protected, not buried.",
  },
  {
    title: "Confidence Without Dismissal",
    body: "Our elections must be secure, but citizens with questions should be treated with respect, not contempt.",
  },
  {
    title: "A People-Focused Office",
    body: "The office should work for everyday Arkansans, not political insiders or special interests.",
  },
] as const;

export const PROOF_SECTION = {
  eyebrow: "How we work",
  title: "Built to show up for Arkansas",
  intro:
    "This campaign is organized to listen county by county, answer honestly, and meet people where they are—in person and online.",
  blocks: [
    {
      title: "Volunteers and coordination",
      body: "Clear ways to sign up, get matched to local needs, and stay in touch so counties aren’t left guessing.",
    },
    {
      title: "Field organizing",
      body: "County visits, trained hosts, and neighbor-to-neighbor outreach you can see in public—not just on paper.",
    },
    {
      title: "Clear information online",
      body: "A fast, accessible site with updates and media that respect your time and intelligence.",
    },
    {
      title: "Public engagement",
      body: "Kelly taking questions, listening first, and explaining the office in plain language.",
    },
  ],
  ctaLabel: "Join the team",
  ctaHref: "/get-involved",
} as const;

export const STATEWIDE_SECTION = {
  eyebrow: "Presence",
  title: "Showing Up Across Arkansas",
  body: "Serving Arkansas starts with listening. This campaign is committed to showing up, learning from communities, and earning trust across all 75 counties.",
  ctaLabel: "See updates from the trail",
  ctaHref: "/from-the-road",
} as const;

export const VIDEO_SECTION = {
  eyebrow: "In her own words",
  title: "Hear Kelly in Her Own Words",
  intro: "Watch the speeches, answers, and campaign moments shaping a people-first vision for Arkansas.",
  ctaLabel: "Watch More Videos",
  ctaHref: "/from-the-road",
  /** Themed clips — /watch redirects to From the Road */
  secondaryClips: [
    { category: "Why I’m Running", title: "The reason I’m asking for your trust", href: "/from-the-road", thumbHint: "From the Road" },
    { category: "People Over Politics", title: "This office isn’t a party prize", href: "/from-the-road", thumbHint: "From the Road" },
    { category: "Election Transparency", title: "What transparency actually looks like", href: "/from-the-road", thumbHint: "From the Road" },
  ],
} as const;

export const VOICES_SECTION = {
  eyebrow: "Voices",
  title: "Why This Campaign Matters to Real People",
  intro:
    "Across Arkansas, people are asking for honesty, transparency, and a government that remembers who it works for.",
  ctaLabel: "Read the Stories",
  ctaHref: "/stories",
} as const;

/** When fewer than 3 live stories, pad with these grounded placeholders. */
export const PLACEHOLDER_VOICES = [
  {
    title: "“I don’t need a politician—I need the process to make sense.”",
    excerpt:
      "First-time volunteer in Garland County, helping neighbors register and read the ballot without feeling stupid. Says the campaign’s plain-language approach is why she stayed.",
    meta: "Volunteer · Hot Springs area",
    href: "/stories",
  },
  {
    title: "“Ask my question like I’m not the enemy.”",
    excerpt:
      "Independent voter from the River Valley, tired of being talked down to when asking how signatures and deadlines work. Wants a Secretary of State who answers with respect.",
    meta: "Voter · River Valley",
    href: "/stories",
  },
  {
    title: "“Our county clerks carry enough.”",
    excerpt:
      "Community leader who hosts forums for local officials and neighbors. Says statewide leadership should make clerks’ jobs clearer—not heavier.",
    meta: "Community leader · South Arkansas",
    href: "/stories",
  },
] as const;

export const JOURNAL_SECTION = {
  eyebrow: "On the trail",
  title: "From the Campaign Trail",
  intro: "Notes from the road—policy, people, and the work of earning trust one county at a time.",
  ctaLabel: "Read the Latest",
  ctaHref: "/from-the-road",
} as const;

export const PLACEHOLDER_JOURNAL = [
  {
    id: "ph-journal-1",
    title: "What “secure” should mean to a voter",
    excerpt:
      "Security isn’t a vibe—it’s testing, documentation, and culture. A short framework we’re using when we talk with clerks and the public.",
    meta: "Campaign journal · Civic explainer",
    href: "/blog",
    cta: "Read",
  },
  {
    id: "ph-journal-2",
    title: "County recap: listening session takeaways",
    excerpt:
      "Three themes we heard last week: clarity on deadlines, respect for local election workers, and frustration with jargon-heavy notices.",
    meta: "Field note · County visit",
    href: "/from-the-road",
    cta: "Read",
  },
  {
    id: "ph-journal-3",
    title: "Statement: The people come before the party",
    excerpt:
      "The Secretary of State’s office administers the law for everyone. Here’s what that promise means in practice—not just on a bumper sticker.",
    meta: "Campaign statement",
    href: "/editorial",
    cta: "Read",
  },
] as const;

export const GET_INVOLVED_SECTION = {
  eyebrow: "Step in",
  title: "This is a campaign for the people. Join it.",
  subtitle: "Choose a way to help—we’ll meet you with training, backup, and respect for your time.",
} as const;

export type JournalCardVM = {
  key: string;
  title: string;
  excerpt: string;
  href: string;
  meta: string;
  cta: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type VoiceCardVM =
  | {
      kind: "live";
      slug: string;
      title: string;
      excerpt: string;
      meta: string;
      href: string;
      imageSrc: string;
      imageAlt: string;
    }
  | {
      kind: "placeholder";
      title: string;
      excerpt: string;
      meta: string;
      href: string;
    };

/** Live journal rail cards (orchestrator + blog + editorial) before placeholder fill. */
export function buildJournalTrailLive(
  orchestratorRail: PublicFeedCardVM[],
  blogPosts: HomepageBlogCard[],
  editorialPieces: EditorialPiece[],
): JournalCardVM[] {
  const out: JournalCardVM[] = [];

  for (const p of orchestratorRail.slice(0, 3)) {
    out.push({
      key: p.id,
      title: p.title,
      excerpt: p.excerpt,
      href: p.href,
      meta: p.meta,
      cta: p.ctaLabel,
      imageSrc: p.imageSrc,
      imageAlt: p.imageAlt,
    });
  }
  let bi = 0;
  while (out.length < 3 && bi < blogPosts.length) {
    const p = blogPosts[bi];
    bi += 1;
    out.push({
      key: `blog-${p.slug}`,
      title: p.title,
      excerpt: p.excerpt,
      href: p.href,
      meta: p.publishedAt
        ? `${p.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · Blog`
        : "Blog",
      cta: "Read",
      imageSrc: p.imageSrc,
      imageAlt: p.imageAlt,
    });
  }
  let ei = 0;
  while (out.length < 3 && ei < editorialPieces.length) {
    const p = editorialPieces[ei];
    ei += 1;
    out.push({
      key: `ed-${p.slug}`,
      title: p.title,
      excerpt: p.summary,
      href: `/editorial/${p.slug}`,
      meta: p.category,
      cta: "Read essay",
      imageSrc: p.image.src,
      imageAlt: p.image.alt,
    });
  }
  return out;
}

export function buildVoiceCards(stories: StoryEntry[], max = 3): VoiceCardVM[] {
  const out: VoiceCardVM[] = stories.slice(0, max).map((s) => ({
    kind: "live" as const,
    slug: s.slug,
    title: s.title,
    excerpt: s.summary,
    meta: `${s.categoryLabel}${s.dek ? ` · ${s.dek}` : ""}`,
    href: `/stories/${s.slug}`,
    imageSrc: s.image.src,
    imageAlt: s.image.alt,
  }));
  for (const p of PLACEHOLDER_VOICES) {
    if (out.length >= max) break;
    out.push({
      kind: "placeholder",
      title: p.title,
      excerpt: p.excerpt,
      meta: p.meta,
      href: p.href,
    });
  }
  return out.slice(0, max);
}

export function buildJournalCards(live: JournalCardVM[], max = 3): JournalCardVM[] {
  const out = [...live];
  for (const p of PLACEHOLDER_JOURNAL) {
    if (out.length >= max) break;
    out.push({
      key: p.id,
      title: p.title,
      excerpt: p.excerpt,
      href: p.href,
      meta: p.meta,
      cta: p.cta ?? "Read",
    });
  }
  return out.slice(0, max);
}
