import { NextResponse } from "next/server";
import type { CommunityWorkbenchEventStatus } from "@prisma/client";

import { requireElectionPlanOperator } from "@/lib/election-plan/auth/require-election-plan-api";
import { COMMUNITY_EVENT_STATUSES } from "@/lib/election-plan/community-workbench/constants";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const VALID_STATUSES = new Set<string>(COMMUNITY_EVENT_STATUSES.map((s) => s.value));

async function resolveWorkbench(slug: string) {
  return prisma.communityWorkbench.findUnique({ where: { slug } });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; eventId: string }> },
) {
  const auth = await requireElectionPlanOperator();
  if (auth.error || !auth.operator) {
    return NextResponse.json({ error: "Operator sign-in required" }, { status: 403 });
  }

  const { slug, eventId } = await context.params;
  const workbench = await resolveWorkbench(slug);
  if (!workbench) return NextResponse.json({ error: "Workbench not found" }, { status: 404 });

  const existing = await prisma.communityWorkbenchEvent.findFirst({
    where: { id: eventId, workbenchId: workbench.id },
  });
  if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    eventDate?: string | null;
    location?: string | null;
    expectedAttendance?: number | null;
    actualAttendance?: number | null;
    leadName?: string | null;
    status?: string;
    committeeId?: string | null;
    runOfShow?: Array<{ time: string; label: string; owner?: string }>;
    assignments?: Array<{ role: string; assignee: string; notes?: string }>;
    documents?: Array<{ label: string; url?: string }>;
    aarBody?: string | null;
  };

  if (body.status && !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (body.committeeId) {
    const committee = await prisma.communityWorkbenchCommittee.findFirst({
      where: { id: body.committeeId, workbenchId: workbench.id },
    });
    if (!committee) return NextResponse.json({ error: "Committee not found" }, { status: 400 });
  }

  let eventDate: Date | null | undefined;
  if (body.eventDate !== undefined) {
    eventDate = body.eventDate ? new Date(body.eventDate) : null;
    if (body.eventDate && Number.isNaN(eventDate?.getTime())) {
      return NextResponse.json({ error: "Invalid eventDate" }, { status: 400 });
    }
  }

  try {
    await prisma.communityWorkbenchEvent.update({
      where: { id: eventId },
      data: {
        ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
        ...(eventDate !== undefined ? { eventDate } : {}),
        ...(body.location !== undefined ? { location: body.location?.trim() || null } : {}),
        ...(body.expectedAttendance !== undefined
          ? { expectedAttendance: body.expectedAttendance ?? null }
          : {}),
        ...(body.actualAttendance !== undefined ? { actualAttendance: body.actualAttendance ?? null } : {}),
        ...(body.leadName !== undefined ? { leadName: body.leadName?.trim() || null } : {}),
        ...(body.status !== undefined
          ? { status: body.status as CommunityWorkbenchEventStatus }
          : {}),
        ...(body.committeeId !== undefined ? { committeeId: body.committeeId || null } : {}),
        ...(body.runOfShow !== undefined ? { runOfShowJson: JSON.stringify(body.runOfShow) } : {}),
        ...(body.assignments !== undefined ? { assignmentsJson: JSON.stringify(body.assignments) } : {}),
        ...(body.documents !== undefined ? { documentsJson: JSON.stringify(body.documents) } : {}),
        ...(body.aarBody !== undefined ? { aarBody: body.aarBody?.trim() || null } : {}),
        operatorInitials: auth.operator.initials,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update event" }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string; eventId: string }> },
) {
  const auth = await requireElectionPlanOperator();
  if (auth.error || !auth.operator) {
    return NextResponse.json({ error: "Operator sign-in required" }, { status: 403 });
  }

  const { slug, eventId } = await context.params;
  const workbench = await resolveWorkbench(slug);
  if (!workbench) return NextResponse.json({ error: "Workbench not found" }, { status: 404 });

  try {
    await prisma.communityWorkbenchEvent.deleteMany({
      where: { id: eventId, workbenchId: workbench.id },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete event" }, { status: 503 });
  }
}
