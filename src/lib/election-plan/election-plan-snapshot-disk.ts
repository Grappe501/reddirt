import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { mergeBonusCitiesIntoSnapshot } from "./load-bonus-city-workbenches";
import { buildWarRoomFundraisingFromTracker } from "./load-fundraising-tracker";
import { mergeWarRoomVolunteerLeaders } from "./merge-war-room-volunteer-leaders";
import type { ElectionPlanWorkbenchSnapshot } from "./types";

/** Script-safe snapshot path (no `server-only` — usable from tsx/CLI). */
export const ELECTION_PLAN_SNAPSHOT_PATH = path.join(
  process.cwd(),
  "data/election-plan/election-plan-workbench.snapshot.json",
);

let cached: ElectionPlanWorkbenchSnapshot | null = null;

export function loadElectionPlanSnapshotFromDisk(): ElectionPlanWorkbenchSnapshot {
  if (cached) return cached;
  if (!existsSync(ELECTION_PLAN_SNAPSHOT_PATH)) {
    throw new Error(
      `Election plan snapshot missing at ${ELECTION_PLAN_SNAPSHOT_PATH}. Run npm run election-plan:build.`,
    );
  }
  const raw = readFileSync(ELECTION_PLAN_SNAPSHOT_PATH, "utf8");
  const parsed = JSON.parse(raw) as ElectionPlanWorkbenchSnapshot;
  const volunteerMerge = mergeWarRoomVolunteerLeaders(parsed.warRoom.volunteerLeaders ?? []);
  cached = {
    ...parsed,
    cities: mergeBonusCitiesIntoSnapshot(parsed.cities ?? []),
    warRoom: {
      ...parsed.warRoom,
      ...buildWarRoomFundraisingFromTracker(),
      volunteerLeaders: volunteerMerge.leaders,
      volunteerLeadersCurrent: volunteerMerge.totalCount,
      volunteerLeadersInviteCount: volunteerMerge.inviteListCount,
      volunteerLeadersWorkbenchCount: volunteerMerge.operatorWorkbenchCount,
    },
  };
  return cached;
}

export function clearElectionPlanSnapshotDiskCache(): void {
  cached = null;
}
