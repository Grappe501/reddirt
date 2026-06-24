import { buildVolunteerLeaderPowerOf5Context } from "@/lib/volunteers/build-leader-power-of-5";
import { LANE_RESPONSIBILITIES } from "@/lib/volunteers/leader-workbench-sections";
import { primaryCountyLabel } from "@/lib/volunteers/resolve-leader-links";
import { VOLUNTEER_TEAM_LANES } from "@/lib/volunteers/types";
import type { VolunteerLeader, VolunteerTeamLaneId } from "@/lib/volunteers/types";

export type LeaderWorkbenchV2Payload = {
  leader: VolunteerLeader;
  countyLabel: string | null;
  laneLabels: string[];
  responsibilities: string[];
  po5: ReturnType<typeof buildVolunteerLeaderPowerOf5Context>;
  nextActions: Array<{ id: string; title: string; lane: string; dueLabel: string; priority: "high" | "medium" | "low" }>;
  overviewSummary: string;
};

function laneLabel(id: VolunteerTeamLaneId): string {
  return VOLUNTEER_TEAM_LANES.find((l) => l.id === id)?.label ?? id;
}

export function buildLeaderWorkbenchV2Payload(leader: VolunteerLeader): LeaderWorkbenchV2Payload {
  const county = primaryCountyLabel(leader);
  const po5 = buildVolunteerLeaderPowerOf5Context(leader);

  const responsibilities = leader.teamLanes.flatMap((lane) => LANE_RESPONSIBILITIES[lane] ?? []);

  const laneLabels = leader.teamLanes.map(laneLabel);

  const nextActions = [
    {
      id: "a1",
      title: "Complete Power of 5 walkthrough if you have not yet",
      lane: "Power of 5",
      dueLabel: "Before first team meeting",
      priority: "high" as const,
    },
    {
      id: "a2",
      title: county
        ? `Open ${county} County playbook and bookmark your top 3 priorities`
        : "Open your primary area workbench and bookmark top priorities",
      lane: laneLabels[0] ?? "County",
      dueLabel: "This week",
      priority: "high" as const,
    },
    ...po5.personalDemo.followUps.filter((f) => !f.done).slice(0, 3).map((f, i) => ({
      id: `follow-${i}`,
      title: f.title,
      lane: "Relational",
      dueLabel: f.dueLabel,
      priority: f.priority,
    })),
  ];

  const overviewSummary = `${leader.displayName} leads ${laneLabels.join(", ")}${
    county ? ` in ${county} County` : ""
  }. This workbench connects your geography, Power of 5 participant tools, and Election Plan drill-downs — demo KPIs until live rosters connect.`;

  return {
    leader,
    countyLabel: county,
    laneLabels,
    responsibilities: [...new Set(responsibilities)],
    po5,
    nextActions,
    overviewSummary,
  };
}

export function leaderWorkbenchHref(slug: string): string {
  return `/election-plan/operators/leaders/${slug}`;
}

export function leaderWorkbenchMeHref(): string {
  return "/election-plan/operators/leaders/me";
}
