export const PHASE_18_MOVEMENT_INFRASTRUCTURE = {
  title: "Phase 18 — Statewide Influence & Movement Infrastructure",
  subtitle: "Arkansas Movement Infrastructure overlay across Executive Book · People Power · Coalition · Forward Motion · Volunteer Leadership · Budget",
  intro:
    "Phase 18 is not isolated pages — it is a statewide operating layer that connects campus recruitment, cross-party trust building, direct democracy stewardship, vertical video corps, thank-you doctrine, Mobilize enforcement, and budget additions into one coordinated growth engine.",
  doctrine: [
    "Campus network is a top-level OS — not a subsection of city briefs",
    "If volunteers or registrations are needed, Mobilize is required",
    "Thank-you closeout is mandatory after every immersion",
    "Trust network emphasizes partnership in good faith — not agreement",
    "Direct democracy is a signature issue: meaningful pathway to propose and repeal laws",
  ],
  modules: [
    {
      id: "18-1",
      title: "Campus Network",
      status: "in_progress" as const,
      href: "/election-plan/campuses",
      items: [
        "Arkansas Colleges & Universities Registry (16+ institutions)",
        "Statewide campus dashboard: enrollment, reg goal, volunteers, fundraising, captains",
        "Routes /election-plan/campuses and /election-plan/campuses/[campus]",
        "Freshman week blitz + campus fundraiser program hooks",
      ],
    },
    {
      id: "18-2",
      title: "Arkansas Trust Network",
      status: "in_progress" as const,
      href: "/election-plan/movement-infrastructure/trust-network",
      items: [
        "Cross-party relationship program — Republicans, independents, business, clerks, civic leaders",
        "Track introductions, meetings, follow-ups, county influencers",
        "Searcy County 50%+1 pilot linkage",
      ],
    },
    {
      id: "18-3",
      title: "Direct Democracy Initiative",
      status: "in_progress" as const,
      href: "/election-plan/direct-democracy",
      items: [
        "Ballot Initiative Resource Center (internal + public /direct-democracy)",
        "Executive Book · platform · coalition · county playbook integration",
        "Clerk, library, and ballot committee outreach tracking",
      ],
    },
    {
      id: "18-4",
      title: "Arkansas Story Corps",
      status: "in_progress" as const,
      href: "/election-plan/movement-infrastructure/story-corps",
      items: [
        "Candidate · volunteer · community · campus · county video teams",
        "YouTube Shorts · TikTok · Reels goals",
        "$1,500 equipment starter kit in budget",
      ],
    },
    {
      id: "18-5",
      title: "Thank-You & Recognition System",
      status: "in_progress" as const,
      href: "/election-plan/movement-infrastructure/thank-you-doctrine",
      items: [
        "Mandatory event closeout checklist in stop command centers",
        "Host: email, card, social, $20 gift card",
        "Volunteer lead: call, card, gift card",
      ],
    },
    {
      id: "18-6",
      title: "Mobilize Enforcement Rules",
      status: "in_progress" as const,
      href: "/election-plan/movement-infrastructure/mobilize-rules",
      items: [
        "Volunteer trigger: reg goal > 0, volunteer goal > 0, or qualifying event type",
        "Red warning: Missing Mobilize Event on Forward Motion + stop command centers",
      ],
    },
    {
      id: "18-7",
      title: "Letters to the Editor Program",
      status: "pending" as const,
      href: "/election-plan/movement-infrastructure/lte-program",
      items: ["LTE volunteer corps", "Tier-3 newspaper inventory binding", "Citizen Voices integration"],
    },
    {
      id: "18-8",
      title: "Campus Fundraising Program",
      status: "pending" as const,
      href: "/election-plan/campuses",
      items: ["Per-campus fundraising goals", "Young Dems / campus org co-host playbook"],
    },
    {
      id: "18-9",
      title: "Freshman Week Blitz",
      status: "pending" as const,
      href: "/election-plan/campuses",
      items: ["August tabling budget ($3,000)", "Captain assignment workflow", "Mobilize required for tabling events"],
    },
    {
      id: "18-10",
      title: "Volunteer Media Corps",
      status: "pending" as const,
      href: "/election-plan/movement-infrastructure/story-corps",
      items: ["Volunteer creators trained on vertical video", "Story Corps + Social Resume rollup"],
    },
  ],
  overlayTargets: [
    { system: "Executive Book", link: "/election-plan?tab=executiveBook" },
    { system: "People Power", link: "/election-plan?tab=volunteerLeadership" },
    { system: "Coalition Command", link: "/election-plan?tab=coalitionCommand" },
    { system: "Forward Motion", link: "/election-plan?tab=forwardMotion" },
    { system: "Budget", link: "/election-plan/executive-book/budget" },
  ],
  buildOrder: [
    "18.1 Campus registry + dashboard",
    "18.6 Mobilize enforcement rules",
    "18.5 Thank-you closeout in stop command centers",
    "18.3 Direct democracy resource center",
    "18.2 Trust network tracking",
    "18.4 Story Corps teams + budget line",
    "18.7–18.10 LTE, fundraising, freshman week, media corps",
  ],
  docPath: "docs/campaign-brain/movement-infrastructure/PHASE-18-BUILD-MASTER-PLAN.md",
};

export function phase18MasterPlanHref(): string {
  return "/election-plan/movement-infrastructure/master-plan";
}

export function campusNetworkHref(): string {
  return "/election-plan/campuses";
}

export function campusDetailHref(slug: string): string {
  return `/election-plan/campuses/${slug}`;
}

export function directDemocracyElectionPlanHref(): string {
  return "/election-plan/direct-democracy";
}
