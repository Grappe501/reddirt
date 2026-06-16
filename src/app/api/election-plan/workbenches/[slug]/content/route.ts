import type { CommunityWorkbenchEventStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireElectionPlanOperator } from "@/lib/election-plan/auth/require-election-plan-api";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type Section =
  | "leadership"
  | "mission"
  | "committee"
  | "event"
  | "intel"
  | "relationship"
  | "note";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await requireElectionPlanOperator();
  if (auth.error === "session") {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }
  if (auth.error === "operator" || !auth.operator) {
    return NextResponse.json({ error: "Operator initials sign-in required" }, { status: 403 });
  }

  const { slug } = await context.params;
  const body = (await request.json()) as { section?: Section; payload?: Record<string, unknown> };
  const section = body.section;
  const payload = body.payload ?? {};
  const initials = auth.operator.initials;

  try {
    const workbench = await prisma.communityWorkbench.findUnique({ where: { slug } });
    if (!workbench) {
      return NextResponse.json({ error: "Workbench not found" }, { status: 404 });
    }

    if (section === "leadership") {
      const roleKey = String(payload.roleKey ?? "").trim();
      const personName = String(payload.personName ?? "").trim();
      if (!roleKey || !personName) {
        return NextResponse.json({ error: "roleKey and personName required" }, { status: 400 });
      }
      const row = await prisma.communityWorkbenchLeadership.upsert({
        where: { workbenchId_roleKey: { workbenchId: workbench.id, roleKey } },
        create: {
          workbenchId: workbench.id,
          roleKey,
          personName,
          contact: payload.contact ? String(payload.contact).trim() : null,
          notes: payload.notes ? String(payload.notes).trim() : null,
          operatorInitials: initials,
        },
        update: {
          personName,
          contact: payload.contact ? String(payload.contact).trim() : null,
          notes: payload.notes ? String(payload.notes).trim() : null,
          operatorInitials: initials,
        },
      });
      return NextResponse.json({ ok: true, row });
    }

    if (section === "mission") {
      const title = String(payload.title ?? "").trim();
      if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
      const row = await prisma.communityWorkbenchMission.create({
        data: {
          workbenchId: workbench.id,
          title,
          status: String(payload.status ?? "open"),
          priority: Number(payload.priority) || 0,
          operatorInitials: initials,
        },
      });
      return NextResponse.json({ ok: true, row });
    }

    if (section === "committee") {
      const name = String(payload.name ?? "").trim();
      if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
      const row = await prisma.communityWorkbenchCommittee.create({
        data: {
          workbenchId: workbench.id,
          name,
          goals: payload.goals ? String(payload.goals).trim() : null,
          notes: payload.notes ? String(payload.notes).trim() : null,
          operatorInitials: initials,
        },
      });
      return NextResponse.json({ ok: true, row });
    }

    if (section === "event") {
      const title = String(payload.title ?? "").trim();
      if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
      const row = await prisma.communityWorkbenchEvent.create({
        data: {
          workbenchId: workbench.id,
          title,
          location: payload.location ? String(payload.location).trim() : null,
          leadName: payload.leadName ? String(payload.leadName).trim() : null,
          expectedAttendance: payload.expectedAttendance ? Number(payload.expectedAttendance) : null,
          status: (String(payload.status ?? "idea") as CommunityWorkbenchEventStatus) || "idea",
          runOfShowJson: payload.runOfShow ? JSON.stringify(payload.runOfShow) : null,
          assignmentsJson: payload.assignments ? JSON.stringify(payload.assignments) : null,
          operatorInitials: initials,
        },
      });
      return NextResponse.json({ ok: true, row });
    }

    if (section === "intel") {
      const sectionKey = String(payload.sectionKey ?? "leaders").trim();
      const title = String(payload.title ?? "").trim();
      const intelBody = String(payload.body ?? "").trim();
      if (!title || !intelBody) {
        return NextResponse.json({ error: "title and body required" }, { status: 400 });
      }
      const row = await prisma.communityWorkbenchIntel.create({
        data: {
          workbenchId: workbench.id,
          sectionKey,
          title,
          body: intelBody,
          operatorInitials: initials,
        },
      });
      return NextResponse.json({ ok: true, row });
    }

    if (section === "relationship") {
      const personName = String(payload.personName ?? "").trim();
      if (!personName) return NextResponse.json({ error: "personName required" }, { status: 400 });
      const row = await prisma.communityWorkbenchRelationship.create({
        data: {
          workbenchId: workbench.id,
          personName,
          roleLabel: payload.roleLabel ? String(payload.roleLabel).trim() : null,
          strength: Math.min(100, Math.max(0, Number(payload.strength) || 50)),
          lastContact: payload.lastContact ? String(payload.lastContact).trim() : null,
          nextFollowUp: payload.nextFollowUp ? String(payload.nextFollowUp).trim() : null,
          knowsWho: payload.knowsWho ? String(payload.knowsWho).trim() : null,
          notes: payload.notes ? String(payload.notes).trim() : null,
          operatorInitials: initials,
        },
      });
      return NextResponse.json({ ok: true, row });
    }

    if (section === "note") {
      const title = String(payload.title ?? "").trim();
      const noteBody = String(payload.body ?? "").trim();
      if (!title || !noteBody) {
        return NextResponse.json({ error: "title and body required" }, { status: 400 });
      }
      const row = await prisma.communityWorkbenchNote.create({
        data: {
          workbenchId: workbench.id,
          noteType: String(payload.noteType ?? "meeting"),
          title,
          body: noteBody,
          operatorInitials: initials,
        },
      });
      return NextResponse.json({ ok: true, row });
    }

    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not save — is migration applied?" }, { status: 503 });
  }
}
