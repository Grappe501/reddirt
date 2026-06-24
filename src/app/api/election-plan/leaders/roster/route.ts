import { NextResponse } from "next/server";
import type { VolunteerLeaderRosterLayer, VolunteerLeaderRosterStatus } from "@prisma/client";

import { getVolunteerLeaderByInitials } from "@/lib/volunteers/leader-roster";
import {
  canEditLeaderRoster,
  requireLeaderRosterEditor,
  requireLeaderRosterReadSession,
} from "@/lib/volunteers/leader-roster-access";
import {
  createVolunteerLeaderRosterPerson,
  deleteVolunteerLeaderRosterPerson,
  loadVolunteerLeaderRoster,
  nextBranchSlotIndex,
  updateVolunteerLeaderRosterPerson,
} from "@/lib/volunteers/leader-roster-db";

export const runtime = "nodejs";

const VALID_LAYERS = new Set<string>(["my_five", "branch", "team"]);
const VALID_STATUSES = new Set<string>(["open", "mapped", "contacted", "invited", "committed"]);

export async function GET(request: Request) {
  if (!(await requireLeaderRosterReadSession())) {
    return NextResponse.json({ error: "Sign in to view roster" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const initials = searchParams.get("leaderInitials")?.trim().toUpperCase() ?? "";
  if (!/^[A-Z]{3}$/.test(initials)) {
    return NextResponse.json({ error: "leaderInitials required (3 letters)" }, { status: 400 });
  }

  const leader = getVolunteerLeaderByInitials(initials);
  if (!leader) return NextResponse.json({ error: "Unknown leader" }, { status: 404 });

  const roster = await loadVolunteerLeaderRoster(initials, leader.slug);
  const editable = await canEditLeaderRoster(initials);

  return NextResponse.json({ ...roster, editable, leaderInitials: initials });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    leaderInitials?: string;
    layer?: string;
    displayName?: string;
    category?: string | null;
    status?: string;
    notes?: string | null;
    lastTouchNote?: string | null;
    parentId?: string | null;
    slotIndex?: number | null;
  };

  const initials = String(body.leaderInitials ?? "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{3}$/.test(initials)) {
    return NextResponse.json({ error: "leaderInitials required" }, { status: 400 });
  }

  const auth = await requireLeaderRosterEditor(initials);
  if (auth.error === "session") {
    return NextResponse.json({ error: "Sign in as this leader to edit roster" }, { status: 401 });
  }
  if (auth.error === "forbidden") {
    return NextResponse.json({ error: "You can only edit your own roster" }, { status: 403 });
  }

  const layer = String(body.layer ?? "").trim();
  if (!VALID_LAYERS.has(layer)) {
    return NextResponse.json({ error: "Invalid layer" }, { status: 400 });
  }

  const displayName = String(body.displayName ?? "").trim();
  if (displayName.length < 1 || displayName.length > 120) {
    return NextResponse.json({ error: "displayName required (max 120 chars)" }, { status: 400 });
  }

  const status = body.status?.trim();
  if (status && !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  let parentId = body.parentId?.trim() || null;
  let slotIndex = body.slotIndex != null ? Math.floor(Number(body.slotIndex)) : null;

  if (layer === "branch") {
    if (!parentId) {
      return NextResponse.json({ error: "parentId required for branch" }, { status: 400 });
    }
    if (slotIndex == null || slotIndex < 1 || slotIndex > 5) {
      slotIndex = await nextBranchSlotIndex(parentId, initials);
      if (slotIndex == null) {
        return NextResponse.json({ error: "This My Five person already has 5 branch contacts" }, { status: 409 });
      }
    }
  }

  if (layer === "team") {
    parentId = null;
    slotIndex = null;
  }

  const created = await createVolunteerLeaderRosterPerson({
    leaderInitials: initials,
    layer: layer as VolunteerLeaderRosterLayer,
    displayName,
    category: body.category,
    status: (status as VolunteerLeaderRosterStatus) ?? "mapped",
    notes: body.notes,
    lastTouchNote: body.lastTouchNote,
    parentId,
    slotIndex,
  });

  if (!created) {
    return NextResponse.json({ error: "Could not save — is the database migration applied?" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, person: created });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    leaderInitials?: string;
    displayName?: string;
    category?: string | null;
    status?: string;
    notes?: string | null;
    lastTouchNote?: string | null;
    sortOrder?: number;
  };

  const id = String(body.id ?? "").trim();
  const initials = String(body.leaderInitials ?? "")
    .trim()
    .toUpperCase();
  if (!id || !/^[A-Z]{3}$/.test(initials)) {
    return NextResponse.json({ error: "id and leaderInitials required" }, { status: 400 });
  }

  const auth = await requireLeaderRosterEditor(initials);
  if (auth.error === "session") {
    return NextResponse.json({ error: "Sign in as this leader to edit roster" }, { status: 401 });
  }
  if (auth.error === "forbidden") {
    return NextResponse.json({ error: "You can only edit your own roster" }, { status: 403 });
  }

  const status = body.status?.trim();
  if (status && !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await updateVolunteerLeaderRosterPerson(id, initials, {
    ...(body.displayName != null ? { displayName: body.displayName } : {}),
    ...(body.category !== undefined ? { category: body.category } : {}),
    ...(status ? { status: status as VolunteerLeaderRosterStatus } : {}),
    ...(body.notes !== undefined ? { notes: body.notes } : {}),
    ...(body.lastTouchNote !== undefined ? { lastTouchNote: body.lastTouchNote } : {}),
    ...(body.sortOrder != null ? { sortOrder: body.sortOrder } : {}),
  });

  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, person: updated });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim() ?? "";
  const initials = searchParams.get("leaderInitials")?.trim().toUpperCase() ?? "";

  if (!id || !/^[A-Z]{3}$/.test(initials)) {
    return NextResponse.json({ error: "id and leaderInitials required" }, { status: 400 });
  }

  const auth = await requireLeaderRosterEditor(initials);
  if (auth.error === "session") {
    return NextResponse.json({ error: "Sign in as this leader to edit roster" }, { status: 401 });
  }
  if (auth.error === "forbidden") {
    return NextResponse.json({ error: "You can only edit your own roster" }, { status: 403 });
  }

  const ok = await deleteVolunteerLeaderRosterPerson(id, initials);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
