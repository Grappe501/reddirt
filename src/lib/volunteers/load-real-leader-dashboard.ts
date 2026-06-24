import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/db";
import { buildLeaderWorkbenchV3Payload } from "@/lib/volunteers/build-leader-workbench-v3";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import {
  getVolunteerLeaderRoster,
  countsInFieldLeaderRoster,
} from "@/lib/volunteers/leader-roster";
import type { LeaderRosterPersonRow } from "@/lib/volunteers/leader-roster-db";
import { loadCommandCoverageHeatmap, type CommandHeatmapRow } from "@/lib/volunteers/load-command-coverage";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderFollowUpRow = {
  id: string;
  personName: string;
  context: string;
  status: string;
  dueBucket: "overdue" | "today" | "this_week";
  note: string;
};

export type LeaderMyFiveRow = {
  slotIndex: number | null;
  displayName: string;
  category: string | null;
  status: string;
  lastTouchNote: string | null;
  branchCount: number;
};

export type LeaderTeamHealthStat = {
  label: string;
  value: string;
  source: "live" | "empty";
  hint: string;
};

export type RealLeaderPersonalPayload = {
  leader: VolunteerLeader;
  workbenchHref: string;
  recordSource: "live" | "empty";
  stats: LeaderTeamHealthStat[];
  myFive: LeaderMyFiveRow[];
  teamMembers: Array<{ displayName: string; status: string; category: string | null }>;
  followUps: LeaderFollowUpRow[];
  nextActions: Array<{ id: string; title: string; lane: string; dueLabel: string; priority: string }>;
  fieldEntryCount: number;
  fieldEntryQty: number;
};

export type LeaderPo5GapRow = {
  slug: string;
  displayName: string;
  initials: string;
  myFiveFilled: number;
  teamCount: number;
  committedCount: number;
  activity: CommandHeatmapRow["activity"];
  workbenchHref: string;
};

export type RealLeaderCommandPayload = {
  dbAvailable: boolean;
  stats: {
    fieldLeaders: number;
    myFiveComplete: number;
    myFivePartial: number;
    myFiveEmpty: number;
    activeLeaders: number;
    quietLeaders: number;
  };
  pipeline: Array<{ stage: string; label: string; count: number; description: string }>;
  po5Gaps: LeaderPo5GapRow[];
  heatmap: CommandHeatmapRow[];
  weeklyRhythm: Array<{ id: string; label: string; description: string; href?: string }>;
};

export type RealLeaderDashboardPayload = {
  personal: RealLeaderPersonalPayload | null;
  command: RealLeaderCommandPayload | null;
};

function followUpDueBucket(status: string): LeaderFollowUpRow["dueBucket"] {
  if (status === "mapped") return "this_week";
  if (status === "contacted" || status === "warming") return "today";
  return "this_week";
}

function buildFollowUps(
  myFive: LeaderRosterPersonRow[],
  team: LeaderRosterPersonRow[],
): LeaderFollowUpRow[] {
  const rows: LeaderFollowUpRow[] = [];

  for (const person of [...myFive, ...team]) {
    if (person.status === "open" || person.displayName === "Open slot") continue;
    if (person.status === "committed") continue;
    rows.push({
      id: person.id,
      personName: person.displayName,
      context: person.layer === "my_five" ? "My Five" : "Team",
      status: person.status,
      dueBucket: followUpDueBucket(person.status),
      note: person.lastTouchNote?.trim() || person.notes?.trim() || "Move toward commitment or next touch",
    });
  }

  const order = { overdue: 0, today: 1, this_week: 2 };
  return rows.sort((a, b) => order[a.dueBucket] - order[b.dueBucket]).slice(0, 10);
}

function mapMyFiveRows(
  myFive: LeaderRosterPersonRow[],
  branchesByParentId: Record<string, LeaderRosterPersonRow[]>,
): LeaderMyFiveRow[] {
  return myFive.map((m) => ({
    slotIndex: m.slotIndex,
    displayName: m.displayName,
    category: m.category,
    status: m.status,
    lastTouchNote: m.lastTouchNote,
    branchCount: (branchesByParentId[m.id] ?? []).filter((b) => b.status !== "open").length,
  }));
}

export async function loadRealLeaderPersonalDashboard(
  leader: VolunteerLeader,
): Promise<RealLeaderPersonalPayload> {
  const payload = await buildLeaderWorkbenchV3Payload(leader, { isSelf: true });
  const { roster, live, nextActions } = payload;

  const stats: LeaderTeamHealthStat[] = [
    {
      label: "My Five mapped",
      value: `${roster.stats.myFiveFilled} / 5`,
      source: roster.recordSource === "live" ? "live" : "empty",
      hint: roster.stats.myFiveFilled < 5 ? "Fill open slots from people you trust" : "All five slots named",
    },
    {
      label: "Team members",
      value: String(roster.stats.teamCount),
      source: roster.stats.teamCount > 0 ? "live" : "empty",
      hint: "Deputies and co-leads on your roster",
    },
    {
      label: "Committed contacts",
      value: String(roster.stats.committedCount),
      source: roster.stats.committedCount > 0 ? "live" : "empty",
      hint: "My Five, branches, and team at committed status",
    },
    {
      label: "Your field entries",
      value: String(live.operatorEntries.entryCount),
      source: live.operatorEntries.entryCount > 0 ? "live" : "empty",
      hint: `${live.operatorEntries.totalQuantity} total qty tagged ${leader.initials}`,
    },
    {
      label: "Open leadership slots",
      value: String(live.openLeadershipSlots.length),
      source: live.openLeadershipSlots.length > 0 ? "live" : "empty",
      hint: "Community workbench roles still open",
    },
  ];

  const recordSource =
    roster.recordSource === "live" || live.recordSource === "live" ? "live" : "empty";

  return {
    leader,
    workbenchHref: leaderWorkbenchHref(leader.slug),
    recordSource,
    stats,
    myFive: mapMyFiveRows(roster.myFive, roster.branchesByParentId),
    teamMembers: roster.team.map((t) => ({
      displayName: t.displayName,
      status: t.status,
      category: t.category,
    })),
    followUps: buildFollowUps(roster.myFive, roster.team),
    nextActions: nextActions.map((a) => ({
      id: a.id,
      title: a.title,
      lane: a.lane,
      dueLabel: a.dueLabel,
      priority: a.priority,
    })),
    fieldEntryCount: live.operatorEntries.entryCount,
    fieldEntryQty: live.operatorEntries.totalQuantity,
  };
}

async function loadStatewidePo5ByInitials(): Promise<
  Map<string, { myFiveFilled: number; teamCount: number; committedCount: number }>
> {
  const map = new Map<string, { myFiveFilled: number; teamCount: number; committedCount: number }>();
  if (!isDatabaseConfigured()) return map;

  try {
    const rows = await prisma.volunteerLeaderRosterPerson.findMany({
      select: { leaderInitials: true, layer: true, status: true, displayName: true },
    });

    for (const row of rows) {
      const code = row.leaderInitials.toUpperCase();
      const entry = map.get(code) ?? { myFiveFilled: 0, teamCount: 0, committedCount: 0 };
      if (row.layer === "my_five" && row.status !== "open" && row.displayName !== "Open slot") {
        entry.myFiveFilled += 1;
      }
      if (row.layer === "team") entry.teamCount += 1;
      if (row.status === "committed") entry.committedCount += 1;
      map.set(code, entry);
    }
  } catch {
    /* empty map */
  }

  return map;
}

export async function loadRealLeaderCommandDashboard(): Promise<RealLeaderCommandPayload> {
  const dbAvailable = isDatabaseConfigured();
  const [heatmap, po5ByInitials] = await Promise.all([
    loadCommandCoverageHeatmap(),
    loadStatewidePo5ByInitials(),
  ]);

  const fieldLeaders = getVolunteerLeaderRoster().filter(countsInFieldLeaderRoster);

  const po5Gaps: LeaderPo5GapRow[] = fieldLeaders.map((leader) => {
    const po5 = po5ByInitials.get(leader.initials.toUpperCase()) ?? {
      myFiveFilled: 0,
      teamCount: 0,
      committedCount: 0,
    };
    const heat = heatmap.find((h) => h.slug === leader.slug);
    return {
      slug: leader.slug,
      displayName: leader.displayName,
      initials: leader.initials,
      myFiveFilled: po5.myFiveFilled,
      teamCount: po5.teamCount,
      committedCount: po5.committedCount,
      activity: heat?.activity ?? "quiet",
      workbenchHref: leaderWorkbenchHref(leader.slug),
    };
  });

  const myFiveComplete = po5Gaps.filter((r) => r.myFiveFilled >= 5).length;
  const myFivePartial = po5Gaps.filter((r) => r.myFiveFilled > 0 && r.myFiveFilled < 5).length;
  const myFiveEmpty = po5Gaps.filter((r) => r.myFiveFilled === 0).length;
  const activeLeaders = heatmap.filter((r) => r.activity === "active").length;
  const quietLeaders = heatmap.filter((r) => r.activity === "quiet").length;

  const pipeline = [
    {
      stage: "my_five_complete",
      label: "My Five complete",
      count: myFiveComplete,
      description: "Field leaders with all five My Five slots named",
    },
    {
      stage: "my_five_partial",
      label: "My Five in progress",
      count: myFivePartial,
      description: "Started mapping — slots still open",
    },
    {
      stage: "my_five_empty",
      label: "My Five not started",
      count: myFiveEmpty,
      description: "No named contacts yet — first coaching touch",
    },
    {
      stage: "quiet",
      label: "Quiet leaders",
      count: quietLeaders,
      description: "No field log or leadership fills yet",
    },
  ];

  const sortedGaps = [...po5Gaps].sort((a, b) => {
    if (a.myFiveFilled !== b.myFiveFilled) return a.myFiveFilled - b.myFiveFilled;
    if (a.activity === "quiet" && b.activity !== "quiet") return -1;
    if (b.activity === "quiet" && a.activity !== "quiet") return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  return {
    dbAvailable,
    stats: {
      fieldLeaders: fieldLeaders.length,
      myFiveComplete,
      myFivePartial,
      myFiveEmpty,
      activeLeaders,
      quietLeaders,
    },
    pipeline,
    po5Gaps: sortedGaps,
    heatmap,
    weeklyRhythm: [
      {
        id: "coach-gaps",
        label: "Coach My Five gaps",
        description: "Leaders under 5/5 — schedule a 15-minute roster mapping call.",
      },
      {
        id: "quiet-touch",
        label: "First touch on quiet leaders",
        description: "No field log yet — pair with a field log entry or leadership slot fill.",
        href: "/election-plan/operators/leaders/command",
      },
      {
        id: "follow-up-debt",
        label: "Clear follow-up debt",
        description: "Review committed vs mapped contacts — move warming nodes forward.",
        href: "/election-plan/operators/leader-dashboard",
      },
      {
        id: "command-review",
        label: "Command heatmap review",
        description: "Full roster activity table for HQ and Volunteer Manager.",
        href: "/election-plan/operators/leaders/command",
      },
    ],
  };
}

export async function loadRealLeaderDashboard(opts: {
  leader?: VolunteerLeader | null;
  includeCommandRollup?: boolean;
}): Promise<RealLeaderDashboardPayload> {
  const [personal, command] = await Promise.all([
    opts.leader ? loadRealLeaderPersonalDashboard(opts.leader) : Promise.resolve(null),
    opts.includeCommandRollup ? loadRealLeaderCommandDashboard() : Promise.resolve(null),
  ]);

  return { personal, command };
}
