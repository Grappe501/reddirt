export const LOCATION_BRIEF_MASTER_PLAN = {
  title: "City & County Location Brief — Master Plan",
  subtitle: "From ranked lists to narrative field intelligence · 40 cities · 75 counties",
  intro:
    "This project replaces split Top 10 / Top 40 views with one priority city list and full drill-down pages. Each city gets a brief-board landing with narrative sections (not bullet lists). Each county card opens the full county workbench. Content moves from scaffold → draft → review → approved as field intelligence arrives.",
  phases: [
    {
      id: "phase-0",
      title: "Phase 0 — Structure (complete)",
      status: "complete" as const,
      items: [
        "Unified Priority Cities tab in election plan workbench",
        "Routes: /election-plan/cities and /election-plan/cities/[slug]",
        "County playbook cards link to full county workbench",
        "Master plan page and source JSON schema",
        "Scaffold narratives for all 40 cities from snapshot data",
      ],
    },
    {
      id: "phase-1",
      title: "Phase 1 — City narrative content",
      status: "complete" as const,
      items: [
        "All 40 priority cities at draft status in city-location-briefs.source.json",
        "Each city: situation, penetration, accomplishment, messaging, Kelly talking points, house parties, volunteers, registration",
        "Status workflow: scaffold → draft → review → approved",
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2 — County workbench integration",
      status: "complete" as const,
      items: [
        "Expanded county KPIs on playbook entry (VCI, coverage, lanes, guardrail, field stop count)",
        "Bidirectional links: field calendar ↔ county playbook ↔ city location briefs",
        "County strike team / captain ownership on county and city pages",
        "Priority cities listed on each county playbook page",
      ],
    },
    {
      id: "phase-3",
      title: "Phase 3 — Numeric targets from LANE budget",
      status: "complete" as const,
      items: [
        "Locked registration targets allocated from chapter-05 county registrationGoal by city vote share",
        "House party and volunteer targets from Power of 5 formulas; Sherwood from win-sherwood-operation.json",
        "city-location-numeric-targets.source.json + Locked numeric targets panel on city briefs",
        "County playbook registration allocation table per priority city",
      ],
    },
    {
      id: "phase-4",
      title: "Phase 4 — Calendar & week plan binding",
      status: "pending" as const,
      items: [
        "Show next locked visit and revisit flags on city brief",
        "Link event approvals and verified calendar to location pages",
        "Week plan metrics roll up from city brief completion status",
      ],
    },
  ],
  contentSchema: [
    { field: "briefBoard", purpose: "Landing brief board — what leadership reads first" },
    { field: "situation", purpose: "What is going on here — local political and community context" },
    { field: "situation", purpose: "What is going on here — local political and community context" },
    { field: "penetration", purpose: "How we penetrate — validators, channels, cadence" },
    { field: "accomplishment", purpose: "What we are trying to accomplish — vote and field outcomes" },
    { field: "messaging", purpose: "Messaging localized to this place" },
    { field: "kellyTalkingPoints", purpose: "Kelly-ready quotes (paragraph style, not bullets on page)" },
    { field: "housePartyGoals", purpose: "House party / host committee narrative targets" },
    { field: "volunteerGoals", purpose: "Volunteer depth and captain structure" },
    { field: "registrationGoals", purpose: "Registration contribution to county goal" },
  ],
  sourcePath: "data/campaign-brain/city-location-briefs.source.json",
  routes: [
    { path: "/election-plan?tab=cities", label: "Priority cities (workbench tab)" },
    { path: "/election-plan/cities", label: "Priority cities hub" },
    { path: "/election-plan/cities/[slug]", label: "City location brief" },
    { path: "/election-plan/counties/[countySlug]", label: "County playbook hub" },
    { path: "/election-plan/locations/master-plan", label: "This master plan" },
  ],
};
