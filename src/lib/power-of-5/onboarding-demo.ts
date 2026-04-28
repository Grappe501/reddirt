/**
 * Static copy and structure for the Power of 5 onboarding prototype.
 * No PII, no API — demo / preview only.
 */

export const REFLECTION_CATEGORIES = [
  "Family",
  "Friends",
  "Neighbors",
  "Coworkers",
  "Church or community groups",
  "People you already talk to regularly",
] as const;

export const REFLECTION_PROMPTS = [
  "Who already trusts you?",
  "Who do you naturally talk with?",
  "Who lives near you?",
  "Who needs to feel heard before they act?",
] as const;

export const TRAINING_GUIDELINES = [
  "Start with listening.",
  "Ask what matters to them.",
  "Do not begin with a lecture.",
  "Do not argue — curiosity builds bridges.",
  "Invite them into action only after trust feels real.",
  "Follow up within 48 hours.",
] as const;

export const CONVERSATION_STARTERS = [
  "What are you hearing from folks around here?",
  "What do you wish someone would actually fix?",
  "Would you be willing to stay connected with a few of us working on this?",
] as const;

export type ImpactLadderStep = {
  step: string;
  detail: string;
};

export const IMPACT_LADDER_STEPS: ImpactLadderStep[] = [
  { step: "1 person added", detail: "One trusted relationship enters the map." },
  { step: "Power Team forming", detail: "Five intentional connections become a team node." },
  { step: "Precinct coverage increases", detail: "Aggregates show where conversations are landing — never public household maps." },
  { step: "City pipeline grows", detail: "Invites and follow-ups stack into municipal-scale momentum." },
  { step: "County readiness improves", detail: "Leaders see honest gaps and next actions, not vanity scores." },
  { step: "Region and state dashboards move", detail: "Small local work visibly lifts the whole field picture." },
];

export type GamificationPreview = {
  title: string;
  description: string;
};

export const GAMIFICATION_PREVIEW_ITEMS: GamificationPreview[] = [
  {
    title: "Complete your five",
    description: "Celebrate finishing your core circle — cooperative, not competitive against strangers.",
  },
  {
    title: "Conversation streaks",
    description: "Honor consistency with your team and community, without shame for busy weeks.",
  },
  {
    title: "Team badges",
    description: "Civic, proud markers for milestones your whole team can share.",
  },
  {
    title: "Precinct progress",
    description: "Aggregate coverage goals — never public exposure of private voter data.",
  },
  {
    title: "City goals",
    description: "Municipal-scale milestones built from real conversations, not vanity leaderboards.",
  },
  {
    title: "County readiness",
    description: "Honest rollups for organizers — paired with “what to do next,” not blame.",
  },
  {
    title: "Pipeline fill meters",
    description: "See how invites and follow-ups feed signup, volunteer, and GOTV stages — preview only.",
  },
  {
    title: "Cooperative challenges",
    description: "Team-based wins; no shame-based rankings, no public voter dossiers.",
  },
];

export type PipelineCard = {
  id: string;
  title: string;
  what: string;
  why: string;
  howP5: string;
};

export const PIPELINE_CARDS: PipelineCard[] = [
  {
    id: "signup",
    title: "Signup",
    what: "Someone raises their hand to stay in the loop.",
    why: "Every campaign needs a human doorway, not just a form.",
    howP5: "Trusted invites convert faster than cold ads.",
  },
  {
    id: "invite",
    title: "Invite",
    what: "A volunteer asks someone they know to take a step.",
    why: "Word-of-mouth scales when it is organized.",
    howP5: "Your five are the first invite network.",
  },
  {
    id: "activation",
    title: "Activation",
    what: "A new supporter takes a first concrete action.",
    why: "Momentum is built through small wins.",
    howP5: "Peers coach peers through the awkward first step.",
  },
  {
    id: "volunteer",
    title: "Volunteer",
    what: "Time, skills, or presence committed to the work.",
    why: "Elections are won by people showing up.",
    howP5: "Teams recruit teams; leaders spot who is ready.",
  },
  {
    id: "event",
    title: "Event",
    what: "A room, table, or community moment on the calendar.",
    why: "Face-to-face trust still drives rural and small-town politics.",
    howP5: "Your five fill seats and bring plus-ones.",
  },
  {
    id: "conversation",
    title: "Conversation",
    what: "A real dialogue — listening, not just talking points.",
    why: "People change minds through relationship, not volume.",
    howP5: "Power of 5 is conversation-first organizing.",
  },
  {
    id: "follow-up",
    title: "Follow-up",
    what: "A timely check-in after a ask or event.",
    why: "Most drop-off is silence, not disagreement.",
    howP5: "Leaders and members share lightweight follow-up habits.",
  },
  {
    id: "candidate-recruitment",
    title: "Candidate recruitment",
    what: "Finding people willing to run or serve.",
    why: "Bench strength is a geography-wide asset.",
    howP5: "Local networks surface leaders others never see.",
  },
  {
    id: "donor",
    title: "Donor",
    what: "Financial support tied to belief and relationship.",
    why: "Sustainable funding follows trust.",
    howP5: "Warm introductions beat mass prospecting.",
  },
  {
    id: "petition",
    title: "Petition",
    what: "Signatures or pledges with clear purpose.",
    why: "Public measures need grounded, face-to-face validation.",
    howP5: "Neighbors signing with neighbors.",
  },
  {
    id: "gotv",
    title: "GOTV",
    what: "Get-out-the-vote: plans, rides, reminders, accountability.",
    why: "Turnout is the last mile of every campaign.",
    howP5: "Teams cover their precincts and watch each other’s lists (with proper data rules).",
  },
];

export type DashboardPreview = {
  label: string;
  description: string;
  route: string;
  isFuture?: boolean;
};

export const DASHBOARD_PREVIEWS: DashboardPreview[] = [
  {
    label: "Message hub (What to Say)",
    description: "Weekly line, county story cards, share packets, and Power of 5 prompts — public shelf, demo registry.",
    route: "/messages",
  },
  {
    label: "Volunteer preview",
    description: "Your five, your next step, your momentum — scoped to you (illustrative).",
    route: "/dashboard",
  },
  {
    label: "Leadership preview",
    description: "Team completion, follow-up queue, celebration — no cruel rankings (illustrative).",
    route: "/dashboard/leader",
  },
  {
    label: "Precinct view (future)",
    description: "Future aggregate-first precinct view — no public household maps.",
    route: "/organizing-intelligence/counties/[countySlug]/precincts/[precinctId]",
    isFuture: true,
  },
  {
    label: "City view (future)",
    description: "Future drill-down under a county — pipeline and goals at city scale.",
    route: "/organizing-intelligence/counties/[countySlug]/cities/[citySlug]",
    isFuture: true,
  },
  {
    label: "County organizing preview",
    description: "Gold-sample county briefing: Pope v2 (dense public preview).",
    route: "/county-briefings/pope/v2",
  },
  {
    label: "Region & state organizing previews",
    description: "Public organizing intelligence — state rollup and regional drills (demo/seed).",
    route: "/organizing-intelligence",
  },
];

export const PRIVACY_PROMISES = [
  "Private voter data is never public.",
  "Household-level maps are not public.",
  "Relationships are treated with care — consent and safety are part of the organizing model.",
  "Voter file tools are reference tools only for trained staff — not a public people browser.",
  "No shame-based rankings; no public exposure of private voter data in product design.",
] as const;

export const NETWORK_LADDER_LABELS = [
  "You",
  "5 people",
  "Their 5",
  "Neighborhood",
  "Precinct",
  "City",
  "County",
  "Region",
  "State",
] as const;
