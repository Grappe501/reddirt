/**
 * Demo-only payload for `/dashboard` — no API, no session, no PII.
 * Names are synthetic labels (given + initial), not real people.
 */

export type MyFiveSlotStatus = "open" | "mapped" | "contacted" | "invited" | "committed";

export type MyFiveMember = {
  id: string;
  /** Synthetic display, e.g. "Jordan K." */
  displayName: string;
  category: string;
  status: MyFiveSlotStatus;
  /** Human-readable last activity, demo copy */
  lastTouchLabel: string;
};

export type TeamProgressDemo = {
  teamName: string;
  countyLabel: string;
  membersActive: number;
  membersGoal: number;
  /** Conversations logged by the team this week (demo) */
  conversationsThisWeek: number;
  weeklyConversationGoal: number;
  openFollowUps: number;
  /** Cooperative streak — weeks with ≥1 team conversation logged */
  consistencyStreakWeeks: number;
};

export type ConversationDemo = {
  id: string;
  /** Synthetic */
  withPerson: string;
  summary: string;
  /** ISO-like demo label for UI only */
  whenLabel: string;
  outcomeLabel: string;
};

export type FollowUpTaskDemo = {
  id: string;
  title: string;
  relatedPerson: string;
  dueLabel: string;
  priority: "high" | "medium" | "low";
  done: boolean;
};

export type PersonalImpactDemo = {
  /** 0-based index into IMPACT_LADDER_STEPS (clamped in UI) */
  ladderStepIndex: number;
  personalConversationsCount: number;
  invitesExtendedCount: number;
  /** Narrative reach — not voter-file derived */
  estimatedTrustedReach: number;
  caption: string;
};

export type PersonalDashboardDemo = {
  myFive: MyFiveMember[];
  team: TeamProgressDemo;
  recentConversations: ConversationDemo[];
  followUps: FollowUpTaskDemo[];
  impact: PersonalImpactDemo;
};

export const PERSONAL_DASHBOARD_DEMO: PersonalDashboardDemo = {
  myFive: [
    {
      id: "1",
      displayName: "Jordan K.",
      category: "Neighbor",
      status: "committed",
      lastTouchLabel: "Coffee — agreed to host a small circle",
    },
    {
      id: "2",
      displayName: "Riley M.",
      category: "Coworker",
      status: "invited",
      lastTouchLabel: "Text — sent event + follow-up question",
    },
    {
      id: "3",
      displayName: "Sam T.",
      category: "Faith community",
      status: "contacted",
      lastTouchLabel: "Call — 20m listen-first check-in",
    },
    {
      id: "4",
      displayName: "Avery P.",
      category: "Family",
      status: "mapped",
      lastTouchLabel: "Mapped — ready for first touch this week",
    },
    {
      id: "5",
      displayName: "Open slot",
      category: "—",
      status: "open",
      lastTouchLabel: "Pick someone you already trust",
    },
  ],
  team: {
    teamName: "River Valley circle",
    countyLabel: "Demo county — not live roster",
    membersActive: 12,
    membersGoal: 20,
    conversationsThisWeek: 18,
    weeklyConversationGoal: 25,
    openFollowUps: 7,
    consistencyStreakWeeks: 4,
  },
  recentConversations: [
    {
      id: "c1",
      withPerson: "Sam T.",
      summary: "School funding + local jobs — they want a second touch with partner present.",
      whenLabel: "Sat, demo calendar",
      outcomeLabel: "Follow-up scheduled",
    },
    {
      id: "c2",
      withPerson: "Riley M.",
      summary: "Asked about weekend canvass — hesitant on time, open to a ride-share.",
      whenLabel: "Thu, demo calendar",
      outcomeLabel: "Soft yes — needs logistics",
    },
    {
      id: "c3",
      withPerson: "Jordan K.",
      summary: "Hosted intro — two guests asked how to join the volunteer list.",
      whenLabel: "Tue, demo calendar",
      outcomeLabel: "Signups captured (demo)",
    },
  ],
  followUps: [
    {
      id: "t1",
      title: "Send Riley the canvass map + shift options",
      relatedPerson: "Riley M.",
      dueLabel: "Within 48 hours",
      priority: "high",
      done: false,
    },
    {
      id: "t2",
      title: "Thank-you text to Jordan + confirm next host date",
      relatedPerson: "Jordan K.",
      dueLabel: "Tomorrow",
      priority: "medium",
      done: false,
    },
    {
      id: "t3",
      title: "Ask Sam for a good time for second conversation",
      relatedPerson: "Sam T.",
      dueLabel: "This week",
      priority: "medium",
      done: false,
    },
    {
      id: "t4",
      title: "First touch plan for Avery — pick low-pressure setting",
      relatedPerson: "Avery P.",
      dueLabel: "Before weekend",
      priority: "low",
      done: false,
    },
  ],
  impact: {
    ladderStepIndex: 2,
    personalConversationsCount: 14,
    invitesExtendedCount: 6,
    estimatedTrustedReach: 38,
    caption:
      "Impact here is relationship-first: conversations and invites you own, plus a rough trusted-reach estimate from demo math — not voter-file rolls.",
  },
};
