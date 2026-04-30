/**
 * Community Election Integrity Tour — public pathway.
 *
 * Related in codebase/docs (not a guarantee of DB-backed rows with this exact title):
 * - `campaign-system-manual/COMMUNITY_ELECTION_INTEGRITY_AND_BALLOT_INITIATIVE_LISTENING_TOUR.md`
 * - Public `/listening-sessions` — separate structured series
 *
 * TODO: When verified stops exist in CMS/DB, merge safe fields only — never invent counties or dates here.
 */

export type IntegrityTourStopStatus = "Research" | "Requested" | "Scheduled" | "Completed";

export type IntegrityTourPlaceholderRow = {
  slot: number;
  county: string;
  status: IntegrityTourStopStatus;
  host: string;
  venue: string;
  date: string;
  pointTeam: string;
};

/** Allocation slots for up to 26 verified stops — not a published schedule. */
export const INTEGRITY_TOUR_PLACEHOLDER_ROWS: readonly IntegrityTourPlaceholderRow[] = Array.from(
  { length: 26 },
  (_, i) => ({
    slot: i + 1,
    county: "—",
    status: "Research",
    host: "—",
    venue: "—",
    date: "—",
    pointTeam: "—",
  }),
);

export const communityElectionIntegrityTourContent = {
  meta: {
    hub: {
      title: "Community Election Integrity Tour",
      description:
        "Twenty-six planned stops statewide — election systems education, voter questions, and local point teams. Calm, nonpartisan, grounded in what the Secretary of State’s office actually does.",
      path: "/events/community-election-integrity-tour",
    },
    request: {
      title: "Host an Election Integrity Tour stop",
      description:
        "Invite a civic, education-first conversation about election systems in your county — same respect and clarity as Invite Kelly.",
      path: "/events/community-election-integrity-tour/request",
    },
    counties: {
      title: "Tour counties tracker",
      description:
        "26-stop allocation grid — counties and dates appear only after verification and approval for public listing.",
      path: "/events/community-election-integrity-tour/counties",
    },
  },

  hub: {
    eyebrow: "Events · Civic education",
    title: "Community Election Integrity Tour",
    subtitle:
      "A trust-first, statewide series of conversations about how Arkansas elections work — and how communities can stay informed without fear or rumor.",
    why: {
      heading: "Why",
      lead: "People trust systems they understand. This tour creates real conversations where Arkansans can ask questions and get clear answers.",
      more: [
        "Election administration can feel distant until someone explains it plainly. The tour is about education and confidence — not slogans, not panic, and not shortcuts around the law.",
        "The Secretary of State’s office has real duties and real limits. Stops should reflect that honesty so neighbors know what to expect from state-level election oversight and what belongs to county officials, courts, or the legislature.",
      ] as const,
    },
    how: {
      heading: "How",
      bullets: [
        "26 planned stops (capacity — not a route list until venues are verified)",
        "Local hosts who know the room",
        "Q&A format — good-faith questions welcome",
        "Plain-language explainers",
        "Calm, nonpartisan conversation",
        "Build local point teams for ongoing, factual follow-up",
      ] as const,
      closing:
        "What you see on this site is planning and principles. Counties and dates are added only after staff verify details — nothing here is a public announcement until the campaign lists it on the calendar.",
    },
    what: {
      heading: "What each stop should do",
      bullets: [
        "Explain the Secretary of State’s role in election administration — and what is outside that role.",
        "Answer real voter questions about registration, access, privacy, and how elections are run.",
        "Identify local leaders who can help carry accurate information back into the community.",
        "Begin or strengthen a county-level point team for trusted follow-up.",
        "Connect people to reliable, lawful resources.",
      ] as const,
    },
    ctas: [
      { label: "Invite a tour stop", href: "/events/community-election-integrity-tour/request" },
      { label: "Counties tracker", href: "/events/community-election-integrity-tour/counties" },
    ] as const,
  },

  request: {
    eyebrow: "Election Integrity Tour · Host",
    title: "Host a tour stop in your community",
    leadParagraphs: [
      "This pathway mirrors the spirit of Invite Kelly: real rooms, civil tone, and honesty about what the office can and cannot do. The difference is the focus — here we center election systems, voter confidence, and plain answers instead of general campaign stops.",
      "If you can convene neighbors, civic members, or local leaders who want to learn without theatrics, you are the kind of host we are looking for. Mixed crowds are welcome when everyone agrees to stay respectful.",
    ] as const,
    intro:
      "Use the checklist below to prepare a request. When the dedicated form is live it will follow the same review process as other campaign invitations — for now, email works.",
    whoInvites: {
      heading: "Who should invite",
      bullets: [
        "County parties and civic groups that want an education-first room",
        "Faith communities, libraries, colleges, and community centers",
        "Neighborhood and local election-focused groups",
        "Bipartisan or mixed-political groups that commit to civility",
      ] as const,
    },
    whatWeNeed: {
      heading: "What we need from you",
      bullets: [
        "Venue suggestion",
        "Local host or point person",
        "Expected turnout (a range is fine)",
        "Preferred dates or windows",
        "Accessibility needs",
        "Public, private, or invitation-only",
        "Topics or questions your community wants addressed",
      ] as const,
    },
    inviteKellyCrossLink: {
      label: "Invite Kelly (general visits & gatherings)",
      href: "/events/request",
    },
    formTitle: "Host request form coming soon",
    formBody: "Email the campaign with the details above — staff will follow up the same way they do for other host requests.",
  },

  counties: {
    eyebrow: "Election Integrity Tour · Tracker",
    title: "Build the 26-stop tour",
    intro:
      "Tracker for tour counties and confirmed stops. Rows stay empty or in Research until a real host, venue, and schedule are verified. Nothing here is an official event listing until it appears on the public campaign calendar.",
    mapCaption: "Map coming soon — counties will light up as tour builds.",
    pointTeam: {
      heading: "County point teams",
      intro:
        "Each stop should leave a small local team behind — people who can answer basic questions, point neighbors to reliable resources, and keep election talk grounded in facts.",
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
  "Load verified rows from admin/CMS when public fields are approved — map only safe, non-PII columns.",
  "Accessible Arkansas map — county status colors as the tour fills in.",
] as const;
