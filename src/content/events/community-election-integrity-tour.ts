/**
 * Community Election Integrity Tour — public pathway.
 *
 * Related in codebase/docs (not a guarantee of DB-backed rows with this exact title):
 * - `campaign-system-manual/COMMUNITY_ELECTION_INTEGRITY_AND_BALLOT_INITIATIVE_LISTENING_TOUR.md`
 * - Public `/listening-sessions` — Arkansas Election & Ballot Access Listening Sessions (separate structured series)
 * - `src/content/events/index.ts` — movement events mentioning election process / listening framing
 *
 * TODO: When verified stops exist in CMS/DB, merge safe fields only — never invent counties or dates here.
 */

export type IntegrityTourStopStatus =
  | "Research needed"
  | "Requested"
  | "Pending approval"
  | "Scheduled"
  | "Completed";

export type IntegrityTourPlaceholderRow = {
  slot: number;
  regionCounty: string;
  status: IntegrityTourStopStatus;
  host: string;
  venue: string;
  date: string;
  pointTeam: string;
  notes: string;
};

/** Allocation slots for up to 26 verified stops — not a published schedule. */
export const INTEGRITY_TOUR_PLACEHOLDER_ROWS: readonly IntegrityTourPlaceholderRow[] = Array.from(
  { length: 26 },
  (_, i) => ({
    slot: i + 1,
    regionCounty: "—",
    status: "Research needed",
    host: "—",
    venue: "—",
    date: "—",
    pointTeam: "—",
    notes: "—",
  }),
);

export const communityElectionIntegrityTourContent = {
  meta: {
    hub: {
      title: "Community Election Integrity Tour",
      description:
        "Twenty-six planned community conversations across Arkansas — plain-language election systems education, local questions, and county point teams. Calm, nonpartisan, confidence-building.",
      path: "/events/community-election-integrity-tour",
    },
    request: {
      title: "Invite the Election Integrity Tour",
      description:
        "Invite a Community Election Integrity Tour stop in your county or region — hosted, civil, education-first.",
      path: "/events/community-election-integrity-tour/request",
    },
    counties: {
      title: "Build the 26-stop tour",
      description:
        "Tracker for Community Election Integrity Tour counties and regions — slots fill only after verification.",
      path: "/events/community-election-integrity-tour/counties",
    },
  },

  hub: {
    eyebrow: "Events · Civic education",
    title: "Community Election Integrity Tour",
    subtitle:
      "Twenty-six community conversations to help Arkansans understand, question, and strengthen confidence in our election systems.",
    why: {
      heading: "Why",
      paragraphs: [
        "People trust systems better when they understand them. Kelly believes election confidence cannot be built by slogans, fear, or party talking points. It has to be built in rooms where people can ask real questions and get plain answers.",
        "Arkansas elections belong to Arkansans. The tour fits a simple ethos: Hold the line under law, steward transparent and nonpartisan administration, and help communities take responsibility locally — education and neighbor-to-neighbor clarity, not alarm.",
      ] as const,
    },
    how: {
      heading: "How",
      paragraphs: [
        "The campaign will organize 26 community stops across Arkansas. Each stop should include local hosts, voter education, time for Q&A, practical explainers, and the start of a county point team that can carry trusted information back into daily community life.",
        "What you see here is planning and principles — not a published route list. Counties and dates appear only after staff verify details.",
      ] as const,
    },
    what: {
      heading: "What each stop should help with",
      bullets: [
        "Explain what the Secretary of State does and does not do within Arkansas law.",
        "Answer good-faith questions about voter registration, access, privacy, and election administration — without jargon walls.",
        "Gather local concerns so the campaign and partners can follow up responsibly.",
        "Identify or begin forming a county point team for ongoing outreach.",
        "Connect voters to reliable, lawful resources — the boring links that actually help.",
        "Invite people into the broader campaign work only when they want in — no pressure, no theatrics.",
      ] as const,
    },
    ctas: [
      { label: "Invite a tour stop", href: "/events/community-election-integrity-tour/request" },
      { label: "Build the 26-stop tour (tracker)", href: "/events/community-election-integrity-tour/counties" },
    ] as const,
  },

  request: {
    eyebrow: "Election Integrity Tour · Host",
    title: "Invite the Election Integrity Tour",
    intro:
      "Invite Kelly and the campaign to hold a Community Election Integrity Tour stop in your county or region. The room should be education-first, civil, and honest about what the office can and cannot do.",
    whoInvites: {
      heading: "Who should invite",
      bullets: [
        "County parties (any affiliation) that want a serious, hosted room",
        "Civic groups",
        "Churches, synagogues, mosques, or community centers",
        "Libraries",
        "Colleges and student groups",
        "Neighborhood associations",
        "Local election-focused groups",
        "Bipartisan or mixed-political rooms that agree to stay civil",
      ] as const,
    },
    whatWeNeed: {
      heading: "What we need from you",
      bullets: [
        "Venue suggestion",
        "Local host or point person",
        "Expected turnout (rough range is fine)",
        "Preferred dates / windows",
        "Accessibility notes",
        "Whether the event should be public, private, or invitation-only",
        "Local concerns or questions the community wants addressed",
      ] as const,
    },
    formTitle: "Request form coming soon",
    formBody:
      "When the form is live, it will use the same review standards as other campaign requests. Until then, email the campaign with the details above.",
  },

  counties: {
    eyebrow: "Election Integrity Tour · Tracker",
    title: "Build the 26-Stop Tour",
    intro:
      "This table is an allocation grid for up to twenty-six verified stops. Rows fill in only when research and scheduling confirm a real venue — **nothing here is an announcement until the campaign publishes it on the calendar.**",
    mapCaption:
      "Arkansas county map — coming soon. Future: subtle colors for requested, pending approval, scheduled, completed, and point-team-formed — no decorative pins until data is verified.",
    pointTeam: {
      heading: "Build a County Point Team",
      intro:
        "Each tour stop should leave something behind: a small local team that can answer basic questions, point people to reliable resources, invite neighbors to future events, and help keep election conversations grounded in facts instead of fear.",
      roles: [
        "Local host",
        "Venue / logistics lead",
        "Voter education lead",
        "Outreach / bring-5 lead",
        "Follow-up lead",
        "Media / story collector",
      ] as const,
    },
  },
} as const;

export const integrityTourFutureTodos = [
  "Connect host request form to WorkflowIntake and internal pending-approval calendar.",
  "Load verified rows from admin/CMS or Prisma CampaignEvent when tagging exists — map only approved public fields.",
  "SVG / accessible map with county status colors (requested / pending / scheduled / completed / point team).",
] as const;
