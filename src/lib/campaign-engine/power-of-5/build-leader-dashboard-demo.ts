import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";

/** Demo-only team row — no roster PII. */
export type LeaderDashboardTeamRow = {
  id: string;
  displayName: string;
  geographyLabel: string;
  slotsFilled: number;
  slotsTarget: number;
  completionPct: number;
  health: "strong" | "watch" | "at_risk";
  lastActivityNote: string;
};

export type LeaderDashboardWeakNodeRow = {
  id: string;
  teamDisplayName: string;
  signal: string;
  severity: "low" | "medium" | "high";
};

export type LeaderDashboardFollowUpRow = {
  id: string;
  summary: string;
  teamDisplayName: string;
  dueBucket: "overdue" | "today" | "this_week";
  demoDueLabel: string;
};

export type PowerOf5LeaderDashboardDemoPayload = {
  demoBanner: string;
  healthKpis: CountyDashboardKpiItem[];
  teamsUnderLeader: LeaderDashboardTeamRow[];
  incompleteTeams: LeaderDashboardTeamRow[];
  weakNodes: LeaderDashboardWeakNodeRow[];
  followUpsDue: LeaderDashboardFollowUpRow[];
};

/**
 * Static demo payload for `/dashboard/leader` until auth + team scope + relational metrics exist.
 * All figures are illustrative; do not use for operations or targeting.
 */
export function buildPowerOf5LeaderDashboardDemo(): PowerOf5LeaderDashboardDemoPayload {
  const teamsUnderLeader: LeaderDashboardTeamRow[] = [
    {
      id: "t1",
      displayName: "River Valley — East bench",
      geographyLabel: "Precinct aggregate · demo turf A",
      slotsFilled: 5,
      slotsTarget: 5,
      completionPct: 100,
      health: "strong",
      lastActivityNote: "Demo: follow-ups cleared this week",
    },
    {
      id: "t2",
      displayName: "Capitol corridor — campus ring",
      geographyLabel: "City slice · demo turf B",
      slotsFilled: 4,
      slotsTarget: 5,
      completionPct: 80,
      health: "watch",
      lastActivityNote: "Demo: one seat open; invite in flight",
    },
    {
      id: "t3",
      displayName: "Highland volunteers",
      geographyLabel: "Neighborhood cluster · demo turf C",
      slotsFilled: 3,
      slotsTarget: 5,
      completionPct: 60,
      health: "watch",
      lastActivityNote: "Demo: two activations pending",
    },
    {
      id: "t4",
      displayName: "Weekend canvass pod",
      geographyLabel: "Event-adjacent · demo turf D",
      slotsFilled: 2,
      slotsTarget: 5,
      completionPct: 40,
      health: "at_risk",
      lastActivityNote: "Demo: stalled invites; needs leader nudge",
    },
  ];

  const incompleteTeams = teamsUnderLeader.filter((t) => t.slotsFilled < t.slotsTarget);

  const weakNodes: LeaderDashboardWeakNodeRow[] = [
    {
      id: "w1",
      teamDisplayName: "Weekend canvass pod",
      signal: "Demo: no logged touches in 14d on two roster slots",
      severity: "high",
    },
    {
      id: "w2",
      teamDisplayName: "Highland volunteers",
      signal: "Demo: follow-up SLA drift vs team median",
      severity: "medium",
    },
    {
      id: "w3",
      teamDisplayName: "Capitol corridor — campus ring",
      signal: "Demo: single-threaded outreach (diversity of paths low)",
      severity: "low",
    },
  ];

  const followUpsDue: LeaderDashboardFollowUpRow[] = [
    {
      id: "f1",
      summary: "Demo: confirm RSVP + assign buddy for neighborhood social",
      teamDisplayName: "Highland volunteers",
      dueBucket: "overdue",
      demoDueLabel: "Demo due: 2 days ago",
    },
    {
      id: "f2",
      summary: "Demo: return call — undecided voter from relational handoff",
      teamDisplayName: "River Valley — East bench",
      dueBucket: "today",
      demoDueLabel: "Demo due: today",
    },
    {
      id: "f3",
      summary: "Demo: send thank-you + next step after house party",
      teamDisplayName: "Capitol corridor — campus ring",
      dueBucket: "this_week",
      demoDueLabel: "Demo due: in 3 days",
    },
  ];

  const healthKpis: CountyDashboardKpiItem[] = [
    {
      label: "Teams under you",
      metric: { value: teamsUnderLeader.length, source: "demo", note: "Illustrative roster count" },
      actionHint: "When live: opens scoped team list.",
    },
    {
      label: "Avg completion (My Five)",
      metric: { value: 70, source: "demo", note: "Rounded demo aggregate" },
      actionHint: "Target 100% with healthy invites, not churn.",
    },
    {
      label: "Teams incomplete",
      metric: { value: incompleteTeams.length, source: "demo" },
      actionHint: "Prioritize open seats + stalled invites.",
    },
    {
      label: "Weak nodes flagged",
      metric: { value: weakNodes.length, source: "demo" },
      actionHint: "Coach or reassign before coverage gaps harden.",
    },
    {
      label: "Follow-ups in queue",
      metric: { value: followUpsDue.length, source: "demo" },
      actionHint: "Clear overdue first; keep latency honest.",
    },
  ];

  return {
    demoBanner:
      "Figures below are demo / seed only. No login, voter file, or live relational graph is loaded on this page.",
    healthKpis,
    teamsUnderLeader,
    incompleteTeams,
    weakNodes,
    followUpsDue,
  };
}
