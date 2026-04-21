/**
 * Homepage structured content — aligned with narrative wireframes.
 * Story preview hrefs point at published story slugs in `src/content/stories`.
 */

export const heardItems = [
  {
    title: "Voters want the office to feel fair—not performative",
    body: "Across Arkansas, people aren’t asking for a personality cult. They want consistent rules, clear answers, and election administration that doesn’t look like it’s picking winners before the ballots are counted.",
  },
  {
    title: "Small businesses and nonprofits need the SOS to be legible",
    body: "Filings, registrations, and public records touch real deadlines. When systems are confusing or opaque, the cost lands on local people trying to do things the right way.",
  },
  {
    title: "Disengagement is often a design problem",
    body: "Neighbors step back when the process feels rigged, confusing, or humiliating. Meeting people where they are—with respect—is how we rebuild trust in democratic institutions.",
  },
] as const;

export const movementBeliefs = [
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
    title: "Stay connected",
    description: "Updates and honest context about the office—without noise or shame.",
    href: "/get-involved",
    ctaLabel: "Stay connected",
  },
  {
    title: "Help locally",
    description: "Host, knock doors, or support neighbors stepping up in your county.",
    href: "/local-organizing",
    ctaLabel: "Organize nearby",
  },
  {
    title: "Learn ballot access",
    description: "How initiatives and referenda move from idea to ballot—and how we protect voter access responsibly.",
    href: "/direct-democracy",
    ctaLabel: "Explore tools",
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

export const storyPreviews = [
  {
    meta: "Young voter · Northwest Arkansas",
    title: "“I voted for the first time and didn’t feel alone in the line.”",
    excerpt:
      "Paperwork and deadlines shouldn’t feel like a secret club. Plain help at the polls builds confidence in the process.",
    href: "/stories/first-time-voter-line",
    ctaLabel: "Read story",
  },
  {
    meta: "Organizer · Saline County",
    title: "“I started with a porch list and ended with a team.”",
    excerpt:
      "Local listening beats top-down slogans. Here’s how one volunteer built a county rhythm that didn’t depend on one leader.",
    href: "/stories/porch-list-organizer",
    ctaLabel: "Read story",
  },
  {
    meta: "River Valley · after the water",
    title: "“The water went down. The paperwork didn’t.”",
    excerpt:
      "When disaster hits, families navigate forms and deadlines. Clear public processes are part of dignity—and they start with how government shows up.",
    href: "/stories/flood-fema-loop",
    ctaLabel: "Read story",
  },
] as const;
