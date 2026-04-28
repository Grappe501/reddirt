/**
 * Homepage structured content — aligned with narrative wireframes.
 * Story preview hrefs point at published story slugs in `src/content/stories`.
 */

export const heardItems = [
  {
    title: "Voters want the office to feel fair—not performative",
    body: "Across Arkansas, people aren’t asking for a personality cult. They want consistent rules, clear answers, and election administration that doesn’t look like it’s picking winners before the ballots are counted. They expect the same instructions in every county, paperwork that matches the law as written, and timely public information when something changes. When rules are explained in plain language and applied evenly—rural and urban, big county and small—that’s when confidence comes back. Fairness here is operational: honest checklists for clerks, audits that are actually designed to learn, and a front office that treats every voter’s question as legitimate. That’s the bar this campaign is built to meet.",
  },
  {
    title: "Small businesses and nonprofits need the SOS to be legible",
    body: "Filings, registrations, and public records touch real deadlines. When systems are confusing or opaque, the cost lands on local people trying to do things the right way. A missed annual report, a misfiled UCC, or a form that sends you in circles isn’t a footnote—it can mean fees, delays, or doors that should stay open suddenly closing. Owners and treasurers shouldn’t need a lawyer on speed-dial to understand what the state already requires. The office should publish clear examples, keep phone and online help actually answerable, and treat business services as economic infrastructure—not an afterthought buried in PDFs from 2011. Legibility is how Arkansas keeps employers and civic groups moving.",
  },
  {
    title: "Disengagement is often a design problem",
    body: "Neighbors step back when the process feels rigged, confusing, or humiliating. Meeting people where they are—with respect—is how we rebuild trust in democratic institutions. That starts with materials that read like they were written for humans, not for compliance officers, and with outreach that reaches small towns and night shifts—not just press releases aimed at Little Rock. When people can’t find accurate information, or they get punished for honest mistakes, they don’t become “apathetic”; they get smart about protecting their time. Fixing that is leadership: fewer dead ends, clearer paths, and an office that assumes good faith until proven otherwise. Trust returns when the process stops punishing curiosity.",
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
    title: "Meet Kelly",
    description: "Who she is, why Secretary of State, and what “the people rule” means for Arkansas.",
    href: "/about",
    ctaLabel: "Learn about Kelly",
  },
  {
    title: "Priorities",
    description: "Elections, ballot access, business filings, and public records—what this office actually does.",
    href: "/priorities",
    ctaLabel: "Read priorities",
  },
  {
    title: "Counties & local teams",
    description: "Find your county, host a gathering, or join neighbors building teams where you live.",
    href: "/counties",
    ctaLabel: "Browse counties",
  },
  {
    title: "Volunteer",
    description: "Door knocks, events, outreach, and county leadership—pick a lane that fits your life.",
    href: "/get-involved",
    ctaLabel: "Get involved",
  },
  {
    title: "Donate",
    description: "Chip in to power accountable, voter-facing organizing—online or recurring.",
    href: "/donate",
    ctaLabel: "Donate",
  },
  {
    title: "Ballot access",
    description: "How initiatives and referenda reach the ballot—explained clearly, without jargon.",
    href: "/direct-democracy",
    ctaLabel: "Explore direct democracy",
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
