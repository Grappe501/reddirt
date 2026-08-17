/**
 * Homepage structured content — aligned with narrative wireframes.
 * Story preview hrefs point at published story slugs in `src/content/stories`.
 */

export const heardItems = [
  {
    title: "What voters expect from this office",
    body: "Generic civic expectation—not a survey claim: voters deserve consistent election rules, clear business filings, and public information they can find without insider knowledge. When processes are explained plainly and applied evenly, confidence in institutions recovers.",
  },
  {
    title: "Why business services matter",
    body: "Generic civic explanation: filings and registrations touch real deadlines for employers and nonprofits. Predictable systems reduce confusion and keep Arkansas organizations focused on their work—not on decoding state paperwork.",
  },
  {
    title: "Participation needs clear paths",
    body: "Generic civic explanation: neighbors step back when the process feels confusing or unfair. Plain materials, respectful outreach, and offices that assume good faith help people re-engage with democratic institutions.",
  },
] as const;

export const movementBeliefs = [
  {
    title: "Defend direct democracy",
    body: "Ballot initiatives and referenda belong to citizens—not insiders who treat signature gathering as a privilege. Kelly entered this race to protect that path.",
  },
  {
    title: "Protect the vote",
    body: "Fair, secure elections administered consistently—free from political pressure or favoritism. That’s the baseline for confidence in Arkansas democracy.",
  },
  {
    title: "Serve all 75 counties",
    body: "Rural and urban communities deserve the same clarity, reliable systems, and responsive support from the Secretary of State’s office.",
  },
  {
    title: "Lead with transparency",
    body: "Plain-language information, open processes, and accountability in every function—not just the parts that photograph well.",
  },
  {
    title: "People over politics",
    body: "This campaign welcomes voters of every party. The office belongs to the public; the job is administration faithful to the law.",
  },
] as const;

export const pathwayCards = [
  {
    title: "Direct democracy & ballot access",
    description: "How initiatives and referenda move from idea to ballot—and how we protect citizen-led petition work.",
    href: "/priorities#peoples-voice",
    ctaLabel: "The People's Constitutional Voice",
  },
  {
    title: "Ballot initiative process",
    description: "Official steps from title drafting through signature verification—plain language, no insider jargon.",
    href: "/direct-democracy/ballot-initiative-process",
    ctaLabel: "Walk the process",
  },
  {
    title: "Stay connected",
    description: "Updates and honest context about the office—without noise or shame.",
    href: "/get-involved",
    ctaLabel: "Stay connected",
  },
  {
    title: "Help locally",
    description: "Host, knock doors, or support neighbors stepping up in your county.",
    href: "/start-a-local-team",
    ctaLabel: "Start a local team",
  },
  {
    title: "Office priorities",
    description: "Election integrity, public records, and business services—what the Secretary of State actually touches.",
    href: "/priorities",
    ctaLabel: "Read priorities",
  },
  {
    title: "Share your story",
    description: "Your experience with voting, filings, or county administration helps us keep the campaign grounded.",
    href: "/stories#share",
    ctaLabel: "Tell your story",
  },
] as const;

export type StoryPreview = {
  meta: string;
  title: string;
  excerpt: string;
  href: string;
  ctaLabel: string;
};

/** Removed from public homepage — illustrative story slugs were not verified voter testimonials. */
export const storyPreviews: readonly StoryPreview[] = [];
