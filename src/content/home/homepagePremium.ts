/**
 * Homepage premium layer — static copy + CMS injection points.
 * Replace or extend via admin/API later; merge helpers combine live + placeholder.
 */
import type { StoryEntry } from "@/content/stories";

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

export const MEET_KELLY = {
  eyebrow: "Candidate",
  title: "Meet Kelly Grappe",
  body: "Kelly Grappe is running for Secretary of State to put the office back where it belongs: in service to the people of Arkansas. With experience in leadership, systems-building, civic education, and community engagement, she brings both heart and discipline to one of the state’s most important public offices.",
  traits: [
    { title: "Proven Leadership", body: "Tested judgment when the stakes are public trust—not a photo op." },
    { title: "Systems Thinker", body: "Builds processes, manuals, and teams that still work when the news cycle moves on." },
    { title: "Public Trust First", body: "Filters decisions through service to voters and clerks—not insider convenience." },
    { title: "Service to All Arkansans", body: "Democrats, Republicans, independents: this office belongs to you." },
  ],
  ctaLabel: "Read Kelly’s Story",
  ctaHref: "/about",
} as const;

export const OFFICE_MATTERS = [
  {
    title: "Protect the Vote",
    body: "Secure systems, public trust, and transparent election processes.",
  },
  {
    title: "Defend Ballot Rights",
    body: "Arkansans deserve a fair path to direct democracy and citizen-led change.",
  },
  {
    title: "Serve Every County",
    body: "This office should work for rural communities, small towns, and growing cities alike.",
  },
  {
    title: "Make Government Understandable",
    body: "The people should be able to see how the system works and how decisions are made.",
  },
] as const;

export const FIGHT_FOR = [
  {
    title: "Transparency Under the Hood",
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
  eyebrow: "Infrastructure",
  title: "This Campaign Is Building Something Real",
  intro:
    "This is more than a message. It is an operation built to organize, communicate, and serve people across Arkansas.",
  blocks: [
    {
      title: "Campaign Infrastructure",
      body: "Volunteer intake, compliance-aware workflows, and a content engine that keeps counties informed—not guessing.",
    },
    {
      title: "Field Organizing",
      body: "County visits, trained hosts, and neighbor-to-neighbor outreach you can see in public—not just on paper.",
    },
    {
      title: "Digital Readiness",
      body: "Fast, accessible web, syndicated updates, and media that respects intelligence and time.",
    },
    {
      title: "Public Engagement",
      body: "Kelly taking questions, listening first, and explaining the office in language real people use.",
    },
  ],
  ctaLabel: "Join the Team Building It",
  ctaHref: "/get-involved",
} as const;

export const STATEWIDE_SECTION = {
  eyebrow: "Presence",
  title: "Showing Up Across Arkansas",
  body: "Serving Arkansas starts with listening. This campaign is committed to showing up, learning from communities, and earning trust across all 75 counties.",
  ctaLabel: "Follow the Statewide Campaign",
  ctaHref: "/updates",
} as const;

export const VIDEO_SECTION = {
  eyebrow: "In her own words",
  title: "Hear Kelly in Her Own Words",
  intro: "Watch the speeches, answers, and campaign moments shaping a people-first vision for Arkansas.",
  ctaLabel: "Watch More Videos",
  ctaHref: "/watch",
  /** Secondary clips — deep-link into themed rails on /watch */
  secondaryClips: [
    { category: "Why I’m Running", title: "The reason I’m asking for your trust", href: "/watch#why_im_running", thumbHint: "Curated on Watch Kelly" },
    { category: "People Over Politics", title: "This office isn’t a party prize", href: "/watch#people_over_politics", thumbHint: "Curated on Watch Kelly" },
    { category: "Election Transparency", title: "What transparency actually looks like", href: "/watch#election_transparency", thumbHint: "Curated on Watch Kelly" },
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
  ctaHref: "/updates",
} as const;

export const PLACEHOLDER_JOURNAL = [
  {
    id: "ph-journal-1",
    title: "Notebook: What “secure” should mean to a voter",
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
    href: "/updates",
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
  title: "This Is a Campaign for the People. Join It.",
  subtitle: "High-trust work needs high-trust people. Pick a lane—we’ll meet you with training and respect.",
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
