import { NextResponse } from "next/server";

import { requireElectionPlanOperator } from "@/lib/election-plan/auth/require-election-plan-api";
import { COMMUNITY_EVENT_VOLUNTEER_ROLES } from "@/lib/election-plan/community-workbench/constants";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await requireElectionPlanOperator();
  if (auth.error || !auth.operator) {
    return NextResponse.json({ error: "Operator sign-in required" }, { status: 403 });
  }

  const { slug } = await context.params;
  const workbench = await prisma.communityWorkbench.findUnique({ where: { slug } });
  if (!workbench) return NextResponse.json({ error: "Workbench not found" }, { status: 404 });

  const body = (await request.json()) as { title?: string };
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const assignments = COMMUNITY_EVENT_VOLUNTEER_ROLES.map((role) => ({
    role,
    assignee: "",
    notes: "",
  }));

  try {
    const event = await prisma.communityWorkbenchEvent.create({
      data: {
        workbenchId: workbench.id,
        title,
        status: "idea",
        assignmentsJson: JSON.stringify(assignments),
        operatorInitials: auth.operator.initials,
      },
    });
    return NextResponse.json({ ok: true, eventId: event.id });
  } catch {
    return NextResponse.json({ error: "Could not create event" }, { status: 503 });
  }
}
