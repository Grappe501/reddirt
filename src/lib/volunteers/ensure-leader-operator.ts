import type { ElectionPlanOperatorCapability } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import { resolveLeaderGeographyScope } from "@/lib/volunteers/leader-scope";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderOperatorRecord = {
  id: string;
  initials: string;
  displayName: string;
  countySlug: string | null;
  capabilities: ElectionPlanOperatorCapability[];
};

function capabilitiesForLeader(leader: VolunteerLeader, countySlug: string | null): ElectionPlanOperatorCapability[] {
  if (leader.commandAccess) {
    return ["field_entry", "manage_operators"];
  }
  if (countySlug) {
    return ["field_entry", "county_scope"];
  }
  return ["field_entry"];
}

/** Upsert Election Plan operator row from volunteer leader roster — idempotent. */
export async function ensureVolunteerLeaderOperator(leader: VolunteerLeader): Promise<LeaderOperatorRecord | null> {
  const scope = resolveLeaderGeographyScope(leader);
  const countySlug = scope.primaryCountySlug;
  const caps = capabilitiesForLeader(leader, countySlug);

  try {
    const op = await prisma.electionPlanOperator.upsert({
      where: { initials: leader.initials.toUpperCase() },
      create: {
        initials: leader.initials.toUpperCase(),
        displayName: leader.displayName,
        countySlug,
        capabilities: caps,
        active: true,
      },
      update: {
        displayName: leader.displayName,
        countySlug,
        capabilities: caps,
        active: true,
      },
    });
    return {
      id: op.id,
      initials: op.initials,
      displayName: op.displayName,
      countySlug: op.countySlug,
      capabilities: op.capabilities,
    };
  } catch {
    return null;
  }
}

export async function syncAllVolunteerLeaderOperators(): Promise<number> {
  const roster = getVolunteerLeaderRoster();
  let synced = 0;
  for (const leader of roster) {
    const op = await ensureVolunteerLeaderOperator(leader);
    if (op) synced += 1;
  }
  return synced;
}

export async function loadLeaderOperatorRecord(initials: string): Promise<LeaderOperatorRecord | null> {
  try {
    const op = await prisma.electionPlanOperator.findFirst({
      where: { initials: initials.toUpperCase(), active: true },
    });
    if (!op) return null;
    return {
      id: op.id,
      initials: op.initials,
      displayName: op.displayName,
      countySlug: op.countySlug,
      capabilities: op.capabilities,
    };
  } catch {
    return null;
  }
}
