import { buildLeaderWorkbenchV2Payload, type LeaderWorkbenchV2Payload } from "@/lib/volunteers/build-leader-workbench-v2";
import type { LeaderWorkbenchLiveData } from "@/lib/volunteers/load-leader-workbench-live";
import { loadLeaderWorkbenchLiveData } from "@/lib/volunteers/load-leader-workbench-live";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderWorkbenchV3Payload = LeaderWorkbenchV2Payload & {
  live: LeaderWorkbenchLiveData;
};

export async function buildLeaderWorkbenchV3Payload(leader: VolunteerLeader): Promise<LeaderWorkbenchV3Payload> {
  const base = buildLeaderWorkbenchV2Payload(leader);
  const live = await loadLeaderWorkbenchLiveData(leader);

  const overviewSummary =
    live.recordSource === "live"
      ? `${base.overviewSummary.replace("demo KPIs until live rosters connect.", "")} Live record counts below — drill into areas for full detail.`.trim()
      : base.overviewSummary;

  return {
    ...base,
    overviewSummary,
    live,
  };
}
