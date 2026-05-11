import { computeInvitationVisibility } from "@/lib/dashboard/invitation-privacy";
import { formatTeamCode, formatTeamDisplayName, VOLUNTEER_OS_DEMO_TEAM_SLUG, buildTeamSlug } from "@/lib/team-naming";
import type {
  Announcement,
  CampaignAlert,
  DownstreamTeamNode,
  Kpi,
  PriorityAction,
  SharedFile,
  Team,
  TeamBuildInvitation,
  TeamMember,
  TeamMessage,
  TeamMonthlyProgram,
  TeamReachContact,
  Task,
  Volunteer,
} from "@/types/dashboard";

export const PROTOTYPE_TEAM_SLUG = VOLUNTEER_OS_DEMO_TEAM_SLUG;

/** Demo: one-person building team (invite flows + privacy). */
export const MOCK_SOLO_BUILDING_TEAM_SLUG = buildTeamSlug("rogers-county", "Resolve", 315);

const MOCK_MONTHLY_P5_PROGRAMS: TeamMonthlyProgram[] = [
  {
    id: "vos-p5-community-social-hour",
    title: "Community Outreach Social Hour",
    cadence: "monthly",
    kind: "power_of_5_gathering",
    planningNote: "Brings area Power of 5 networks together; add to Events when scheduled.",
  },
  {
    id: "vos-vr-monthly-drive",
    title: "Voter Registration Event",
    cadence: "monthly",
    kind: "voter_registration",
    planningNote: "Focused monthly VR push; add to Events when scheduled.",
  },
];

function mockInvite(
  input: Omit<TeamBuildInvitation, "visibleToMemberIds">,
  memberVolunteerIds: string[],
): TeamBuildInvitation {
  return {
    ...input,
    visibleToMemberIds: computeInvitationVisibility(input, memberVolunteerIds),
  };
}

export const MOCK_VOLUNTEER: Volunteer = {
  id: "vol-1",
  name: "Alex Volunteer",
  role: "social-media",
  teamId: "team-creek-county-liberty-104",
  assignedTeamIds: ["team-creek-county-liberty-104"],
  streaks: {
    dailySocialEngagement: { currentDays: 5, best7: 6, best30: 18 },
  },
  weeklyTaskCompletionPercent: 78,
  monthlyGoalsCompleted: 2,
  monthlyGoalsTarget: 4,
  kpis: [
    { id: "k-v-1", label: "Daily social streak (days)", value: 5, target: 7, period: "rolling" },
    { id: "k-v-2", label: "Weekly lane tasks done", value: 7, target: 9, period: "weekly" },
    { id: "k-v-3", label: "/volunteer invites sent", value: 3, target: 5, period: "weekly" },
    { id: "k-v-4", label: "Huddles attended (month)", value: 3, target: 4, period: "monthly" },
  ],
};

const geoCreek = "Creek County, OK";

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    volunteerId: "vol-2",
    name: "Jamie Events",
    role: "events",
    emailStatus: "confirmed",
    lastActivity: "2026-05-10 — added 2 pipeline items",
  },
  {
    volunteerId: "vol-1",
    name: "Alex Rivera",
    role: "social-media",
    emailStatus: "confirmed",
    lastActivity: "2026-05-10 — engagement on official post",
  },
  {
    volunteerId: "vol-3",
    name: "Riley Chen",
    role: "power-of-5",
    emailStatus: "pending",
    lastActivity: "2026-05-09 — VR table shift scheduled",
  },
];

const creekTriadMemberIds = MOCK_TEAM_MEMBERS.map((m) => m.volunteerId);

const MOCK_CREEK_REACH_CONTACTS: TeamReachContact[] = [
  {
    id: "rc-1",
    displayName: "Neighbor A.",
    relationship: "Next door · 6 yrs",
    supportStatus: "supportive",
    registrationStatus: "registered",
    lastTouch: "2026-05-09 — text check-in",
    nextAction: "Turnout plan before early vote",
    volunteerInterest: "not-asked",
    ownerMemberId: "vol-1",
  },
  {
    id: "rc-2",
    displayName: "Cousin B.",
    relationship: "Family",
    supportStatus: "persuadable",
    registrationStatus: "needs-registration",
    lastTouch: "2026-05-07 — coffee",
    nextAction: "VR booth Saturday",
    volunteerInterest: "interested",
    ownerMemberId: "vol-1",
  },
  {
    id: "rc-3",
    displayName: "PTA contact",
    relationship: "School parent",
    supportStatus: "needs-follow-up",
    registrationStatus: "unknown",
    lastTouch: "2026-05-04 — event floor",
    nextAction: "Follow-up call",
    volunteerInterest: "not-asked",
    ownerMemberId: "vol-2",
  },
  {
    id: "rc-4",
    displayName: "Shift buddy",
    relationship: "Work",
    supportStatus: "unknown",
    registrationStatus: "helped-register",
    lastTouch: "2026-05-08 — registration table",
    nextAction: "Thank-you + stay in touch",
    volunteerInterest: "referred-to-volunteer",
    ownerMemberId: "vol-3",
  },
  {
    id: "rc-5",
    displayName: "Faith community friend",
    relationship: "Congregation",
    supportStatus: "not-interested",
    registrationStatus: "unknown",
    lastTouch: "2026-05-01 — respectful close",
    nextAction: "No push — preserve relationship",
    volunteerInterest: "not-asked",
    ownerMemberId: "vol-3",
  },
];

const creekDisplay = formatTeamDisplayName("Creek County", "Liberty", 104);
const creekCode = formatTeamCode("Liberty", 104);

export const MOCK_TEAM: Team = {
  id: "team-creek-county-liberty-104",
  teamCode: creekCode,
  displayName: creekDisplay,
  slug: PROTOTYPE_TEAM_SLUG,
  accessEmails: ["demo.events@example.invalid", "demo.social@example.invalid", "demo.p5@example.invalid"],
  geography: geoCreek,
  level: "county",
  upstreamContactId: "vol-staff-1",
  upstreamContactName: "Sarah Okonkwo",
  upstreamContactEmail: "upstream@example.invalid",
  members: MOCK_TEAM_MEMBERS,
  downstreamTeamIds: ["team-sapulpa-beacon-211", "team-bristow-eagle-087", "team-drumright-torch-194"],
  teamInviteUrl: "https://www.example.invalid/volunteer/team-invite?team=creek-county-liberty-104",
  teamQrCodeUrl: "https://www.example.invalid/static/qr/team-creek-county-liberty-104.png",
  lifecycleStatus: "active",
  monthlyPrograms: MOCK_MONTHLY_P5_PROGRAMS,
  powerOfFiveSummary: {
    contactsTracked: 14,
    touchesCompleted: 38,
    registrationsCompleted: 11,
    volunteersReferred: 2,
  },
  powerOfFiveTeamTargets: {
    minCoreContacts: 15,
    minRegistrations: 30,
    monthlySocialHourPlanned: false,
    monthlyVrEventPlanned: true,
  },
  reachContacts: MOCK_CREEK_REACH_CONTACTS,
  powerOfFivePlacementLeads: [
    {
      id: "p5-pl-1",
      name: "Taylor Kim",
      location: "Kellyville, OK",
      interest: "Wants to table occasionally, not a full triad role",
      source: "County fair signup sheet · P5 contact of Jamie (Events)",
      suggestedOwnerMemberId: "vol-2",
      suggestedNextStep: "add-to-p5-network",
      fitCheckStatus: "not-applicable",
      inviteLinkStatus: "none",
      workflowStatus: "pending-fit-check",
      notes: "Room on Jamie’s P5 list — add relationally, not as a bulk import.",
    },
    {
      id: "p5-pl-2",
      name: "Chris Ortiz",
      location: "Sapulpa, OK",
      interest: "Asked about volunteer leadership",
      source: "/volunteer funnel (demo)",
      suggestedOwnerMemberId: "vol-1",
      suggestedNextStep: "invite-to-volunteer",
      fitCheckStatus: "not-applicable",
      inviteLinkStatus: "none",
      workflowStatus: "invite-sent",
      notes: "Send to /volunteer for triad onboarding.",
    },
    {
      id: "p5-pl-3",
      name: "Morgan Lee",
      location: "Bristow area",
      interest: "New mover, open to hosting small gatherings",
      source: "Neighbor referral · Riley’s network full at five",
      suggestedOwnerMemberId: "vol-3",
      suggestedNextStep: "place-downstream",
      suggestedDownstreamTeamName: "Sapulpa Beacon 211",
      suggestedDownstreamTeamSlug: buildTeamSlug("sapulpa", "Beacon", 211),
      suggestedDownstreamLeadName: "Morgan",
      fitCheckStatus: "pending",
      inviteLinkStatus: "pending-lead",
      workflowStatus: "pending-fit-check",
      notes: "Geography aligns with city team; confirm open lanes downstream.",
    },
    {
      id: "p5-pl-4",
      name: "Pat Rivera",
      location: "Drumright, OK",
      interest: "Wants to meet other volunteers socially",
      source: "Outreach social hour waitlist (demo)",
      suggestedOwnerMemberId: "vol-3",
      suggestedNextStep: "invite-outreach-social-hour",
      fitCheckStatus: "not-applicable",
      inviteLinkStatus: "none",
      workflowStatus: "pending-fit-check",
    },
    {
      id: "p5-pl-5",
      name: "Jamie Ng",
      location: "Creek County",
      interest: "Needs help checking voter registration",
      source: "Text-in hotline (demo)",
      suggestedOwnerMemberId: "vol-3",
      suggestedNextStep: "invite-vr-event",
      fitCheckStatus: "not-applicable",
      inviteLinkStatus: "none",
      workflowStatus: "pending-fit-check",
    },
  ],
  invitations: [
    mockInvite(
      {
        id: "inv-creek-declined-jamie",
        teamId: "team-creek-county-liberty-104",
        email: "busyneighbor@example.invalid",
        intendedRole: "social-media",
        invitedByMemberId: "vol-2",
        status: "declined",
        note: "Timing did not work — private to inviter + HQ.",
        createdAt: "2026-05-08",
        respondedAt: "2026-05-09",
      },
      creekTriadMemberIds,
    ),
    mockInvite(
      {
        id: "inv-creek-draft-alex",
        teamId: "team-creek-county-liberty-104",
        email: "draft.only@example.invalid",
        intendedRole: "social-media",
        invitedByMemberId: "vol-1",
        status: "drafted",
        note: "Not sent yet — inviter + HQ only.",
        createdAt: "2026-05-11",
      },
      creekTriadMemberIds,
    ),
    mockInvite(
      {
        id: "inv-creek-sent-alex",
        teamId: "team-creek-county-liberty-104",
        email: "friend.powers@example.invalid",
        intendedRole: "power-of-5",
        invitedByMemberId: "vol-1",
        status: "sent",
        createdAt: "2026-05-10",
      },
      creekTriadMemberIds,
    ),
    mockInvite(
      {
        id: "inv-creek-accepted-riley",
        teamId: "team-creek-county-liberty-104",
        email: "riley.chen@example.invalid",
        intendedRole: "power-of-5",
        invitedByMemberId: "vol-2",
        status: "accepted",
        createdAt: "2026-04-01",
        respondedAt: "2026-04-02",
      },
      creekTriadMemberIds,
    ),
    mockInvite(
      {
        id: "inv-creek-canceled-riley",
        teamId: "team-creek-county-liberty-104",
        email: "backup.coord@example.invalid",
        intendedRole: "events",
        invitedByMemberId: "vol-3",
        status: "canceled",
        createdAt: "2026-05-02",
        respondedAt: "2026-05-03",
      },
      creekTriadMemberIds,
    ),
  ],
  kpis: [
    { id: "k-t-1", label: "Active team members", value: 3, target: 3, period: "weekly" },
    { id: "k-t-2", label: "Weekly completion %", value: 74, target: 80, period: "weekly" },
    { id: "k-t-3", label: "Downstream teams launched", value: 3, target: 5, period: "monthly" },
    { id: "k-t-4", label: "New volunteers recruited", value: 4, target: 8, period: "monthly" },
    { id: "k-t-5", label: "Contacts reached (est.)", value: 118, target: 200, period: "weekly" },
    { id: "k-t-p5-contacts", label: "Active Power of 5 contacts", value: 14, target: 15, period: "rolling" },
    { id: "k-t-p5-regs", label: "Voter registrations (tracked)", value: 11, target: 30, period: "monthly" },
    { id: "k-t-p5-touches", label: "Relational touches logged", value: 38, period: "weekly" },
    { id: "k-t-p5-referrals", label: "Volunteers referred · /volunteer", value: 2, period: "monthly" },
    { id: "k-t-womens-leads", label: "Women's network contacts identified", value: 12, target: 25, period: "monthly" },
    { id: "k-t-womens-gatherings", label: "Women-led gatherings held", value: 3, target: 8, period: "monthly" },
    { id: "k-t-womens-regs", label: "Women voter registrations (tracked)", value: 8, target: 20, period: "monthly" },
    { id: "k-t-womens-referrals", label: "Women volunteer referrals", value: 2, target: 6, period: "monthly" },
    { id: "k-t-womens-family-events", label: "Family-friendly events supported", value: 4, target: 10, period: "monthly" },
    { id: "k-t-community-leads", label: "Community region active leads", value: 18, target: 40, period: "rolling" },
    { id: "k-t-community-teams", label: "Active sub-teams / cells", value: 2, target: 6, period: "monthly" },
    { id: "k-t-community-events", label: "Region events completed (period)", value: 5, target: 12, period: "monthly" },
    { id: "k-t-community-regs", label: "Registrations attributed to region", value: 9, target: 25, period: "monthly" },
    { id: "k-t-community-review", label: "Territory review milestones met", value: 3, target: 5, period: "monthly" },
  ],
  weeklyBriefing:
    "Week of May 11: emphasize neighbor stories and local trust-building. County fair season is starting — Events lane should flood the pipeline with anything that helps Kelly connect. Social: one authentic local post per coordinator; stay on-message with the field playbook. Power of 5 / VR: keep registration conversations relational — quality over volume. Upstream huddle Thursday 7pm; materials are in the resource library.",
  upcomingEvents: [
    { id: "ev-1", title: "County fair — information booth slot", date: "2026-05-18", location: "Kellyville, OK" },
    { id: "ev-2", title: "Chamber breakfast (listening block)", date: "2026-05-22", location: "Sapulpa, OK" },
    { id: "ev-3", title: "Backyard meet-and-greet (planning)", date: "TBD June", location: "Bristow area" },
  ],
  eventPipeline: [
    { id: "ep-1", title: "Sapulpa youth sports opening weekend", status: "Watching", notes: "Vendor row + community tent" },
    { id: "ep-2", title: "Drumright rodeo parade", status: "Research", notes: "Confirm route + viewing area" },
    { id: "ep-3", title: "Community blood drive (neutral visibility)", status: "Added", notes: "Nonpartisan room — bring literature only if invited" },
  ],
  visitPlans: [
    { id: "vp-1", label: "Kelly weekend in Creek County", status: "Draft itinerary" },
    { id: "vp-2", label: "VIP introductions (faith + civic)", status: "3 names warming" },
  ],
};

function teamBasics(overrides: Partial<Team> & Pick<Team, "id" | "slug" | "displayName" | "geography" | "level">): Team {
  const mockCore = { ...MOCK_TEAM };
  delete mockCore.invitations;
  delete mockCore.reachContacts;
  delete mockCore.powerOfFiveTeamTargets;
  delete mockCore.powerOfFiveMemberNetworks;
  delete mockCore.powerOfFivePlacementLeads;
  delete mockCore.teamInviteUrl;
  delete mockCore.teamQrCodeUrl;
  delete mockCore.fieldOperatingSystem;
  delete mockCore.youthOutreach;

  return {
    ...mockCore,
    ...overrides,
    members: overrides.members ?? [],
    downstreamTeamIds: overrides.downstreamTeamIds ?? [],
    upcomingEvents: overrides.upcomingEvents ?? [],
    eventPipeline: overrides.eventPipeline ?? [],
    visitPlans: overrides.visitPlans ?? [],
    kpis: overrides.kpis ?? MOCK_TEAM.kpis,
    accessEmails: overrides.accessEmails ?? [],
    upstreamContactId: MOCK_TEAM.upstreamContactId,
    upstreamContactName: MOCK_TEAM.upstreamContactName,
    upstreamContactEmail: MOCK_TEAM.upstreamContactEmail,
    invitations: overrides.invitations,
    reachContacts: overrides.reachContacts,
    powerOfFiveTeamTargets: overrides.powerOfFiveTeamTargets,
    powerOfFiveMemberNetworks: overrides.powerOfFiveMemberNetworks,
    powerOfFivePlacementLeads: overrides.powerOfFivePlacementLeads,
    teamInviteUrl: overrides.teamInviteUrl,
    teamQrCodeUrl: overrides.teamQrCodeUrl,
  };
}

const soloMemberIds = ["vol-solo-1"];

/** One-person “building” triad — see `/dashboard/team/` + `MOCK_SOLO_BUILDING_TEAM_SLUG`. */
export const MOCK_SOLO_BUILDING_TEAM: Team = teamBasics({
  id: "team-rogers-county-resolve-315",
  teamCode: formatTeamCode("Resolve", 315),
  displayName: formatTeamDisplayName("Rogers County", "Resolve", 315),
  slug: MOCK_SOLO_BUILDING_TEAM_SLUG,
  geography: "Rogers County, OK",
  level: "county",
  members: [
    {
      volunteerId: "vol-solo-1",
      name: "Jordan Matthews",
      role: "events",
      emailStatus: "confirmed",
      lastActivity: "2026-05-10 — seeding Events pipeline",
    },
  ],
  downstreamTeamIds: [],
  teamInviteUrl: "https://www.example.invalid/volunteer/team-invite?team=rogers-county-resolve-315",
  teamQrCodeUrl: "https://www.example.invalid/static/qr/team-rogers-county-resolve-315.png",
  accessEmails: ["jordan.events@example.invalid"],
  lifecycleStatus: "building",
  weeklyBriefing:
    "You are the first volunteer on this operating team — that is expected. Use private invitations to recruit your Social and Power of 5 / VR coordinators without broadcasting declines to the whole triad.",
  monthlyPrograms: MOCK_MONTHLY_P5_PROGRAMS,
  powerOfFiveSummary: {
    contactsTracked: 4,
    touchesCompleted: 9,
    registrationsCompleted: 2,
    volunteersReferred: 0,
  },
  powerOfFiveTeamTargets: {
    minCoreContacts: 15,
    minRegistrations: 30,
    monthlySocialHourPlanned: false,
    monthlyVrEventPlanned: false,
  },
  reachContacts: [
    {
      id: "rc-solo-1",
      displayName: "Friend from rotary",
      relationship: "Civic club",
      supportStatus: "supportive",
      registrationStatus: "registered",
      lastTouch: "2026-05-06 — quick call",
      nextAction: "Early vote reminder",
      volunteerInterest: "not-asked",
      ownerMemberId: "vol-solo-1",
    },
    {
      id: "rc-solo-2",
      displayName: "Sibling",
      relationship: "Family",
      supportStatus: "persuadable",
      registrationStatus: "needs-registration",
      lastTouch: "2026-05-09 — text thread",
      nextAction: "Offer VR help this weekend",
      volunteerInterest: "interested",
      ownerMemberId: "vol-solo-1",
    },
  ],
  powerOfFivePlacementLeads: [
    {
      id: "p5-solo-pl-1",
      name: "Devon Ash",
      location: "Claremore, OK",
      interest: "Curious about volunteering after church event",
      source: "Community table (demo) · Jordan’s P5",
      suggestedOwnerMemberId: "vol-solo-1",
      suggestedNextStep: "invite-to-volunteer",
      fitCheckStatus: "not-applicable",
      inviteLinkStatus: "none",
      workflowStatus: "pending-fit-check",
    },
  ],
  invitations: [
    mockInvite(
      {
        id: "inv-solo-social-sent",
        teamId: "team-rogers-county-resolve-315",
        email: "social.lead@example.invalid",
        intendedRole: "social-media",
        invitedByMemberId: "vol-solo-1",
        status: "sent",
        note: "You would be perfect for weekly local posts.",
        createdAt: "2026-05-10",
      },
      soloMemberIds,
    ),
    mockInvite(
      {
        id: "inv-solo-p5-declined",
        teamId: "team-rogers-county-resolve-315",
        email: "not.ready@example.invalid",
        intendedRole: "power-of-5",
        invitedByMemberId: "vol-solo-1",
        status: "declined",
        createdAt: "2026-05-07",
        respondedAt: "2026-05-08",
      },
      soloMemberIds,
    ),
  ],
  kpis: [
    { id: "k-t-1", label: "Active team members", value: 1, target: 3, period: "weekly" },
    { id: "k-t-2", label: "Weekly completion %", value: 22, target: 80, period: "weekly" },
    { id: "k-t-p5-contacts", label: "Active Power of 5 contacts", value: 4, target: 15, period: "rolling" },
    { id: "k-t-p5-regs", label: "Voter registrations (tracked)", value: 2, target: 30, period: "monthly" },
    { id: "k-t-p5-touches", label: "Relational touches logged", value: 9, period: "weekly" },
  ],
  upcomingEvents: [{ id: "ev-solo-1", title: "Choose first community touchpoint", date: "TBD", location: "Rogers County" }],
  eventPipeline: [],
  visitPlans: [],
});

const slugSapulpa = buildTeamSlug("sapulpa", "Beacon", 211);
const slugWard3 = buildTeamSlug("ward-3", "Eagle", 88);
const slugBristow = buildTeamSlug("bristow", "Eagle", 87);
const slugNeighborhood = buildTeamSlug("bristow-downtown", "Pioneer", 42);
const slugDrumright = buildTeamSlug("drumright", "Torch", 194);

/** Minimal workspace stubs so hierarchy links resolve in the demo */
const MOCK_TEAM_REGISTRY: Team[] = [
  MOCK_TEAM,
  MOCK_SOLO_BUILDING_TEAM,
  teamBasics({
    id: "team-sapulpa-beacon-211",
    teamCode: formatTeamCode("Beacon", 211),
    displayName: formatTeamDisplayName("Sapulpa", "Beacon", 211),
    slug: slugSapulpa,
    geography: "Sapulpa, OK",
    level: "city",
    weeklyBriefing: "Sapulpa Beacon 211 — city triad workspace. County priorities flow from Creek County Liberty 104.",
  }),
  teamBasics({
    id: "team-ward-3-eagle-088",
    teamCode: formatTeamCode("Eagle", 88),
    displayName: formatTeamDisplayName("Ward 3", "Eagle", 88),
    slug: slugWard3,
    geography: "Ward 3 — Sapulpa",
    level: "precinct",
    weeklyBriefing: "Ward triad — precinct-level execution. Support city and county upstreams.",
  }),
  teamBasics({
    id: "team-bristow-eagle-087",
    teamCode: formatTeamCode("Eagle", 87),
    displayName: formatTeamDisplayName("Bristow", "Eagle", 87),
    slug: slugBristow,
    geography: "Bristow, OK",
    level: "city",
    weeklyBriefing: "Bristow Eagle 087 — grow neighborhood coverage west of US-75.",
  }),
  teamBasics({
    id: "team-bristow-downtown-pioneer-042",
    teamCode: formatTeamCode("Pioneer", 42),
    displayName: formatTeamDisplayName("Downtown Bristow", "Pioneer", 42),
    slug: slugNeighborhood,
    geography: "Downtown Bristow",
    level: "neighborhood",
    weeklyBriefing: "Neighborhood cell — small gatherings and visibility.",
  }),
  teamBasics({
    id: "team-drumright-torch-194",
    teamCode: formatTeamCode("Torch", 194),
    displayName: formatTeamDisplayName("Drumright", "Torch", 194),
    slug: slugDrumright,
    geography: "Drumright, OK",
    level: "city",
    weeklyBriefing: "Drumright Torch 194 — rural events + pipeline to county fair.",
  }),
];

const bySlug = new Map(MOCK_TEAM_REGISTRY.map((t) => [t.slug, t]));

export function getMockTeamBySlug(slug: string): Team | null {
  return bySlug.get(slug) ?? null;
}

export const MOCK_DOWNSTREAM_TREE: DownstreamTeamNode = {
  teamId: MOCK_TEAM.id,
  slug: MOCK_TEAM.slug,
  displayName: MOCK_TEAM.displayName,
  level: "county",
  geography: "Creek County",
  status: "active",
  leadNames: ["Alex R.", "Jamie E.", "Riley C."],
  activitySummary: "County huddle Thursdays · downstream city triads active",
  children: [
    {
      teamId: "team-sapulpa-beacon-211",
      slug: slugSapulpa,
      displayName: formatTeamDisplayName("Sapulpa", "Beacon", 211),
      level: "city",
      geography: "Sapulpa",
      status: "active",
      leadNames: ["Morgan", "Casey"],
      activitySummary: "Precinct Ward 3 cell forming",
      children: [
        {
          teamId: "team-ward-3-eagle-088",
          slug: slugWard3,
          displayName: formatTeamDisplayName("Ward 3", "Eagle", 88),
          level: "precinct",
          geography: "Ward 3",
          status: "forming",
          leadNames: ["Taylor"],
          activitySummary: "Roster finalization",
          children: [],
        },
      ],
    },
    {
      teamId: "team-bristow-eagle-087",
      slug: slugBristow,
      displayName: formatTeamDisplayName("Bristow", "Eagle", 87),
      level: "city",
      geography: "Bristow",
      status: "active",
      leadNames: ["Jordan"],
      activitySummary: "Downtown neighborhood team live",
      children: [
        {
          teamId: "team-bristow-downtown-pioneer-042",
          slug: slugNeighborhood,
          displayName: formatTeamDisplayName("Downtown Bristow", "Pioneer", 42),
          level: "neighborhood",
          geography: "Downtown Bristow",
          status: "active",
          leadNames: ["Sam", "Quinn"],
          activitySummary: "Tabling + relational circles",
          children: [],
        },
      ],
    },
    {
      teamId: "team-drumright-torch-194",
      slug: slugDrumright,
      displayName: formatTeamDisplayName("Drumright", "Torch", 194),
      level: "city",
      geography: "Drumright",
      status: "forming",
      leadNames: ["Chris"],
      activitySummary: "Recruiting third lane",
      children: [],
    },
  ],
};

export const UNIVERSAL_DAILY_TASK: Task = {
  id: "u-daily-social",
  cadence: "daily",
  roleApplicability: "universal",
  title: "Like and comment on one campaign social media post",
  description:
    "When you open social media, like one official campaign post and add one short, kind comment. Small actions from many volunteers amplify reach.",
};

export const UNIVERSAL_WEEKLY_TASKS: Task[] = [
  {
    id: "u-w-1",
    cadence: "weekly",
    roleApplicability: "universal",
    title: "Review the campaign briefing",
  },
  {
    id: "u-w-2",
    cadence: "weekly",
    roleApplicability: "universal",
    title: "Complete your lane tasks",
  },
  {
    id: "u-w-3",
    cadence: "weekly",
    roleApplicability: "universal",
    title: "Invite one person to visit /volunteer",
  },
  {
    id: "u-w-4",
    cadence: "weekly",
    roleApplicability: "universal",
    title: "Report progress to your upstream contact",
  },
  {
    id: "u-w-5",
    cadence: "weekly",
    roleApplicability: "universal",
    title: "Attend or review the weekly team huddle",
  },
];

export const UNIVERSAL_MONTHLY_TASKS: Task[] = [
  {
    id: "u-m-1",
    cadence: "monthly",
    roleApplicability: "universal",
    title: "Review progress and celebrate wins",
  },
  {
    id: "u-m-2",
    cadence: "monthly",
    roleApplicability: "universal",
    title: "Help launch at least one new volunteer connection",
  },
  {
    id: "u-m-3",
    cadence: "monthly",
    roleApplicability: "universal",
    title: "Update role preference if needed",
  },
];

export const SOCIAL_MEDIA_WEEKLY_TASKS: Task[] = [
  {
    id: "sm-w-1",
    cadence: "weekly",
    roleApplicability: ["social-media"],
    title: "Create one original local post",
    description:
      "Ground it in something local: an event you attended, a neighbor story (factual), or an invitation to get involved.",
  },
  {
    id: "sm-w-graphic",
    cadence: "weekly",
    roleApplicability: ["social-media"],
    title: "Create or update one local graphic",
    description: "Canva (or similar): event flyer, square post, story slide, VR reminder, house party invite, or recruitment tile.",
  },
  {
    id: "sm-w-2",
    cadence: "weekly",
    roleApplicability: ["social-media"],
    title: "Share campaign posts when possible",
  },
  {
    id: "sm-w-3",
    cadence: "weekly",
    roleApplicability: ["social-media"],
    title: "Engage with comments and messages",
  },
  {
    id: "sm-w-4",
    cadence: "weekly",
    roleApplicability: ["social-media"],
    title: "Recruit social volunteers online",
  },
  {
    id: "sm-w-5",
    cadence: "weekly",
    roleApplicability: ["social-media"],
    title: "Coordinate with the campaign social lead",
    description: "Priority posts, themes, and content requests land here first.",
  },
];

export const SOCIAL_MEDIA_MONTHLY_GOALS: Task[] = [
  {
    id: "sm-m-1",
    cadence: "monthly",
    roleApplicability: ["social-media"],
    title: "4 original local posts",
  },
  {
    id: "sm-m-4graphics",
    cadence: "monthly",
    roleApplicability: ["social-media"],
    title: "4 local graphics created",
    description: "Mix of squares, stories, and simple flyers — track in your lane KPIs.",
  },
  {
    id: "sm-m-2",
    cadence: "monthly",
    roleApplicability: ["social-media"],
    title: "2 new social volunteers",
  },
  {
    id: "sm-m-3",
    cadence: "monthly",
    roleApplicability: ["social-media"],
    title: "Increase reach and engagement",
    description: "Track honestly; small gains compound.",
  },
];

export const SOCIAL_MEDIA_KPIS: Kpi[] = [
  { id: "sm-k-local-graphics", label: "Local graphics created", value: 2, target: 4, period: "monthly" },
  { id: "sm-k-canva-templates", label: "Canva templates used", value: 3, target: 4, period: "monthly" },
  { id: "sm-k-event-graphics", label: "Event graphics created", value: 1, target: 4, period: "monthly" },
  { id: "sm-k-recruit-graphics", label: "Volunteer recruitment graphics", value: 1, target: 2, period: "monthly" },
  { id: "sm-k-approved-shared", label: "Graphics approved/shared", value: 2, target: 4, period: "monthly" },
  { id: "sm-k-2", label: "Campaign shares", value: 12, target: 16, period: "monthly" },
  { id: "sm-k-3", label: "Engagement streak (days)", value: 5, target: 7, period: "rolling" },
];

export const MOCK_SOCIAL_PRIORITY_POSTS: { id: string; title: string; note: string }[] = [
  { id: "sp-1", title: "Neighbor trust — story format", note: "Pinned theme for the week; keep claims factual." },
  { id: "sp-2", title: "County fair photo thread", note: "Use volunteer-taken photos only; no crowd PII." },
];

export const MOCK_CONTENT_REQUESTS: { id: string; label: string; dueLabel?: string }[] = [
  { id: "cr-1", label: "15s vertical: why you volunteered (B-roll voiceover)", dueLabel: "By Friday" },
  { id: "cr-2", label: "Quote graphic: local business support (approved copy only)" },
];

export const MOCK_LOCAL_POST_IDEAS: string[] = [
  "A civic club you respect — what you heard (no opponent talk).",
  "A photo from a parade line + one sentence on showing up.",
  "Invite three neighbors to /volunteer with a personal reason.",
];

export const EVENTS_DAILY_TASK: Task = {
  id: "ev-d-1",
  cadence: "daily",
  roleApplicability: ["events"],
  title: "Watch local communities for upcoming events",
  description:
    "School functions, chamber meetings, ribbon cuttings, fairs, festivals, parades, civic clubs, town halls, and community gatherings — nothing is too small. Add leads to the pipeline.",
};

export const EVENTS_WEEKLY_TASKS: Task[] = [
  {
    id: "ev-w-1",
    cadence: "weekly",
    roleApplicability: ["events"],
    title: "Add new event opportunities to the board",
  },
  {
    id: "ev-w-2",
    cadence: "weekly",
    roleApplicability: ["events"],
    title: "Review existing opportunities and owners",
  },
  {
    id: "ev-w-3",
    cadence: "weekly",
    roleApplicability: ["events"],
    title: "Coordinate with the campaign events lead",
  },
  {
    id: "ev-w-4",
    cadence: "weekly",
    roleApplicability: ["events"],
    title: "Prepare deliverables when Kelly is scheduled locally",
  },
  {
    id: "ev-w-5",
    cadence: "weekly",
    roleApplicability: ["events"],
    title: "Advance county fundraising pipeline (hosts, dates, RSVP)",
  },
  {
    id: "ev-w-6",
    cadence: "weekly",
    roleApplicability: ["events"],
    title: "Check faith-visit or clergy coffee slot when feasible",
  },
];

export const EVENTS_MONTHLY_GOALS: Task[] = [
  {
    id: "ev-m-1",
    cadence: "monthly",
    roleApplicability: ["events"],
    title: "Keep a complete local events pipeline",
  },
  {
    id: "ev-m-2",
    cadence: "monthly",
    roleApplicability: ["events"],
    title: "Organize at least one small meet-and-greet opportunity",
  },
  {
    id: "ev-m-3",
    cadence: "monthly",
    roleApplicability: ["events"],
    title: "Strengthen relationships with community leaders",
  },
  {
    id: "ev-m-4",
    cadence: "monthly",
    roleApplicability: ["events"],
    title: "Move or hold one county fundraising event toward the September objective",
  },
];

export const EVENTS_KPIS: Kpi[] = [
  { id: "ev-k-1", label: "Events identified", value: 14, target: 20, period: "monthly" },
  { id: "ev-k-2", label: "Events attended / staffed", value: 5, target: 8, period: "monthly" },
  { id: "ev-k-3", label: "Meet-and-greets scheduled", value: 1, target: 2, period: "monthly" },
  { id: "ev-k-6", label: "House parties hosted", value: 0, target: 1, period: "monthly" },
  { id: "ev-k-7", label: "Fundraisers hosted (county)", value: 0, target: 1, period: "monthly" },
  { id: "ev-k-8", label: "Funds raised (reported)", value: 0, target: 15000, period: "monthly" },
  { id: "ev-k-9", label: "Coffee / small-format touches", value: 2, target: 6, period: "monthly" },
  { id: "ev-k-10", label: "Lunch / stakeholder meetings", value: 1, target: 3, period: "monthly" },
  { id: "ev-k-11", label: "Clergy or faith visits completed", value: 0, target: 1, period: "monthly" },
  { id: "ev-k-12", label: "County Clerk visits completed", value: 0, target: 1, period: "monthly" },
  { id: "ev-k-13", label: "Weekend immersions executed", value: 0, target: 1, period: "monthly" },
  { id: "ev-k-14", label: "Campaign stops (immersions + one-off)", value: 3, target: 6, period: "monthly" },
  { id: "ev-k-4", label: "VIP introductions", value: 3, target: 6, period: "monthly" },
  { id: "ev-k-5", label: "Town halls planned (EIT focus)", value: 0, target: 1, period: "monthly" },
];

export const EVENTS_COORDINATOR_RESPONSIBILITIES: string[] = [
  "Build Kelly’s local itinerary from real opportunities.",
  "Identify influential local people for thoughtful introductions.",
  "Organize small 10–15 person backyard or house gatherings.",
  "Serve as a local guide when Kelly visits.",
  "Coordinate with the larger event network.",
  "Plan Election Integrity Town Hall discussion tables in target counties.",
  "Stack two-day city immersions and Weekend Community Immersions using the field playbooks.",
  "Keep county fundraising hosts and dates moving toward at least one event through September.",
  "When appropriate, schedule respectful faith community and clergy conversations.",
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Weekly theme: neighbor stories",
    body: "Keep claims factual and kind; social lead will push priority posts here.",
    priority: "normal",
    createdAt: "2026-05-10",
  },
  {
    id: "ann-2",
    title: "Huddle materials updated",
    body: "New 1-pager in the volunteer resource library under Weekly operations.",
    priority: "high",
    createdAt: "2026-05-09",
  },
];

export const MOCK_PRIORITY_ACTIONS: PriorityAction[] = [
  { id: "pa-1", label: "Confirm Thursday huddle time with your triad", dueLabel: "Before Wed" },
  {
    id: "pa-2",
    label: "Draft your one local social post for the week",
    dueLabel: "By Sunday",
    href: `/dashboard/team/${PROTOTYPE_TEAM_SLUG}/resources#local-post-ideas`,
  },
];

export const MOCK_TEAM_MESSAGES: TeamMessage[] = [
  {
    id: "tm-1",
    fromName: "Jamie (Events)",
    preview: "Coffee meetup moved to 9am — same place.",
    createdAt: "2026-05-10",
  },
  {
    id: "tm-2",
    fromName: "Riley (Power of 5)",
    preview: "Lining up 3 follow-ups from Sunday’s tabling.",
    createdAt: "2026-05-09",
  },
  {
    id: "tm-3",
    fromName: "Sarah (Upstream)",
    preview: "Great week on Sapulpa pipeline — keep feeding fair leads.",
    createdAt: "2026-05-08",
  },
];

export const MOCK_SHARED_FILES: SharedFile[] = [
  { id: "sf-1", name: "Huddle agenda (PDF) — coming soon", href: "/volunteer/resources#weekly-operations" },
  { id: "sf-2", name: "Team launch checklist", href: "/volunteer/resources#team-building" },
];

export const MOCK_CAMPAIGN_ALERTS: CampaignAlert[] = [
  { id: "ca-1", label: "No live “today’s post” push yet — use official channels for priority URLs.", severity: "info" },
];

/** Future: deep link from social lead automation */
export const MOCK_TODAYS_CAMPAIGN_POST_URL: string | null = null;
