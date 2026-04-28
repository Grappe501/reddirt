import {
  getInvolvedVolunteerCaptainHref,
  powerOf5OnboardingHref,
  representLocalEventVolunteerHref,
} from "@/config/navigation";

export type GetInvolvedPathwayDefinition = {
  id: string;
  title: string;
  whatYouDo: string;
  whyItMatters: string;
  timeRequired: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

/**
 * Pass 3 — ordered “pathway” cards for `/get-involved`.
 * CTAs point at existing routes/forms only (no new API or schema).
 */
export const getInvolvedPathways: GetInvolvedPathwayDefinition[] = [
  {
    id: "power-of-5",
    title: "Start Power of 5",
    whatYouDo:
      "Walk the trust-first relational ladder: who you know, who you’re inviting, and what “done” looks like at each stage—using demo and seed visuals in your browser.",
    whyItMatters:
      "Elections are won in overlapping circles of trust. Power of 5 gives volunteers a shared language so follow-up doesn’t fall through the cracks.",
    timeRequired: "About 15–25 minutes for the guided flow; optional deeper previews afterward.",
    primaryAction: { label: "Open Power of 5 onboarding", href: powerOf5OnboardingHref },
    secondaryAction: { label: "How we organize statewide", href: "/organizing-intelligence" },
  },
  {
    id: "county-team",
    title: "Join a county team",
    whatYouDo:
      "Tell us your community, county, and what you want to build—neighbor outreach, voter education, or local hosting—via the local team intake form.",
    whyItMatters:
      "County teams turn statewide energy into repeatable local action: clear hosts, clear turf, and coordinators who know who raised their hand.",
    timeRequired: "10–15 minutes to submit; follow-up timing depends on volunteer capacity in your area.",
    primaryAction: { label: "Start or join a local team", href: "/start-a-local-team" },
    secondaryAction: { label: "Browse county workbench", href: "/counties" },
  },
  {
    id: "captain",
    title: "Become a city or precinct captain",
    whatYouDo:
      "Raise your hand for leadership training—hosting, captaining, or mentoring others. This link scrolls to the volunteer form and shows a captain-pathway banner; confirm the leadership checkbox and add turf or experience in the skills box.",
    whyItMatters:
      "Captains stabilize geography: they pair new volunteers with real tasks and keep relational work from collapsing when one person gets busy.",
    timeRequired: "15–20 minutes for the form; training cadence is coordinated after intake (not on this page).",
    primaryAction: { label: "Open volunteer signup (leadership tagged)", href: getInvolvedVolunteerCaptainHref },
    secondaryAction: { label: "Read local organizing context", href: "/local-organizing" },
  },
  {
    id: "conversations-stories",
    title: "Help with stories & voices",
    whatYouDo:
      "Use the public message hub for weekly lines and share packets, and optionally submit a story for staff review before anything goes public.",
    whyItMatters:
      "Neighbors believe people they know. Consistent, accurate language plus real stories beats scatter-shot posts and rumor.",
    timeRequired: "A few minutes to skim the hub; 20–40 minutes if you write a thoughtful story draft.",
    primaryAction: { label: "Open Stories & voices hub", href: "/messages" },
    secondaryAction: { label: "Submit a story", href: "/stories#share" },
  },
  {
    id: "events",
    title: "Attend an event",
    whatYouDo:
      "Pick a public campaign or community event from the calendar, show up, and (if you want) represent the campaign at third-party local gatherings with training and materials.",
    whyItMatters:
      "Events concentrate attention: they’re where undecided voters and volunteers often take a first real step.",
    timeRequired: "Varies by event—typically 1–3 hours on site; representation shifts may include a short prep call.",
    primaryAction: { label: "Browse events", href: "/events" },
    secondaryAction: { label: "Volunteer to represent at an event", href: representLocalEventVolunteerHref },
  },
  {
    id: "recruit-candidates",
    title: "Recruit candidates",
    whatYouDo:
      "Learn how the Secretary of State’s office touches filing and calendars, then raise your hand to help first-time or local candidates understand the path—often paired with voter education or party/civic invites.",
    whyItMatters:
      "Democracy needs a wider bench. When filing and deadlines are clearer, more everyday Arkansans can consider running.",
    timeRequired: "30+ minutes to read priorities context; volunteer follow-up is routed after you submit skills or a join form.",
    primaryAction: { label: "Read candidate access priorities", href: "/priorities#candidate-access-heading" },
    secondaryAction: { label: "Volunteer (note candidate support in skills)", href: "/get-involved#volunteer" },
  },
  {
    id: "petitions-gotv",
    title: "Help with petitions and GOTV",
    whatYouDo:
      "Join the referendum commitment network for ballot-access pledges (legal details finalized with counsel before collection), and use the volunteer form for general election GOTV shifts when coordinators publish them.",
    whyItMatters:
      "Ballot access and turnout are complementary: one protects the public’s leverage; the other ensures voters get over the finish line.",
    timeRequired: "10–15 minutes for the commitment form; GOTV windows are seasonal and shift-based.",
    primaryAction: { label: "Join the commitment network", href: "/direct-democracy#commitment-network" },
    secondaryAction: { label: "Volunteer for field shifts", href: "/get-involved#volunteer" },
  },
];
