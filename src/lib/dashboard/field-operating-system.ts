import type {
  GotvReadinessBand,
  Team,
  TeamDashboardBriefingExtended,
  TeamExpansionLadderOrder,
  TeamExpansionLadderStage,
  TeamFieldHealth,
  TeamFieldOperatingSystem,
  TeamGotvReadiness,
  TeamGovernanceChecklistItem,
  TeamStatewideContribution,
  StatewideVolunteerGoalsSnapshot,
} from "@/types/dashboard";

function kpiValue(team: Team, id: string): number | null {
  const row = team.kpis.find((k) => k.id === id);
  return row != null ? row.value : null;
}

function kpiTarget(team: Team, id: string): number | null {
  const row = team.kpis.find((k) => k.id === id);
  return row?.target != null ? row.target : null;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function pctPart(value: number, target: number): number {
  if (target <= 0) return value > 0 ? 100 : 0;
  return clampPct((value / target) * 100);
}

function hasCoreTriad(team: Team): boolean {
  const s = new Set(team.members.map((m) => m.role));
  return s.has("events") && s.has("social-media") && s.has("power-of-5");
}

function declinedInviteCount(team: Team): number {
  return team.invitations?.filter((i) => i.status === "declined").length ?? 0;
}

const MOCK_STATEWIDE: StatewideVolunteerGoalsSnapshot = {
  countyTeamsLaunched: { current: 41, target: 77 },
  cityTeamsLaunched: { current: 58, target: 120 },
  precinctTeamsLaunched: { current: 112, target: 400 },
  neighborhoodTeamsLaunched: { current: 36, target: 200 },
  totalVolunteersOnboarded: { current: 1840, target: 6000 },
  totalPowerOfFiveContacts: { current: 9120, target: 30000 },
  totalNewRegistrations: { current: 4260, target: 15000 },
  totalDownstreamTeams: { current: 88, target: 260 },
  gotvReadyTeams: { current: 12, target: 77 },
};

const GOV_WEEKLY: TeamGovernanceChecklistItem[] = [
  { id: "gw-geo", label: "Do we know our geography?" },
  { id: "gw-lanes", label: "Are all three lanes covered?" },
  { id: "gw-lane-tasks", label: "Did each lane complete its weekly task?" },
  { id: "gw-report", label: "Did we report our numbers?" },
  { id: "gw-place", label: "Did we identify new people to place?" },
  { id: "gw-launch", label: "Are we helping launch another team?" },
  { id: "gw-hq", label: "Do we need campaign help?" },
];

const GOV_MONTHLY: TeamGovernanceChecklistItem[] = [
  { id: "gm-outreach", label: "Did we hold or support a community outreach event?" },
  { id: "gm-vr", label: "Did we hold or support a voter registration event?" },
  { id: "gm-p5", label: "Did each member work their Power of 5?" },
  { id: "gm-vol", label: "Did we add or place new volunteers?" },
  { id: "gm-gotv", label: "Are we closer to GOTV readiness?" },
];

const DOWNSTREAM_TRAIN: TeamGovernanceChecklistItem[] = [
  { id: "dt-dash", label: "New team has dashboard access" },
  { id: "dt-geo", label: "New team knows geography" },
  { id: "dt-up", label: "New team has upstream contact" },
  { id: "dt-roles", label: "New team has role assignments" },
  { id: "dt-rhythm", label: "New team knows weekly rhythm" },
  { id: "dt-res", label: "New team has resources" },
  { id: "dt-p5vr", label: "New team understands Power of 5 / VR" },
  { id: "dt-report", label: "New team knows how to report" },
];

function bandFromScore(avg: number): { band: GotvReadinessBand; label: string } {
  if (avg < 22) return { band: "not-started", label: "Not started" };
  if (avg < 52) return { band: "building", label: "Building" };
  if (avg < 82) return { band: "on-track", label: "On track" };
  return { band: "gotv-ready", label: "GOTV ready" };
}

function buildBriefing(team: Team): TeamDashboardBriefingExtended {
  return {
    narrative: team.weeklyBriefing,
    weekFocus:
      "Build the next team — place people where they fit — small actions, statewide impact. More teams, not bigger teams.",
    prioritySocialPost:
      "One authentic local story this week (event, neighbor help, registration table) — link /volunteer only when someone asks how to help.",
    priorityEventNeed:
      team.upcomingEvents[0]?.title ?? "Add one credible local event to the pipeline so Events lane has momentum.",
    priorityP5VrAsk:
      "Each coordinator: one respectful relational touch per day; log registrations helped. When a list is full, place downstream — don’t endless-expand one network.",
    trainingResourceOfWeek: "Open the Training path — start with Module 1",
    trainingResourceHref: "/dashboard/team/" + team.slug + "/training",
    questionsForUpstream: [
      "Do we have an approved caption pack for the next county moment?",
      "Any messaging shifts after this week’s polling or press?",
      "Who is the point contact for event insurance questions?",
    ],
  };
}

function buildGotv(team: Team): TeamGotvReadiness {
  const triad = hasCoreTriad(team);
  const memberTarget = 3;
  const memberCount = team.members.length;
  const formation = pctPart(memberCount, memberTarget);
  const lanes = triad ? 100 : pctPart(memberCount, 3);
  const weeklyPct = kpiValue(team, "k-t-2") ?? (triad ? 55 : 20);
  const weeklyTasks = clampPct(weeklyPct);
  const p5Contacts = team.powerOfFiveSummary?.contactsTracked ?? 0;
  const p5Target =
    kpiTarget(team, "k-t-p5-contacts") ?? team.powerOfFiveTeamTargets?.minCoreContacts ?? 15;
  const p5Complete = pctPart(p5Contacts, p5Target);
  const regs = team.powerOfFiveSummary?.registrationsCompleted ?? 0;
  const regTarget = kpiTarget(team, "k-t-p5-regs") ?? team.powerOfFiveTeamTargets?.minRegistrations ?? 30;
  const vrProgress = pctPart(regs, regTarget);
  const eventsScore =
    (team.upcomingEvents.length > 0 ? 40 : 0) +
    (team.powerOfFiveTeamTargets?.monthlySocialHourPlanned ? 30 : 15) +
    (team.powerOfFiveTeamTargets?.monthlyVrEventPlanned ? 30 : 15);
  const downstreamVal = kpiValue(team, "k-t-3") ?? team.downstreamTeamIds.length;
  const downstreamTgt = kpiTarget(team, "k-t-3") ?? 5;
  const downstreamGrowth = pctPart(downstreamVal, downstreamTgt);
  const reporting = weeklyTasks;
  const trainingComplete = triad ? (team.lifecycleStatus === "expanding" ? 85 : 62) : 35;

  const categories = [
    { id: "formation", label: "Team formation", score: formation, detail: `${memberCount} of ${memberTarget} core roles` },
    { id: "lanes", label: "Lane coverage", score: lanes, detail: triad ? "Events · Social · P5/VR" : "Fill open lanes first" },
    { id: "weekly", label: "Weekly task completion", score: weeklyTasks, detail: `About ${weeklyPct}% this week` },
    { id: "p5", label: "Power of 5 completion", score: p5Complete, detail: `${p5Contacts} contacts vs ${p5Target} target` },
    { id: "vr", label: "Voter registration progress", score: vrProgress, detail: `${regs} tracked vs ${regTarget} target` },
    { id: "events", label: "Event rhythm", score: clampPct(eventsScore), detail: "Calendar + monthly programs" },
    { id: "downstream", label: "Downstream growth", score: downstreamGrowth, detail: `${downstreamVal} teams vs ${downstreamTgt} goal` },
    { id: "reporting", label: "Reporting consistency", score: reporting, detail: "Weekly numbers to upstream" },
    { id: "training", label: "Training completion", score: trainingComplete, detail: "Modules + shadowing downstream" },
  ];

  const compositeScore = clampPct(categories.reduce((s, c) => s + c.score, 0) / categories.length);
  const { band, label } = bandFromScore(compositeScore);

  return { band, bandLabel: label, categories, compositeScore };
}

function buildLadder(team: Team, gotv: TeamGotvReadiness): TeamExpansionLadderStage[] {
  const m = team.members.length;
  const triad = hasCoreTriad(team);
  const p5 = team.powerOfFiveSummary;
  const p5Contacts = p5?.contactsTracked ?? 0;
  const p5Target = team.powerOfFiveTeamTargets?.minCoreContacts ?? 15;
  const monthlyRhythm =
    Boolean(team.powerOfFiveTeamTargets?.monthlySocialHourPlanned && team.powerOfFiveTeamTargets?.monthlyVrEventPlanned) ||
    team.upcomingEvents.length >= 2;
  const downstream = team.downstreamTeamIds.length;
  const trainedDownstream = downstream >= 2;

  const s1: TeamExpansionLadderStage = {
    order: 1,
    title: "Solo starter",
    requirements: "One person with dashboard access and geography.",
    progressPercent: m >= 1 ? 100 : 0,
    nextAction: m >= 1 ? "Invite your next coordinator — train as you grow." : "Start at /volunteer and claim geography.",
    isComplete: m >= 1,
  };
  const s2: TeamExpansionLadderStage = {
    order: 2,
    title: "Building triad",
    requirements: "Two coordinators; lanes taking shape.",
    progressPercent: clampPct((m / 2) * 100),
    nextAction: m >= 2 ? "Fill the third lane with private invites." : "Recruit one trusted partner in an open lane.",
    isComplete: m >= 2,
  };
  const s3: TeamExpansionLadderStage = {
    order: 3,
    title: "Active 3-person team",
    requirements: "Events, Social, and Power of 5 / VR covered.",
    progressPercent: triad ? 100 : clampPct((m / 3) * 100),
    nextAction: triad ? "Run a weekly huddle; keep invites relational." : "Close the triad — small teams beat hero volunteers.",
    isComplete: triad,
  };
  const s4: TeamExpansionLadderStage = {
    order: 4,
    title: "Power of 5 networks complete",
    requirements: "Reach core P5 depth (quality contacts vs target).",
    progressPercent: pctPart(p5Contacts, p5Target),
    nextAction:
      p5Contacts >= p5Target
        ? "Maintain touches; place overflow downstream."
        : "Each member builds toward five real relationships they can coach.",
    isComplete: p5Contacts >= p5Target,
  };
  const s5: TeamExpansionLadderStage = {
    order: 5,
    title: "Monthly outreach rhythm active",
    requirements: "Community social + VR cadence on the calendar.",
    progressPercent: monthlyRhythm ? 100 : 40,
    nextAction: monthlyRhythm ? "Promote both through P5 and social." : "Schedule outreach social hour and one VR push.",
    isComplete: monthlyRhythm,
  };
  const stage6: TeamExpansionLadderStage = {
    order: 6,
    title: "Downstream team launched",
    requirements: "At least one geographic downstream triad live.",
    progressPercent: downstream >= 1 ? 100 : 0,
    nextAction: downstream >= 1 ? "Hand off dashboard + upstream contact." : "Identify geography for the next triad; place people where they fit.",
    isComplete: downstream >= 1,
  };
  const s7: TeamExpansionLadderStage = {
    order: 7,
    title: "Downstream team trained",
    requirements: "Second downstream forming or mentored (train as you grow).",
    progressPercent: trainedDownstream ? 100 : downstream >= 1 ? 55 : 0,
    nextAction: trainedDownstream
      ? "Keep a light weekly check-in until rhythm sticks."
      : "Shadow their first huddle; share Team Launch Kit links.",
    isComplete: trainedDownstream,
  };
  const s8: TeamExpansionLadderStage = {
    order: 8,
    title: "GOTV-ready local unit",
    requirements: "Healthy lanes, reporting, downstream, and GOTV band.",
    progressPercent: gotv.band === "gotv-ready" ? 100 : gotv.compositeScore,
    nextAction:
      gotv.band === "gotv-ready"
        ? "Maintain capacity — escalate questions, not routine work."
        : "Close gaps in the GOTV scorecard — one category per week.",
    isComplete: gotv.band === "gotv-ready",
  };

  return [s1, s2, s3, s4, s5, stage6, s7, s8];
}

function currentFocusOrder(stages: TeamExpansionLadderStage[]): TeamExpansionLadderOrder {
  const next = stages.find((s) => !s.isComplete);
  return (next?.order ?? 8) as TeamExpansionLadderOrder;
}

function buildHealth(team: Team, gotv: TeamGotvReadiness): TeamFieldHealth {
  const triad = hasCoreTriad(team);
  const weeklyPct = kpiValue(team, "k-t-2") ?? 0;
  const declined = declinedInviteCount(team);
  const p5c = team.powerOfFiveSummary?.contactsTracked ?? 0;
  const inactive = team.members.length === 0 || (team.lifecycleStatus === "dormant" && !triad);

  const signals: TeamFieldHealth["signals"] = [
    { ok: !inactive, label: inactive ? "Inactive or empty team" : "Team active" },
    { ok: triad || team.members.length < 2, label: triad ? "Lane coverage · triad" : "Open lanes — recruit" },
    { ok: weeklyPct >= 60, label: weeklyPct >= 60 ? "Weekly tasks on pace" : "Weekly tasks need attention" },
    { ok: p5c > 0 || !triad, label: p5c > 0 || !triad ? "P5 motion" : "Log relational touches" },
    { ok: team.upcomingEvents.length > 0 || !triad, label: "Event pipeline warm" },
    { ok: declined < 2, label: declined < 2 ? "Invites healthy" : "Several declines — adjust ask" },
    { ok: gotv.band !== "not-started" || team.members.length <= 1, label: "GOTV path visible" },
  ];

  const bad = signals.filter((s) => !s.ok).length;
  let level: TeamFieldHealth["level"] = "green";
  let headline = "Green · moving well";

  if (inactive || declined >= 3 || (!triad && team.members.length >= 3 && weeklyPct < 30)) {
    level = "red";
    headline = "Red · needs support — use Ask the Campaign";
  } else if (!triad || weeklyPct < 60 || bad >= 3 || declined >= 2) {
    level = "yellow";
    headline = "Yellow · needs attention — use governance checklist";
  }

  return { level, headline, signals };
}

function buildContribution(team: Team, gotv: TeamGotvReadiness): TeamStatewideContribution {
  const p5 = team.powerOfFiveSummary?.contactsTracked ?? 0;
  const regs = team.powerOfFiveSummary?.registrationsCompleted ?? 0;
  const vol = kpiValue(team, "k-t-4") ?? team.powerOfFiveSummary?.volunteersReferred ?? 0;
  const downstream = team.downstreamTeamIds.length;

  const lines = [
    `${team.displayName} represents 1 ${team.level} team in the statewide count.`,
    `Power of 5: ${p5} contacts logged toward the statewide relational goal.`,
    `Registration help: ${regs} tracked assists — every registration counts.`,
    `Volunteer referrals: ${vol} toward onboarding goals.`,
    `Downstream teams mentored or launched from this node: ${downstream}.`,
    `GOTV readiness: ${gotv.bandLabel} — get GOTV ready; every team builds another team.`,
  ];
  return { lines };
}

/** Public: attach self-building field OS snapshot for dashboards. */
export function buildTeamFieldOperatingSystem(team: Team): TeamFieldOperatingSystem {
  const gotv = buildGotv(team);
  const ladder = buildLadder(team, gotv);
  const contribution = buildContribution(team, gotv);

  return {
    expansionLadder: ladder,
    currentFocusOrder: currentFocusOrder(ladder),
    gotvReadiness: gotv,
    health: buildHealth(team, gotv),
    statewideGoals: MOCK_STATEWIDE,
    statewideContribution: contribution,
    briefing: buildBriefing(team),
    governanceWeekly: GOV_WEEKLY,
    governanceMonthly: GOV_MONTHLY,
    downstreamTrainingChecklist: DOWNSTREAM_TRAIN,
  };
}
