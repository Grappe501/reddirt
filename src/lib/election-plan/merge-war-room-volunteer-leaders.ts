import {
  getVolunteerLeaderRoster,
  leaderHasOperatorDashboard,
} from "@/lib/volunteers/leader-roster";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type WarRoomVolunteerLeaderRow = {
  id: string;
  name: string;
  locationHint: string | null;
  inviteStatus: string;
  confirmedFoundingTeam: boolean;
  /** Operator workbench drill-down when roster-backed. */
  workbenchHref?: string;
  /** Three-letter sign-in code when roster-backed. */
  initials?: string;
};

export type WarRoomVolunteerLeaderMerge = {
  leaders: WarRoomVolunteerLeaderRow[];
  inviteListCount: number;
  operatorWorkbenchCount: number;
  totalCount: number;
};

function normalizeNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/\./g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function leaderLocationHint(leader: VolunteerLeader): string | null {
  const countyConn = leader.connections.find((c) => c.kind === "county");
  if (countyConn && countyConn.kind === "county") {
    const label = countyConn.label?.trim();
    return label || `${countyConn.county} County`;
  }
  const cityConn = leader.connections.find((c) => c.kind === "city");
  if (cityConn && cityConn.kind === "city") {
    return cityConn.label?.trim() || null;
  }
  if (leader.notes) {
    const head = leader.notes.split("—")[0]?.split("·")[0]?.trim();
    if (head && head.length <= 72) return head;
  }
  if (leader.workbenchTier) {
    const tierLabels: Record<string, string> = {
      volunteer: "Volunteer workbench",
      city: "City workbench",
      county: "County workbench",
      cluster: "Cluster workbench",
      assistant_campaign_manager: "Assistant CM workbench",
      campaign_manager: "Campaign manager workbench",
    };
    return tierLabels[leader.workbenchTier] ?? `${leader.workbenchTier} workbench`;
  }
  return null;
}

/**
 * June 28 invite list + every leader-roster person with an operator dashboard (deduped by name).
 */
export function mergeWarRoomVolunteerLeaders(
  inviteList: WarRoomVolunteerLeaderRow[],
): WarRoomVolunteerLeaderMerge {
  const byKey = new Map<string, WarRoomVolunteerLeaderRow>();

  for (const row of inviteList) {
    byKey.set(normalizeNameKey(row.name), { ...row });
  }

  let operatorWorkbenchCount = 0;
  for (const leader of getVolunteerLeaderRoster()) {
    if (!leaderHasOperatorDashboard(leader)) continue;
    operatorWorkbenchCount += 1;

    const key = normalizeNameKey(leader.displayName);
    const existing = byKey.get(key);
    const hint = leaderLocationHint(leader);
    byKey.set(key, {
      id: existing?.id ?? `roster-${leader.slug}`,
      name: leader.displayName,
      locationHint: hint ?? existing?.locationHint ?? null,
      inviteStatus: existing?.inviteStatus ?? "workbench",
      confirmedFoundingTeam:
        existing?.confirmedFoundingTeam ?? Boolean(leader.volunteerLeadershipTeam),
      workbenchHref: `/election-plan/operators/leaders/${leader.slug}`,
      initials: leader.initials,
    });
  }

  const leaders = [...byKey.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );

  return {
    leaders,
    inviteListCount: inviteList.length,
    operatorWorkbenchCount,
    totalCount: leaders.length,
  };
}

export function warRoomVolunteerLeaderSubtitle(merge: WarRoomVolunteerLeaderMerge): string {
  const rosterOnly = Math.max(0, merge.totalCount - merge.inviteListCount);
  return `${merge.inviteListCount} on June 28 invite list · ${rosterOnly} operator workbench${rosterOnly === 1 ? "" : "es"} · ${merge.totalCount} total`;
}
