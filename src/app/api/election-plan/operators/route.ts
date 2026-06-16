import { NextResponse } from "next/server";
import type { ElectionPlanOperatorCapability } from "@prisma/client";

import {
  getElectionPlanOperatorFromRequest,
  requireElectionPlanApiSession,
} from "@/lib/election-plan/auth/require-election-plan-api";
import { normalizeOperatorInitials } from "@/lib/election-plan/auth/operator-session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireElectionPlanApiSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const operators = await prisma.electionPlanOperator.findMany({
      orderBy: [{ active: "desc" }, { initials: "asc" }],
    });
    const current = await getElectionPlanOperatorFromRequest();
    return NextResponse.json({ operators, current });
  } catch {
    return NextResponse.json({ operators: [], current: null });
  }
}

export async function POST(request: Request) {
  if (!(await requireElectionPlanApiSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await getElectionPlanOperatorFromRequest();
  if (!current?.capabilities.includes("manage_operators")) {
    return NextResponse.json({ error: "manage_operators capability required" }, { status: 403 });
  }

  const body = (await request.json()) as {
    initials?: string;
    displayName?: string;
    email?: string;
    countySlug?: string | null;
    capabilities?: string[];
  };

  const initials = normalizeOperatorInitials(String(body.initials ?? ""));
  if (!initials) {
    return NextResponse.json({ error: "Initials must be exactly 3 letters" }, { status: 400 });
  }

  const displayName = String(body.displayName ?? "").trim();
  if (!displayName) {
    return NextResponse.json({ error: "Display name required" }, { status: 400 });
  }

  const caps = (body.capabilities ?? ["field_entry"]).filter((c) =>
    ["field_entry", "county_scope", "manage_operators"].includes(c),
  ) as ElectionPlanOperatorCapability[];

  if (caps.length === 0) caps.push("field_entry");

  try {
    const operator = await prisma.electionPlanOperator.upsert({
      where: { initials },
      create: {
        initials,
        displayName,
        email: body.email?.trim() || null,
        countySlug: body.countySlug?.trim().toLowerCase() || null,
        capabilities: caps,
        active: true,
      },
      update: {
        displayName,
        email: body.email?.trim() || null,
        countySlug: body.countySlug?.trim().toLowerCase() || null,
        capabilities: caps,
        active: true,
      },
    });
    return NextResponse.json({ ok: true, operator });
  } catch {
    return NextResponse.json({ error: "Could not save operator" }, { status: 503 });
  }
}
