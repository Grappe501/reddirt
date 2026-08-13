import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import { PERSONAL_DASHBOARD_DEMO } from "@/lib/power-of-5/personal-dashboard-demo";
import { primaryCountyLabel } from "@/lib/volunteers/resolve-leader-links";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type VolunteerLeaderPowerOf5Context = {
  countyLabel: string;
  intro: string;
  impactExplanation: string;
  kpiItems: CountyDashboardKpiItem[];
  personalDemo: typeof PERSONAL_DASHBOARD_DEMO;
};

export function buildVolunteerLeaderPowerOf5Context(leader: VolunteerLeader): VolunteerLeaderPowerOf5Context {
  const county = primaryCountyLabel(leader) ?? "your area";
  const teamName = `${county} circle`;

  const personalDemo = {
    ...PERSONAL_DASHBOARD_DEMO,
    team: {
      ...PERSONAL_DASHBOARD_DEMO.team,
      teamName,
      countyLabel: `${county} — starter roster`,
    },
    impact: {
      ...PERSONAL_DASHBOARD_DEMO.impact,
      caption: `Your relational footprint in ${county}: conversations and invites you own, plus demo reach math until live rosters connect.`,
    },
  };

  return {
    countyLabel: county,
    intro: `${leader.displayName}, build your Power of 5 here: map five people you already trust, log conversations, and grow teams in ${county}. Demo numbers below — your live roster connects as the campaign scales.`,
    impactExplanation:
      "Power of 5 is how one trusted conversation becomes five, then twenty-five. Your workbench tracks My Five, team completion, and follow-ups.",
    kpiItems: [
      {
        label: "My Five mapped",
        metric: {
          value: `${personalDemo.myFive.filter((m) => m.status !== "open").length} / 5`,
          source: "demo",
        },
        actionHint: "Fill open slots from people you already know",
      },
      {
        label: "Team conversations (week)",
        metric: { value: personalDemo.team.conversationsThisWeek, source: "demo" },
        actionHint: `Goal ${personalDemo.team.weeklyConversationGoal} this week`,
      },
      {
        label: "Follow-ups open",
        metric: {
          value: personalDemo.followUps.filter((f) => !f.done).length,
          source: "demo",
        },
        actionHint: "Clear within 48 hours when possible",
      },
      {
        label: "Team members active",
        metric: {
          value: `${personalDemo.team.membersActive} / ${personalDemo.team.membersGoal}`,
          source: "demo",
        },
        actionHint: "Invite one new host this month",
      },
      {
        label: "Consistency streak",
        metric: { value: `${personalDemo.team.consistencyStreakWeeks} wks`, source: "demo" },
        actionHint: "Log at least one team touch weekly",
      },
    ],
    personalDemo,
  };
}
