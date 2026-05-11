import type { Kpi, Team, TeamYouthOutreachWorkspace, YouthCampusMappingRow } from "@/types/dashboard";

export const YOUTH_OUTREACH_P5_LANE_INTRO =
  "Youth Outreach is a formal sub-lane under the Power of 5 / Voter Registration lead at every geographic layer (state, region, county, city, community region, campus, school). Mission: register young voters, build relational turnout networks, recruit student volunteers, launch campus-based 3-person teams, feed students into downstream teams, and grow a networked student organizing system across campuses.";

export const YOUTH_CROSS_CAMPUS_DOCTRINE =
  "Build your campus, then help another campus launch. Students naturally know students at other schools — recruiting peers at neighboring high schools, sibling colleges, trade programs, and org networks is a primary responsibility, not an extra credit project.";

export const YOUTH_REPORTING_HIERARCHY_LINES = [
  "P5 / Voter Registration Lead",
  "└─ Youth Outreach Lead",
  "   ├─ High School Outreach Leads",
  "   ├─ College Outreach Leads",
  "   └─ Campus Team Leads",
] as const;

export const YOUTH_CAMPUS_TEAM_RULE =
  "Every campus team uses the same 3-person triad: Events Coordinator · Social Media Coordinator · Power of 5 / Voter Registration Coordinator. It starts with one student — they recruit two more and launch the team.";

export const YOUTH_LEAD_RESPONSIBILITIES = [
  "Recruit high school and college leads.",
  "Track all campuses in the area.",
  "Support student team launches.",
  "Coordinate registration drives.",
  "Encourage social-media-led recruitment.",
  "Identify student organizations.",
  "Coordinate with Events and Social lanes.",
  "Feed student volunteers into downstream teams.",
  "Monitor campus KPI progress.",
  "Coach cross-campus recruitment — help students launch teams beyond their home school.",
] as const;

export const YOUTH_HS_FOCUS = [
  "Rising seniors and trusted student leaders.",
  "Parent- and school-appropriate engagement.",
  "Registration preparation for eligible students.",
  "Civic education.",
  "Peer-to-peer outreach.",
] as const;

export const YOUTH_HS_TASKS = [
  "Identify student leaders.",
  "Build school teams.",
  "Prepare registration drives.",
  "Recruit graduating seniors.",
  "Each week: invite one student at another school to start a campus team.",
] as const;

export const YOUTH_COLLEGE_FOCUS = [
  "Student organizations.",
  "Dorm and apartment networks.",
  "Greek organizations.",
  "Faith-based student groups.",
  "Young professionals.",
] as const;

export const YOUTH_COLLEGE_TASKS = [
  "Recruit campus leads.",
  "Launch 3-person teams.",
  "Host registration drives.",
  "Build a strong social presence.",
  "Each week: invite one student at another school to start a campus team.",
] as const;

export const YOUTH_CROSS_CAMPUS_COLLEGE = [
  "High school classmates now at other colleges.",
  "Friends at universities, trade schools, and community colleges.",
  "Student organization contacts and multicampus chapters.",
] as const;

export const YOUTH_CROSS_CAMPUS_HS = [
  "Friends at neighboring schools.",
  "Club and athletic contacts.",
  "Graduates who are now in college (reverse mentoring for launches).",
] as const;

export const YOUTH_MONTHLY_RHYTHM = [
  "One campus outreach event.",
  "One voter registration drive.",
  "One social media challenge.",
  "One team-building push.",
  "One progress review.",
] as const;

export const YOUTH_SOCIAL_TASKS = [
  "Share one local post per week.",
  "Repost campaign-approved content.",
  "Create short stories/reels (community guidelines).",
  "Invite classmates to /volunteer.",
  "Promote campus registration drives.",
] as const;

export const YOUTH_MESSAGING_THEMES = [
  "Your voice matters.",
  "Build your campus team.",
  "Help your friends register.",
  "Small actions create real impact.",
  "Service and leadership.",
  "Shape Arkansas’s future.",
] as const;

export const YOUTH_TASK_FRAMING = [
  "5–10 minute daily actions.",
  "Weekly campus challenges.",
  "Monthly voter registration pushes.",
  "Mobile-first, text-friendly, semester-based planning.",
] as const;

export const YOUTH_SCHOOL_TEAM_NAMING_FORMAT = "[School Name] + [Callsign — Liberty, Beacon, Eagle, Pioneer, etc.] + [3-digit team number] — e.g. University of Arkansas Liberty 101, Arkansas Tech Beacon 203, North Little Rock High Eagle 011, Bentonville West Pioneer 055.";

export const YOUTH_SCHOOL_TEAM_NAMING_EXAMPLES = [
  "University of Arkansas Liberty 101",
  "Arkansas Tech Beacon 203",
  "North Little Rock High Eagle 011",
  "Bentonville West Pioneer 055",
] as const;

export const YOUTH_CREATIVE_EVENTS = [
  "Coffee meetups",
  "Study breaks",
  "Pizza nights",
  "Dorm hangouts",
  "Tailgates",
  "Club meetings",
  "Group lunches",
  "Trivia nights",
  "Service projects",
  "Registration tables",
] as const;

export const YOUTH_EVENT_DOCTRINE =
  "An event is anything that brings students together. The goal is community and relationship building — not only rallies. Keep it social, repeatable, and easy to host.";

export const YOUTH_KELLY_VISIT_GUIDANCE = [
  "Kelly should visit as many authentic student events as the schedule allows.",
  "Request early: classroom discussions (where appropriate), org meetings, coffee meetups, lunch roundtables, after-dinner appetizers, small house or apartment gatherings.",
] as const;

export const YOUTH_KELLY_VISIT_REQUEST = [
  "Use Request Kelly Visit on the Youth Events panel — include host student, school, expected attendance, public vs closed event, parking, and accessibility.",
  "Pair student stops with the city day plan: morning coffee → lunch with students → afternoon campus stop → evening house party coordination.",
] as const;

export const YOUTH_CITY_STUDENT_COORD = [
  "City Events Leads coordinate with Youth / student leads when Kelly is in market.",
  "Sketch a city day: morning coffee with locals and students, lunch student table, afternoon campus walkthrough, evening house party, optional appetizers after.",
  "Student leaders help build the student stops; Events lane owns the run-of-show handoff to HQ.",
] as const;

export const YOUTH_IMMERSION_WEEKLY = "Campaign target: 2–3 deep immersions per week when calendar allows — typically two days in one city.";

export const YOUTH_IMMERSION_STRUCTURE = "Day 1 anchors county-seat work + community leaders + evening hospitality. Day 2 leans campus, registration, student social, and neighborhood outreach.";

export const YOUTH_IMMERSION_DAY1 = [
  "County clerk visit when in the county seat (coordinate with Events).",
  "Coffee with local leaders.",
  "Lunch roundtable.",
  "Ribbon cutting or community event.",
  "Evening house party.",
] as const;

export const YOUTH_IMMERSION_DAY2 = [
  "Campus event.",
  "Registration drive.",
  "Student social.",
  "Community outreach event.",
  "After-dinner appetizers.",
] as const;

export const YOUTH_COUNTY_CLERK_INTRO =
  "When visiting county seats, attempt a County Clerk visit — Elections office relationships help registration accuracy and partnership tone.";

export const YOUTH_RECOGNITION_LEVELS = [
  "Starter",
  "Builder",
  "Connector",
  "Organizer",
  "Campus Champion",
  "Statewide Leader",
] as const;

export const YOUTH_CHALLENGES_SEED: { id: string; title: string; detail?: string }[] = [
  { id: "ch-xcamp-1", title: "Launch a team on another campus", detail: "Use peer networks — HS to college sibling schools count." },
  { id: "ch-reg-25", title: "Register 25 students this month", detail: "Track honestly through P5/VR tables and digital pushes." },
  { id: "ch-rival", title: "Recruit a student at a rival school", detail: "Civic, respectful — shared love of place beats jersey color." },
  { id: "ch-joint", title: "Hold a joint campus event", detail: "Two schools, one registration moment, one story." },
  { id: "ch-three", title: "Start teams at three campuses", detail: "Sequence: prove model at home, then carry playbooks cross-campus." },
];

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Geographic-level KPI ids — align with dashboards / future DB aggregates. */
export function buildYouthGeographicKpis(seed: Partial<Record<string, number>>): Kpi[] {
  const v = (id: string, def: number) => seed[id] ?? def;
  return [
    { id: "y-k-campuses", label: "Campuses identified", value: v("y-k-campuses", 0), target: 12, period: "rolling" },
    { id: "y-k-hs-leads", label: "High school leads assigned", value: v("y-k-hs-leads", 0), target: 6, period: "monthly" },
    { id: "y-k-college-leads", label: "College leads assigned", value: v("y-k-college-leads", 0), target: 4, period: "monthly" },
    { id: "y-k-teams", label: "Student teams launched", value: v("y-k-teams", 0), target: 8, period: "monthly" },
    { id: "y-k-cross-campus", label: "Cross-campus recruits", value: v("y-k-cross-campus", 0), target: 10, period: "monthly" },
    { id: "y-k-volunteers", label: "Student volunteers onboarded", value: v("y-k-volunteers", 0), target: 24, period: "monthly" },
    { id: "y-k-p5", label: "Student P5 contacts", value: v("y-k-p5", 0), target: 120, period: "rolling" },
    { id: "y-k-regs", label: "Student voter registrations", value: v("y-k-regs", 0), target: 60, period: "monthly" },
    { id: "y-k-events", label: "Student outreach events", value: v("y-k-events", 0), target: 10, period: "monthly" },
    { id: "y-k-social", label: "Social media recruits", value: v("y-k-social", 0), target: 15, period: "monthly" },
    { id: "y-k-gotv", label: "GOTV-ready campus teams", value: v("y-k-gotv", 0), target: 5, period: "monthly" },
  ];
}

export const YOUTH_PER_CAMPUS_TARGETS = [
  { label: "3 team members assigned (triad)", value: "Events · Social · P5/VR" },
  { label: "5 P5 contacts per member", value: "Relational, not spam" },
  { label: "10 registration assists per member", value: "Tracked honestly" },
  { label: "Monthly outreach event", value: "Campus or coalition" },
  { label: "Monthly registration event", value: "Table or digital push" },
] as const;

function demoCampuses(geography: string): YouthCampusMappingRow[] {
  return [
    {
      id: "yc-demo-1",
      name: "North Little Rock High",
      studentTeamDisplayName: "North Little Rock High Eagle 011",
      kind: "high-school",
      status: "team-building",
      studentOrganizations: "Student council · service club (examples)",
      leadDisplayLabel: "Student lead (TBD)",
      leadTrack: "high-school",
      registrationNotes: `Spring drive · ${geography}`,
    },
    {
      id: "yc-demo-2",
      name: "University of Arkansas — Fayetteville",
      studentTeamDisplayName: "University of Arkansas Liberty 101",
      kind: "university",
      status: "active-team",
      studentOrganizations: "SGA · civic engagement org",
      leadDisplayLabel: "Campus lead (TBD)",
      leadTrack: "college",
      registrationNotes: "Quad day + dorm captain network",
    },
    {
      id: "yc-demo-3",
      name: "Pulaski Tech",
      studentTeamDisplayName: "Pulaski Tech Beacon 087",
      kind: "community-college",
      status: "lead-identified",
      studentOrganizations: "Phi Theta Kappa (example)",
      leadDisplayLabel: "College lead — recruiting triad",
      leadTrack: "college",
    },
    {
      id: "yc-demo-4",
      name: "Demo Trade School",
      studentTeamDisplayName: "Demo Trade Pioneer 032",
      kind: "trade-school",
      status: "not-started",
      registrationNotes: "Identify shop-floor trusted connectors",
    },
  ];
}

function demoCountyClerk(geography: string) {
  return [
    {
      id: "yc-cc-1",
      countySeatLabel: `${geography.split(",")[0]?.trim() || "County seat"} · County Clerk`,
      status: "clerk-contacted" as const,
      notes: "Draft intro request — no PII in notes field.",
    },
  ];
}

function buildYouthTwentySquareMetrics(kpis: Kpi[]) {
  const pick = (id: string) => kpis.find((k) => k.id === id);
  const pct = (id: string, fallback: number) => {
    const k = pick(id);
    if (!k || k.target == null || k.target <= 0) return fallback;
    return clampPct((k.value / k.target) * 100);
  };
  return [
    { id: "y-ts-teams", label: "Campus teams launched", percent: pct("y-k-teams", 35) },
    { id: "y-ts-cross", label: "Cross-campus launches", percent: pct("y-k-cross-campus", 28) },
    { id: "y-ts-regs", label: "Student registrations", percent: pct("y-k-regs", 55) },
    { id: "y-ts-vol", label: "Student volunteers", percent: pct("y-k-volunteers", 42) },
    { id: "y-ts-events", label: "Monthly student events", percent: pct("y-k-events", 40) },
    { id: "y-ts-social", label: "Social recruitment", percent: pct("y-k-social", 48) },
    { id: "y-ts-gotv", label: "GOTV readiness (campus teams)", percent: pct("y-k-gotv", 20) },
  ];
}

function buildScoreboardFromKpis(kpis: Kpi[]) {
  const val = (id: string) => kpis.find((k) => k.id === id)?.value ?? 0;
  const tgt = (id: string) => kpis.find((k) => k.id === id)?.target;
  return [
    { id: "sb-campuses", label: "Campuses launched", value: val("y-k-teams"), target: tgt("y-k-teams") },
    { id: "sb-vol", label: "Student volunteers onboarded", value: val("y-k-volunteers"), target: tgt("y-k-volunteers") },
    { id: "sb-xc", label: "Cross-campus recruits", value: val("y-k-cross-campus"), target: tgt("y-k-cross-campus") },
    { id: "sb-soc", label: "Social media recruits", value: val("y-k-social"), target: tgt("y-k-social") },
    { id: "sb-regs", label: "Voter registrations", value: val("y-k-regs"), target: tgt("y-k-regs") },
    { id: "sb-p5", label: "Power of 5 contacts", value: val("y-k-p5"), target: tgt("y-k-p5") },
    { id: "sb-events", label: "Monthly events held", value: val("y-k-events"), target: tgt("y-k-events") },
    { id: "sb-gotv", label: "GOTV-ready campus teams", value: val("y-k-gotv"), target: tgt("y-k-gotv") },
  ];
}

function buildBadges(crossCampus: number, teams: number, regs: number, gotv: number) {
  return [
    { id: "bd-first-team", label: "First Campus Team", description: "Triad launched at your school.", earned: teams >= 1 },
    { id: "bd-first-xc", label: "First Cross-Campus Launch", description: "Helped another campus stand up.", earned: crossCampus >= 1 },
    { id: "bd-regs-10", label: "10 Registrations", earned: regs >= 10 },
    { id: "bd-regs-50", label: "50 Registrations", earned: regs >= 50 },
    { id: "bd-multi", label: "Multi-Campus Builder", description: "Teams active on 3+ campuses in footprint.", earned: teams >= 3 },
    { id: "bd-gotv", label: "GOTV Ready", description: "At least one campus team marked GOTV-ready.", earned: gotv >= 1 },
  ];
}

function demoKpiSeedFromTeam(team: Team): Partial<Record<string, number>> {
  const p5 = team.powerOfFiveSummary;
  return {
    "y-k-campuses": 4,
    "y-k-hs-leads": 1,
    "y-k-college-leads": 2,
    "y-k-teams": team.lifecycleStatus === "building" ? 0 : 2,
    "y-k-cross-campus": 3,
    "y-k-volunteers": Math.min(18, (p5?.volunteersReferred ?? 0) + 4),
    "y-k-p5": Math.min(80, Math.floor((p5?.contactsTracked ?? 5) * 0.4)),
    "y-k-regs": Math.min(40, Math.floor((p5?.registrationsCompleted ?? 3) * 0.35)),
    "y-k-events": 3,
    "y-k-social": 6,
    "y-k-gotv": 0,
  };
}

function currentRecognitionLevel(kpis: Kpi[]): string {
  const regs = kpis.find((k) => k.id === "y-k-regs")?.value ?? 0;
  const teams = kpis.find((k) => k.id === "y-k-teams")?.value ?? 0;
  const xc = kpis.find((k) => k.id === "y-k-cross-campus")?.value ?? 0;
  const gotv = kpis.find((k) => k.id === "y-k-gotv")?.value ?? 0;
  if (gotv >= 3 && regs >= 50) return "Statewide Leader";
  if (teams >= 5 && xc >= 8) return "Campus Champion";
  if (teams >= 3 || regs >= 25) return "Organizer";
  if (xc >= 3 || teams >= 2) return "Connector";
  if (teams >= 1 || regs >= 10) return "Builder";
  return "Starter";
}

export function buildYouthOutreachWorkspace(team: Team): TeamYouthOutreachWorkspace {
  const geographicKpis = buildYouthGeographicKpis(demoKpiSeedFromTeam(team));
  const teams = geographicKpis.find((k) => k.id === "y-k-teams")?.value ?? 0;
  const xc = geographicKpis.find((k) => k.id === "y-k-cross-campus")?.value ?? 0;
  const regs = geographicKpis.find((k) => k.id === "y-k-regs")?.value ?? 0;
  const gotv = geographicKpis.find((k) => k.id === "y-k-gotv")?.value ?? 0;

  return {
    p5VrLaneLabel: YOUTH_OUTREACH_P5_LANE_INTRO,
    campuses: demoCampuses(team.geography),
    geographicKpis,
    campusTargetKpis: [...YOUTH_PER_CAMPUS_TARGETS],
    leadResponsibilities: [...YOUTH_LEAD_RESPONSIBILITIES],
    highSchoolFocus: [...YOUTH_HS_FOCUS],
    highSchoolTasks: [...YOUTH_HS_TASKS],
    collegeFocus: [...YOUTH_COLLEGE_FOCUS],
    collegeTasks: [...YOUTH_COLLEGE_TASKS],
    monthlyRhythm: [...YOUTH_MONTHLY_RHYTHM],
    socialRecruitmentTasks: [...YOUTH_SOCIAL_TASKS],
    messagingThemes: [...YOUTH_MESSAGING_THEMES],
    studentTeamRule: YOUTH_CAMPUS_TEAM_RULE,
    taskFraming: [...YOUTH_TASK_FRAMING],
    placementNotes: [
      "Place student volunteers into existing adult triads when they are not launching a campus team.",
      "Route interested adults from campus events into community geographic teams.",
      "Move strong student leaders into new campus triad launches with Events + Social + P5/VR coverage.",
      "Prioritize cross-campus introductions before paid acquisition — trust transfers through peers.",
    ],
    crossCampusDoctrine: YOUTH_CROSS_CAMPUS_DOCTRINE,
    crossCampusCollegeNetworks: [...YOUTH_CROSS_CAMPUS_COLLEGE],
    crossCampusHighSchoolNetworks: [...YOUTH_CROSS_CAMPUS_HS],
    weeklyCrossCampusTask: "Invite one student at another school to start a campus team.",
    schoolTeamNamingFormat: YOUTH_SCHOOL_TEAM_NAMING_FORMAT,
    schoolTeamNamingExamples: [...YOUTH_SCHOOL_TEAM_NAMING_EXAMPLES],
    creativeStudentEventExamples: [...YOUTH_CREATIVE_EVENTS],
    kellyStudentVisitGuidance: [...YOUTH_KELLY_VISIT_GUIDANCE],
    kellyVisitRequestBullets: [...YOUTH_KELLY_VISIT_REQUEST],
    cityStudentCoordination: [...YOUTH_CITY_STUDENT_COORD],
    immersionWeeklyTarget: YOUTH_IMMERSION_WEEKLY,
    immersionTypicalStructure: YOUTH_IMMERSION_STRUCTURE,
    immersionDayOne: [...YOUTH_IMMERSION_DAY1],
    immersionDayTwo: [...YOUTH_IMMERSION_DAY2],
    countyClerkIntro: YOUTH_COUNTY_CLERK_INTRO,
    countyClerkVisits: demoCountyClerk(team.geography),
    challenges: [...YOUTH_CHALLENGES_SEED],
    scoreboardMetrics: buildScoreboardFromKpis(geographicKpis),
    recognitionLevels: [...YOUTH_RECOGNITION_LEVELS],
    recognitionLevelCurrent: currentRecognitionLevel(geographicKpis),
    badges: buildBadges(xc, teams, regs, gotv),
    twentySquareYouthMetrics: buildYouthTwentySquareMetrics(geographicKpis),
  };
}

export function attachYouthOutreachToTeam(team: Team): Team {
  if (team.youthOutreach) return team;
  return { ...team, youthOutreach: buildYouthOutreachWorkspace(team) };
}
