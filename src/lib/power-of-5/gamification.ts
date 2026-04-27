/**
 * Power of 5 — gamification primitives (XP, badges, streaks, missions).
 *
 * Demo-first: `buildPersonalGamificationFromDemo` derives a UI snapshot from
 * `PersonalDashboardDemo` with no persistence or PII. Wire real events later
 * by mapping activity logs into {@link XpLedgerLine} and streak windows.
 *
 * @see docs/POWER_OF_5_GAMIFICATION.md
 */

import type { PersonalDashboardDemo } from "@/lib/power-of-5/personal-dashboard-demo";

// ---------------------------------------------------------------------------
// XP
// ---------------------------------------------------------------------------

/** Event kinds that can award XP when persisted; demo totals use the same weights. */
export type XpActivityKind =
  | "conversation_logged"
  | "invite_extended"
  | "myfive_slot_advanced"
  | "followup_completed"
  | "mission_completed"
  | "team_weekly_touch";

/** Base XP per activity — tune in one place when balancing live play. */
export const XP_PER_ACTIVITY: Record<XpActivityKind, number> = {
  conversation_logged: 25,
  invite_extended: 40,
  myfive_slot_advanced: 35,
  followup_completed: 20,
  mission_completed: 75,
  team_weekly_touch: 15,
};

/** Cumulative XP thresholds: level N is active while totalXp >= LEVEL_THRESHOLDS[N-1] and < LEVEL_THRESHOLDS[N]. */
export const LEVEL_THRESHOLDS: readonly number[] = [
  0, 200, 500, 900, 1400, 2000, 2700, 3500, 4500, 6000, 7500,
] as const;

export const LEVEL_TITLES: readonly string[] = [
  "Observer",
  "Contributor",
  "Connector",
  "Organizer",
  "Catalyst",
  "Anchor",
  "Builder",
  "Mentor",
  "Champion",
  "Steward",
  "Circle keeper",
] as const;

export type XpLedgerLine = {
  kind: XpActivityKind;
  /** How many times this award applies (integer ≥ 0). */
  count: number;
};

export type XpState = {
  totalXp: number;
  level: number;
  levelTitle: string;
  /** 0–1 progress within the current level band. */
  progressInLevel: number;
  xpIntoCurrentLevel: number;
  xpToReachNextLevel: number | null;
};

export function sumXpFromLedger(lines: XpLedgerLine[]): number {
  let sum = 0;
  for (const line of lines) {
    const w = XP_PER_ACTIVITY[line.kind];
    if (w == null || line.count < 0) continue;
    sum += w * Math.floor(line.count);
  }
  return sum;
}

/**
 * Map demo counts to a synthetic ledger (not a claim about real history).
 */
export function demoLedgerFromPersonalDashboard(demo: PersonalDashboardDemo): XpLedgerLine[] {
  const myFiveAdvanced = demo.myFive.filter((m) => m.status !== "open").length;
  const invites = demo.impact.invitesExtendedCount;
  const conversations = demo.impact.personalConversationsCount;
  const followupsDone = demo.followUps.filter((t) => t.done).length;
  const teamTouches = demo.team.conversationsThisWeek;

  return [
    { kind: "myfive_slot_advanced", count: myFiveAdvanced },
    { kind: "invite_extended", count: invites },
    { kind: "conversation_logged", count: conversations },
    { kind: "followup_completed", count: followupsDone },
    { kind: "team_weekly_touch", count: Math.min(teamTouches, 30) },
  ];
}

export function totalXpFromDemo(demo: PersonalDashboardDemo): number {
  return sumXpFromLedger(demoLedgerFromPersonalDashboard(demo));
}

export function computeXpState(totalXp: number): XpState {
  const cappedXp = Math.max(0, totalXp);
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (cappedXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  const titleIdx = Math.min(LEVEL_TITLES.length - 1, Math.max(0, level - 1));
  const levelTitle = LEVEL_TITLES[titleIdx] ?? LEVEL_TITLES[0];
  const floorXp = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const ceilingXp = LEVEL_THRESHOLDS[level] ?? null;

  if (ceilingXp == null) {
    return {
      totalXp: cappedXp,
      level,
      levelTitle,
      progressInLevel: 1,
      xpIntoCurrentLevel: cappedXp - floorXp,
      xpToReachNextLevel: null,
    };
  }

  const span = ceilingXp - floorXp;
  const into = cappedXp - floorXp;
  const progressInLevel = span > 0 ? Math.min(1, into / span) : 0;

  return {
    totalXp: cappedXp,
    level,
    levelTitle,
    progressInLevel,
    xpIntoCurrentLevel: into,
    xpToReachNextLevel: ceilingXp - cappedXp,
  };
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
};

export const BADGE_CATALOG: readonly BadgeDefinition[] = [
  {
    id: "circle_started",
    name: "Circle started",
    description: "At least one Power of 5 slot is active (not open).",
  },
  {
    id: "circle_almost",
    name: "Almost full",
    description: "Four or more intentional slots are active.",
  },
  {
    id: "warm_inviter",
    name: "Warm inviter",
    description: "Extended five or more personal invites in your impact tally.",
  },
  {
    id: "conversation_starter",
    name: "Conversation starter",
    description: "Logged ten or more relational conversations.",
  },
  {
    id: "cadence_streak",
    name: "Cadence streak",
    description: "Team has kept a multi-week consistency streak on shared goals.",
  },
  {
    id: "rising_momentum",
    name: "Rising momentum",
    description: "Crossed the first major XP threshold on the personal track.",
  },
] as const;

export type EarnedBadge = BadgeDefinition & {
  earned: boolean;
  /** Demo-only label for UI; live system would use ISO timestamps. */
  earnedLabel: string | null;
};

export function evaluateBadges(demo: PersonalDashboardDemo, totalXp: number): EarnedBadge[] {
  const filled = demo.myFive.filter((m) => m.status !== "open").length;
  const invites = demo.impact.invitesExtendedCount;
  const convos = demo.impact.personalConversationsCount;
  const streakWeeks = demo.team.consistencyStreakWeeks;

  const rules: Record<string, boolean> = {
    circle_started: filled >= 1,
    circle_almost: filled >= 4,
    warm_inviter: invites >= 5,
    conversation_starter: convos >= 10,
    cadence_streak: streakWeeks >= 3,
    rising_momentum: totalXp >= LEVEL_THRESHOLDS[2],
  };

  return BADGE_CATALOG.map((b) => ({
    ...b,
    earned: rules[b.id] ?? false,
    earnedLabel: rules[b.id] ? "Earned in demo snapshot" : null,
  }));
}

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------

export type StreakSnapshot = {
  id: string;
  label: string;
  /** Current streak count (days, weeks, etc. — see unit). */
  current: number;
  unit: "days" | "weeks";
  caption: string;
  /** Longest observed in demo narrative (same unit). */
  best: number;
};

/**
 * Demo streaks: not calendar-accurate — mirrors fields already on the personal demo payload.
 */
export function buildStreakSnapshots(demo: PersonalDashboardDemo): StreakSnapshot[] {
  const convoCount = demo.recentConversations.length;
  const personalCadenceDays = Math.min(14, 3 + convoCount * 2);

  return [
    {
      id: "personal_touch",
      label: "Personal touch rhythm",
      current: personalCadenceDays,
      unit: "days",
      caption: "Synthetic check-in streak from recent conversation density — not a login streak.",
      best: Math.max(personalCadenceDays, 5),
    },
    {
      id: "team_cadence",
      label: "Team cadence",
      current: demo.team.consistencyStreakWeeks,
      unit: "weeks",
      caption: "Weeks the team has kept at least one shared organizing touch on the demo goal.",
      best: Math.max(demo.team.consistencyStreakWeeks, 6),
    },
  ];
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

export type GamificationMission = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  xpReward: number;
  status: "locked" | "active" | "complete";
};

function missionStatus(current: number, target: number, unlocked: boolean): GamificationMission["status"] {
  if (!unlocked) return "locked";
  if (current >= target) return "complete";
  return "active";
}

/**
 * Weekly-style missions aligned to Power of 5 habits; progress is demo-derived.
 */
export function buildMissionsFromDemo(demo: PersonalDashboardDemo): GamificationMission[] {
  const filled = demo.myFive.filter((m) => m.status !== "open").length;
  const openHigh = demo.followUps.filter((t) => !t.done && t.priority === "high").length;
  const weeklyConvos = demo.team.conversationsThisWeek;
  const weeklyGoal = demo.team.weeklyConversationGoal;

  return [
    {
      id: "mission_circle",
      title: "Intentional circle",
      description: "Keep five warm relationships in motion — fill every slot when you are ready.",
      current: filled,
      target: 5,
      xpReward: XP_PER_ACTIVITY.mission_completed,
      status: missionStatus(filled, 5, true),
    },
    {
      id: "mission_team_week",
      title: "Team weekly cadence",
      description: "Help the team hit its shared conversation goal for the week.",
      current: weeklyConvos,
      target: weeklyGoal,
      xpReward: XP_PER_ACTIVITY.mission_completed,
      status: missionStatus(weeklyConvos, weeklyGoal, filled >= 2),
    },
    {
      id: "mission_followups",
      title: "Close the loop",
      description: "Clear high-priority follow-ups so trust compounds.",
      current: openHigh === 0 ? 1 : 0,
      target: 1,
      xpReward: XP_PER_ACTIVITY.mission_completed,
      status: missionStatus(openHigh === 0 ? 1 : 0, 1, filled >= 1),
    },
  ];
}

// ---------------------------------------------------------------------------
// Snapshot (personal dashboard)
// ---------------------------------------------------------------------------

export type PersonalGamificationSnapshot = {
  xp: XpState;
  ledger: XpLedgerLine[];
  badges: EarnedBadge[];
  streaks: StreakSnapshot[];
  missions: GamificationMission[];
};

export function buildPersonalGamificationFromDemo(demo: PersonalDashboardDemo): PersonalGamificationSnapshot {
  const ledger = demoLedgerFromPersonalDashboard(demo);
  const totalXp = sumXpFromLedger(ledger);
  const xp = computeXpState(totalXp);
  const badges = evaluateBadges(demo, totalXp);
  const streaks = buildStreakSnapshots(demo);
  const missions = buildMissionsFromDemo(demo);

  return { xp, ledger, badges, streaks, missions };
}
