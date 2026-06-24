import { buildLeaderWorkbenchV2Payload, type LeaderWorkbenchV2Payload } from "@/lib/volunteers/build-leader-workbench-v2";
import type { LeaderWorkbenchLiveData } from "@/lib/volunteers/load-leader-workbench-live";
import { loadLeaderWorkbenchLiveData } from "@/lib/volunteers/load-leader-workbench-live";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderWorkbenchV3Payload = LeaderWorkbenchV2Payload & {
  live: LeaderWorkbenchLiveData;
};

export async function buildLeaderWorkbenchV3Payload(
  leader: VolunteerLeader,
  opts?: { isSelf?: boolean },
): Promise<LeaderWorkbenchV3Payload> {
  const base = buildLeaderWorkbenchV2Payload(leader);
  const live = await loadLeaderWorkbenchLiveData(leader);

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

  const nextActions = [...liveActions, ...base.nextActions].slice(0, 6);

  return {
    ...base,
    overviewSummary,
    nextActions,
    live,
  };
}
