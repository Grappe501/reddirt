import { formatInTimeZone } from "date-fns-tz";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { listCountyRegistrationGoals } from "@/lib/campaign-engine/county-goals";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadStatewideFieldEntryRollups } from "@/lib/election-plan/field-entry/load-field-entries";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import {
  loadVolunteerIntakeDashboard,
  type VolunteerIntakeQueueRow,
} from "@/lib/volunteers/load-volunteer-intake-dashboard";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import type { VolunteerLeader } from "@/lib/volunteers/types";

const TZ = "America/Chicago";
const UPCOMING_DRIVE_HORIZON_DAYS = 14;

export type VrPipelineStage = "registration_intake" | "upcoming_drives" | "field_reporting" | "county_goals";

export type VrIntakeQueueRow = VolunteerIntakeQueueRow & {
  registrationSignals: string[];
};

export type VrUpcomingDriveRow = {
  recordId: string;
  dateYmd: string;
  timeLabel: string;
  title: string;
  city: string;
  county: string;
  status: string;
  daysUntil: number;
  calendarHref: string;
};

export type VrCountyGoalRow = {
  countySlug: string;
  countyName: string;
  registrationGoal: number;
  registrationsSoFar: number | null;
  progressPct: number | null;
  playbookHref: string;
};

export type VrLaneLeaderRow = {
  slug: string;
  displayName: string;
  initials: string;
  roleLabel: string;
  counties: string[];
  workbenchHref: string;
  laneDrillDownHref: string;
};

export type VrFieldReportingRow = {
  category: string;
  label: string;
  totalQuantity: number;
  entryCount: number;
};

export type StatewideVrDashboardPayload = {
  dbAvailable: boolean;
  period: string;
  stats: {
    registrationIntakePending: number;
    upcomingDrives: number;
    conversationQty: number;
    countiesWithGoals: number;
    vrLaneLeaders: number;
    statewideGoal: number;
  };
  pipeline: Array<{ stage: VrPipelineStage; label: string; count: number; description: string }>;
  registrationIntake: VrIntakeQueueRow[];
  upcomingDrives: VrUpcomingDriveRow[];
  countyGoals: VrCountyGoalRow[];
  vrLeaders: VrLaneLeaderRow[];
  fieldReporting: VrFieldReportingRow[];
  weeklyRhythm: Array<{ id: string; label: string; description: string; href?: string }>;
};

function ymdAddDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function daysBetween(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86_400_000);
}

function registrationIntakeSignals(row: VolunteerIntakeQueueRow): string[] {
  const signals: string[] = [];
  if (row.student) signals.push("Student");
  if (row.schoolCampus) signals.push(row.schoolCampus);
  const role = row.preferredRole?.toLowerCase() ?? "";
  if (role.includes("registration") || role.includes("register")) signals.push("Registration role");
  for (const interest of row.interests) {
    const lower = interest.toLowerCase();
    if (
      lower.includes("registration") ||
      lower.includes("voter reg") ||
      lower.includes("campus") ||
      lower.includes("help 10")
    ) {
      signals.push(interest);
    }
  }
  return [...new Set(signals)];
}

export function isRegistrationIntakeCandidate(row: VolunteerIntakeQueueRow): boolean {
  return registrationIntakeSignals(row).length > 0;
}

export function isVrLaneLeader(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.workbenchTemplates?.includes("voter_registration_lead") ||
      (leader.teamLanes.includes("voter-registration") && !leader.commandAccess),
  );
}

function vrRoleLabel(leader: VolunteerLeader): string {
  if (leader.workbenchTemplates?.includes("voter_registration_lead")) return "Statewide VR lead";
  if (leader.teamLanes.includes("voter-registration")) return "Registration lane";
  return "Voter registration";
}

function buildVrLeaderRows(): VrLaneLeaderRow[] {
  return getVolunteerLeaderRoster()
    .filter(isVrLaneLeader)
    .map((leader) => ({
      slug: leader.slug,
      displayName: leader.displayName,
      initials: leader.initials,
      roleLabel: vrRoleLabel(leader),
      counties: leader.connections
        .filter((c): c is Extract<typeof c, { kind: "county" }> => c.kind === "county")
        .map((c) => c.county)
        .slice(0, 3),
      workbenchHref: leaderWorkbenchHref(leader.slug),
      laneDrillDownHref: `/election-plan/operators/leaders/${leader.slug}/lane/voter-registration`,
    }))
    .sort((a, b) => {
      if (a.roleLabel.includes("Statewide") && !b.roleLabel.includes("Statewide")) return -1;
      if (!a.roleLabel.includes("Statewide") && b.roleLabel.includes("Statewide")) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
}

function countyGoalsFromSnapshot(): VrCountyGoalRow[] {
  const snap = loadElectionPlanSnapshot();
  return [...snap.counties]
    .sort((a, b) => b.registrationGoal - a.registrationGoal)
    .slice(0, 12)
    .map((c) => ({
      countySlug: c.slug,
      countyName: c.county,
      registrationGoal: c.registrationGoal,
      registrationsSoFar: null,
      progressPct: null,
      playbookHref: `/election-plan/counties/${c.slug}`,
    }));
}

const WEEKLY_RHYTHM: StatewideVrDashboardPayload["weeklyRhythm"] = [
  {
    id: "drive-cadence",
    label: "Confirm next registration drive",
    description: "Tabling, festivals, and campus stops on county and city workbench calendars.",
  },
  {
    id: "help-ten",
    label: "Help 10 participation",
    description: "Ten conversations leading to registration checks — relational before blast messaging.",
    href: "/election-plan/power-of-5/command-center",
  },
  {
    id: "county-goals",
    label: "Review county registration goals",
    description: "75-county playbook targets — prioritize youth registration counties first.",
    href: "/election-plan/registration-goals",
  },
  {
    id: "campus-bridges",
    label: "Campus registration bridges",
    description: "Students for Arkansas chapters and 18-by-election tabling.",
    href: "/election-plan/workbenches/students-for-arkansas",
  },
  {
    id: "field-reporting",
    label: "Log registrations & conversations",
    description: "Field log quantity rollups feed county KPI reporting.",
  },
];

const EMPTY: StatewideVrDashboardPayload = {
  dbAvailable: false,
  period: formatInTimeZone(new Date(), TZ, "yyyy-MM"),
  stats: {
    registrationIntakePending: 0,
    upcomingDrives: 0,
    conversationQty: 0,
    countiesWithGoals: 0,
    vrLaneLeaders: 0,
    statewideGoal: 50_000,
  },
  pipeline: [
    {
      stage: "registration_intake",
      label: "Registration intake",
      count: 0,
      description: "Volunteer sign-ups with campus or registration signals",
    },
    {
      stage: "upcoming_drives",
      label: "Upcoming drives (14d)",
      count: 0,
      description: "Field calendar stops for tabling and registration work",
    },
    {
      stage: "field_reporting",
      label: "Help 10 conversations",
      count: 0,
      description: "Meaningful conversations logged statewide (field log)",
    },
    {
      stage: "county_goals",
      label: "County goals tracked",
      count: 0,
      description: "Counties with registration goal rows in Kelly DB",
    },
  ],
  registrationIntake: [],
  upcomingDrives: [],
  countyGoals: countyGoalsFromSnapshot(),
  vrLeaders: buildVrLeaderRows(),
  fieldReporting: [],
  weeklyRhythm: WEEKLY_RHYTHM,
};

export async function loadStatewideVrDashboard(): Promise<StatewideVrDashboardPayload> {
  const period = formatInTimeZone(new Date(), TZ, "yyyy-MM");
  const snap = loadElectionPlanSnapshot();
  const vrLeaders = buildVrLeaderRows();
  const statewideGoal = snap.warRoom.registrationGoal;

  let upcomingDrives: VrUpcomingDriveRow[] = [];
  let todayYmd = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  try {
    const events = await loadCampaignEventsDashboard(period);
    todayYmd = events.snapshot.todayYmd;
    const horizonYmd = ymdAddDays(todayYmd, UPCOMING_DRIVE_HORIZON_DAYS);
    upcomingDrives = events.snapshot.upcoming
      .filter((e) => e.dateYmd <= horizonYmd)
      .map((e) => ({
        recordId: e.recordId,
        dateYmd: e.dateYmd,
        timeLabel: e.timeLabel,
        title: e.title,
        city: e.city,
        county: e.county,
        status: e.status,
        daysUntil: daysBetween(todayYmd, e.dateYmd),
        calendarHref: `/admin/campaign-events/review?month=${period}&mode=chronological`,
      }));
  } catch (e) {
    console.error("[loadStatewideVrDashboard] events", e);
  }

  const fieldRollups = await loadStatewideFieldEntryRollups();
  const conversationRollup = fieldRollups.find((r) => r.category === "conversation");
  const conversationQty = conversationRollup?.totalQuantity ?? 0;
  const fieldReporting: VrFieldReportingRow[] = fieldRollups.map((r) => ({
    category: r.category,
    label: r.label,
    totalQuantity: r.totalQuantity,
    entryCount: r.entryCount,
  }));

  let countyGoals = countyGoalsFromSnapshot();
  let countiesWithGoals = snap.counties.length;

  if (isDatabaseConfigured()) {
    try {
      const dbGoals = await listCountyRegistrationGoals();
      countiesWithGoals = dbGoals.filter((g) => g.registrationGoal != null).length;
      countyGoals = dbGoals
        .filter((g) => g.registrationGoal != null)
        .sort((a, b) => (b.registrationGoal ?? 0) - (a.registrationGoal ?? 0))
        .slice(0, 12)
        .map((g) => {
          const goal = g.registrationGoal ?? 0;
          const soFar = g.newRegistrationsSinceBaseline;
          const progressPct =
            soFar != null && goal > 0 ? Math.min(100, Math.round((soFar / goal) * 100)) : null;
          return {
            countySlug: g.county.slug,
            countyName: g.county.displayName,
            registrationGoal: goal,
            registrationsSoFar: soFar,
            progressPct,
            playbookHref: `/election-plan/counties/${g.county.slug}`,
          };
        });
    } catch (e) {
      console.error("[loadStatewideVrDashboard] county goals", e);
    }
  }

  if (!isDatabaseConfigured()) {
    const intake = await loadVolunteerIntakeDashboard();
    const registrationIntake = intake.queue
      .filter(isRegistrationIntakeCandidate)
      .map((row) => ({ ...row, registrationSignals: registrationIntakeSignals(row) }));
    const pendingRegIntake = registrationIntake.filter(
      (r) => r.pipelineStage === "pending" || r.pipelineStage === "in_review",
    ).length;

    return {
      ...EMPTY,
      period,
      vrLeaders,
      stats: {
        registrationIntakePending: pendingRegIntake,
        upcomingDrives: upcomingDrives.length,
        conversationQty,
        countiesWithGoals,
        vrLaneLeaders: vrLeaders.length,
        statewideGoal,
      },
      pipeline: [
        {
          stage: "registration_intake",
          label: "Registration intake",
          count: pendingRegIntake,
          description: "Volunteer sign-ups with campus or registration signals awaiting placement",
        },
        {
          stage: "upcoming_drives",
          label: "Upcoming drives (14d)",
          count: upcomingDrives.length,
          description: "Field calendar stops for tabling and registration work",
        },
        {
          stage: "field_reporting",
          label: "Help 10 conversations",
          count: conversationQty,
          description: "Meaningful conversations logged statewide (field log)",
        },
        {
          stage: "county_goals",
          label: "County goals tracked",
          count: countiesWithGoals,
          description: "Counties with registration goal rows in Kelly DB",
        },
      ],
      registrationIntake,
      upcomingDrives,
      countyGoals,
      fieldReporting,
    };
  }

  try {
    const intakePayload = await loadVolunteerIntakeDashboard();

    const registrationIntake = intakePayload.queue
      .filter(isRegistrationIntakeCandidate)
      .map((row) => ({
        ...row,
        registrationSignals: registrationIntakeSignals(row),
        detailHref: `/election-plan/operators/voter-registration?intake=${row.id}`,
      }));

    const pendingRegIntake = registrationIntake.filter(
      (r) => r.pipelineStage === "pending" || r.pipelineStage === "in_review",
    ).length;

    const stats = {
      registrationIntakePending: pendingRegIntake,
      upcomingDrives: upcomingDrives.length,
      conversationQty,
      countiesWithGoals,
      vrLaneLeaders: vrLeaders.length,
      statewideGoal,
    };

    const pipeline = [
      {
        stage: "registration_intake" as const,
        label: "Registration intake",
        count: pendingRegIntake,
        description: "Volunteer sign-ups with campus or registration signals awaiting placement",
      },
      {
        stage: "upcoming_drives" as const,
        label: "Upcoming drives (14d)",
        count: upcomingDrives.length,
        description: "Field calendar stops for tabling and registration work",
      },
      {
        stage: "field_reporting" as const,
        label: "Help 10 conversations",
        count: conversationQty,
        description: "Meaningful conversations logged statewide (field log)",
      },
      {
        stage: "county_goals" as const,
        label: "County goals tracked",
        count: countiesWithGoals,
        description: "Counties with registration goal rows in Kelly DB",
      },
    ];

    return {
      dbAvailable: intakePayload.dbAvailable,
      period,
      stats,
      pipeline,
      registrationIntake,
      upcomingDrives,
      countyGoals,
      vrLeaders,
      fieldReporting,
      weeklyRhythm: WEEKLY_RHYTHM,
    };
  } catch (e) {
    console.error("[loadStatewideVrDashboard]", e);
    return {
      ...EMPTY,
      period,
      vrLeaders,
      upcomingDrives,
      countyGoals,
      fieldReporting,
      stats: {
        ...EMPTY.stats,
        upcomingDrives: upcomingDrives.length,
        conversationQty,
        countiesWithGoals,
        vrLaneLeaders: vrLeaders.length,
        statewideGoal,
      },
      pipeline: EMPTY.pipeline.map((p) =>
        p.stage === "upcoming_drives"
          ? { ...p, count: upcomingDrives.length }
          : p.stage === "field_reporting"
            ? { ...p, count: conversationQty }
            : p.stage === "county_goals"
              ? { ...p, count: countiesWithGoals }
              : p,
      ),
    };
  }
}
