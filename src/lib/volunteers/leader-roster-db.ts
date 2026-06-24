import type { VolunteerLeaderRosterLayer, VolunteerLeaderRosterStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getVolunteerLeaderByInitials } from "@/lib/volunteers/leader-roster";

export type LeaderRosterPersonRow = {
  id: string;
  leaderInitials: string;
  leaderSlug: string;
  layer: VolunteerLeaderRosterLayer;
  parentId: string | null;
  slotIndex: number | null;
  displayName: string;
  category: string | null;
  status: VolunteerLeaderRosterStatus;
  notes: string | null;
  lastTouchNote: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type LeaderRosterSnapshot = {
  myFive: LeaderRosterPersonRow[];
  team: LeaderRosterPersonRow[];
  branchesByParentId: Record<string, LeaderRosterPersonRow[]>;
  stats: {
    myFiveFilled: number;
    branchCount: number;
    teamCount: number;
    committedCount: number;
  };
  recordSource: "live" | "empty";
};

function toRow(p: {
  id: string;
  leaderInitials: string;
  leaderSlug: string;
  layer: VolunteerLeaderRosterLayer;
  parentId: string | null;
  slotIndex: number | null;
  displayName: string;
  category: string | null;
  status: VolunteerLeaderRosterStatus;
  notes: string | null;
  lastTouchNote: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): LeaderRosterPersonRow {
  return {
    id: p.id,
    leaderInitials: p.leaderInitials,
    leaderSlug: p.leaderSlug,
    layer: p.layer,
    parentId: p.parentId,
    slotIndex: p.slotIndex,
    displayName: p.displayName,
    category: p.category,
    status: p.status,
    notes: p.notes,
    lastTouchNote: p.lastTouchNote,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/** Ensure five My Five slot rows exist for a leader — idempotent. */
export async function ensureVolunteerLeaderMyFiveSlots(
  leaderInitials: string,
  leaderSlug: string,
): Promise<void> {
  const code = leaderInitials.trim().toUpperCase();
  try {
    const existing = await prisma.volunteerLeaderRosterPerson.count({
      where: { leaderInitials: code, layer: "my_five", parentId: null },
    });
    if (existing >= 5) return;

    const have = await prisma.volunteerLeaderRosterPerson.findMany({
      where: { leaderInitials: code, layer: "my_five", parentId: null },
      select: { slotIndex: true },
    });
    const taken = new Set(have.map((h) => h.slotIndex).filter((n): n is number => n != null));

    for (let slot = 1; slot <= 5; slot += 1) {
      if (taken.has(slot)) continue;
      await prisma.volunteerLeaderRosterPerson.create({
        data: {
          leaderInitials: code,
          leaderSlug,
          layer: "my_five",
          slotIndex: slot,
          displayName: "Open slot",
          category: "—",
          status: "open",
          sortOrder: slot,
        },
      });
    }
  } catch {
    /* DB unavailable — caller shows empty state */
  }
}

export async function loadVolunteerLeaderRoster(
  leaderInitials: string,
  leaderSlug: string,
): Promise<LeaderRosterSnapshot> {
  const code = leaderInitials.trim().toUpperCase();
  await ensureVolunteerLeaderMyFiveSlots(code, leaderSlug);

  try {
    const rows = await prisma.volunteerLeaderRosterPerson.findMany({
      where: { leaderInitials: code },
      orderBy: [{ layer: "asc" }, { slotIndex: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });

    const mapped = rows.map(toRow);
    const myFive = mapped.filter((r) => r.layer === "my_five").sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));
    const team = mapped.filter((r) => r.layer === "team");
    const branches = mapped.filter((r) => r.layer === "branch");
    const branchesByParentId: Record<string, LeaderRosterPersonRow[]> = {};
    for (const b of branches) {
      if (!b.parentId) continue;
      const list = branchesByParentId[b.parentId] ?? [];
      list.push(b);
      branchesByParentId[b.parentId] = list;
    }
    for (const key of Object.keys(branchesByParentId)) {
      branchesByParentId[key]!.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));
    }

    const myFiveFilled = myFive.filter((m) => m.status !== "open" && m.displayName !== "Open slot").length;
    const committedCount = mapped.filter((m) => m.status === "committed").length;

    return {
      myFive,
      team,
      branchesByParentId,
      stats: {
        myFiveFilled,
        branchCount: branches.length,
        teamCount: team.length,
        committedCount,
      },
      recordSource: myFiveFilled > 0 || team.length > 0 || branches.length > 0 ? "live" : "empty",
    };
  } catch {
    return {
      myFive: [],
      team: [],
      branchesByParentId: {},
      stats: { myFiveFilled: 0, branchCount: 0, teamCount: 0, committedCount: 0 },
      recordSource: "empty",
    };
  }
}

export type CreateRosterPersonInput = {
  leaderInitials: string;
  layer: VolunteerLeaderRosterLayer;
  displayName: string;
  category?: string | null;
  status?: VolunteerLeaderRosterStatus;
  notes?: string | null;
  lastTouchNote?: string | null;
  parentId?: string | null;
  slotIndex?: number | null;
  sortOrder?: number;
};

export async function createVolunteerLeaderRosterPerson(
  input: CreateRosterPersonInput,
): Promise<LeaderRosterPersonRow | null> {
  const leader = getVolunteerLeaderByInitials(input.leaderInitials);
  if (!leader) return null;

  const code = input.leaderInitials.trim().toUpperCase();
  try {
    const person = await prisma.volunteerLeaderRosterPerson.create({
      data: {
        leaderInitials: code,
        leaderSlug: leader.slug,
        layer: input.layer,
        parentId: input.parentId ?? null,
        slotIndex: input.slotIndex ?? null,
        displayName: input.displayName.trim().slice(0, 120),
        category: input.category?.trim().slice(0, 80) || null,
        status: input.status ?? "mapped",
        notes: input.notes?.trim().slice(0, 2000) || null,
        lastTouchNote: input.lastTouchNote?.trim().slice(0, 500) || null,
        sortOrder: input.sortOrder ?? 0,
      },
    });
    return toRow(person);
  } catch {
    return null;
  }
}

export async function updateVolunteerLeaderRosterPerson(
  id: string,
  leaderInitials: string,
  patch: Partial<{
    displayName: string;
    category: string | null;
    status: VolunteerLeaderRosterStatus;
    notes: string | null;
    lastTouchNote: string | null;
    sortOrder: number;
  }>,
): Promise<LeaderRosterPersonRow | null> {
  const code = leaderInitials.trim().toUpperCase();
  try {
    const person = await prisma.volunteerLeaderRosterPerson.update({
      where: { id, leaderInitials: code },
      data: {
        ...(patch.displayName != null ? { displayName: patch.displayName.trim().slice(0, 120) } : {}),
        ...(patch.category !== undefined ? { category: patch.category?.trim().slice(0, 80) || null } : {}),
        ...(patch.status != null ? { status: patch.status } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes?.trim().slice(0, 2000) || null } : {}),
        ...(patch.lastTouchNote !== undefined
          ? { lastTouchNote: patch.lastTouchNote?.trim().slice(0, 500) || null }
          : {}),
        ...(patch.sortOrder != null ? { sortOrder: patch.sortOrder } : {}),
      },
    });
    return toRow(person);
  } catch {
    return null;
  }
}

export async function deleteVolunteerLeaderRosterPerson(
  id: string,
  leaderInitials: string,
): Promise<boolean> {
  const code = leaderInitials.trim().toUpperCase();
  try {
    const row = await prisma.volunteerLeaderRosterPerson.findFirst({
      where: { id, leaderInitials: code },
    });
    if (!row) return false;
    if (row.layer === "my_five") {
      await prisma.volunteerLeaderRosterPerson.update({
        where: { id },
        data: {
          displayName: "Open slot",
          category: "—",
          status: "open",
          notes: null,
          lastTouchNote: null,
        },
      });
      return true;
    }
    await prisma.volunteerLeaderRosterPerson.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/** Next open branch slot (1–5) under a My Five person. */
export async function nextBranchSlotIndex(parentId: string, leaderInitials: string): Promise<number | null> {
  const code = leaderInitials.trim().toUpperCase();
  try {
    const used = await prisma.volunteerLeaderRosterPerson.findMany({
      where: { leaderInitials: code, layer: "branch", parentId },
      select: { slotIndex: true },
    });
    const taken = new Set(used.map((u) => u.slotIndex).filter((n): n is number => n != null));
    for (let slot = 1; slot <= 5; slot += 1) {
      if (!taken.has(slot)) return slot;
    }
    return null;
  } catch {
    return null;
  }
}
