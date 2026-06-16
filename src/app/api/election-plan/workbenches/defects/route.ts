import { NextResponse } from "next/server";

import { requireElectionPlanOperator } from "@/lib/election-plan/auth/require-election-plan-api";
import { COMMUNITY_PILOT_SLUGS } from "@/lib/election-plan/community-workbench/pilot";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireElectionPlanOperator();
  if (auth.error === "session") {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }
  if (auth.error === "operator" || !auth.operator) {
    return NextResponse.json({ error: "Operator initials sign-in required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  try {
    const rows = await prisma.communityWorkbenchPilotDefect.findMany({
      where: slug ? { workbenchSlug: slug } : { workbenchSlug: { in: [...COMMUNITY_PILOT_SLUGS] } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({
      defects: rows.map((d) => ({
        id: d.id,
        workbenchSlug: d.workbenchSlug,
        title: d.title,
        body: d.body,
        severity: d.severity,
        status: d.status,
        operatorInitials: d.operatorInitials,
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ defects: [], note: "Defect table not migrated yet" });
  }
}

export async function POST(request: Request) {
  const auth = await requireElectionPlanOperator();
  if (auth.error === "session") {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }
  if (auth.error === "operator" || !auth.operator) {
    return NextResponse.json({ error: "Operator initials sign-in required" }, { status: 403 });
  }

  const body = (await request.json()) as {
    workbenchSlug?: string;
    title?: string;
    body?: string;
    severity?: string;
  };

  const workbenchSlug = String(body.workbenchSlug ?? "").trim();
  const title = String(body.title ?? "").trim();
  const defectBody = String(body.body ?? "").trim();
  const severity = String(body.severity ?? "medium").trim();

  if (!workbenchSlug || !COMMUNITY_PILOT_SLUGS.includes(workbenchSlug as (typeof COMMUNITY_PILOT_SLUGS)[number])) {
    return NextResponse.json({ error: "workbenchSlug must be a pilot city (sherwood or jacksonville)" }, { status: 400 });
  }
  if (!title || !defectBody) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  try {
    const row = await prisma.communityWorkbenchPilotDefect.create({
      data: {
        workbenchSlug,
        title,
        body: defectBody,
        severity: ["low", "medium", "high", "blocker"].includes(severity) ? severity : "medium",
        operatorInitials: auth.operator.initials,
      },
    });
    return NextResponse.json({
      ok: true,
      defect: {
        id: row.id,
        workbenchSlug: row.workbenchSlug,
        title: row.title,
        body: row.body,
        severity: row.severity,
        status: row.status,
        operatorInitials: row.operatorInitials,
        createdAt: row.createdAt.toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireElectionPlanOperator();
  if (auth.error === "session") {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }
  if (auth.error === "operator" || !auth.operator) {
    return NextResponse.json({ error: "Operator initials sign-in required" }, { status: 403 });
  }

  const body = (await request.json()) as { id?: string; status?: string };
  const id = String(body.id ?? "").trim();
  const status = String(body.status ?? "").trim();

  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }
  if (!["open", "triaged", "fixed", "wontfix"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const row = await prisma.communityWorkbenchPilotDefect.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ ok: true, defect: row });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 404 });
  }
}
