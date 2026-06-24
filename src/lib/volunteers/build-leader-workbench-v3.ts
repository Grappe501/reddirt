import { buildLeaderWorkbenchV2Payload, type LeaderWorkbenchV2Payload } from "@/lib/volunteers/build-leader-workbench-v2";
import type { LeaderRosterSnapshot } from "@/lib/volunteers/leader-roster-db";
import { loadVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster-db";
import type { LeaderWorkbenchLiveData } from "@/lib/volunteers/load-leader-workbench-live";
import { loadLeaderWorkbenchLiveData } from "@/lib/volunteers/load-leader-workbench-live";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderWorkbenchV3Payload = LeaderWorkbenchV2Payload & {
  live: LeaderWorkbenchLiveData;
  roster: LeaderRosterSnapshot;
};

export async function buildLeaderWorkbenchV3Payload(
  leader: VolunteerLeader,
  opts?: { isSelf?: boolean },
): Promise<LeaderWorkbenchV3Payload> {
  const base = buildLeaderWorkbenchV2Payload(leader);
  const [live, roster] = await Promise.all([
    loadLeaderWorkbenchLiveData(leader),
    loadVolunteerLeaderRoster(leader.initials, leader.slug),
  ]);

  const po5KpiItems = base.po5.kpiItems.map((item) => {
    if (item.label === "My Five mapped") {
      return {
        ...item,
        metric: {
          value: `${roster.stats.myFiveFilled} / 5`,
          source: roster.recordSource === "live" ? ("db" as const) : item.metric.source,
        },
        actionHint: roster.stats.myFiveFilled < 5 ? "Fill open My Five slots below" : item.actionHint,
      };
    }
    if (item.label === "Team members active") {
      return {
        ...item,
        metric: {
          value: `${roster.stats.teamCount} / ${Math.max(5, roster.stats.teamCount)}`,
          source: roster.stats.teamCount > 0 ? ("db" as const) : item.metric.source,
        },
        actionHint: "Add deputies and co-leads in your team roster",
      };
    }
    return item;
  });

  const po5Intro =
    roster.recordSource === "live"
      ? `${leader.displayName}, your Power of 5 roster is live — map My Five, grow branches, and add team members below.`
      : base.po5.intro;

  const overviewSummary =
    live.recordSource === "live"
      ? `${base.overviewSummary.replace("demo KPIs until live rosters connect.", "")} Live record counts below — drill into areas for full detail.`.trim()
      : base.overviewSummary;

  const liveActions: LeaderWorkbenchV3Payload["nextActions"] = [];
  if (live.openLeadershipSlots.length > 0) {
    const slot = live.openLeadershipSlots[0]!;
    liveActions.push({
      id: "live-leadership-gap",
      title: `Assign ${slot.roleLabel} on ${slot.workbenchName}`,
      lane: "Leadership",
      dueLabel: "Open slot",
      priority: "high",
    });
  }
  if (opts?.isSelf && live.operatorEntries.entryCount === 0) {
    liveActions.push({
      id: "live-first-field-log",
      title: "Log your first field result — conversation, volunteer, or leader contact",
      lane: "Field",
      dueLabel: "This week",
      priority: "high",
    });
  }

  if (opts?.isSelf && roster.stats.myFiveFilled < 5) {
    liveActions.push({
      id: "live-my-five-gap",
      title: `Map ${5 - roster.stats.myFiveFilled} remaining My Five slot${5 - roster.stats.myFiveFilled === 1 ? "" : "s"}`,
      lane: "Power of 5",
      dueLabel: "This week",
      priority: "high",
    });
  }

  const nextActions = [...liveActions, ...base.nextActions].slice(0, 6);

  return {
    ...base,
    po5: { ...base.po5, intro: po5Intro, kpiItems: po5KpiItems },
    overviewSummary,
    nextActions,
    live,
    roster,
  };
}
